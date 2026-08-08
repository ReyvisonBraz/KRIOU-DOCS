import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Icon } from "../components/Icons";
import { AppNavbar } from "../components/UI";
import AdminRoute from "../components/AdminRoute";
import { AdminService } from "../services/AdminService";
import { useDebounce } from "../hooks";

const PAGE_SIZE = 20;

// ─── Estilos e TabBar fora do componente ────────────────────────────────────
// Antes viviam dentro de AdminPage: a cada setState (inclusive ao selecionar
// um usuário) o React via um componente/objeto "novo" e desmontava/remontava
// a barra de abas inteira.
const s = {
  page: { minHeight: "100vh", background: "var(--navy)", color: "var(--text)", fontFamily: "var(--font-body)" },
  container: { maxWidth: 900, margin: "0 auto", padding: "24px 20px" },
  card: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 16 },
  statCard: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 20px", textAlign: "center" },
  statValue: { fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "var(--coral)", lineHeight: 1 },
  statLabel: { fontSize: 12, color: "var(--text-muted)", marginTop: 8 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "10px 12px", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--border)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" },
  td: { padding: "10px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" },
  pill: { display: "inline-flex", padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 },
  tabBtn: (active) => ({
    padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
    fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
    background: active ? "var(--coral)" : "var(--surface-2)",
    color: active ? "#fff" : "var(--text-muted)",
    transition: "all 0.2s ease",
  }),
  input: {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid var(--border)", background: "var(--surface-2)",
    color: "var(--text)", fontSize: 13, fontFamily: "inherit",
  },
  pageBtn: (disabled) => ({
    padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--border)",
    background: "transparent", color: disabled ? "var(--text-faint)" : "var(--text-dim)",
    cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600,
    fontFamily: "inherit", opacity: disabled ? 0.6 : 1,
  }),
};

const TABS = [
  { id: "overview", label: "Visão Geral", icon: "BarChart" },
  { id: "users", label: "Usuários", icon: "Users" },
];

const TabBar = ({ tab, onChange }) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
    {TABS.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)} style={s.tabBtn(tab === t.id)}>
        <Icon name={t.icon} className="w-4 h-4" style={{ marginRight: 6, verticalAlign: "middle" }} />
        {t.label}
      </button>
    ))}
  </div>
);

const Spinner = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "24px 0", color: "var(--text-muted)", fontSize: 13 }}>
    <span
      aria-hidden="true"
      className="w-4 h-4 rounded-full animate-spin"
      style={{ border: "2px solid currentColor", borderTopColor: "transparent", flexShrink: 0 }}
    />
    {label}
  </div>
);

const ErrorBanner = ({ message }) => (
  <div style={{ ...s.card, border: "1px solid rgba(244,63,94,0.3)", background: "rgba(244,63,94,0.04)" }}>
    <p style={{ color: "var(--coral)", fontSize: 13, margin: 0 }}>{message}</p>
  </div>
);

const AdminPage = () => {
  const { navigate, profile } = useApp();
  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userDocs, setUserDocs] = useState([]);
  const [userDocsLoading, setUserDocsLoading] = useState(false);
  const [userDocsError, setUserDocsError] = useState(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      setStats(await AdminService.getStats());
    } catch (err) {
      console.error("[AdminPage][ERRO] loadStats:", err.message);
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await AdminService.getUsers({ page, pageSize: PAGE_SIZE, search: debouncedSearch });
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (err) {
      console.error("[AdminPage][ERRO] loadUsers:", err.message);
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Busca nova sempre volta para a página 1 — senão o usuário pode ficar
  // numa página que não existe mais para o termo digitado.
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const loadUserDocs = async (userId) => {
    setSelectedUser(userId);
    setUserDocsLoading(true);
    setUserDocsError(null);
    try {
      setUserDocs(await AdminService.getUserDocs(userId));
    } catch (err) {
      console.error("[AdminPage][ERRO] loadUserDocs:", err.message);
      setUserDocsError(err.message);
    } finally {
      setUserDocsLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  return (
    <AdminRoute>
      <div style={s.page}>
        <AppNavbar
          title="Admin"
          leftAction={
            <button onClick={() => navigate("dashboard", { replace: true })}
              style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)]/60">
              <Icon name="ChevronLeft" className="w-5 h-5" />
            </button>
          }
        />

        <div style={s.container}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(244,63,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="Shield" className="w-5 h-5" style={{ color: "var(--coral)" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, margin: 0 }}>Painel Administrativo</h1>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Bem-vindo, {profile?.nome || "Admin"}</p>
            </div>
          </div>

          <TabBar tab={tab} onChange={setTab} />

          {tab === "overview" && (
            <>
              {statsError && <ErrorBanner message={statsError} />}
              {statsLoading && <Spinner label="Carregando estatísticas..." />}

              {!statsLoading && stats && (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                    <span style={{ padding: "10px 18px", borderRadius: 100, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-dim)" }}>
                      <strong style={{ color: "var(--coral)" }}>{stats.totalUsers}</strong> usuário{stats.totalUsers !== 1 ? "s" : ""}
                    </span>
                    <span style={{ padding: "10px 18px", borderRadius: 100, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-dim)" }}>
                      <strong style={{ color: "var(--teal)" }}>{stats.totalDocs}</strong> documento{stats.totalDocs !== 1 ? "s" : ""}
                    </span>
                    <span style={{ padding: "10px 18px", borderRadius: 100, background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-dim)" }}>
                      <strong style={{ color: "var(--gold)" }}>{stats.finalizedDocs}</strong> finalizado{stats.finalizedDocs !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {stats.docsByType && Object.keys(stats.docsByType).length > 0 && (
                    <div style={s.card}>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>Documentos por Tipo</h3>
                      {Object.entries(stats.docsByType).map(([type, count]) => (
                        <div key={type} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                          <span style={{ color: "var(--text-dim)" }}>{type}</span>
                          <span style={{ fontWeight: 700, color: "var(--text)" }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === "users" && (
            <div style={s.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Usuários {totalUsers > 0 && `(${totalUsers})`}
                </h3>
                <div style={{ width: 220, maxWidth: "100%" }}>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nome..."
                    style={s.input}
                    aria-label="Buscar usuário por nome"
                  />
                </div>
              </div>

              {usersError && <ErrorBanner message={usersError} />}
              {usersLoading && <Spinner label="Carregando usuários..." />}

              {!usersLoading && !usersError && users.length === 0 && (
                <p style={{ color: "var(--text-faint)", fontSize: 13 }}>
                  {search ? "Nenhum usuário encontrado para essa busca." : "Nenhum usuário encontrado."}
                </p>
              )}

              {!usersLoading && users.length > 0 && (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          <th style={s.th}>Nome</th>
                          <th style={s.th}>Email</th>
                          <th style={s.th}>Role</th>
                          <th style={s.th}>Documentos</th>
                          <th style={s.th}>Criado em</th>
                          <th style={s.th}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td style={s.td}>
                              <span style={{ color: "var(--text)", fontWeight: 600 }}>
                                {u.nome ? `${u.nome} ${u.sobrenome || ""}`.trim() : "—"}
                              </span>
                            </td>
                            <td style={s.td}>{u.email || "—"}</td>
                            <td style={s.td}>
                              <span style={{
                                ...s.pill,
                                background: u.role === "admin" ? "rgba(212,175,55,0.12)" : "var(--surface-3)",
                                color: u.role === "admin" ? "var(--gold)" : "var(--text-muted)",
                              }}>
                                {u.role || "user"}
                              </span>
                            </td>
                            <td style={{ ...s.td, fontWeight: 700, color: "var(--text)" }}>{u.docCount}</td>
                            <td style={s.td}>{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                            <td style={s.td}>
                              <button onClick={() => loadUserDocs(u.id)}
                                style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-dim)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
                                Documentos
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        style={s.pageBtn(page <= 1)}
                      >
                        Anterior
                      </button>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        Página {page} de {totalPages}
                      </span>
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        style={s.pageBtn(page >= totalPages)}
                      >
                        Próxima
                      </button>
                    </div>
                  )}
                </>
              )}

              {selectedUser && (
                <div style={{ marginTop: 24, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <h4 style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, margin: 0 }}>
                      Documentos do Usuário {!userDocsLoading && `(${userDocs.length})`}
                    </h4>
                    <button onClick={() => { setSelectedUser(null); setUserDocs([]); setUserDocsError(null); }}
                      style={{ padding: "4px 12px", borderRadius: 8, border: "none", background: "var(--surface-2)", color: "var(--text-muted)", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                      Fechar
                    </button>
                  </div>

                  {userDocsError && <ErrorBanner message={userDocsError} />}
                  {userDocsLoading && <Spinner label="Carregando documentos..." />}

                  {!userDocsLoading && !userDocsError && userDocs.length === 0 && (
                    <p style={{ color: "var(--text-faint)", fontSize: 13 }}>Nenhum documento.</p>
                  )}

                  {!userDocsLoading && userDocs.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {userDocs.map((d) => (
                        <div key={d.id} style={{ padding: "12px 16px", borderRadius: 12, background: "var(--surface-2)", fontSize: 13 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <span style={{ fontWeight: 600, color: "var(--text)" }}>{d.title}</span>
                              <span style={{ marginLeft: 8, fontSize: 11, color: "var(--text-faint)" }}>{d.code || "—"}</span>
                            </div>
                            <span style={{
                              ...s.pill,
                              background: d.status === "finalizado" ? "rgba(20,184,166,0.12)" : "rgba(244,63,94,0.12)",
                              color: d.status === "finalizado" ? "var(--teal)" : "var(--coral)",
                            }}>
                              {d.status || "draft"}
                            </span>
                          </div>
                          <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-faint)" }}>
                            {d.document_type_name || d.type} — {d.created_at ? new Date(d.created_at).toLocaleDateString("pt-BR") : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPage;
