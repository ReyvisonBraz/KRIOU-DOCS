// Exportacao dos dados do titular (LGPD, art. 18, II e V).
//
// Devolve, em JSON legivel, tudo que a plataforma guarda sobre quem fez a
// requisicao. O arquivo e entregue ao proprio titular, por isso os rotulos
// estao em portugues: quem le e o consumidor, nao o desenvolvedor.
//
// Escopo deliberado:
//   - inclui conta, perfil, documentos (com o conteudo preenchido) e rascunhos
//   - NAO inclui payment_webhook_events. Aquela tabela e a trilha interna de
//     notificacoes do provedor de pagamento; os dados de pagamento que dizem
//     respeito ao titular ja vao junto de cada documento.
//
// Esta funcao apenas LE. A exclusao de conta e outra funcao (F2.4) e depende
// dos prazos de retencao definidos na F4.3.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticate, createAdminClient } from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";

// Versao do formato do arquivo. Incremente ao mudar a estrutura, para que
// exportacoes antigas continuem interpretaveis.
const FORMATO_EXPORTACAO = 1;

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  try {
    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) return json({ error: "Não autorizado" }, 401);

    // Todas as consultas sao restritas ao titular autenticado. O id vem do
    // token, nunca do corpo da requisicao.
    const [perfilRes, documentosRes, rascunhosRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
      supabase.from("document_drafts").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
    ]);

    // Uma falha parcial produziria um arquivo incompleto que o titular nao
    // teria como perceber. Preferimos falhar por inteiro.
    const falha = perfilRes.error || documentosRes.error || rascunhosRes.error;
    if (falha) {
      console.error("[export-user-data] Falha ao reunir dados", falha.message);
      return json({ error: "Erro interno ao reunir seus dados" }, 500);
    }

    const documentos = documentosRes.data ?? [];

    return json({
      formato: FORMATO_EXPORTACAO,
      gerado_em: new Date().toISOString(),

      conta: {
        id: user.id,
        email: user.email ?? null,
        criada_em: user.created_at ?? null,
        ultimo_acesso: user.last_sign_in_at ?? null,
        forma_de_entrada: user.app_metadata?.provider ?? null,
      },

      perfil: perfilRes.data ?? null,
      documentos,
      rascunhos: rascunhosRes.data ?? [],

      resumo: {
        total_de_documentos: documentos.length,
        documentos_pagos: documentos.filter((d) => d.payment_status === "approved").length,
        total_de_rascunhos: (rascunhosRes.data ?? []).length,
      },

      observacoes: [
        "Este arquivo contém todos os dados pessoais que a Kriou Docs armazena sobre você.",
        "Os dados de pagamento de cada documento estão dentro do próprio documento.",
        "Registros internos de notificação do provedor de pagamento não são incluídos por não conterem dados pessoais além dos já listados aqui.",
      ],
    });
  } catch (error) {
    console.error("[export-user-data] Erro interno", error instanceof Error ? error.message : "desconhecido");
    return json({ error: "Erro interno ao exportar seus dados" }, 500);
  }
});
