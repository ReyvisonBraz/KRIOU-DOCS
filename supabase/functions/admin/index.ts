/**
 * ============================================
 * KRIOU DOCS — Admin API
 * ============================================
 * Supabase Edge Function com autenticação do usuário e consultas backend.
 *
 * Requer a capacidade privada admin.legacy.read (admin/owner).
 *
 * GET /admin?action=stats
 * GET /admin?action=users
 * GET /admin?action=user-docs&userId=xxx
 * GET /admin?action=authorization
 * ============================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  authenticate,
  createAdminClient,
  getAdminAuthorization,
  hasAdminCapability,
} from "../_shared/auth.ts";
import { handlePreflight, json } from "../_shared/http.ts";

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const supabase = createAdminClient();
    const user = await authenticate(req, supabase);
    if (!user) {
      return json({ error: "Nao autorizado" }, 401);
    }

    const authorization = await getAdminAuthorization(supabase, user.id);
    if (!hasAdminCapability(authorization, "admin.legacy.read")) {
      return json({ error: "Capacidade administrativa insuficiente" }, 403);
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "authorization":
        return json(authorization);

      case "stats": {
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: totalDocs } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null);

        const { count: trashedDocs } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .not("deleted_at", "is", null);

        const { count: finalizedDocs } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .is("deleted_at", null)
          .eq("status", "finalizado");

        const { data: docsByType } = await supabase
          .from("documents")
          .select("type, document_type")
          .is("deleted_at", null);

        const typeCount = {};
        (docsByType || []).forEach((d) => {
          const key = d.document_type || d.type || "unknown";
          typeCount[key] = (typeCount[key] || 0) + 1;
        });

        return json({
          totalUsers: totalUsers || 0,
          totalDocs: totalDocs || 0,
          trashedDocs: trashedDocs || 0,
          finalizedDocs: finalizedDocs || 0,
          docsByType: typeCount,
        });
      }

      case "users": {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, nome, sobrenome, role, created_at")
          .order("created_at", { ascending: false });

        if (usersError) throw usersError;

        const [{ data: documents, error: documentsError }, authUsersResult, rolesResult] = await Promise.all([
          supabase.from("documents").select("user_id, deleted_at"),
          supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
          supabase.rpc("kriou_admin_list_role_assignments"),
        ]);
        if (documentsError) throw documentsError;
        if (authUsersResult.error) throw authUsersResult.error;
        if (rolesResult.error) throw rolesResult.error;

        const counts = (documents || []).reduce((result, document) => {
          const bucket = result[document.user_id] || { active: 0, trashed: 0 };
          if (document.deleted_at) bucket.trashed += 1;
          else bucket.active += 1;
          result[document.user_id] = bucket;
          return result;
        }, {} as Record<string, { active: number; trashed: number }>);
        const emails = new Map(authUsersResult.data.users.map((authUser) => [authUser.id, authUser.email || null]));
        const adminRoles = new Map((rolesResult.data || []).map((assignment) => [assignment.user_id, assignment.role]));
        const usersWithCounts = (users || []).map((profile) => ({
          ...profile,
          adminRole: adminRoles.get(profile.id) || null,
          email: emails.get(profile.id) || null,
          docCount: counts[profile.id]?.active || 0,
          trashCount: counts[profile.id]?.trashed || 0,
        }));

        return json(usersWithCounts);
      }

      case "user-docs": {
        const targetUserId = url.searchParams.get("userId");
        if (!targetUserId) {
          return json({ error: "userId é obrigatório" }, 400);
        }

        const { data: docs, error: docsError } = await supabase
          .from("documents")
          .select("id, title, code, type, document_type, document_type_name, status, payment_status, deleted_at, created_at, updated_at")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false });

        if (docsError) throw docsError;

        return json(docs || []);
      }

      default:
        return json({ error: "Acao invalida. Use: stats, users, user-docs" }, 400);
    }
  } catch (err) {
    console.error("[admin][ERRO]", err.message);
    return json({ error: err.message }, 500);
  }
});
