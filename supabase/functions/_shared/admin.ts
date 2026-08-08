// Lógica pura das ações do painel administrativo, separada do handler HTTP
// (admin/index.ts) para poder ser testada no Vitest sem depender de
// Deno.serve. Nenhuma função aqui usa Deno.*.

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 50;
// Limite padrão do PostgREST por consulta. Um select() sem paginação trunca
// silenciosamente acima disso — é a causa do bug em que docsByType não batia
// com totalDocs.
const DOCUMENT_BATCH_SIZE = 1000;

export function normalizePageParams(params: { page?: unknown; pageSize?: unknown }) {
  const rawPage = Number.parseInt(String(params?.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawPageSize = Number.parseInt(String(params?.pageSize), 10);
  const pageSize = Number.isFinite(rawPageSize) && rawPageSize > 0
    ? Math.min(PAGE_SIZE_MAX, rawPageSize)
    : PAGE_SIZE_DEFAULT;

  return { page, pageSize };
}

// deno-lint-ignore no-explicit-any
type SupabaseClient = any;

export async function getStats(supabase: SupabaseClient) {
  const [{ count: totalUsers }, { count: totalDocs }, { count: finalizedDocs }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "finalizado"),
  ]);

  const docsByType = await countDocumentsByType(supabase);

  return {
    totalUsers: totalUsers || 0,
    totalDocs: totalDocs || 0,
    finalizedDocs: finalizedDocs || 0,
    docsByType,
  };
}

// Pagina em blocos de DOCUMENT_BATCH_SIZE até esgotar as linhas, para que a
// soma de docsByType sempre bata com totalDocs, mesmo com milhares de linhas.
export async function countDocumentsByType(supabase: SupabaseClient) {
  const typeCount: Record<string, number> = {};
  let offset = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("documents")
      .select("type, document_type")
      .range(offset, offset + DOCUMENT_BATCH_SIZE - 1);
    if (error) throw error;

    for (const doc of data || []) {
      const key = doc.document_type || doc.type || "unknown";
      typeCount[key] = (typeCount[key] || 0) + 1;
    }

    if (!data || data.length < DOCUMENT_BATCH_SIZE) break;
    offset += DOCUMENT_BATCH_SIZE;
  }

  return typeCount;
}

export async function getUsers(
  supabase: SupabaseClient,
  params: { page?: unknown; pageSize?: unknown; search?: unknown },
) {
  const { page, pageSize } = normalizePageParams(params);
  const search = String(params?.search || "").trim();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("profiles")
    .select("id, nome, sobrenome, role, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    // Escapa curingas do PostgREST para que o texto do usuário não altere o
    // padrão de busca.
    const term = search.replace(/[%_]/g, (c) => `\\${c}`);
    query = query.or(`nome.ilike.%${term}%,sobrenome.ilike.%${term}%`);
  }

  const { data: profiles, count, error: profilesError } = await query;
  if (profilesError) throw profilesError;

  const pageProfiles = profiles || [];
  const userIds = pageProfiles.map((p: { id: string }) => p.id);

  const [emailByUserId, docCountByUserId] = await Promise.all([
    fetchEmails(supabase, userIds),
    fetchDocCounts(supabase, userIds),
  ]);

  const users = pageProfiles.map((profile: { id: string }) => ({
    ...profile,
    email: emailByUserId.get(profile.id) || null,
    docCount: docCountByUserId.get(profile.id) || 0,
  }));

  return { users, total: count || 0, page, pageSize };
}

// auth.admin.listUsers() pagina por conta própria e não é filtrável por id.
// Buscamos o e-mail só de quem está na página atual — nunca da base inteira,
// que é o que fazia o usuário 1001+ aparecer com email: null.
async function fetchEmails(supabase: SupabaseClient, userIds: string[]) {
  const pairs = await Promise.all(
    userIds.map(async (id) => {
      const { data, error } = await supabase.auth.admin.getUserById(id);
      if (error || !data?.user) return [id, null] as const;
      return [id, data.user.email || null] as const;
    }),
  );
  return new Map(pairs);
}

// Conta documentos só dos usuários da página atual — nunca de todos os
// documentos do sistema, que era o que fazia esta consulta crescer com a
// base inteira em vez de com o tamanho da página.
async function fetchDocCounts(supabase: SupabaseClient, userIds: string[]) {
  if (userIds.length === 0) return new Map<string, number>();

  const { data, error } = await supabase.from("documents").select("user_id").in("user_id", userIds);
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const doc of data || []) {
    counts.set(doc.user_id, (counts.get(doc.user_id) || 0) + 1);
  }
  return counts;
}

// Whitelist de metadados — sem form_data/legal_data. Mantido idêntico ao
// comportamento anterior, que já estava correto.
export async function getUserDocs(supabase: SupabaseClient, targetUserId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, code, type, document_type, document_type_name, status, payment_status, created_at, updated_at")
    .eq("user_id", targetUserId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
