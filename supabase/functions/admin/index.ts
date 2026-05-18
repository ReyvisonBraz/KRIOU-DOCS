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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Nao autorizado" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Acesso restrito a administradores" }), { status: 403, headers: { "Content-Type": "application/json" } });
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

        return new Response(JSON.stringify({
          totalUsers: totalUsers || 0,
          totalDocs: totalDocs || 0,
          finalizedDocs: finalizedDocs || 0,
          docsByType: typeCount,
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      case "users": {
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("id, nome, sobrenome, email, role, created_at")
          .order("created_at", { ascending: false });

        if (usersError) throw usersError;

        const usersWithCounts = await Promise.all(
          (users || []).map(async (u) => {
            const { count: docCount } = await supabase
              .from("documents")
              .select("*", { count: "exact", head: true })
              .eq("user_id", u.id);
            return { ...u, docCount: docCount || 0 };
          })
        );

        return new Response(JSON.stringify(usersWithCounts), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "user-docs": {
        const targetUserId = url.searchParams.get("userId");
        if (!targetUserId) {
          return new Response(JSON.stringify({ error: "userId é obrigatório" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const { data: docs, error: docsError } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false });

        if (docsError) throw docsError;

        return new Response(JSON.stringify(docs || []), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: "Acao invalida. Use: stats, users, user-docs" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("[admin][ERRO]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
