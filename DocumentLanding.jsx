import { useState } from "react";

/*
 * Kriou Docs — Landing Pages por Tipo de Documento
 * 
 * Funcionalidades:
 * - Landing page individual para cada tipo de documento
 * - SEO-friendly com conteúdo específico por tipo
 * - Hero, benefícios, FAQ, CTA
 * - Exemplo visual do documento gerado
 * - Preço e CTA de conversão
 * 
 * TODO: [API] - Tracking de conversão por landing page
 * TODO: [DB] - Contar acessos e conversões por tipo
 * 
 * Uso com React Router:
 *   <Route path="/documentos/:tipo" element={<DocumentLanding />} />
 */

const Icons = {
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  ChevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>,
  ChevronDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>,
  FileText: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Shield: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Clock: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Zap: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  MessageCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
  Star: (p) => <svg {...p} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  User: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Download: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Home: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  DollarSign: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Heart: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Briefcase: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
:root {
  --navy:#0F0F1E; --coral:#E94560; --coral-light:#FF6B81; --blue:#0F3460; --teal:#00D2D3;
  --gold:#F9A825; --purple:#533483; --surface:#16162A; --surface-2:#1E1E36; --surface-3:#26264A;
  --text:#F0F0F5; --text-muted:#8888A8; --border:#2A2A4A; --success:#00C897;
  --font-display:'Outfit',sans-serif; --font-body:'Plus Jakarta Sans',sans-serif;
}
* { box-sizing:border-box;margin:0;padding:0 }
body { font-family:var(--font-body);background:var(--navy);color:var(--text) }
.font-display { font-family:var(--font-display) }
@keyframes fadeUp { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0}to{opacity:1} }
.animate-fadeUp { animation:fadeUp .6s ease both }
.delay-1{animation-delay:.1s}.delay-2{animation-delay:.2s}.delay-3{animation-delay:.3s}.delay-4{animation-delay:.4s}
.glass { background:rgba(22,22,42,0.85);backdrop-filter:blur(20px) }
.card { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;transition:all .3s }
.btn-primary { background:linear-gradient(135deg,var(--coral),#D63851);color:white;border:none;border-radius:14px;padding:16px 40px;font-weight:700;font-size:16px;cursor:pointer;transition:all .25s;font-family:var(--font-body) }
.btn-primary:hover { transform:translateY(-2px);box-shadow:0 8px 30px rgba(233,69,96,0.4) }
.btn-secondary { background:var(--surface-2);color:var(--text);border:1px solid var(--border);border-radius:14px;padding:16px 40px;font-weight:600;font-size:16px;cursor:pointer;transition:all .25s;font-family:var(--font-body) }
.gradient-text { background:linear-gradient(135deg,var(--coral),var(--coral-light),var(--teal));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text }
`;

// ─── Landing Page Data per Document Type ───
const LANDING_DATA = {
  curriculo: {
    icon: Icons.User, color: "#E94560",
    title: "Currículo Profissional",
    subtitle: "Crie um currículo que impressiona em 5 minutos",
    description: "Modelos profissionais com design moderno, preenchimento guiado passo a passo e exportação em PDF de alta qualidade. Tudo pensado para o mercado brasileiro.",
    price: "R$ 9,90",
    heroStats: [{ n:"50K+", l:"Currículos criados" },{ n:"5", l:"Modelos premium" },{ n:"< 5min", l:"Tempo médio" }],
    benefits: [
      { icon: Icons.Zap, title:"Wizard de 7 Etapas", desc:"Preenchimento guiado que cobre dados pessoais, objetivo, experiência, formação, habilidades, idiomas e extras." },
      { icon: Icons.FileText, title:"5 Modelos Profissionais", desc:"Executivo, Criativo, Clássico, Tech e Primeiro Emprego — cada um ideal para uma área diferente." },
      { icon: Icons.Download, title:"PDF de Alta Fidelidade", desc:"Seu currículo é gerado em PDF com layout perfeito, pronto para enviar a qualquer empresa." },
      { icon: Icons.MessageCircle, title:"Entrega via WhatsApp", desc:"Receba o PDF pronto diretamente no seu WhatsApp para compartilhar onde quiser." },
    ],
    faq: [
      { q:"Preciso pagar para criar o currículo?", a:"Não! Você cria e preenche gratuitamente. O pagamento de R$ 9,90 é apenas para baixar o PDF sem marca d'água." },
      { q:"Posso editar depois de finalizado?", a:"Sim! Você tem 30 dias de edições ilimitadas após o pagamento, sem custo adicional." },
      { q:"Os modelos são adequados para o Brasil?", a:"Sim, todos os modelos seguem as melhores práticas de currículos para o mercado brasileiro." },
      { q:"Como funciona o envio por WhatsApp?", a:"Após o pagamento, você recebe o PDF automaticamente no WhatsApp cadastrado em segundos." },
    ],
    testimonials: [
      { name:"Ana Silva", role:"Designer UX", text:"Fiz meu currículo em 4 minutos e já consegui 3 entrevistas na mesma semana!", stars:5 },
      { name:"Carlos Mendes", role:"Dev Backend", text:"O modelo Tech ficou perfeito pro meu perfil. Muito melhor que o Canva.", stars:5 },
      { name:"Juliana Costa", role:"Primeira experiência", text:"Nunca tinha feito um currículo antes. O wizard me guiou em tudo!", stars:5 },
    ],
  },
  "compra-venda": {
    icon: Icons.DollarSign, color: "#0F3460",
    title: "Contrato de Compra e Venda",
    subtitle: "Formalize a venda de bens com segurança jurídica",
    description: "Modelo completo com cláusulas de proteção para vendedor e comprador. Preencha os dados das partes, objeto, valores e condições. O contrato é gerado automaticamente.",
    price: "R$ 19,90",
    heroStats: [{ n:"10K+", l:"Contratos gerados" },{ n:"100%", l:"Estrutura validada" },{ n:"< 10min", l:"Tempo de criação" }],
    benefits: [
      { icon: Icons.Shield, title:"Cláusulas de Proteção", desc:"Modelo inclui cláusulas de garantia, multa por descumprimento e foro competente." },
      { icon: Icons.Zap, title:"Preenchimento Inteligente", desc:"Formulário guiado por seções: vendedor, comprador, objeto, valores e condições." },
      { icon: Icons.FileText, title:"Formato Jurídico", desc:"Documento segue a estrutura aceita por cartórios e órgãos públicos." },
      { icon: Icons.Clock, title:"Pronto em Minutos", desc:"Sem precisar de advogado para transações simples de bens móveis e imóveis." },
    ],
    faq: [
      { q:"Este contrato tem validade jurídica?", a:"Sim, o modelo segue a estrutura jurídica padrão. Para transações de alto valor, recomendamos reconhecimento de firma." },
      { q:"Posso usar para venda de veículos?", a:"Sim! O modelo é flexível para bens móveis (veículos, equipamentos) e imóveis." },
      { q:"Precisa de testemunhas?", a:"Recomendamos 2 testemunhas para maior segurança jurídica. O modelo já inclui espaço para assinatura." },
    ],
    testimonials: [
      { name:"Roberto Alves", role:"Vendedor", text:"Vendi meu carro e usei o contrato daqui. Simples e profissional.", stars:5 },
      { name:"Maria Luíza", role:"Compradora", text:"Me senti segura com as cláusulas incluídas no contrato.", stars:4 },
    ],
  },
  aluguel: {
    icon: Icons.Home, color: "#00D2D3",
    title: "Contrato de Aluguel",
    subtitle: "Locação residencial ou comercial com proteção total",
    description: "Modelo completo para locação de imóveis com cláusulas de garantia, multa, reajuste e todas as exigências da Lei do Inquilinato (Lei 8.245/91).",
    price: "R$ 19,90",
    heroStats: [{ n:"8K+", l:"Contratos de aluguel" },{ n:"Lei 8.245", l:"Em conformidade" },{ n:"< 10min", l:"Para preencher" }],
    benefits: [
      { icon: Icons.Shield, title:"Conforme Lei do Inquilinato", desc:"Cláusulas alinhadas com a Lei 8.245/91, garantindo direitos de locador e locatário." },
      { icon: Icons.Home, title:"Residencial e Comercial", desc:"Modelos específicos para cada tipo de locação com cláusulas adequadas." },
      { icon: Icons.DollarSign, title:"Garantias Flexíveis", desc:"Suporte a caução, fiador, seguro fiança e título de capitalização." },
      { icon: Icons.Clock, title:"Reajuste Automático", desc:"Cláusula de reajuste anual pelo índice escolhido (IGP-M, IPCA, etc.)." },
    ],
    faq: [
      { q:"Qual tipo de garantia devo escolher?", a:"Depende da sua situação. Caução (3 aluguéis) é a mais comum, mas fiador e seguro fiança também são aceitos." },
      { q:"O contrato serve para aluguel comercial?", a:"Sim! Você pode selecionar o tipo de imóvel durante o preenchimento." },
      { q:"Precisa registrar em cartório?", a:"Não é obrigatório, mas o registro garante proteção contra terceiros e validade perante terceiros." },
    ],
    testimonials: [
      { name:"Pedro Santos", role:"Proprietário", text:"Aluguei 3 imóveis usando os contratos daqui. Economizei com advogado.", stars:5 },
      { name:"Fernanda Lima", role:"Inquilina", text:"Contrato claro e completo. Me senti protegida como locatária.", stars:5 },
    ],
  },
};

// ─── FAQ Accordion ───
const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:"1px solid var(--border)" }}>
      <button onClick={() => setOpen(!open)} style={{
        width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 0",
        background:"none", border:"none", cursor:"pointer", textAlign:"left", color:"var(--text)", fontFamily:"var(--font-body)",
      }}>
        <span style={{ fontSize:15, fontWeight:600, paddingRight:16 }}>{q}</span>
        <Icons.ChevronDown className="w-5 h-5" style={{
          color:"var(--text-muted)", flexShrink:0, transition:"transform .3s",
          transform: open ? "rotate(180deg)" : "rotate(0)",
        }} />
      </button>
      {open && (
        <div style={{ paddingBottom:18, fontSize:14, color:"var(--text-muted)", lineHeight:1.7, animation:"fadeIn .3s ease" }}>
          {a}
        </div>
      )}
    </div>
  );
};

export default function DocumentLanding() {
  // TODO: Em produção, pegar o tipo via React Router useParams()
  const [currentType, setCurrentType] = useState("curriculo");
  const data = LANDING_DATA[currentType];
  const Icon = data.icon;

  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight:"100vh" }}>
        {/* Type Switcher (dev only — em produção é via URL) */}
        <div style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", padding:"10px 24px", display:"flex", justifyContent:"center", gap:8, overflowX:"auto" }}>
          <span style={{ fontSize:12, color:"var(--text-muted)", alignSelf:"center", marginRight:8 }}>Demo:</span>
          {Object.keys(LANDING_DATA).map(key => (
            <button key={key} onClick={() => setCurrentType(key)} style={{
              padding:"6px 14px", borderRadius:100, border:"none", fontSize:12, fontWeight:600, cursor:"pointer",
              background: currentType === key ? "var(--coral)" : "var(--surface-3)",
              color: currentType === key ? "white" : "var(--text-muted)",
              fontFamily:"var(--font-body)", whiteSpace:"nowrap",
            }}>{LANDING_DATA[key].title.split(" ").slice(0,2).join(" ")}</button>
          ))}
        </div>

        {/* Navbar */}
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div className="font-display" style={{ fontSize:28, fontWeight:900, letterSpacing:"-1px" }}>
              <span style={{ color:"var(--coral)" }}>Kriou</span> Docs
            </div>
            <button className="btn-primary" style={{ padding:"12px 28px", fontSize:14 }}>
              Criar Agora
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"80px 24px 60px", position:"relative" }}>
          <div style={{ position:"absolute", top:20, right:"10%", width:250, height:250, background:`radial-gradient(circle, ${data.color}12 0%, transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }} />

          <div style={{ display:"flex", gap:48, alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:300 }}>
              <div className="animate-fadeUp" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:100, padding:"8px 18px", marginBottom:20 }}>
                <Icon className="w-4 h-4" style={{ color:data.color }} />
                <span style={{ fontSize:13, fontWeight:600, color:data.color }}>{data.title}</span>
              </div>

              <h1 className="font-display animate-fadeUp delay-1" style={{ fontSize:"clamp(32px, 5vw, 52px)", fontWeight:900, lineHeight:1.08, marginBottom:16, letterSpacing:"-1.5px" }}>
                {data.subtitle.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-text">{data.subtitle.split(" ").slice(-2).join(" ")}</span>
              </h1>

              <p className="animate-fadeUp delay-2" style={{ fontSize:17, color:"var(--text-muted)", lineHeight:1.7, marginBottom:32, maxWidth:520 }}>
                {data.description}
              </p>

              <div className="animate-fadeUp delay-3" style={{ display:"flex", gap:14, flexWrap:"wrap", alignItems:"center" }}>
                <button className="btn-primary" style={{ fontSize:17 }}>
                  Criar {data.title.split(" ")[0]} <Icons.ChevronRight className="w-5 h-5" style={{ display:"inline", marginLeft:4 }} />
                </button>
                <div style={{ fontSize:14, color:"var(--text-muted)" }}>
                  A partir de <span style={{ fontWeight:800, color:"var(--coral)", fontSize:20 }}>{data.price}</span>
                </div>
              </div>
            </div>

            {/* Document Preview Mockup */}
            <div className="animate-fadeUp delay-3" style={{ flexShrink:0, position:"relative" }}>
              <div style={{
                width:260, height:340, background:"white", borderRadius:10, padding:24,
                boxShadow:"0 20px 60px rgba(0,0,0,0.4)", transform:"rotate(2deg)", position:"relative",
              }}>
                <div style={{ borderBottom:`3px solid ${data.color}`, paddingBottom:12, marginBottom:16 }}>
                  <div style={{ width:"70%", height:10, background:"#1a1a2e", borderRadius:4, marginBottom:6 }} />
                  <div style={{ width:"50%", height:6, background:"#ccc", borderRadius:3 }} />
                </div>
                {[80,65,90,45,75,60,85,40].map((w,i) => (
                  <div key={i} style={{ width:`${w}%`, height:4, background: i<2 ? "#e0e0e0" : "#f0f0f0", borderRadius:3, marginBottom:6 }} />
                ))}
                <div style={{ position:"absolute", bottom:16, right:16 }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:`${data.color}22`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icons.Check className="w-3 h-3" style={{ color:data.color }} />
                  </div>
                </div>
              </div>
              <div style={{ position:"absolute", top:-8, right:-8, background:"var(--coral)", color:"white", padding:"6px 14px", borderRadius:100, fontSize:12, fontWeight:700, boxShadow:"0 4px 16px rgba(233,69,96,0.4)" }}>
                {data.price}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-fadeUp delay-4" style={{ display:"flex", justifyContent:"flex-start", gap:48, marginTop:56, flexWrap:"wrap" }}>
            {data.heroStats.map((s, i) => (
              <div key={i}>
                <div className="font-display" style={{ fontSize:28, fontWeight:900, color:data.color }}>{s.n}</div>
                <div style={{ fontSize:13, color:"var(--text-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section style={{ maxWidth:1200, margin:"0 auto", padding:"60px 24px" }}>
          <h2 className="font-display" style={{ textAlign:"center", fontSize:32, fontWeight:800, marginBottom:48, letterSpacing:"-1px" }}>
            Como Funciona
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:20 }}>
            {data.benefits.map((b, i) => {
              const BIcon = b.icon;
              return (
                <div key={i} className="card animate-fadeUp" style={{ animationDelay:`${i*0.1}s` }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:`${data.color}15`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                    <BIcon className="w-6 h-6" style={{ color:data.color }} />
                  </div>
                  <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>{b.title}</h3>
                  <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.6 }}>{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step-by-step */}
        <section style={{ maxWidth:800, margin:"0 auto", padding:"60px 24px" }}>
          <h2 className="font-display" style={{ textAlign:"center", fontSize:32, fontWeight:800, marginBottom:48, letterSpacing:"-1px" }}>
            3 Passos Simples
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            {[
              { n:"1", title:"Preencha os Dados", desc:"Siga o formulário guiado com campos inteligentes e validação em tempo real." },
              { n:"2", title:"Revise o Documento", desc:"Veja o preview completo com todos os dados preenchidos antes de finalizar." },
              { n:"3", title:"Baixe e Compartilhe", desc:"Pague via PIX e receba o PDF pronto no WhatsApp e para download." },
            ].map((step, i) => (
              <div key={i} className="animate-fadeUp" style={{ display:"flex", gap:20, alignItems:"flex-start", animationDelay:`${i*0.15}s` }}>
                <div style={{
                  width:48, height:48, borderRadius:14, background:`${data.color}18`, border:`2px solid ${data.color}`,
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  fontSize:20, fontWeight:900, color:data.color, fontFamily:"var(--font-display)",
                }}>{step.n}</div>
                <div>
                  <h3 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{step.title}</h3>
                  <p style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        {data.testimonials && (
          <section style={{ maxWidth:1200, margin:"0 auto", padding:"60px 24px" }}>
            <h2 className="font-display" style={{ textAlign:"center", fontSize:32, fontWeight:800, marginBottom:48, letterSpacing:"-1px" }}>
              O Que Dizem Nossos Usuários
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:20 }}>
              {data.testimonials.map((t, i) => (
                <div key={i} className="card animate-fadeUp" style={{ animationDelay:`${i*0.1}s` }}>
                  <div style={{ display:"flex", gap:4, marginBottom:12 }}>
                    {Array(t.stars).fill(0).map((_,j) => <Icons.Star key={j} className="w-4 h-4" style={{ color:"var(--gold)" }} />)}
                  </div>
                  <p style={{ fontSize:15, lineHeight:1.7, marginBottom:16, fontStyle:"italic" }}>"{t.text}"</p>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:`${data.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:data.color }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{t.name}</div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section style={{ maxWidth:700, margin:"0 auto", padding:"60px 24px" }}>
          <h2 className="font-display" style={{ textAlign:"center", fontSize:32, fontWeight:800, marginBottom:36, letterSpacing:"-1px" }}>
            Perguntas Frequentes
          </h2>
          <div className="card" style={{ padding:4 }}>
            <div style={{ padding:"0 20px" }}>
              {data.faq.map((item, i) => <FaqItem key={i} q={item.q} a={item.a} />)}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ maxWidth:700, margin:"0 auto", padding:"40px 24px 80px", textAlign:"center" }}>
          <div className="card animate-fadeUp" style={{ padding:48, background:`linear-gradient(135deg, var(--surface) 0%, ${data.color}08 100%)`, border:`1px solid ${data.color}33` }}>
            <h2 className="font-display" style={{ fontSize:28, fontWeight:900, marginBottom:8 }}>
              Pronto para criar seu {data.title.toLowerCase()}?
            </h2>
            <p style={{ color:"var(--text-muted)", fontSize:16, marginBottom:28 }}>
              Comece agora — leva menos de 10 minutos.
            </p>
            <button className="btn-primary" style={{ fontSize:17, padding:"18px 48px" }}>
              Começar Agora — {data.price} <Icons.ChevronRight className="w-5 h-5" style={{ display:"inline", marginLeft:4 }} />
            </button>
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
    </>
  );
}
