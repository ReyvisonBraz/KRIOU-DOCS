import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { AppNavbar, Drawer, IconButton } from "../components/UI";
import {
  PeriodFilter,
  MetricsCards,
  MiniChart,
  RecentFailures,
  AdminEnvironmentBadge,
  AdminRoleManager,
  AdminUserDocumentsDrawer,
  AdminUsersTable,
} from "../components/admin";
import { MetricsService } from "../services/MetricsService";
import { formatCurrency } from "../utils/formatting";

const AdminPage = () => {
  const { navigate, profile, userId } = useApp();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocs, setUserDocs] = useState([]);
  const [userDocsLoading, setUserDocsLoading] = useState(false);
  const [userDocsError, setUserDocsError] = useState("");
  const [accessUser, setAccessUser] = useState(null);
  const [accessBusy, setAccessBusy] = useState(false);
  const [authorization, setAuthorization] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

  // ── Métricas do painel (admin-metrics) ──
  const [period, setPeriod] = useState("30d");
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const callAdmin = useCallback(async (action, params = {}) => {
    const { supabase } = await import("../lib/supabase");
    const query = new URLSearchParams({ action, ...params }).toString();
    const { data, error } = await supabase.functions.invoke(`admin?${query}`);
    if (error) throw error;
    return data;
  }, []);

  const loadStats = useCallback(async () => {
    setError(null);
    try {
      const data = await callAdmin("stats");
      setStats(data);
    } catch (err) {
      setError(err.message);
    }
  }, [callAdmin]);

  const loadUsers = useCallback(async () => {
    setError(null);
    setUsersLoading(true);
    try {
      const data = await callAdmin("users");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [callAdmin]);

  useEffect(() => {
    loadStats();
    loadUsers();
    callAdmin("authorization").then(setAuthorization).catch((err) => setError(err.message));
  }, [callAdmin, loadStats, loadUsers]);

  const loadMetrics = useCallback(async (targetPeriod) => {
    setError(null);
    setMetricsLoading(true);
    try {
      const data = await MetricsService.getMetrics(targetPeriod);
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Carrega métricas ao abrir e sempre que o período mudar.
  useEffect(() => {
    loadMetrics(period);
  }, [period, loadMetrics]);

  // Saúde geral: atenção quando há falhas recentes que exigem ação.
  const healthy =
    !error &&
    (!metrics ||
      !Array.isArray(metrics.recentFailures) ||
      metrics.recentFailures.length === 0);

  const loadUserDocs = async (selectedUserId) => {
    const user = users.find(({ id }) => id === selectedUserId);
    if (!user) return;
    setSelectedUser(user);
    setUserDocs([]);
    setUserDocsError("");
    setUserDocsLoading(true);
    try {
      const data = await callAdmin("user-docs", { userId: selectedUserId });
      setUserDocs(data);
    } catch (err) {
      setUserDocsError(err.message || "Erro inesperado ao consultar os documentos.");
    } finally {
      setUserDocsLoading(false);
    }
  };

  const closeUserDocuments = () => {
    setSelectedUser(null);
    setUserDocs([]);
    setUserDocsError("");
  };

  const s = {
    page: { minHeight: "100vh", background: "var(--navy)", color: "var(--text)", fontFamily: "var(--font-body)" },
    container: { maxWidth: 900, margin: "0 auto", padding: "24px 20px" },
    card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 16 },
    statCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 20px", textAlign: "center" },
    statValue: { fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "var(--coral)", lineHeight: 1 },
    statLabel: { fontSize: 12, color: "var(--text-muted)", marginTop: 8 },
    tabBtn: (active) => ({
      padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
      fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
      background: active ? "var(--coral)" : "var(--surface-2)",
      color: active ? "var(--on-action)" : "var(--text-muted)",
      transition: "all 0.2s ease",
    }),
  };

  const TabBar = () => (
    <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      {[
        { id: "overview", label: "Visão Geral", icon: "Layout" },
        { id: "users", label: "Usuários", icon: "Users" },
      ].map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} style={s.tabBtn(tab === t.id)}>
          <Icon name={t.icon} className="w-4 h-4" style={{ marginRight: 6, verticalAlign: "middle" }} />
          {t.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={s.page}>
        <AppNavbar
          title="Admin"
          leftAction={
            <IconButton
              icon="ChevronLeft"
              label="Voltar ao dashboard"
              onClick={() => navigate("dashboard", { replace: true })}
            />
          }
        />

        <div style={s.container}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(244,63,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="Shield" className="w-5 h-5" style={{ color: "var(--coral)" }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, margin: 0 }}>Painel Administrativo</h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Bem-vindo, {profile?.nome || "Admin"}</p>
              </div>
            </div>
            <AdminEnvironmentBadge healthy={healthy} />
          </div>

          {error && (
            <div style={{ ...s.card, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.04)" }}>
              <p style={{ color: "var(--coral)", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <TabBar />

          {tab === "overview" && (
            <>
              {/* Seletor de período das métricas */}
              <div style={{ marginBottom: 20 }}>
                <PeriodFilter value={period} onChange={setPeriod} disabled={metricsLoading} />
              </div>

              {/* Indicadores principais */}
              <div style={{ marginBottom: 16 }}>
                <MetricsCards summary={metrics?.summary} isLoading={metricsLoading} />
              </div>

              {/* Gráficos diários */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 16 }}>
                <div style={s.card}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Documentos por dia</h3>
                  <MiniChart data={metrics?.series?.documents} color="var(--teal)" formatValue={(v) => `${v} doc`} isLoading={metricsLoading} />
                </div>
                <div style={s.card}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Receita aprovada por dia</h3>
                  <MiniChart data={metrics?.series?.revenue} color="var(--coral)" formatValue={(v) => formatCurrency(v)} isLoading={metricsLoading} />
                </div>
              </div>

              {/* Distribuição por tipo (vem do stats existente) */}
              {stats?.docsByType && Object.keys(stats.docsByType).length > 0 && (
                <div style={{ ...s.card, marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Documentos por Tipo</h3>
                  {Object.entries(stats.docsByType).map(([type, count]) => (
                    <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                      <span style={{ color: "var(--text-dim)" }}>{type}</span>
                      <span style={{ fontWeight: 700, color: "var(--text)" }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Falhas recentes que exigem ação */}
              <div style={s.card}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
                  Falhas que exigem ação
                </h3>
                <RecentFailures failures={metrics?.recentFailures} isLoading={metricsLoading} />
              </div>
            </>
          )}

          {tab === "users" && (
            <div style={s.card}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>
                Usuários ({users.length})
              </h3>
              <AdminUsersTable
                users={users}
                isLoading={usersLoading}
                canManageRoles={authorization?.capabilities?.includes("roles.manage")}
                onViewDocuments={loadUserDocs}
                onManageAccess={setAccessUser}
              />

            </div>
          )}
        </div>

        <AdminUserDocumentsDrawer
          user={selectedUser}
          documents={userDocs}
          loading={userDocsLoading}
          error={userDocsError}
          onRetry={() => selectedUser && loadUserDocs(selectedUser.id)}
          onClose={closeUserDocuments}
        />

        <Drawer
          open={Boolean(accessUser && authorization?.capabilities?.includes("roles.manage"))}
          title={`Permissões de ${accessUser?.nome || accessUser?.email || "usuário"}`}
          description={accessUser?.email || "E-mail indisponível"}
          onClose={() => setAccessUser(null)}
          busy={accessBusy}
        >
          {accessUser && (
            <AdminRoleManager
              key={`${accessUser.id}:${accessUser.adminRole || "none"}`}
              user={accessUser}
              currentUserId={userId}
              onBusyChange={setAccessBusy}
              onChanged={async () => {
                await loadUsers();
                setAccessUser(null);
              }}
            />
          )}
        </Drawer>
    </div>
  );
};

export default AdminPage;
