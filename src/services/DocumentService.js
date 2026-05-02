/**
 * ============================================
 * KRIOU DOCS - Document Service
 * ============================================
 * Fachada para operacoes de documentos e perfil no Supabase.
 *
 * LOGS: Todos os logs usam prefixo [DocumentService] para facilitar
 * filtragem no console.
 *
 * ERROS: Metodos jogam excecao em caso de erro — o chamador (context ou page)
 * e responsavel por capturar e decidir o que fazer (mostrar toast, logar, etc).
 *
 * SEGURANCA: As queries usam RLS (Row Level Security) do Supabase para
 * garantir que cada usuario veja apenas seus proprios registros.
 * Alem disso, fetchAll() aceita userId como parametro explicito para
 * filtrar no client-side tambem (defesa em profundidade).
 */

import { supabase } from "../lib/supabase";

// ─── Helpers internos ────────────────────────────────────────────────────────
// Mapeia uma row do banco para o formato usado pelo frontend.
// Centralizado aqui para evitar duplicacao de mapeamento.
function mapDocumentRow(row) {
  return {
    id:               row.id,
    type:             row.type,
    title:            row.title,
    code:             row.code,
    template:         row.template,
    templateId:       row.template_id,
    templateName:     row.template_name,
    status:           row.status,
    formData:         row.form_data,
    legalData:        row.legal_data,
    documentType:     row.document_type,
    documentTypeName: row.document_type_name,
    variantId:        row.variant_id,
    variantName:      row.variant_name,
    variant:         row.variant,
    date:             new Date(row.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    createdAt:        row.created_at,
    userId:           row.user_id,
  };
}

export const DocumentService = {
  /**
   * Busca todos os documentos finalizados do usuario.
   *
   * @param {string} userId — ID do usuario para filtrar (defesa em profundidade)
   * @returns {Promise<Array>} Lista de documentos mapeados
   *
   * PONTO DE FALHA: Se o RLS nao estiver configurado corretamente, esta
   * query pode retornar dados de outros usuarios. O parametro userId
   * adiciona uma camada extra de seguranca — mas o RLS e a defesa principal.
   */
  async fetchAll(userId = null) {
    let query = supabase
      .from("documents")
      .select("*")
      .eq("status", "finalizado");

    // Filtro explícito por userId como defesa em profundidade
    if (userId) {
      query = query.eq("user_id", userId);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      // [KRIOU_ERRO][DocumentService] Erro ao buscar documentos
      console.error("[DocumentService][ERRO] fetchAll:", error.message, { userId });
      throw error;
    }

    return (data || []).map(mapDocumentRow);
  },

  /**
   * Insere um documento finalizado no Supabase.
   *
   * @param {Object} doc — Dados do documento
   * @param {string} userId — ID do usuario dono do documento
   * @returns {Promise<Object>} Documento salvo com id e createdAt
   *
   * PONTO DE FALHA: Se userId for null/undefined, a query vai falhar
   * porque a coluna user_id e NOT NULL e o RLS vai bloquear.
   */
  async insert(doc, userId) {
    if (!userId) {
      const err = new Error("[DocumentService][ERRO] insert: userId e obrigatorio");
      console.error(err.message);
      throw err;
    }

    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id:            userId,
        type:               doc.type,
        title:              doc.title || "Sem título",
        code:               doc.code || null,
        template:           doc.template || null,
        template_id:        doc.templateId || null,
        template_name:      doc.templateName || null,
        status:             doc.status || "finalizado",
        form_data:          doc.formData   || null,
        legal_data:         doc.legalData  || null,
        document_type:      doc.documentType || null,
        document_type_name: doc.documentTypeName || null,
        variant_id:         doc.variantId || null,
        variant_name:       doc.variantName || null,
        variant:            doc.variant || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[DocumentService][ERRO] insert:", error.message, { doc, userId });
      throw error;
    }

    return {
      ...doc,
      id:        data.id,
      code:      doc.code || null,
      createdAt: data.created_at,
      date:      new Date(data.created_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }),
    };
  },

  /**
   * Atualiza um documento existente no Supabase (usado para re-finalizar
   * documentos ja salvos apos edicao).
   *
   * @param {string} documentId — UUID do documento a atualizar
   * @param {Object} docData  — Dados atualizados do documento
   * @param {string} userId   — ID do usuario dono do documento
   * @returns {Promise<Object>} Dados atualizados do banco
   *
   * PONTO DE FALHA: Se documentId nao pertencer ao usuario, o RLS
   * bloqueia a operacao (0 rows affected). Verificamos via user_id eq.
   */
  async update(documentId, docData, userId) {
    if (!documentId || !userId) {
      const err = new Error("[DocumentService][ERRO] update: documentId e userId sao obrigatorios");
      console.error(err.message);
      throw err;
    }

    const { data, error } = await supabase
      .from("documents")
      .update({
        title:               docData.title || "Sem titulo",
        template:            docData.template || null,
        template_id:         docData.templateId || null,
        template_name:       docData.templateName || null,
        form_data:           docData.formData  || null,
        legal_data:          docData.legalData  || null,
        document_type:       docData.documentType || null,
        document_type_name:  docData.documentTypeName || null,
        variant_id:          docData.variantId || null,
        variant_name:        docData.variantName || null,
        variant:             docData.variant || null,
      })
      .eq("id", documentId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("[DocumentService][ERRO] update:", error.message, { documentId, userId });
      throw error;
    }

    return data;
  },

  /**
   * Remove um documento pelo ID.
   *
   * @param {string} documentId — UUID do documento
   * @returns {Promise<boolean>} true se removido com sucesso
   *
   * PONTO DE FALHA: Se documentId for invalido ou nao pertencer ao usuario,
   * o RLS retornara sucesso mas nada sera deletado (0 rows affected).
   * O Supabase nao retorna erro nesse caso — sempre verifique se o documento
   * sumiu da lista apos a delecao.
   */
  async remove(documentId) {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", documentId);

    if (error) {
      console.error("[DocumentService][ERRO] remove:", error.message, { documentId });
      throw error;
    }
    return true;
  },

  /**
   * Busca o perfil do usuario autenticado.
   *
   * @returns {Promise<Object|null>} Perfil do usuario ou null se nao existir
   *
   * PONTO DE FALHA: O erro PGRST116 (no rows) e ignorado porque o perfil
   * pode nao existir ainda (trigger handle_new_user pode nao ter sido executado
   * para usuarios antigos). Nesse caso retorna null.
   */
  async fetchProfile() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Nenhum perfil encontrado — usuario pode ser antigo (pre-trigger)
        return null;
      }
      console.error("[DocumentService][ERRO] fetchProfile:", error.message);
      throw error;
    }
    return data || null;
  },

  /**
   * Atualiza nome, sobrenome, CPF e dados do Google no perfil.
   *
   * @param {Object} params
   * @param {string} params.nome
   * @param {string} params.sobrenome
   * @param {string} params.cpf
   * @param {Object} [params.googleData] — Dados vindos do Google OAuth
   * @returns {Promise<Object>} Perfil atualizado
   */
  async updateProfile({ nome, sobrenome, cpf, googleData }) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      const err = new Error("[DocumentService][ERRO] updateProfile: usuario nao autenticado");
      console.error(err.message);
      throw err;
    }

    const email = googleData?.email || user?.email || null;
    const avatar_url = googleData?.avatar_url || user?.raw_user_meta_data?.avatar_url || null;
    const google_id = user?.raw_user_meta_data?.sub || null;

    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        nome,
        sobrenome,
        cpf,
        email,
        avatar_url,
        google_id,
      }, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("[DocumentService][ERRO] updateProfile:", error.message);
      throw error;
    }
    return data;
  },

  /**
   * Verifica se o perfil esta completo (nome, sobrenome e CPF preenchidos).
   *
   * @param {Object|null} profile
   * @returns {boolean}
   */
  isProfileComplete(profile) {
    return !!(profile?.nome?.trim() && profile?.sobrenome?.trim() && profile?.cpf?.trim());
  },

  /**
   * Verifica se o onboarding foi concluido.
   *
   * @param {Object|null} profile
   * @returns {boolean}
   */
  isOnboardingDone(profile) {
    return !!profile?.onboarding_done;
  },

  /**
   * Marca o onboarding como concluido no perfil do usuario.
   *
   * @returns {Promise<boolean>}
   */
  async markOnboardingDone() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      const err = new Error("[DocumentService][ERRO] markOnboardingDone: usuario nao autenticado");
      console.error(err.message);
      throw err;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_done: true })
      .eq("id", user.id);

    if (error) {
      console.error("[DocumentService][ERRO] markOnboardingDone:", error.message);
      throw error;
    }
    return true;
  },
};
