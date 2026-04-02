import { useState } from "react";

/*
 * Kriou Docs — Detalhes do Documento + Histórico de Edições
 * 
 * Funcionalidades:
 * - Visualização detalhada de um documento específico
 * - Histórico completo de edições com timeline visual
 * - Comparação entre versões
 * - Ações: editar, duplicar, baixar, compartilhar, excluir
 * - Status do documento e validade
 * 
 * TODO: [DB] - Carregar documento e histórico do banco
 * TODO: [API] - Endpoints GET /api/documents/:id e GET /api/documents/:id/history
 * TODO: [AUTH] - Verificar ownership do documento
 */

const Icons = {
  FileText: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Edit: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Download: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Copy: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Trash: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Share: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  Clock: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  ChevronLeft: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>,
  MessageCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Eye: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  RotateCcw: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  Calendar: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  AlertCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
:root {
  --navy:#0F0F1E; --coral:#E94560; --blue:#0F3460; --teal:#00D2D3; --gold:#F9A825;
  --purple:#533483; --surface:#16162A; --surface-2:#1E1E36; --surface-3:#26264A;
  --text:#F0F0F5; --text-muted:#8888A8; --border:#2A2A4A; --success:#00C897; --danger:#FF4757;
  --font-display:'Outfit',sans-serif; --font-body:'Plus Jakarta Sans',sans-serif;
}
* { box-sizing:border-box;margin:0;padding:0 }
body { font-family:var(--font-body);background:var(--navy);color:var(--text) }
.font-display { font-family:var(--font-display) }
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0}to{opacity:1} }
.animate-fadeUp { animation:fadeUp .5s ease both }
.animate-fadeIn { animation:fadeIn .4s ease both }
.delay-1{animation-delay:.1s}.delay-2{animation-delay:.2s}.delay-3{animation-delay:.3s}
.glass { background:rgba(22,22,42,0.85);backdrop-filter:blur(20px) }
.card { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;transition:all .3s }
.btn-primary { background:linear-gradient(135deg,var(--coral),#D63851);color:white;border:none;border-radius:12px;padding:12px 24px;font-weight:700;font-size:14px;cursor:pointer;transition:all .25s;font-family:var(--font-body) }
.btn-primary:hover { transform:translateY(-2px);box-shadow:0 8px 30px rgba(233,69,96,0.4) }
.btn-secondary { background:var(--surface-2);color:var(--text);border:1px solid var(--border);border-radius:12px;padding:12px 24px;font-weight:600;font-size:14px;cursor:pointer;transition:all .25s;font-family:var(--font-body) }
.btn-secondary:hover { background:var(--surface-3);border-color:var(--coral) }
.btn-icon { background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;color:var(--text) }
.btn-icon:hover { background:var(--surface-3);border-color:var(--coral) }
`;

// ─── Mock Document Data ───
const MOCK_DOCUMENT = {
  id: "doc-001",
  type: "Currículo",
  template: "Tech",
  title: "Desenvolvedor Full Stack",
  status: "finalizado",
  createdAt: "20/03/2026 às 14:32",
  updatedAt: "25/03/2026 às 10:15",
  expiresAt: "20/04/2026",
  daysLeft: 26,
  downloads: 3,
  whatsappSent: true,
  paidAmount: "R$ 9,90",
  paymentMethod: "PIX",
  templateColor: "#0D7377",
};

const MOCK_HISTORY = [
  {
    id: "v5", date: "25/03/2026", time: "10:15", type: "edit",
    label: "Experiência atualizada", detail: "Adicionado cargo 'Tech Lead' na empresa atual",
    version: "v1.4"
  },
  {
    id: "v4", date: "24/03/2026", time: "16:42", type: "download",
    label: "PDF baixado", detail: "Download do PDF final realizado",
    version: "v1.3"
  },
  {
    id: "v3", date: "23/03/2026", time: "09:30", type: "edit",
    label: "Habilidades atualizadas", detail: "Adicionado Docker, AWS e Kubernetes às habilidades",
    version: "v1.2"
  },
  {
    id: "v2", date: "21/03/2026", time: "14:00", type: "whatsapp",
    label: "Enviado via WhatsApp", detail: "PDF enviado para (11) 99999-9999",
    version: "v1.1"
  },
  {
    id: "v1", date: "20/03/2026", time: "14:32", type: "created",
    label: "Documento criado", detail: "Currículo criado com o modelo Tech e pagamento via PIX confirmado",
    version: "v1.0"
  },
];

// ─── Timeline Event Colors ───
const EVENT_STYLES = {
  edit: { color: "var(--teal)", bg: "rgba(0,210,211,0.15)", icon: Icons.Edit },
  download: { color: "var(--coral)", bg: "rgba(233,69,96,0.15)", icon: Icons.Download },
  whatsapp: { color: "var(--success)", bg: "rgba(0,200,151,0.15)", icon: Icons.MessageCircle },
  created: { color: "var(--purple)", bg: "rgba(83,52,131,0.2)", icon: Icons.Check },
};

export default function DocumentDetails() {
  const [activeTab, setActiveTab] = useState("detalhes");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const doc = MOCK_DOCUMENT;

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight:"100vh" }}>
        {/* Navbar */}
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}>
                <Icons.ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-display" style={{ fontSize:18, fontWeight:800 }}>Detalhes do Documento</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-icon"><Icons.Share className="w-4 h-4" /></button>
              <button className="btn-primary"><Icons.Edit className="w-4 h-4" style={{ display:"inline", marginRight:6 }} /> Editar</button>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth:1000, margin:"0 auto", padding:"32px 24px" }}>
          {/* Document Header Card */}
          <div className="card animate-fadeUp" style={{ marginBottom:24, background:"linear-gradient(135deg, var(--surface) 0%, rgba(13,115,119,0.08) 100%)", border:"1px solid rgba(13,115,119,0.3)" }}>
            <div style={{ display:"flex", gap:20, alignItems:"flex-start", flexWrap:"wrap" }}>
              {/* Document Thumbnail */}
              <div style={{
                width:100, height:130, borderRadius:8, background:"white", position:"relative", flexShrink:0,
                boxShadow:"0 4px 20px rgba(0,0,0,0.3)", display:"flex", alignItems:"center", justifyContent:"center",
                overflow:"hidden",
              }}>
                <div style={{ padding:8, textAlign:"center", width:"100%" }}>
                  <div style={{ width:"80%", height:6, background:"#ddd", borderRadius:3, margin:"0 auto 6px" }} />
                  <div style={{ width:"60%", height:4, background:"#eee", borderRadius:3, margin:"0 auto 4px" }} />
                  <div style={{ width:"70%", height:4, background:"#eee", borderRadius:3, margin:"0 auto 4px" }} />
                  <div style={{ width:"85%", height:1, background:"#eee", margin:"6px auto" }} />
                  {[1,2,3].map(n => <div key={n} style={{ width:`${90-n*12}%`, height:3, background:"#f0f0f0", borderRadius:2, margin:"3px auto" }} />)}
                </div>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, background:doc.templateColor }} />
              </div>

              {/* Document Info */}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" }}>
                  <span style={{
                    fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100,
                    background: doc.status === "finalizado" ? "rgba(0,200,151,0.15)" : "rgba(249,168,37,0.15)",
                    color: doc.status === "finalizado" ? "var(--success)" : "var(--gold)",
                  }}>{doc.status === "finalizado" ? "✓ Finalizado" : "Rascunho"}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:100, background:"var(--surface-3)", color:"var(--text-muted)" }}>{doc.type}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:100, background:"rgba(13,115,119,0.15)", color:"var(--teal)" }}>{doc.template}</span>
                </div>
                <h1 className="font-display" style={{ fontSize:26, fontWeight:900, marginBottom:4, letterSpacing:"-0.5px" }}>{doc.title}</h1>
                <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.7 }}>
                  Criado em {doc.createdAt} • Última edição em {doc.updatedAt}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display:"flex", gap:10, marginTop:20, paddingTop:20, borderTop:"1px solid var(--border)", flexWrap:"wrap" }}>
              {[
                { icon: Icons.Edit, label: "Editar", color: "var(--teal)" },
                { icon: Icons.Download, label: "Baixar PDF", color: "var(--coral)" },
                { icon: Icons.Copy, label: "Duplicar", color: "var(--purple)" },
                { icon: Icons.MessageCircle, label: "Reenviar WhatsApp", color: "var(--success)" },
                { icon: Icons.Trash, label: "Excluir", color: "var(--danger)" },
              ].map((action, i) => (
                <button key={i} onClick={action.label === "Excluir" ? () => setShowDeleteModal(true) : undefined}
                  style={{
                    display:"flex", alignItems:"center", gap:6, background:"var(--surface-2)", border:"1px solid var(--border)",
                    borderRadius:10, padding:"10px 16px", cursor:"pointer", transition:"all .2s", color: action.color,
                    fontWeight:600, fontSize:13, fontFamily:"var(--font-body)",
                  }}>
                  <action.icon className="w-4 h-4" /> {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="animate-fadeUp delay-1" style={{ display:"flex", gap:4, marginBottom:24 }}>
            {[
              { id:"detalhes", label:"Detalhes" },
              { id:"historico", label:"Histórico de Edições" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                padding:"10px 24px", borderRadius:10, border:"none", fontWeight:600, fontSize:14, cursor:"pointer",
                background: activeTab === tab.id ? "var(--coral)" : "var(--surface-2)",
                color: activeTab === tab.id ? "white" : "var(--text-muted)",
                transition:"all .25s", fontFamily:"var(--font-body)",
              }}>{tab.label}</button>
            ))}
          </div>

          {/* Tab: Detalhes */}
          {activeTab === "detalhes" && (
            <div className="animate-fadeIn" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:16 }}>
              {/* Info Cards */}
              <div className="card">
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  <Icons.Calendar className="w-4 h-4" style={{ color:"var(--teal)" }} /> Validade
                </h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>Expira em</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>{doc.expiresAt}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>Dias restantes</span>
                    <span style={{ fontSize:14, fontWeight:700, color:"var(--success)" }}>{doc.daysLeft} dias</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ background:"var(--surface-3)", borderRadius:100, height:6, overflow:"hidden", marginTop:4 }}>
                    <div style={{ width:`${(doc.daysLeft/30)*100}%`, height:"100%", background:"linear-gradient(90deg, var(--success), var(--teal))", borderRadius:100, transition:"width .5s" }} />
                  </div>
                  <p style={{ fontSize:12, color:"var(--text-muted)" }}>Edições ilimitadas dentro do período de validade.</p>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  <Icons.Download className="w-4 h-4" style={{ color:"var(--coral)" }} /> Downloads & Envios
                </h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>Downloads realizados</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>{doc.downloads}x</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>WhatsApp</span>
                    <span style={{ fontSize:14, fontWeight:600, color:"var(--success)" }}>✓ Enviado</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>Último download</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>24/03 às 16:42</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
                  <Icons.FileText className="w-4 h-4" style={{ color:"var(--purple)" }} /> Pagamento
                </h3>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>Valor pago</span>
                    <span style={{ fontSize:14, fontWeight:700, color:"var(--coral)" }}>{doc.paidAmount}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>Método</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>{doc.paymentMethod}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, color:"var(--text-muted)" }}>Data</span>
                    <span style={{ fontSize:14, fontWeight:600 }}>20/03/2026</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Histórico */}
          {activeTab === "historico" && (
            <div className="animate-fadeIn">
              <div className="card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
                  <h3 style={{ fontSize:17, fontWeight:700 }}>Timeline de Alterações</h3>
                  <span style={{ fontSize:13, color:"var(--text-muted)" }}>{MOCK_HISTORY.length} eventos</span>
                </div>

                <div style={{ position:"relative" }}>
                  {/* Timeline line */}
                  <div style={{ position:"absolute", left:19, top:0, bottom:0, width:2, background:"var(--border)" }} />

                  {MOCK_HISTORY.map((event, i) => {
                    const style = EVENT_STYLES[event.type];
                    const Icon = style.icon;
                    return (
                      <div key={event.id} className="animate-fadeUp" style={{ display:"flex", gap:16, marginBottom:i < MOCK_HISTORY.length-1 ? 28 : 0, position:"relative", animationDelay:`${i*0.08}s` }}>
                        {/* Timeline dot */}
                        <div style={{
                          width:40, height:40, borderRadius:12, background:style.bg, border:`2px solid ${style.color}`,
                          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, zIndex:1,
                        }}>
                          <Icon className="w-4 h-4" style={{ color: style.color }} />
                        </div>

                        {/* Event content */}
                        <div style={{ flex:1, paddingTop:2 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
                            <div>
                              <div style={{ fontWeight:700, fontSize:15, marginBottom:2 }}>{event.label}</div>
                              <div style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5 }}>{event.detail}</div>
                            </div>
                            <div style={{ textAlign:"right", flexShrink:0 }}>
                              <div style={{ fontSize:12, color:"var(--text-muted)" }}>{event.date}</div>
                              <div style={{ fontSize:11, color:"var(--text-muted)" }}>{event.time}</div>
                              <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100, background:"var(--surface-3)", color:"var(--text-muted)", marginTop:4, display:"inline-block" }}>{event.version}</span>
                            </div>
                          </div>

                          {/* Action buttons for edits */}
                          {event.type === "edit" && (
                            <div style={{ display:"flex", gap:8, marginTop:10 }}>
                              <button style={{
                                display:"flex", alignItems:"center", gap:4, background:"var(--surface-3)", border:"none",
                                borderRadius:6, padding:"6px 12px", fontSize:12, color:"var(--teal)", cursor:"pointer", fontWeight:600,
                              }}>
                                <Icons.Eye className="w-3 h-3" /> Ver versão
                              </button>
                              <button style={{
                                display:"flex", alignItems:"center", gap:4, background:"var(--surface-3)", border:"none",
                                borderRadius:6, padding:"6px 12px", fontSize:12, color:"var(--text-muted)", cursor:"pointer", fontWeight:600,
                              }}>
                                <Icons.RotateCcw className="w-3 h-3" /> Restaurar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
            <div className="card animate-fadeIn" style={{ maxWidth:420, width:"100%", textAlign:"center", padding:32 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,71,87,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <Icons.AlertCircle className="w-7 h-7" style={{ color:"var(--danger)" }} />
              </div>
              <h3 className="font-display" style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>Excluir documento?</h3>
              <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:24, lineHeight:1.6 }}>
                O documento "{doc.title}" e todo seu histórico serão removidos permanentemente. Esta ação não pode ser desfeita.
              </p>
              <div style={{ display:"flex", gap:12 }}>
                <button className="btn-secondary" style={{ flex:1 }} onClick={() => setShowDeleteModal(false)}>Cancelar</button>
                <button style={{ flex:1, background:"var(--danger)", color:"white", border:"none", borderRadius:12, padding:"14px 24px", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"var(--font-body)" }}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
