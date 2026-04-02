import { useState, useEffect, useCallback } from "react";

// ─── Icons (inline SVG components) ───
const Icons = {
  FileText: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  User: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Briefcase: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  GraduationCap: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5"/></svg>,
  Star: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  Globe: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  Plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Award: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  ChevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>,
  ChevronLeft: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>,
  Phone: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Download: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Edit: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Copy: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  Zap: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  Shield: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Home: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  LogOut: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Eye: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  CreditCard: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  MessageCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Layout: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  Save: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>,
};

const ic = (Icon, cls = "w-5 h-5") => <Icon className={cls} />;

// ─── Styles ───
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --navy: #0F0F1E;
  --navy-light: #1A1A2E;
  --blue: #0F3460;
  --coral: #E94560;
  --coral-light: #FF6B81;
  --purple: #533483;
  --teal: #00D2D3;
  --gold: #F9A825;
  --surface: #16162A;
  --surface-2: #1E1E36;
  --surface-3: #26264A;
  --text: #F0F0F5;
  --text-muted: #8888A8;
  --border: #2A2A4A;
  --success: #00C897;
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body, #root { font-family: var(--font-body); background: var(--navy); color: var(--text); }

.font-display { font-family: var(--font-display); }

@keyframes fadeUp { from { opacity:0; transform: translateY(24px) } to { opacity:1; transform: translateY(0) } }
@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes slideRight { from { opacity:0; transform: translateX(-20px) } to { opacity:1; transform: translateX(0) } }
@keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(233,69,96,0.3) } 50% { box-shadow: 0 0 40px rgba(233,69,96,0.6) } }
@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
@keyframes typing { 0%,100% { opacity:.3 } 50% { opacity:1 } }
@keyframes scaleIn { from { opacity:0; transform: scale(0.9) } to { opacity:1; transform: scale(1) } }
@keyframes checkmark { 0% { stroke-dashoffset: 100 } 100% { stroke-dashoffset: 0 } }
@keyframes confetti { 0% { transform: translateY(0) rotate(0); opacity:1 } 100% { transform: translateY(400px) rotate(720deg); opacity:0 } }

.animate-fadeUp { animation: fadeUp .6s ease both }
.animate-fadeIn { animation: fadeIn .5s ease both }
.animate-slideRight { animation: slideRight .5s ease both }
.animate-scaleIn { animation: scaleIn .4s ease both }
.delay-1 { animation-delay: .1s }
.delay-2 { animation-delay: .2s }
.delay-3 { animation-delay: .3s }
.delay-4 { animation-delay: .4s }
.delay-5 { animation-delay: .5s }
.delay-6 { animation-delay: .6s }

.btn-primary {
  background: linear-gradient(135deg, var(--coral), #D63851);
  color: white; border: none; border-radius: 12px; padding: 14px 32px;
  font-weight: 700; font-size: 15px; cursor: pointer; transition: all .25s;
  font-family: var(--font-body); letter-spacing: 0.3px;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(233,69,96,0.4) }

.btn-secondary {
  background: var(--surface-2); color: var(--text); border: 1px solid var(--border);
  border-radius: 12px; padding: 14px 32px; font-weight: 600; font-size: 15px;
  cursor: pointer; transition: all .25s; font-family: var(--font-body);
}
.btn-secondary:hover { background: var(--surface-3); border-color: var(--coral) }

.btn-small {
  padding: 8px 18px; font-size: 13px; border-radius: 8px;
}

.card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
  padding: 24px; transition: all .3s;
}
.card:hover { border-color: var(--coral); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3) }

.input-field {
  width: 100%; background: var(--surface-2); border: 1.5px solid var(--border);
  border-radius: 10px; padding: 14px 16px; color: var(--text); font-size: 15px;
  font-family: var(--font-body); transition: all .25s; outline: none;
}
.input-field:focus { border-color: var(--coral); box-shadow: 0 0 0 3px rgba(233,69,96,0.15) }
.input-field::placeholder { color: var(--text-muted) }

.glass { background: rgba(22,22,42,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px) }

.gradient-text {
  background: linear-gradient(135deg, var(--coral), var(--coral-light), var(--teal));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.watermark {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg);
  font-size: 48px; font-weight: 900; color: rgba(233,69,96,0.12); white-space: nowrap;
  pointer-events: none; user-select: none; letter-spacing: 8px;
}

::-webkit-scrollbar { width: 6px }
::-webkit-scrollbar-track { background: var(--navy) }
::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 3px }
`;

// ─── Data ───
const RESUME_TEMPLATES = [
  { id: "executivo", name: "Executivo", desc: "Clean e sofisticado", color: "#0F3460", accent: "#E94560", tag: "Popular" },
  { id: "criativo", name: "Criativo", desc: "Moderno e ousado", color: "#533483", accent: "#00D2D3", tag: "Novo" },
  { id: "classico", name: "Clássico", desc: "Formal e elegante", color: "#1A1A2E", accent: "#F9A825", tag: null },
  { id: "tech", name: "Tech", desc: "Minimalista e moderno", color: "#0D7377", accent: "#14FFEC", tag: "Novo" },
  { id: "primeiro-emprego", name: "Primeiro Emprego", desc: "Destaca formação", color: "#E94560", accent: "#FFF", tag: null },
];

const DOC_TYPES = [
  { id: "compra-venda", name: "Compra e Venda", icon: "FileText", available: false },
  { id: "aluguel", name: "Contrato de Aluguel", icon: "Home", available: false },
  { id: "procuracao", name: "Procuração", icon: "Shield", available: false },
  { id: "doacao", name: "Doação", icon: "Award", available: false },
  { id: "declaracao-residencia", name: "Decl. Residência", icon: "Home", available: false },
  { id: "uniao-estavel", name: "União Estável", icon: "User", available: false },
  { id: "oficio", name: "Ofício", icon: "FileText", available: false },
  { id: "parceria", name: "Contrato Parceria", icon: "Briefcase", available: false },
];

const STEPS = [
  { label: "Dados Pessoais", icon: Icons.User },
  { label: "Objetivo", icon: Icons.Star },
  { label: "Experiência", icon: Icons.Briefcase },
  { label: "Formação", icon: Icons.GraduationCap },
  { label: "Habilidades", icon: Icons.Star },
  { label: "Idiomas", icon: Icons.Globe },
  { label: "Extras", icon: Icons.Award },
];

const MOCK_DOCS = [
  { id: 1, type: "Currículo", title: "Dev Full Stack", template: "Tech", date: "25 Mar", status: "finalizado" },
  { id: 2, type: "Currículo", title: "Designer UX", template: "Criativo", date: "22 Mar", status: "rascunho" },
  { id: 3, type: "Contrato", title: "Aluguel Apt 302", template: "Padrão", date: "18 Mar", status: "finalizado" },
];

const SKILLS_OPTIONS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Git",
  "Figma", "Tailwind CSS", "Docker", "AWS", "MongoDB", "GraphQL", "Next.js",
  "Comunicação", "Liderança", "Trabalho em Equipe", "Resolução de Problemas",
  "Gestão de Projetos", "Inglês Técnico", "Scrum", "Design Thinking"
];

// ─── Main App ───
export default function KriouDocs() {
  const [page, setPage] = useState("landing");
  const [loginStep, setLoginStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [formData, setFormData] = useState({
    nome: "", email: "", telefone: "", cidade: "", linkedin: "",
    objetivo: "",
    experiencias: [{ empresa: "", cargo: "", periodo: "", descricao: "" }],
    formacoes: [{ instituicao: "", curso: "", periodo: "", status: "Completo" }],
    habilidades: [],
    idiomas: [{ idioma: "Português", nivel: "Nativo" }],
    cursos: "",
  });
  const [filter, setFilter] = useState("todos");
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); };

  // Auto-save simulation
  const triggerSave = useCallback(() => {
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1200);
  }, []);

  const updateForm = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
    triggerSave();
  };

  // ─── LANDING PAGE ───
  const LandingPage = () => (
    <div style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div className="font-display" style={{ fontSize:28, fontWeight:900, letterSpacing:"-1px" }}>
            <span style={{ color:"var(--coral)" }}>Kriou</span>
            <span style={{ color:"var(--text)", marginLeft:4 }}>Docs</span>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <button className="btn-secondary btn-small" onClick={() => navigate("login")}>Entrar</button>
            <button className="btn-primary btn-small" onClick={() => navigate("login")}>Criar Grátis</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"80px 24px 60px", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", top:40, left:"10%", width:300, height:300, background:"radial-gradient(circle, rgba(233,69,96,0.08) 0%, transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", top:100, right:"5%", width:200, height:200, background:"radial-gradient(circle, rgba(0,210,211,0.06) 0%, transparent 70%)", borderRadius:"50%", pointerEvents:"none" }}/>
        
        <div className="animate-fadeUp" style={{ display:"inline-block", background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:100, padding:"8px 20px", marginBottom:24 }}>
          <span style={{ color:"var(--teal)", fontSize:13, fontWeight:600 }}>✨ Novo — Crie seu currículo em 5 minutos</span>
        </div>
        
        <h1 className="font-display animate-fadeUp delay-1" style={{ fontSize:"clamp(36px, 6vw, 64px)", fontWeight:900, lineHeight:1.05, marginBottom:20, letterSpacing:"-2px" }}>
          Documentos profissionais<br/>
          <span className="gradient-text">sem complicação</span>
        </h1>
        
        <p className="animate-fadeUp delay-2" style={{ fontSize:18, color:"var(--text-muted)", maxWidth:560, margin:"0 auto 36px", lineHeight:1.7 }}>
          Currículos, contratos e documentos jurídicos prontos em minutos. Modelos profissionais, preenchimento guiado e entrega via WhatsApp.
        </p>
        
        <div className="animate-fadeUp delay-3" style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn-primary" style={{ padding:"16px 40px", fontSize:17 }} onClick={() => navigate("login")}>
            Começar Agora — É Grátis {ic(Icons.ChevronRight, "w-5 h-5 inline ml-1")}
          </button>
          <button className="btn-secondary" style={{ padding:"16px 40px", fontSize:17 }} onClick={() => document.getElementById("docs-section")?.scrollIntoView({ behavior:"smooth" })}>
            Ver Documentos
          </button>
        </div>

        {/* Stats */}
        <div className="animate-fadeUp delay-4" style={{ display:"flex", justifyContent:"center", gap:48, marginTop:64, flexWrap:"wrap" }}>
          {[["12+","Tipos de documentos"],["5","Modelos de currículo"],["< 5min","Tempo médio"]].map(([n,l],i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div className="font-display" style={{ fontSize:32, fontWeight:900, color:"var(--coral)" }}>{n}</div>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"60px 24px" }}>
        <h2 className="font-display" style={{ textAlign:"center", fontSize:32, fontWeight:800, marginBottom:48, letterSpacing:"-1px" }}>
          Por que o <span style={{ color:"var(--coral)" }}>Kriou Docs</span>?
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:20 }}>
          {[
            [Icons.Layout, "Modelos Prontos", "Templates profissionais com design moderno. Só preencher e baixar.", "var(--coral)"],
            [Icons.Zap, "Preenchimento Guiado", "Passo a passo inteligente. Sem curva de aprendizado.", "var(--teal)"],
            [Icons.Save, "Salvamento Automático", "Nunca perca seu progresso. Salva a cada alteração.", "var(--gold)"],
            [Icons.MessageCircle, "Entrega via WhatsApp", "Receba seu documento pronto direto no seu WhatsApp.", "var(--success)"],
            [Icons.Shield, "Documentos Válidos", "Estrutura jurídica validada para contratos e declarações.", "var(--purple)"],
            [Icons.Edit, "Edite Depois", "Atualize seus documentos quando quiser, sem refazer.", "var(--blue)"],
          ].map(([Icon, title, desc, color], i) => (
            <div key={i} className="card animate-fadeUp" style={{ animationDelay:`${i*0.1}s` }}>
              <div style={{ width:48, height:48, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3 style={{ fontSize:17, fontWeight:700, marginBottom:8 }}>{title}</h3>
              <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Documents Section */}
      <section id="docs-section" style={{ maxWidth:1200, margin:"0 auto", padding:"60px 24px" }}>
        <h2 className="font-display" style={{ textAlign:"center", fontSize:32, fontWeight:800, marginBottom:12, letterSpacing:"-1px" }}>
          Documentos Disponíveis
        </h2>
        <p style={{ textAlign:"center", color:"var(--text-muted)", marginBottom:48, fontSize:16 }}>Currículos profissionais agora. Contratos e documentos jurídicos em breve.</p>

        {/* Resume highlight */}
        <div className="card" style={{ border:"1px solid var(--coral)", padding:32, marginBottom:32, background:"linear-gradient(135deg, var(--surface) 0%, rgba(233,69,96,0.05) 100%)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <span style={{ background:"var(--coral)", color:"white", padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>DISPONÍVEL</span>
                <span style={{ background:"var(--teal)", color:"var(--navy)", padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:700 }}>5 MODELOS</span>
              </div>
              <h3 className="font-display" style={{ fontSize:26, fontWeight:800 }}>Currículos Profissionais</h3>
              <p style={{ color:"var(--text-muted)", marginTop:4 }}>Wizard de 7 etapas com preview em tempo real</p>
            </div>
            <button className="btn-primary" onClick={() => navigate("login")} style={{ whiteSpace:"nowrap" }}>
              Criar Currículo {ic(Icons.ChevronRight, "w-5 h-5 inline ml-1")}
            </button>
          </div>
        </div>

        {/* Coming soon docs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:14 }}>
          {DOC_TYPES.map((d, i) => {
            const Icon = Icons[d.icon] || Icons.FileText;
            return (
              <div key={d.id} className="card animate-fadeUp" style={{ opacity:0.6, cursor:"default", padding:20, animationDelay:`${i*0.05}s` }}>
                <Icon className="w-5 h-5" style={{ color:"var(--text-muted)", marginBottom:10 }} />
                <div style={{ fontSize:14, fontWeight:600 }}>{d.name}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>Em breve</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"60px 24px 80px" }}>
        <h2 className="font-display" style={{ textAlign:"center", fontSize:32, fontWeight:800, marginBottom:48, letterSpacing:"-1px" }}>Planos Simples</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20, maxWidth:900, margin:"0 auto" }}>
          {[
            { name:"Avulso", price:"R$ 9,90", sub:"por documento", features:["1 download PDF","Edição por 30 dias","Envio via WhatsApp","Suporte por e-mail"], highlight:false },
            { name:"Mensal", price:"R$ 19,90", sub:"/mês", features:["Documentos ilimitados","Todos os modelos","Edição ilimitada","Suporte prioritário"], highlight:true },
            { name:"Empresarial", price:"R$ 49,90", sub:"/mês", features:["Múltiplos usuários","Branding customizado","API de geração","Suporte dedicado"], highlight:false },
          ].map((plan, i) => (
            <div key={i} className="card" style={{
              textAlign:"center", padding:32, position:"relative",
              border: plan.highlight ? "2px solid var(--coral)" : "1px solid var(--border)",
              background: plan.highlight ? "linear-gradient(180deg, rgba(233,69,96,0.08) 0%, var(--surface) 50%)" : "var(--surface)"
            }}>
              {plan.highlight && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"var(--coral)", color:"white", padding:"4px 16px", borderRadius:100, fontSize:12, fontWeight:700 }}>MAIS POPULAR</div>}
              <h3 className="font-display" style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>{plan.name}</h3>
              <div className="font-display" style={{ fontSize:36, fontWeight:900, color:"var(--coral)", marginBottom:0 }}>{plan.price}</div>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>{plan.sub}</div>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, justifyContent:"center" }}>
                  <Icons.Check className="w-4 h-4" style={{ color:"var(--success)" }} />
                  <span style={{ fontSize:14, color:"var(--text-muted)" }}>{f}</span>
                </div>
              ))}
              <button className={plan.highlight ? "btn-primary" : "btn-secondary"} style={{ width:"100%", marginTop:16 }} onClick={() => navigate("login")}>
                Começar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:"1px solid var(--border)", padding:"32px 24px", textAlign:"center" }}>
        <div className="font-display" style={{ fontSize:20, fontWeight:800, marginBottom:8 }}>
          <span style={{ color:"var(--coral)" }}>Kriou</span> Docs
        </div>
        <p style={{ fontSize:13, color:"var(--text-muted)" }}>Documentos profissionais ao alcance de todos. © 2026</p>
      </footer>
    </div>
  );

  // ─── LOGIN PAGE ───
  const LoginPage = () => {
    const handleSendOtp = () => { if (phone.length >= 14) setLoginStep(1) };
    const handleVerifyOtp = () => {
      if (otp.every(d => d !== "")) { setLoginStep(2); setTimeout(() => navigate("dashboard"), 1500) }
    };
    const handleOtpChange = (i, v) => {
      if (v.length > 1) return;
      const next = [...otp]; next[i] = v; setOtp(next);
      if (v && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
    };
    const formatPhone = (v) => {
      const n = v.replace(/\D/g, "").slice(0, 11);
      if (n.length <= 2) return `(${n}`;
      if (n.length <= 7) return `(${n.slice(0,2)}) ${n.slice(2)}`;
      return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    };

    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, background:`radial-gradient(ellipse at top, rgba(233,69,96,0.06) 0%, var(--navy) 60%)` }}>
        <div className="animate-scaleIn" style={{ width:"100%", maxWidth:420 }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div className="font-display" style={{ fontSize:36, fontWeight:900, marginBottom:8, cursor:"pointer" }} onClick={() => navigate("landing")}>
              <span style={{ color:"var(--coral)" }}>Kriou</span> Docs
            </div>
            <p style={{ color:"var(--text-muted)", fontSize:15 }}>
              {loginStep === 0 ? "Entre com seu WhatsApp" : loginStep === 1 ? "Digite o código recebido" : "Verificado com sucesso!"}
            </p>
          </div>

          <div className="card" style={{ padding:32 }}>
            {loginStep === 0 && (
              <div className="animate-fadeIn">
                <label style={{ fontSize:13, fontWeight:600, color:"var(--text-muted)", marginBottom:8, display:"block" }}>Número do WhatsApp</label>
                <div style={{ position:"relative", marginBottom:20 }}>
                  <Icons.Phone className="w-5 h-5" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)" }} />
                  <input className="input-field" style={{ paddingLeft:44 }} placeholder="(11) 99999-9999"
                    value={phone} onChange={e => setPhone(formatPhone(e.target.value))} />
                </div>
                <button className="btn-primary" style={{ width:"100%" }} onClick={handleSendOtp}>
                  Enviar Código {ic(Icons.MessageCircle, "w-4 h-4 inline ml-2")}
                </button>
                <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:16, lineHeight:1.6 }}>
                  Você receberá um código de 6 dígitos no seu WhatsApp para confirmar o acesso.
                </p>
              </div>
            )}

            {loginStep === 1 && (
              <div className="animate-fadeIn">
                <p style={{ fontSize:14, color:"var(--text-muted)", marginBottom:20, textAlign:"center" }}>
                  Código enviado para <strong style={{ color:"var(--text)" }}>{phone}</strong>
                </p>
                <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:24 }}>
                  {otp.map((d, i) => (
                    <input key={i} id={`otp-${i}`} className="input-field" maxLength={1}
                      style={{ width:48, height:56, textAlign:"center", fontSize:22, fontWeight:700, padding:0 }}
                      value={d} onChange={e => handleOtpChange(i, e.target.value)} />
                  ))}
                </div>
                <button className="btn-primary" style={{ width:"100%" }} onClick={handleVerifyOtp}>Verificar</button>
                <p style={{ fontSize:13, color:"var(--text-muted)", textAlign:"center", marginTop:16 }}>
                  Reenviar código em <span style={{ color:"var(--coral)", fontWeight:600 }}>0:59</span>
                </p>
              </div>
            )}

            {loginStep === 2 && (
              <div className="animate-scaleIn" style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(0,200,151,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                  <Icons.Check className="w-8 h-8" style={{ color:"var(--success)" }} />
                </div>
                <h3 style={{ fontWeight:700, marginBottom:4 }}>Bem-vindo!</h3>
                <p style={{ color:"var(--text-muted)", fontSize:14 }}>Redirecionando...</p>
              </div>
            )}
          </div>

          <button onClick={() => navigate("landing")} style={{ display:"block", margin:"24px auto 0", background:"none", border:"none", color:"var(--text-muted)", fontSize:14, cursor:"pointer" }}>
            {ic(Icons.ChevronLeft, "w-4 h-4 inline mr-1")} Voltar ao início
          </button>
        </div>
      </div>
    );
  };

  // ─── DASHBOARD ───
  const DashboardPage = () => {
    const filtered = filter === "todos" ? MOCK_DOCS : MOCK_DOCS.filter(d => d.type.toLowerCase().includes(filter));
    return (
      <div style={{ minHeight:"100vh" }}>
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div className="font-display" style={{ fontSize:24, fontWeight:900, cursor:"pointer" }} onClick={() => navigate("landing")}>
              <span style={{ color:"var(--coral)" }}>Kriou</span> Docs
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--surface-3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {ic(Icons.User, "w-4 h-4")}
              </div>
              <button onClick={() => { setLoginStep(0); setOtp(["","","","","",""]); navigate("login"); }} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                {ic(Icons.LogOut, "w-4 h-4")} Sair
              </button>
            </div>
          </div>
        </nav>

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 24px" }}>
          {/* Welcome */}
          <div className="animate-fadeUp" style={{ marginBottom:32 }}>
            <h1 className="font-display" style={{ fontSize:28, fontWeight:800, marginBottom:4 }}>Olá, Reyvison 👋</h1>
            <p style={{ color:"var(--text-muted)", fontSize:15 }}>Gerencie seus documentos ou crie um novo.</p>
          </div>

          {/* CTA */}
          <div className="animate-fadeUp delay-1" style={{ display:"flex", gap:14, marginBottom:36, flexWrap:"wrap" }}>
            <button className="btn-primary" style={{ display:"flex", alignItems:"center", gap:8 }} onClick={() => navigate("templates")}>
              {ic(Icons.Plus, "w-5 h-5")} Criar Currículo
            </button>
            <button className="btn-secondary" style={{ display:"flex", alignItems:"center", gap:8, opacity:0.5, cursor:"not-allowed" }}>
              {ic(Icons.FileText, "w-5 h-5")} Criar Documento Jurídico
              <span style={{ background:"var(--surface-3)", padding:"2px 8px", borderRadius:100, fontSize:11, color:"var(--text-muted)" }}>Em breve</span>
            </button>
          </div>

          {/* Filters */}
          <div className="animate-fadeUp delay-2" style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
            {["todos", "currículo", "contrato"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                background: filter === f ? "var(--coral)" : "var(--surface-2)",
                color: filter === f ? "white" : "var(--text-muted)",
                border:"none", borderRadius:100, padding:"8px 20px", fontSize:13, fontWeight:600, cursor:"pointer", textTransform:"capitalize",
                transition:"all .2s"
              }}>{f}</button>
            ))}
          </div>

          {/* Document Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
            {filtered.map((doc, i) => (
              <div key={doc.id} className="card animate-fadeUp" style={{ animationDelay:`${(i+3)*0.1}s`, padding:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <span style={{
                      display:"inline-block", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100, marginBottom:8,
                      background: doc.status === "finalizado" ? "rgba(0,200,151,0.15)" : "rgba(249,168,37,0.15)",
                      color: doc.status === "finalizado" ? "var(--success)" : "var(--gold)",
                    }}>{doc.status === "finalizado" ? "Finalizado" : "Rascunho"}</span>
                    <h3 style={{ fontSize:16, fontWeight:700 }}>{doc.title}</h3>
                    <p style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>{doc.type} • {doc.template} • {doc.date}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn-secondary btn-small" style={{ display:"flex", alignItems:"center", gap:4, flex:1, justifyContent:"center" }}
                    onClick={() => { setSelectedTemplate(RESUME_TEMPLATES[3]); setCurrentStep(0); navigate("editor"); }}>
                    {ic(Icons.Edit, "w-3.5 h-3.5")} Editar
                  </button>
                  <button className="btn-secondary btn-small" style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {ic(Icons.Download, "w-3.5 h-3.5")}
                  </button>
                  <button className="btn-secondary btn-small" style={{ display:"flex", alignItems:"center", gap:4 }}>
                    {ic(Icons.Copy, "w-3.5 h-3.5")}
                  </button>
                </div>
              </div>
            ))}

            {/* Empty create card */}
            <div className="card animate-fadeUp delay-5" onClick={() => navigate("templates")} style={{ padding:20, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:180, cursor:"pointer", border:"2px dashed var(--border)" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:"rgba(233,69,96,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                {ic(Icons.Plus, "w-6 h-6 text-[var(--coral)]")}
              </div>
              <span style={{ fontWeight:600, fontSize:15 }}>Novo Documento</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── TEMPLATE SELECTION ───
  const TemplatesPage = () => (
    <div style={{ minHeight:"100vh" }}>
      <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", alignItems:"center", gap:16 }}>
          <button onClick={() => navigate("dashboard")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", display:"flex", alignItems:"center" }}>
            {ic(Icons.ChevronLeft, "w-5 h-5")}
          </button>
          <div className="font-display" style={{ fontSize:20, fontWeight:800 }}>Escolha seu Modelo</div>
        </div>
      </nav>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px" }}>
        <div className="animate-fadeUp" style={{ textAlign:"center", marginBottom:48 }}>
          <h1 className="font-display" style={{ fontSize:32, fontWeight:900, marginBottom:8, letterSpacing:"-1px" }}>Modelos de Currículo</h1>
          <p style={{ color:"var(--text-muted)", fontSize:16 }}>Escolha o estilo que combina com você e sua área</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:20, maxWidth:1000, margin:"0 auto" }}>
          {RESUME_TEMPLATES.map((t, i) => (
            <div key={t.id} className="card animate-fadeUp" onClick={() => { setSelectedTemplate(t); setCurrentStep(0); navigate("editor"); }}
              style={{ cursor:"pointer", padding:0, overflow:"hidden", animationDelay:`${i*0.1}s` }}>
              {/* Template preview mockup */}
              <div style={{ height:200, background:`linear-gradient(135deg, ${t.color} 0%, ${t.color}CC 100%)`, position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {t.tag && <span style={{ position:"absolute", top:12, right:12, background:t.accent, color: t.id==="primeiro-emprego"?"var(--navy)":"white", padding:"4px 10px", borderRadius:100, fontSize:11, fontWeight:700 }}>{t.tag}</span>}
                {/* Mini resume preview */}
                <div style={{ width:"70%", height:"75%", background:"white", borderRadius:6, padding:12, display:"flex", flexDirection:"column", gap:6 }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <div style={{ width:24, height:24, borderRadius:"50%", background:t.accent+"33" }} />
                    <div>
                      <div style={{ width:60, height:6, background:"#ddd", borderRadius:3 }} />
                      <div style={{ width:40, height:4, background:"#eee", borderRadius:3, marginTop:3 }} />
                    </div>
                  </div>
                  <div style={{ width:"100%", height:1, background:"#eee" }} />
                  {[1,2,3].map(n => <div key={n} style={{ width:`${90-n*15}%`, height:4, background:"#eee", borderRadius:3 }} />)}
                  <div style={{ width:"100%", height:1, background:"#eee", marginTop:2 }} />
                  {[1,2].map(n => <div key={n} style={{ width:`${80-n*10}%`, height:4, background:"#f0f0f0", borderRadius:3 }} />)}
                </div>
              </div>
              <div style={{ padding:16 }}>
                <h3 style={{ fontWeight:700, fontSize:16, marginBottom:2 }}>{t.name}</h3>
                <p style={{ fontSize:13, color:"var(--text-muted)" }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── EDITOR (7-Step Wizard) ───
  const EditorPage = () => {
    const step = STEPS[currentStep];

    const toggleSkill = (s) => {
      const has = formData.habilidades.includes(s);
      updateForm("habilidades", has ? formData.habilidades.filter(x => x !== s) : [...formData.habilidades, s]);
    };

    const addExperiencia = () => updateForm("experiencias", [...formData.experiencias, { empresa:"", cargo:"", periodo:"", descricao:"" }]);
    const updateExp = (i, field, val) => {
      const next = [...formData.experiencias]; next[i] = { ...next[i], [field]: val }; updateForm("experiencias", next);
    };
    const addFormacao = () => updateForm("formacoes", [...formData.formacoes, { instituicao:"", curso:"", periodo:"", status:"Cursando" }]);
    const updateForm2 = (i, field, val) => {
      const next = [...formData.formacoes]; next[i] = { ...next[i], [field]: val }; updateForm("formacoes", next);
    };
    const addIdioma = () => updateForm("idiomas", [...formData.idiomas, { idioma:"", nivel:"Básico" }]);
    const updateIdioma = (i, field, val) => {
      const next = [...formData.idiomas]; next[i] = { ...next[i], [field]: val }; updateForm("idiomas", next);
    };

    const renderStepContent = () => {
      switch (currentStep) {
        case 0: return (
          <div className="animate-fadeIn" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn:"1 / -1" }}><label style={labelStyle}>Nome Completo *</label><input className="input-field" placeholder="Seu nome completo" value={formData.nome} onChange={e => updateForm("nome", e.target.value)} /></div>
              <div><label style={labelStyle}>E-mail *</label><input className="input-field" type="email" placeholder="seu@email.com" value={formData.email} onChange={e => updateForm("email", e.target.value)} /></div>
              <div><label style={labelStyle}>Telefone *</label><input className="input-field" placeholder="(11) 99999-9999" value={formData.telefone} onChange={e => updateForm("telefone", e.target.value)} /></div>
              <div><label style={labelStyle}>Cidade / Estado</label><input className="input-field" placeholder="São Paulo, SP" value={formData.cidade} onChange={e => updateForm("cidade", e.target.value)} /></div>
              <div><label style={labelStyle}>LinkedIn</label><input className="input-field" placeholder="linkedin.com/in/seu-perfil" value={formData.linkedin} onChange={e => updateForm("linkedin", e.target.value)} /></div>
            </div>
          </div>
        );
        case 1: return (
          <div className="animate-fadeIn">
            <label style={labelStyle}>Objetivo Profissional *</label>
            <textarea className="input-field" rows={4} placeholder="Ex: Desenvolvedor Full Stack com 5 anos de experiência buscando posição de liderança técnica..." value={formData.objetivo} onChange={e => updateForm("objetivo", e.target.value)} style={{ resize:"vertical" }} />
            <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:12, color:"var(--text-muted)" }}>Sugestões:</span>
              {["Desenvolvedor", "Designer", "Analista", "Gerente"].map(s => (
                <button key={s} onClick={() => updateForm("objetivo", `Profissional de ${s} com experiência buscando novos desafios...`)}
                  style={{ background:"var(--surface-3)", border:"none", borderRadius:100, padding:"4px 12px", fontSize:12, color:"var(--teal)", cursor:"pointer" }}>{s}</button>
              ))}
            </div>
          </div>
        );
        case 2: return (
          <div className="animate-fadeIn" style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {formData.experiencias.map((exp, i) => (
              <div key={i} style={{ padding:16, background:"var(--surface-2)", borderRadius:12, border:"1px solid var(--border)" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--coral)", marginBottom:12 }}>Experiência {i+1}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={labelStyle}>Empresa</label><input className="input-field" placeholder="Nome da empresa" value={exp.empresa} onChange={e => updateExp(i,"empresa",e.target.value)} /></div>
                  <div><label style={labelStyle}>Cargo</label><input className="input-field" placeholder="Seu cargo" value={exp.cargo} onChange={e => updateExp(i,"cargo",e.target.value)} /></div>
                  <div style={{ gridColumn:"1 / -1" }}><label style={labelStyle}>Período</label><input className="input-field" placeholder="Jan 2022 - Atual" value={exp.periodo} onChange={e => updateExp(i,"periodo",e.target.value)} /></div>
                  <div style={{ gridColumn:"1 / -1" }}><label style={labelStyle}>Descrição</label><textarea className="input-field" rows={3} placeholder="Descreva suas principais atividades e conquistas..." value={exp.descricao} onChange={e => updateExp(i,"descricao",e.target.value)} style={{ resize:"vertical" }} /></div>
                </div>
              </div>
            ))}
            <button onClick={addExperiencia} style={{ background:"none", border:"2px dashed var(--border)", borderRadius:12, padding:14, color:"var(--coral)", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {ic(Icons.Plus, "w-4 h-4")} Adicionar Experiência
            </button>
          </div>
        );
        case 3: return (
          <div className="animate-fadeIn" style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {formData.formacoes.map((f, i) => (
              <div key={i} style={{ padding:16, background:"var(--surface-2)", borderRadius:12, border:"1px solid var(--border)" }}>
                <div style={{ fontSize:13, fontWeight:700, color:"var(--teal)", marginBottom:12 }}>Formação {i+1}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div><label style={labelStyle}>Instituição</label><input className="input-field" placeholder="Universidade / Escola" value={f.instituicao} onChange={e => updateForm2(i,"instituicao",e.target.value)} /></div>
                  <div><label style={labelStyle}>Curso</label><input className="input-field" placeholder="Nome do curso" value={f.curso} onChange={e => updateForm2(i,"curso",e.target.value)} /></div>
                  <div><label style={labelStyle}>Período</label><input className="input-field" placeholder="2018 - 2022" value={f.periodo} onChange={e => updateForm2(i,"periodo",e.target.value)} /></div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select className="input-field" value={f.status} onChange={e => updateForm2(i,"status",e.target.value)}>
                      <option>Completo</option><option>Cursando</option><option>Trancado</option><option>Incompleto</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addFormacao} style={{ background:"none", border:"2px dashed var(--border)", borderRadius:12, padding:14, color:"var(--teal)", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {ic(Icons.Plus, "w-4 h-4")} Adicionar Formação
            </button>
          </div>
        );
        case 4: return (
          <div className="animate-fadeIn">
            <p style={{ fontSize:14, color:"var(--text-muted)", marginBottom:16 }}>Selecione suas habilidades ou adicione novas:</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {SKILLS_OPTIONS.map(s => {
                const active = formData.habilidades.includes(s);
                return (
                  <button key={s} onClick={() => toggleSkill(s)} style={{
                    background: active ? "var(--coral)" : "var(--surface-2)",
                    color: active ? "white" : "var(--text-muted)",
                    border: active ? "1px solid var(--coral)" : "1px solid var(--border)",
                    borderRadius:100, padding:"8px 16px", fontSize:13, fontWeight:500, cursor:"pointer", transition:"all .2s"
                  }}>{active && "✓ "}{s}</button>
                );
              })}
            </div>
          </div>
        );
        case 5: return (
          <div className="animate-fadeIn" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {formData.idiomas.map((id, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div><label style={labelStyle}>Idioma</label><input className="input-field" placeholder="Ex: Inglês" value={id.idioma} onChange={e => updateIdioma(i,"idioma",e.target.value)} /></div>
                <div>
                  <label style={labelStyle}>Nível</label>
                  <select className="input-field" value={id.nivel} onChange={e => updateIdioma(i,"nivel",e.target.value)}>
                    <option>Básico</option><option>Intermediário</option><option>Avançado</option><option>Fluente</option><option>Nativo</option>
                  </select>
                </div>
              </div>
            ))}
            <button onClick={addIdioma} style={{ background:"none", border:"2px dashed var(--border)", borderRadius:12, padding:14, color:"var(--teal)", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {ic(Icons.Plus, "w-4 h-4")} Adicionar Idioma
            </button>
          </div>
        );
        case 6: return (
          <div className="animate-fadeIn">
            <label style={labelStyle}>Cursos, Certificações e Informações Adicionais</label>
            <textarea className="input-field" rows={5} placeholder="Liste cursos extracurriculares, certificações, trabalho voluntário, projetos pessoais..." value={formData.cursos} onChange={e => updateForm("cursos", e.target.value)} style={{ resize:"vertical" }} />
          </div>
        );
        default: return null;
      }
    };

    const labelStyle = { fontSize:12, fontWeight:600, color:"var(--text-muted)", marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:"0.5px" };

    return (
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        {/* Top bar */}
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button onClick={() => navigate("templates")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}>
                {ic(Icons.ChevronLeft, "w-5 h-5")}
              </button>
              <div>
                <div style={{ fontSize:15, fontWeight:700 }}>Currículo — {selectedTemplate?.name || "Modelo"}</div>
                <div style={{ fontSize:12, color:"var(--text-muted)" }}>Etapa {currentStep + 1} de 7</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color: saveStatus === "saved" ? "var(--success)" : "var(--gold)" }}>
                {saveStatus === "saving" ? <><span style={{ animation:"typing 1s infinite" }}>●</span> Salvando...</> : <>{ic(Icons.Check, "w-4 h-4")} Salvo</>}
              </div>
              <button className="btn-primary btn-small" onClick={() => navigate("preview")} style={{ display:"flex", alignItems:"center", gap:6 }}>
                {ic(Icons.Eye, "w-4 h-4")} Preview
              </button>
            </div>
          </div>
        </nav>

        <div style={{ flex:1, maxWidth:860, margin:"0 auto", padding:"24px 24px 100px", width:"100%" }}>
          {/* Stepper */}
          <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:36, overflowX:"auto", padding:"4px 0" }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div key={i} onClick={() => setCurrentStep(i)} style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer", flexShrink:0 }}>
                  <div style={{
                    width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .3s",
                    background: done ? "var(--success)" : active ? "var(--coral)" : "var(--surface-2)",
                    border: active ? "2px solid var(--coral)" : "1px solid var(--border)",
                  }}>
                    {done ? ic(Icons.Check, "w-4 h-4") : <Icon className="w-4 h-4" style={{ opacity: active ? 1 : 0.4 }} />}
                  </div>
                  <span style={{ fontSize:12, fontWeight: active ? 700 : 500, color: active ? "var(--text)" : "var(--text-muted)", whiteSpace:"nowrap", display: i < 3 || active ? "inline" : "none" }}>{s.label}</span>
                  {i < STEPS.length - 1 && <div style={{ width:20, height:2, background:"var(--border)", flexShrink:0 }} />}
                </div>
              );
            })}
          </div>

          {/* Step Title */}
          <div className="animate-slideRight" key={currentStep} style={{ marginBottom:28 }}>
            <h2 className="font-display" style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>{step.label}</h2>
            <p style={{ fontSize:14, color:"var(--text-muted)" }}>
              {["Informações básicas de identificação","Descreva seu objetivo profissional","Seu histórico profissional","Formação acadêmica","Competências técnicas e comportamentais","Proficiência em idiomas","Cursos, certificações e mais"][currentStep]}
            </p>
          </div>

          {/* Content */}
          {renderStepContent()}
        </div>

        {/* Bottom Nav */}
        <div className="glass" style={{ position:"fixed", bottom:0, left:0, right:0, borderTop:"1px solid var(--border)", padding:"14px 24px" }}>
          <div style={{ maxWidth:860, margin:"0 auto", display:"flex", justifyContent:"space-between" }}>
            <button className="btn-secondary" disabled={currentStep === 0} onClick={() => setCurrentStep(p => p-1)} style={{ opacity: currentStep === 0 ? 0.3 : 1 }}>
              {ic(Icons.ChevronLeft, "w-4 h-4 inline mr-1")} Anterior
            </button>
            {currentStep < 6 ? (
              <button className="btn-primary" onClick={() => setCurrentStep(p => p+1)}>
                Próximo {ic(Icons.ChevronRight, "w-4 h-4 inline ml-1")}
              </button>
            ) : (
              <button className="btn-primary" onClick={() => navigate("preview")} style={{ animation:"pulse-glow 2s infinite" }}>
                Visualizar Currículo {ic(Icons.Eye, "w-4 h-4 inline ml-2")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── PREVIEW ───
  const PreviewPage = () => (
    <div style={{ minHeight:"100vh" }}>
      <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => navigate("editor")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}>{ic(Icons.ChevronLeft, "w-5 h-5")}</button>
            <div className="font-display" style={{ fontSize:18, fontWeight:800 }}>Preview do Currículo</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-secondary btn-small" onClick={() => navigate("editor")}>{ic(Icons.Edit, "w-4 h-4 inline mr-1")} Editar</button>
            <button className="btn-primary btn-small" onClick={() => navigate("checkout")}>{ic(Icons.Download, "w-4 h-4 inline mr-1")} Finalizar</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:700, margin:"40px auto", padding:"0 24px" }}>
        <div className="animate-scaleIn" style={{ background:"white", borderRadius:8, padding:48, position:"relative", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.4)", color:"#1a1a2e" }}>
          {/* Watermark */}
          <div className="watermark">PREVIEW — KRIOU DOCS</div>

          {/* Resume Content */}
          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ borderBottom:`3px solid ${selectedTemplate?.accent || "#E94560"}`, paddingBottom:20, marginBottom:24 }}>
              <h1 style={{ fontSize:28, fontWeight:800, color:selectedTemplate?.color || "#1a1a2e", margin:0 }}>{formData.nome || "Seu Nome Completo"}</h1>
              <div style={{ fontSize:13, color:"#666", marginTop:6, display:"flex", gap:16, flexWrap:"wrap" }}>
                {formData.email && <span>✉ {formData.email}</span>}
                {formData.telefone && <span>📱 {formData.telefone}</span>}
                {formData.cidade && <span>📍 {formData.cidade}</span>}
              </div>
            </div>

            {formData.objetivo && (
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:14, fontWeight:800, textTransform:"uppercase", letterSpacing:"1px", color:selectedTemplate?.color || "#0F3460", marginBottom:8 }}>Objetivo</h2>
                <p style={{ fontSize:14, lineHeight:1.7, color:"#444" }}>{formData.objetivo}</p>
              </div>
            )}

            {formData.experiencias.some(e => e.empresa) && (
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:14, fontWeight:800, textTransform:"uppercase", letterSpacing:"1px", color:selectedTemplate?.color || "#0F3460", marginBottom:12 }}>Experiência Profissional</h2>
                {formData.experiencias.filter(e => e.empresa).map((exp, i) => (
                  <div key={i} style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                      <strong style={{ fontSize:15, color:"#222" }}>{exp.cargo || "Cargo"}</strong>
                      <span style={{ fontSize:12, color:"#888" }}>{exp.periodo}</span>
                    </div>
                    <div style={{ fontSize:14, color:selectedTemplate?.accent || "#E94560", fontWeight:600 }}>{exp.empresa}</div>
                    {exp.descricao && <p style={{ fontSize:13, color:"#555", marginTop:4, lineHeight:1.6 }}>{exp.descricao}</p>}
                  </div>
                ))}
              </div>
            )}

            {formData.formacoes.some(f => f.instituicao) && (
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:14, fontWeight:800, textTransform:"uppercase", letterSpacing:"1px", color:selectedTemplate?.color || "#0F3460", marginBottom:12 }}>Formação Acadêmica</h2>
                {formData.formacoes.filter(f => f.instituicao).map((f, i) => (
                  <div key={i} style={{ marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <strong style={{ fontSize:14 }}>{f.curso || "Curso"}</strong>
                      <span style={{ fontSize:12, color:"#888" }}>{f.periodo}</span>
                    </div>
                    <div style={{ fontSize:13, color:"#666" }}>{f.instituicao} • {f.status}</div>
                  </div>
                ))}
              </div>
            )}

            {formData.habilidades.length > 0 && (
              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:14, fontWeight:800, textTransform:"uppercase", letterSpacing:"1px", color:selectedTemplate?.color || "#0F3460", marginBottom:10 }}>Habilidades</h2>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {formData.habilidades.map(s => (
                    <span key={s} style={{ background:`${selectedTemplate?.color || "#0F3460"}11`, color:selectedTemplate?.color || "#0F3460", padding:"4px 12px", borderRadius:100, fontSize:12, fontWeight:600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {formData.idiomas.some(i => i.idioma) && (
              <div>
                <h2 style={{ fontSize:14, fontWeight:800, textTransform:"uppercase", letterSpacing:"1px", color:selectedTemplate?.color || "#0F3460", marginBottom:10 }}>Idiomas</h2>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  {formData.idiomas.filter(i => i.idioma).map((i, idx) => (
                    <span key={idx} style={{ fontSize:14, color:"#444" }}>{i.idioma} — <strong>{i.nivel}</strong></span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── CHECKOUT ───
  const CheckoutPage = () => {
    if (checkoutComplete) return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div className="animate-scaleIn" style={{ textAlign:"center", maxWidth:480 }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(0,200,151,0.15)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
            <Icons.Check className="w-10 h-10" style={{ color:"var(--success)" }} />
          </div>
          <h1 className="font-display" style={{ fontSize:32, fontWeight:900, marginBottom:8 }}>Pagamento Confirmado! 🎉</h1>
          <p style={{ color:"var(--text-muted)", fontSize:16, marginBottom:8 }}>Seu currículo está sendo gerado...</p>
          <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:32 }}>Você receberá o PDF no seu WhatsApp em instantes.</p>
          <div className="card" style={{ padding:20, marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center" }}>
              {ic(Icons.MessageCircle, "w-6 h-6")}
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:14, fontWeight:600 }}>Enviando via WhatsApp</div>
                <div style={{ fontSize:13, color:"var(--text-muted)" }}>{phone || "(11) 99999-9999"}</div>
              </div>
              <div style={{ width:24, height:24, borderRadius:"50%", border:"3px solid var(--success)", borderTopColor:"transparent", animation:"spin 1s linear infinite" }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
            <button className="btn-primary" onClick={() => { setCheckoutComplete(false); navigate("dashboard"); }}>Ir ao Dashboard</button>
            <button className="btn-secondary">{ic(Icons.Download, "w-4 h-4 inline mr-1")} Baixar PDF</button>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );

    return (
      <div style={{ minHeight:"100vh" }}>
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={() => navigate("preview")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}>{ic(Icons.ChevronLeft, "w-5 h-5")}</button>
            <div className="font-display" style={{ fontSize:18, fontWeight:800 }}>Checkout</div>
          </div>
        </nav>

        <div style={{ maxWidth:600, margin:"40px auto", padding:"0 24px" }}>
          <div className="animate-fadeUp">
            {/* Summary */}
            <div className="card" style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Resumo do Pedido</h3>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:16, background:"var(--surface-2)", borderRadius:10 }}>
                <div>
                  <div style={{ fontWeight:600 }}>Currículo — {selectedTemplate?.name || "Modelo"}</div>
                  <div style={{ fontSize:13, color:"var(--text-muted)" }}>{formData.nome || "Documento"}</div>
                </div>
                <div className="font-display" style={{ fontSize:24, fontWeight:900, color:"var(--coral)" }}>R$ 9,90</div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="card animate-fadeUp delay-1" style={{ marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>Forma de Pagamento</h3>
              {[
                { id:"pix", label:"PIX", desc:"Pagamento instantâneo", badge:"Recomendado", icon:"⚡" },
                { id:"card", label:"Cartão de Crédito", desc:"Visa, Master, Elo", badge:null, icon:"💳" },
                { id:"boleto", label:"Boleto Bancário", desc:"Compensação em 1-2 dias", badge:null, icon:"📄" },
              ].map((m, i) => (
                <label key={m.id} style={{ display:"flex", alignItems:"center", gap:14, padding:14, background:"var(--surface-2)", borderRadius:10, marginBottom:8, cursor:"pointer", border: i === 0 ? "1.5px solid var(--coral)" : "1px solid var(--border)" }}>
                  <input type="radio" name="payment" defaultChecked={i===0} style={{ accentColor:"var(--coral)" }} />
                  <span style={{ fontSize:20 }}>{m.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{m.label}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)" }}>{m.desc}</div>
                  </div>
                  {m.badge && <span style={{ background:"var(--coral)", color:"white", padding:"3px 10px", borderRadius:100, fontSize:11, fontWeight:600 }}>{m.badge}</span>}
                </label>
              ))}
            </div>

            {/* CTA */}
            <button className="btn-primary animate-fadeUp delay-2" style={{ width:"100%", padding:18, fontSize:17 }} onClick={() => setCheckoutComplete(true)}>
              Pagar R$ 9,90 {ic(Icons.CreditCard, "w-5 h-5 inline ml-2")}
            </button>
            <p style={{ fontSize:12, color:"var(--text-muted)", textAlign:"center", marginTop:12 }}>
              🔒 Pagamento seguro processado por Mercado Pago
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ─── ROUTER ───
  return (
    <>
      <style>{styles}</style>
      {page === "landing" && <LandingPage />}
      {page === "login" && <LoginPage />}
      {page === "dashboard" && <DashboardPage />}
      {page === "templates" && <TemplatesPage />}
      {page === "editor" && <EditorPage />}
      {page === "preview" && <PreviewPage />}
      {page === "checkout" && <CheckoutPage />}
    </>
  );
}
