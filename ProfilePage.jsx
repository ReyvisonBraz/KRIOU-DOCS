import { useState } from "react";

/*
 * Kriou Docs — Página de Perfil e Configurações
 * 
 * Funcionalidades:
 * - Visualização e edição dos dados pessoais
 * - Configurações de notificação (WhatsApp, Email)
 * - Gerenciamento de assinatura/plano
 * - Histórico de pagamentos
 * - Exclusão de conta
 * 
 * TODO: [AUTH] - Validar sessão antes de exibir
 * TODO: [API] - Carregar dados do usuário da API
 * TODO: [DB] - Persistir alterações no banco
 * TODO: [WPP] - Verificar número de WhatsApp atualizado
 * TODO: [PAY] - Integrar com Mercado Pago para gestão de assinatura
 */

// ─── Inline Icons ───
const Icons = {
  User: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Phone: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Bell: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  CreditCard: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Shield: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Trash: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  ChevronLeft: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>,
  ChevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>,
  Mail: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Camera: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  ExternalLink: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

// ─── Styles (shared design tokens) ───
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
:root {
  --navy: #0F0F1E; --navy-light: #1A1A2E; --coral: #E94560; --coral-light: #FF6B81;
  --blue: #0F3460; --purple: #533483; --teal: #00D2D3; --gold: #F9A825;
  --surface: #16162A; --surface-2: #1E1E36; --surface-3: #26264A;
  --text: #F0F0F5; --text-muted: #8888A8; --border: #2A2A4A;
  --success: #00C897; --danger: #FF4757;
  --font-display: 'Outfit', sans-serif; --font-body: 'Plus Jakarta Sans', sans-serif;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-body); background: var(--navy); color: var(--text); }
.font-display { font-family: var(--font-display); }
@keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
.animate-fadeUp { animation: fadeUp .5s ease both }
.animate-fadeIn { animation: fadeIn .4s ease both }
.delay-1 { animation-delay:.1s } .delay-2 { animation-delay:.2s } .delay-3 { animation-delay:.3s }

.glass { background: rgba(22,22,42,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px) }
.card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; transition: all .3s }
.input-field {
  width:100%; background:var(--surface-2); border:1.5px solid var(--border); border-radius:10px;
  padding:14px 16px; color:var(--text); font-size:15px; font-family:var(--font-body);
  transition:all .25s; outline:none;
}
.input-field:focus { border-color:var(--coral); box-shadow:0 0 0 3px rgba(233,69,96,0.15) }
.input-field::placeholder { color:var(--text-muted) }
.btn-primary {
  background:linear-gradient(135deg,var(--coral),#D63851); color:white; border:none;
  border-radius:12px; padding:14px 32px; font-weight:700; font-size:15px;
  cursor:pointer; transition:all .25s; font-family:var(--font-body);
}
.btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(233,69,96,0.4) }
.btn-secondary {
  background:var(--surface-2); color:var(--text); border:1px solid var(--border);
  border-radius:12px; padding:14px 32px; font-weight:600; font-size:15px;
  cursor:pointer; transition:all .25s; font-family:var(--font-body);
}
.btn-secondary:hover { background:var(--surface-3); border-color:var(--coral) }
.btn-danger {
  background:transparent; color:var(--danger); border:1px solid var(--danger);
  border-radius:12px; padding:12px 24px; font-weight:600; font-size:14px;
  cursor:pointer; transition:all .25s; font-family:var(--font-body);
}
.btn-danger:hover { background:rgba(255,71,87,0.1) }
`;

// ─── Mock Data ───
const MOCK_PAYMENTS = [
  { id: 1, date: "25/03/2026", desc: "Currículo — Tech", method: "PIX", amount: "R$ 9,90", status: "Aprovado" },
  { id: 2, date: "18/03/2026", desc: "Contrato de Aluguel", method: "Cartão", amount: "R$ 19,90", status: "Aprovado" },
  { id: 3, date: "10/03/2026", desc: "Currículo — Executivo", method: "PIX", amount: "R$ 9,90", status: "Aprovado" },
];

// ─── Toggle Component ───
const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
    <span style={{ fontSize:14, color:"var(--text)" }}>{label}</span>
    <div onClick={() => onChange(!checked)} style={{
      width:48, height:26, borderRadius:13, padding:3, cursor:"pointer", transition:"all .25s",
      background: checked ? "var(--coral)" : "var(--surface-3)",
    }}>
      <div style={{
        width:20, height:20, borderRadius:"50%", background:"white", transition:"all .25s",
        transform: checked ? "translateX(22px)" : "translateX(0)",
      }} />
    </div>
  </label>
);

// ─── Main Component ───
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("perfil");
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // TODO: [API] - Carregar dados reais do usuário
  const [profile, setProfile] = useState({
    nome: "Reyvison",
    email: "reyvison@email.com",
    telefone: "(11) 99999-9999",
    cidade: "São Paulo, SP",
  });

  const [notifications, setNotifications] = useState({
    whatsappDocs: true,
    whatsappPromo: false,
    emailDocs: true,
    emailNews: false,
  });

  const handleSave = () => {
    // TODO: [API] - PUT /api/user/profile
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "perfil", label: "Perfil", icon: Icons.User },
    { id: "notificacoes", label: "Notificações", icon: Icons.Bell },
    { id: "plano", label: "Plano & Pagamentos", icon: Icons.CreditCard },
    { id: "seguranca", label: "Segurança", icon: Icons.Shield },
  ];

  const labelStyle = { fontSize:12, fontWeight:600, color:"var(--text-muted)", marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:"0.5px" };

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight:"100vh" }}>
        {/* Navbar */}
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", alignItems:"center", gap:16 }}>
            <button style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", display:"flex" }}>
              <Icons.ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-display" style={{ fontSize:20, fontWeight:800 }}>Meu Perfil</div>
            <div style={{ flex:1 }} />
            {saved && (
              <div className="animate-fadeIn" style={{ display:"flex", alignItems:"center", gap:6, color:"var(--success)", fontSize:13, fontWeight:600 }}>
                <Icons.Check className="w-4 h-4" /> Salvo
              </div>
            )}
          </div>
        </nav>

        <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 24px" }}>
          {/* Avatar Section */}
          <div className="animate-fadeUp" style={{ display:"flex", alignItems:"center", gap:20, marginBottom:36 }}>
            <div style={{ position:"relative" }}>
              <div style={{
                width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg, var(--coral), var(--purple))",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, fontWeight:800, fontFamily:"var(--font-display)"
              }}>R</div>
              <button style={{
                position:"absolute", bottom:-2, right:-2, width:28, height:28, borderRadius:"50%",
                background:"var(--surface-3)", border:"2px solid var(--navy)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              }}>
                <Icons.Camera className="w-3.5 h-3.5" style={{ color:"var(--text)" }} />
              </button>
            </div>
            <div>
              <h2 className="font-display" style={{ fontSize:24, fontWeight:800 }}>{profile.nome}</h2>
              <p style={{ color:"var(--text-muted)", fontSize:14 }}>Membro desde Mar 2026</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="animate-fadeUp delay-1" style={{ display:"flex", gap:4, marginBottom:32, overflowX:"auto", paddingBottom:4 }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, border:"none",
                  background: active ? "var(--coral)" : "var(--surface-2)", color: active ? "white" : "var(--text-muted)",
                  fontWeight:600, fontSize:13, cursor:"pointer", transition:"all .25s", whiteSpace:"nowrap",
                  fontFamily:"var(--font-body)",
                }}>
                  <Icon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "perfil" && (
            <div className="animate-fadeIn">
              <div className="card" style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>Informações Pessoais</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div>
                    <label style={labelStyle}>Nome Completo</label>
                    <input className="input-field" value={profile.nome}
                      onChange={e => setProfile(p => ({...p, nome: e.target.value}))} />
                  </div>
                  <div>
                    <label style={labelStyle}>E-mail</label>
                    <input className="input-field" type="email" value={profile.email}
                      onChange={e => setProfile(p => ({...p, email: e.target.value}))} />
                  </div>
                  <div>
                    <label style={labelStyle}>WhatsApp</label>
                    <div style={{ position:"relative" }}>
                      <Icons.Phone className="w-4 h-4" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                      <input className="input-field" style={{ paddingLeft:40 }} value={profile.telefone}
                        onChange={e => setProfile(p => ({...p, telefone: e.target.value}))} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Cidade / Estado</label>
                    <input className="input-field" value={profile.cidade}
                      onChange={e => setProfile(p => ({...p, cidade: e.target.value}))} />
                  </div>
                </div>
                <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}>
                  <button className="btn-primary" onClick={handleSave}>Salvar Alterações</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notificacoes" && (
            <div className="animate-fadeIn">
              <div className="card" style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>WhatsApp</h3>
                <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:20 }}>Gerencie as mensagens que você recebe no WhatsApp</p>
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <Toggle label="Receber documentos finalizados" checked={notifications.whatsappDocs}
                    onChange={v => setNotifications(p => ({...p, whatsappDocs: v}))} />
                  <Toggle label="Ofertas e novidades" checked={notifications.whatsappPromo}
                    onChange={v => setNotifications(p => ({...p, whatsappPromo: v}))} />
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>E-mail</h3>
                <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:20 }}>Gerencie suas notificações por e-mail</p>
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <Toggle label="Confirmação de documentos" checked={notifications.emailDocs}
                    onChange={v => setNotifications(p => ({...p, emailDocs: v}))} />
                  <Toggle label="Newsletter e dicas" checked={notifications.emailNews}
                    onChange={v => setNotifications(p => ({...p, emailNews: v}))} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "plano" && (
            <div className="animate-fadeIn">
              {/* Current Plan */}
              <div className="card" style={{ marginBottom:20, border:"1px solid var(--coral)", background:"linear-gradient(135deg, var(--surface) 0%, rgba(233,69,96,0.05) 100%)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
                  <div>
                    <span style={{ background:"var(--coral)", color:"white", padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700, display:"inline-block", marginBottom:8 }}>PLANO ATUAL</span>
                    <h3 className="font-display" style={{ fontSize:24, fontWeight:800 }}>Avulso</h3>
                    <p style={{ color:"var(--text-muted)", fontSize:14 }}>R$ 9,90 por documento</p>
                  </div>
                  <button className="btn-primary" style={{ whiteSpace:"nowrap" }}>
                    Upgrade para Mensal <Icons.ChevronRight className="w-4 h-4" style={{ display:"inline", marginLeft:4 }} />
                  </button>
                </div>
              </div>

              {/* Payment History */}
              <div className="card">
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>Histórico de Pagamentos</h3>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {MOCK_PAYMENTS.map((p, i) => (
                    <div key={p.id} style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center", padding:14,
                      background:"var(--surface-2)", borderRadius:10, flexWrap:"wrap", gap:8,
                    }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{p.desc}</div>
                        <div style={{ fontSize:12, color:"var(--text-muted)" }}>{p.date} • {p.method}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontWeight:700, color:"var(--text)" }}>{p.amount}</span>
                        <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100, background:"rgba(0,200,151,0.15)", color:"var(--success)" }}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="animate-fadeIn">
              <div className="card" style={{ marginBottom:20 }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>Sessão Ativa</h3>
                <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:16 }}>Autenticado via WhatsApp OTP</p>
                <div style={{ display:"flex", alignItems:"center", gap:12, padding:14, background:"var(--surface-2)", borderRadius:10 }}>
                  <Icons.Phone className="w-5 h-5" style={{ color:"var(--success)" }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{profile.telefone}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)" }}>Última verificação: há 2 horas</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, padding:"3px 10px", borderRadius:100, background:"rgba(0,200,151,0.15)", color:"var(--success)" }}>Ativo</span>
                </div>
              </div>

              <div className="card" style={{ border:"1px solid var(--danger)" }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6, color:"var(--danger)" }}>Zona de Perigo</h3>
                <p style={{ fontSize:13, color:"var(--text-muted)", marginBottom:16 }}>Ações irreversíveis na sua conta</p>
                <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                  <Icons.Trash className="w-4 h-4" style={{ display:"inline", marginRight:8 }} />
                  Excluir Minha Conta
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
            <div className="card animate-fadeIn" style={{ maxWidth:420, width:"100%", textAlign:"center", padding:32 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,71,87,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Icons.Trash className="w-7 h-7" style={{ color:"var(--danger)" }} />
              </div>
              <h3 className="font-display" style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Excluir conta?</h3>
              <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:24, lineHeight:1.6 }}>
                Esta ação é irreversível. Todos os seus documentos, dados e histórico serão permanentemente removidos.
              </p>
              <div style={{ display:"flex", gap:12 }}>
                <button className="btn-secondary" style={{ flex:1 }} onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button className="btn-danger" style={{ flex:1, padding:"14px 24px" }}>Sim, Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
