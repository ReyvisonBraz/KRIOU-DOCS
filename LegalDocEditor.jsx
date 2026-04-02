import { useState, useEffect } from "react";

/*
 * Kriou Docs — Editor de Documentos Jurídicos
 * 
 * Funcionalidades:
 * - Seleção de tipo de documento jurídico
 * - Formulário dinâmico baseado no template JSON
 * - Preview em tempo real do documento com marca d'água
 * - Cláusulas automáticas baseadas no tipo
 * - Salvamento automático
 * 
 * TODO: [DB] - Carregar templates do banco de dados
 * TODO: [API] - Salvar rascunhos via API
 * TODO: [AUTH] - Verificar permissão do usuário
 * TODO: [PAY] - Validar se usuário tem acesso ao tipo de documento
 */

const Icons = {
  FileText: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  User: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Home: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  Shield: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Briefcase: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  Award: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Heart: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  DollarSign: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  ChevronLeft: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>,
  ChevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  Eye: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  MapPin: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap');
:root {
  --navy:#0F0F1E; --coral:#E94560; --blue:#0F3460; --teal:#00D2D3; --gold:#F9A825;
  --purple:#533483; --surface:#16162A; --surface-2:#1E1E36; --surface-3:#26264A;
  --text:#F0F0F5; --text-muted:#8888A8; --border:#2A2A4A; --success:#00C897;
  --font-display:'Outfit',sans-serif; --font-body:'Plus Jakarta Sans',sans-serif;
}
* { box-sizing:border-box; margin:0; padding:0 }
body { font-family:var(--font-body); background:var(--navy); color:var(--text) }
.font-display { font-family:var(--font-display) }
@keyframes fadeUp { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0}to{opacity:1} }
@keyframes slideIn { from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)} }
.animate-fadeUp { animation:fadeUp .5s ease both }
.animate-fadeIn { animation:fadeIn .4s ease both }
.animate-slideIn { animation:slideIn .4s ease both }
.delay-1{animation-delay:.1s}.delay-2{animation-delay:.2s}.delay-3{animation-delay:.3s}
.glass { background:rgba(22,22,42,0.85);backdrop-filter:blur(20px) }
.card { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;transition:all .3s }
.card:hover { border-color:var(--coral);transform:translateY(-2px) }
.input-field { width:100%;background:var(--surface-2);border:1.5px solid var(--border);border-radius:10px;padding:14px 16px;color:var(--text);font-size:15px;font-family:var(--font-body);transition:all .25s;outline:none }
.input-field:focus { border-color:var(--coral);box-shadow:0 0 0 3px rgba(233,69,96,0.15) }
.input-field::placeholder { color:var(--text-muted) }
.btn-primary { background:linear-gradient(135deg,var(--coral),#D63851);color:white;border:none;border-radius:12px;padding:14px 32px;font-weight:700;font-size:15px;cursor:pointer;transition:all .25s;font-family:var(--font-body) }
.btn-primary:hover { transform:translateY(-2px);box-shadow:0 8px 30px rgba(233,69,96,0.4) }
.btn-secondary { background:var(--surface-2);color:var(--text);border:1px solid var(--border);border-radius:12px;padding:14px 32px;font-weight:600;font-size:15px;cursor:pointer;transition:all .25s;font-family:var(--font-body) }
.watermark { position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-35deg);font-size:36px;font-weight:900;color:rgba(233,69,96,0.1);white-space:nowrap;pointer-events:none;letter-spacing:6px }
`;

// ─── Document Templates (JSON-based) ───
const DOC_TEMPLATES = {
  "compra-venda": {
    name: "Contrato de Compra e Venda",
    icon: Icons.DollarSign, color: "#E94560",
    description: "Para formalizar a transferência de propriedade de bens móveis ou imóveis.",
    sections: [
      {
        title: "Vendedor", icon: "User",
        fields: [
          { id:"vendedor_nome", label:"Nome Completo", type:"text", placeholder:"Nome do vendedor", required:true },
          { id:"vendedor_cpf", label:"CPF", type:"text", placeholder:"000.000.000-00", required:true },
          { id:"vendedor_rg", label:"RG", type:"text", placeholder:"00.000.000-0" },
          { id:"vendedor_endereco", label:"Endereço Completo", type:"textarea", placeholder:"Rua, número, bairro, cidade, estado, CEP", required:true },
        ]
      },
      {
        title: "Comprador", icon: "User",
        fields: [
          { id:"comprador_nome", label:"Nome Completo", type:"text", placeholder:"Nome do comprador", required:true },
          { id:"comprador_cpf", label:"CPF", type:"text", placeholder:"000.000.000-00", required:true },
          { id:"comprador_rg", label:"RG", type:"text", placeholder:"00.000.000-0" },
          { id:"comprador_endereco", label:"Endereço Completo", type:"textarea", placeholder:"Rua, número, bairro, cidade, estado, CEP", required:true },
        ]
      },
      {
        title: "Objeto e Valores", icon: "FileText",
        fields: [
          { id:"objeto", label:"Descrição do Objeto", type:"textarea", placeholder:"Descreva o bem sendo vendido com detalhes...", required:true },
          { id:"valor", label:"Valor Total (R$)", type:"text", placeholder:"0,00", required:true },
          { id:"forma_pagamento", label:"Forma de Pagamento", type:"select", options:["À Vista","Parcelado","Financiamento","PIX","Transferência"], required:true },
          { id:"prazo", label:"Prazo de Entrega", type:"text", placeholder:"Ex: Na assinatura do contrato" },
        ]
      },
      {
        title: "Condições", icon: "Shield",
        fields: [
          { id:"local", label:"Local do Contrato", type:"text", placeholder:"Cidade, Estado", required:true },
          { id:"data", label:"Data", type:"date", required:true },
          { id:"observacoes", label:"Observações Adicionais", type:"textarea", placeholder:"Cláusulas especiais, condições extras..." },
        ]
      }
    ]
  },
  "aluguel": {
    name: "Contrato de Aluguel",
    icon: Icons.Home, color: "#0F3460",
    description: "Para locação residencial ou comercial, com cláusulas de garantia.",
    sections: [
      {
        title: "Locador (Proprietário)", icon: "User",
        fields: [
          { id:"locador_nome", label:"Nome Completo", type:"text", placeholder:"Nome do locador", required:true },
          { id:"locador_cpf", label:"CPF", type:"text", placeholder:"000.000.000-00", required:true },
          { id:"locador_endereco", label:"Endereço", type:"textarea", placeholder:"Endereço completo do locador", required:true },
        ]
      },
      {
        title: "Locatário (Inquilino)", icon: "User",
        fields: [
          { id:"locatario_nome", label:"Nome Completo", type:"text", placeholder:"Nome do locatário", required:true },
          { id:"locatario_cpf", label:"CPF", type:"text", placeholder:"000.000.000-00", required:true },
          { id:"locatario_endereco", label:"Endereço Atual", type:"textarea", placeholder:"Endereço atual do locatário" },
        ]
      },
      {
        title: "Imóvel", icon: "Home",
        fields: [
          { id:"imovel_endereco", label:"Endereço do Imóvel", type:"textarea", placeholder:"Endereço completo do imóvel locado", required:true },
          { id:"imovel_tipo", label:"Tipo", type:"select", options:["Residencial","Comercial","Misto"], required:true },
          { id:"imovel_descricao", label:"Descrição", type:"textarea", placeholder:"Ex: Apartamento 2 quartos, sala, cozinha, banheiro..." },
        ]
      },
      {
        title: "Valores e Prazos", icon: "DollarSign",
        fields: [
          { id:"valor_aluguel", label:"Valor do Aluguel (R$)", type:"text", placeholder:"0,00", required:true },
          { id:"dia_vencimento", label:"Dia do Vencimento", type:"text", placeholder:"Ex: 10", required:true },
          { id:"prazo_meses", label:"Prazo (meses)", type:"text", placeholder:"Ex: 30", required:true },
          { id:"garantia", label:"Garantia", type:"select", options:["Caução (3 meses)","Fiador","Seguro Fiança","Título de Capitalização","Sem Garantia"], required:true },
          { id:"data_inicio", label:"Data de Início", type:"date", required:true },
        ]
      }
    ]
  },
  "procuracao": {
    name: "Procuração",
    icon: Icons.Shield, color: "#533483",
    description: "Para conceder poderes a terceiros em seu nome.",
    sections: [
      {
        title: "Outorgante (Quem concede)", icon: "User",
        fields: [
          { id:"outorgante_nome", label:"Nome Completo", type:"text", required:true },
          { id:"outorgante_cpf", label:"CPF", type:"text", placeholder:"000.000.000-00", required:true },
          { id:"outorgante_rg", label:"RG", type:"text" },
          { id:"outorgante_endereco", label:"Endereço", type:"textarea", required:true },
        ]
      },
      {
        title: "Outorgado (Quem recebe)", icon: "User",
        fields: [
          { id:"outorgado_nome", label:"Nome Completo", type:"text", required:true },
          { id:"outorgado_cpf", label:"CPF", type:"text", placeholder:"000.000.000-00", required:true },
          { id:"outorgado_endereco", label:"Endereço", type:"textarea", required:true },
        ]
      },
      {
        title: "Poderes", icon: "Shield",
        fields: [
          { id:"poderes", label:"Poderes Concedidos", type:"textarea", placeholder:"Descreva os poderes que estão sendo concedidos...", required:true },
          { id:"finalidade", label:"Finalidade", type:"text", placeholder:"Ex: Venda de imóvel, representação judicial...", required:true },
          { id:"prazo", label:"Prazo de Validade", type:"text", placeholder:"Ex: 90 dias" },
          { id:"local_data", label:"Local e Data", type:"text", required:true },
        ]
      }
    ]
  },
  "declaracao-residencia": {
    name: "Declaração de Residência",
    icon: Icons.MapPin, color: "#00D2D3",
    description: "Documento que comprova endereço de residência.",
    sections: [
      {
        title: "Declarante", icon: "User",
        fields: [
          { id:"declarante_nome", label:"Nome Completo", type:"text", required:true },
          { id:"declarante_cpf", label:"CPF", type:"text", placeholder:"000.000.000-00", required:true },
          { id:"declarante_rg", label:"RG", type:"text", required:true },
        ]
      },
      {
        title: "Endereço", icon: "MapPin",
        fields: [
          { id:"rua", label:"Rua / Avenida", type:"text", required:true },
          { id:"numero", label:"Número", type:"text", required:true },
          { id:"complemento", label:"Complemento", type:"text", placeholder:"Apt, Bloco, etc." },
          { id:"bairro", label:"Bairro", type:"text", required:true },
          { id:"cidade", label:"Cidade", type:"text", required:true },
          { id:"estado", label:"Estado", type:"select", options:["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"], required:true },
          { id:"cep", label:"CEP", type:"text", placeholder:"00000-000", required:true },
        ]
      },
      {
        title: "Finalidade", icon: "FileText",
        fields: [
          { id:"finalidade", label:"Finalidade", type:"text", placeholder:"Ex: Comprovação de endereço para abertura de conta", required:true },
          { id:"local_data", label:"Local e Data", type:"text", required:true },
        ]
      }
    ]
  },
  "uniao-estavel": {
    name: "Declaração de União Estável",
    icon: Icons.Heart, color: "#FF6B81",
    description: "Para formalizar união estável entre companheiros.",
    sections: [
      {
        title: "Primeiro Companheiro(a)", icon: "User",
        fields: [
          { id:"comp1_nome", label:"Nome Completo", type:"text", required:true },
          { id:"comp1_cpf", label:"CPF", type:"text", required:true },
          { id:"comp1_rg", label:"RG", type:"text" },
          { id:"comp1_nacionalidade", label:"Nacionalidade", type:"text", placeholder:"Brasileiro(a)" },
          { id:"comp1_profissao", label:"Profissão", type:"text" },
        ]
      },
      {
        title: "Segundo Companheiro(a)", icon: "User",
        fields: [
          { id:"comp2_nome", label:"Nome Completo", type:"text", required:true },
          { id:"comp2_cpf", label:"CPF", type:"text", required:true },
          { id:"comp2_rg", label:"RG", type:"text" },
          { id:"comp2_nacionalidade", label:"Nacionalidade", type:"text", placeholder:"Brasileiro(a)" },
          { id:"comp2_profissao", label:"Profissão", type:"text" },
        ]
      },
      {
        title: "Detalhes da União", icon: "Heart",
        fields: [
          { id:"data_inicio", label:"Data de Início da União", type:"date", required:true },
          { id:"endereco_comum", label:"Endereço em Comum", type:"textarea", required:true },
          { id:"regime", label:"Regime de Bens", type:"select", options:["Comunhão Parcial","Comunhão Universal","Separação Total","Participação Final nos Aquestos"], required:true },
          { id:"local_data", label:"Local e Data", type:"text", required:true },
        ]
      }
    ]
  },
};

const ALL_DOC_TYPES = Object.entries(DOC_TEMPLATES).map(([id, doc]) => ({
  id, name: doc.name, icon: doc.icon, color: doc.color, description: doc.description,
}));

export default function LegalDocEditor() {
  const [view, setView] = useState("select"); // select | edit | preview
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState({});
  const [saveStatus, setSaveStatus] = useState("saved");

  const template = selectedDoc ? DOC_TEMPLATES[selectedDoc] : null;

  const handleSelectDoc = (docId) => {
    setSelectedDoc(docId);
    setCurrentSection(0);
    setFormData({});
    setView("edit");
  };

  const updateField = (fieldId, value) => {
    setFormData(p => ({ ...p, [fieldId]: value }));
    setSaveStatus("saving");
    setTimeout(() => setSaveStatus("saved"), 1000);
  };

  const labelStyle = { fontSize:12, fontWeight:600, color:"var(--text-muted)", marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:"0.5px" };

  // ─── Document Type Selection ───
  if (view === "select") return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight:"100vh" }}>
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", alignItems:"center", gap:16 }}>
            <button style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}>
              <Icons.ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-display" style={{ fontSize:20, fontWeight:800 }}>Documentos Jurídicos</div>
          </div>
        </nav>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 24px" }}>
          <div className="animate-fadeUp" style={{ textAlign:"center", marginBottom:48 }}>
            <h1 className="font-display" style={{ fontSize:32, fontWeight:900, letterSpacing:"-1px", marginBottom:8 }}>Escolha o Tipo de Documento</h1>
            <p style={{ color:"var(--text-muted)", fontSize:16 }}>Modelos prontos com estrutura jurídica validada</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:16 }}>
            {ALL_DOC_TYPES.map((doc, i) => {
              const Icon = doc.icon;
              return (
                <div key={doc.id} className="card animate-fadeUp" style={{ cursor:"pointer", animationDelay:`${i*0.08}s` }}
                  onClick={() => handleSelectDoc(doc.id)}>
                  <div style={{ width:48, height:48, borderRadius:12, background:`${doc.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                    <Icon className="w-6 h-6" style={{ color:doc.color }} />
                  </div>
                  <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{doc.name}</h3>
                  <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.5 }}>{doc.description}</p>
                  <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:4, color:doc.color, fontSize:13, fontWeight:600 }}>
                    Criar <Icons.ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  // ─── Document Editor ───
  const section = template?.sections[currentSection];
  const totalSections = template?.sections.length || 0;

  if (view === "edit") return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button onClick={() => setView("select")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}>
                <Icons.ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <div style={{ fontSize:15, fontWeight:700 }}>{template.name}</div>
                <div style={{ fontSize:12, color:"var(--text-muted)" }}>Seção {currentSection+1} de {totalSections}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color: saveStatus === "saved" ? "var(--success)" : "var(--gold)" }}>
                {saveStatus === "saving" ? "Salvando..." : <><Icons.Check className="w-4 h-4" /> Salvo</>}
              </div>
              <button className="btn-primary" style={{ padding:"10px 20px", fontSize:13 }} onClick={() => setView("preview")}>
                <Icons.Eye className="w-4 h-4" style={{ display:"inline", marginRight:6 }} /> Preview
              </button>
            </div>
          </div>
        </nav>

        {/* Progress */}
        <div style={{ background:"var(--surface)", padding:"16px 24px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:800, margin:"0 auto", display:"flex", gap:8, alignItems:"center" }}>
            {template.sections.map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                <button onClick={() => setCurrentSection(i)} style={{
                  width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                  border:"none", cursor:"pointer", transition:"all .2s",
                  background: i === currentSection ? "var(--coral)" : i < currentSection ? "var(--success)" : "var(--surface-3)",
                  color: "white", fontSize:13, fontWeight:700,
                }}>{i < currentSection ? <Icons.Check className="w-4 h-4" /> : i+1}</button>
                <span style={{ fontSize:12, fontWeight: i===currentSection ? 700 : 500, color: i===currentSection ? "var(--text)" : "var(--text-muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.title}</span>
                {i < totalSections-1 && <div style={{ flex:1, height:2, background:"var(--border)", minWidth:12 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div style={{ flex:1, maxWidth:800, margin:"0 auto", padding:"32px 24px 120px", width:"100%" }}>
          <div className="animate-slideIn" key={currentSection}>
            <h2 className="font-display" style={{ fontSize:24, fontWeight:800, marginBottom:6 }}>{section.title}</h2>
            <p style={{ color:"var(--text-muted)", fontSize:14, marginBottom:28 }}>Preencha os dados abaixo. Campos com * são obrigatórios.</p>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {section.fields.map(field => (
                <div key={field.id}>
                  <label style={labelStyle}>{field.label} {field.required && <span style={{ color:"var(--coral)" }}>*</span>}</label>
                  {field.type === "text" && (
                    <input className="input-field" placeholder={field.placeholder || ""} value={formData[field.id] || ""}
                      onChange={e => updateField(field.id, e.target.value)} />
                  )}
                  {field.type === "textarea" && (
                    <textarea className="input-field" rows={3} placeholder={field.placeholder || ""} value={formData[field.id] || ""}
                      onChange={e => updateField(field.id, e.target.value)} style={{ resize:"vertical" }} />
                  )}
                  {field.type === "date" && (
                    <input className="input-field" type="date" value={formData[field.id] || ""}
                      onChange={e => updateField(field.id, e.target.value)} />
                  )}
                  {field.type === "select" && (
                    <select className="input-field" value={formData[field.id] || ""} onChange={e => updateField(field.id, e.target.value)}>
                      <option value="">Selecione...</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Nav */}
        <div className="glass" style={{ position:"fixed", bottom:0, left:0, right:0, borderTop:"1px solid var(--border)", padding:"14px 24px" }}>
          <div style={{ maxWidth:800, margin:"0 auto", display:"flex", justifyContent:"space-between" }}>
            <button className="btn-secondary" disabled={currentSection === 0} onClick={() => setCurrentSection(p => p-1)}
              style={{ opacity: currentSection === 0 ? 0.3 : 1 }}>
              <Icons.ChevronLeft className="w-4 h-4" style={{ display:"inline", marginRight:4 }} /> Anterior
            </button>
            {currentSection < totalSections - 1 ? (
              <button className="btn-primary" onClick={() => setCurrentSection(p => p+1)}>
                Próximo <Icons.ChevronRight className="w-4 h-4" style={{ display:"inline", marginLeft:4 }} />
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setView("preview")}>
                Visualizar Documento <Icons.Eye className="w-4 h-4" style={{ display:"inline", marginLeft:6 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // ─── Document Preview ───
  if (view === "preview") return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight:"100vh" }}>
        <nav className="glass" style={{ position:"sticky", top:0, zIndex:50, borderBottom:"1px solid var(--border)" }}>
          <div style={{ maxWidth:1200, margin:"0 auto", padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button onClick={() => setView("edit")} style={{ background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer" }}>
                <Icons.ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-display" style={{ fontSize:18, fontWeight:800 }}>Preview — {template.name}</div>
            </div>
            <button className="btn-primary" style={{ padding:"10px 20px", fontSize:13 }}>Finalizar e Pagar</button>
          </div>
        </nav>

        <div style={{ maxWidth:700, margin:"40px auto", padding:"0 24px" }}>
          <div className="animate-fadeUp" style={{
            background:"white", borderRadius:8, padding:"60px 48px", position:"relative", overflow:"hidden",
            boxShadow:"0 20px 60px rgba(0,0,0,0.4)", color:"#1a1a2e",
          }}>
            <div className="watermark">PREVIEW — KRIOU DOCS</div>

            <div style={{ position:"relative", zIndex:1 }}>
              {/* Document Header */}
              <div style={{ textAlign:"center", marginBottom:32, borderBottom:"2px solid #1a1a2e", paddingBottom:20 }}>
                <h1 style={{ fontSize:22, fontWeight:800, textTransform:"uppercase", letterSpacing:"2px", margin:0 }}>{template.name}</h1>
              </div>

              {/* Rendered sections */}
              {template.sections.map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom:24 }}>
                  <h2 style={{ fontSize:13, fontWeight:800, textTransform:"uppercase", color:"#666", letterSpacing:"1px", marginBottom:12, borderBottom:"1px solid #ddd", paddingBottom:6 }}>
                    {section.title}
                  </h2>
                  {section.fields.map(field => {
                    const value = formData[field.id];
                    if (!value) return null;
                    return (
                      <div key={field.id} style={{ display:"flex", marginBottom:8, fontSize:14, lineHeight:1.7 }}>
                        <span style={{ fontWeight:600, minWidth:160, color:"#444" }}>{field.label}:</span>
                        <span style={{ color:"#222" }}>{value}</span>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Signature area */}
              <div style={{ marginTop:48, paddingTop:24, borderTop:"1px solid #ddd" }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:40 }}>
                  {["Parte 1", "Parte 2"].map((p, i) => (
                    <div key={i} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ borderBottom:"1px solid #999", marginBottom:8, paddingBottom:40 }} />
                      <div style={{ fontSize:13, color:"#666" }}>{formData[template.sections[i]?.fields[0]?.id] || p}</div>
                      <div style={{ fontSize:11, color:"#999" }}>CPF: {formData[template.sections[i]?.fields[1]?.id] || "___.___.___-__"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Witnesses */}
              <div style={{ marginTop:32 }}>
                <div style={{ fontSize:12, color:"#888", textTransform:"uppercase", marginBottom:16 }}>Testemunhas</div>
                <div style={{ display:"flex", justifyContent:"space-between", gap:40 }}>
                  {["Testemunha 1", "Testemunha 2"].map((t, i) => (
                    <div key={i} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ borderBottom:"1px solid #ccc", marginBottom:6, paddingBottom:32 }} />
                      <div style={{ fontSize:12, color:"#888" }}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return null;
}
