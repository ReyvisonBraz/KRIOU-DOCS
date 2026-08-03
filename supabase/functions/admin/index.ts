/**
 * ============================================
 * KRIOU DOCS — Admin API
 * ============================================
 * Supabase Edge Function protegida por service_role.
 *
 * Requer que o usuario seja admin (profile.role === 'admin').
 *
 * GET /admin?action=stats
 * GET /admin?action=users
 * GET /admin?action=user-docs&userId=xxx
 * ============================================
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handlePreflight, json } from "../_shared/http.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return json({ error: "Nao autorizado" }, 401);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return json({ error: "Acesso restrito a administradores" }, 403);
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "stats": {
        const { count: totalUsers } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: totalDocs } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true });

        const { count: finalizedDocs } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("status", "finalizado");

        const { data: docsByType } = await supabase
          .from("documents")
          .select("type, document_type");

        const typeCount = {};
        (docsByType || []).forEach((d) => {
          const key = d.document_type || d.type || "unknown";
          typeCount[key] = (typeCount[key] || 0) + 1;
        });

        return json({
          totalUsers: totalUsers || 0,
          totalDocs: totalDocs || 0,
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

        const [{ data: documents, error: documentsError }, authUsersResult] = await Promise.all([
          supabase.from("documents").select("user_id"),
          supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ]);
        if (documentsError) throw documentsError;
        if (authUsersResult.error) throw authUsersResult.error;

        const counts = (documents || []).reduce((result, document) => {
          result[document.user_id] = (result[document.user_id] || 0) + 1;
          return result;
        }, {} as Record<string, number>);
        const emails = new Map(authUsersResult.data.users.map((authUser) => [authUser.id, authUser.email || null]));
        const usersWithCounts = (users || []).map((profile) => ({
          ...profile,
          email: emails.get(profile.id) || null,
          docCount: counts[profile.id] || 0,
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
          .select("id, title, code, type, document_type, document_type_name, status, payment_status, created_at, updated_at")
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
