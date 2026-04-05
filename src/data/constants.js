/**
 * ============================================
 * KRIOU DOCS - Application Constants
 * ============================================
 * Centralized data definitions for templates,
 * document types, steps, and static content.
 */

// ─── Resume Templates Configuration ───
export const RESUME_TEMPLATES = [
  {
    id: "executivo",
    name: "Executivo",
    desc: "Clean e sofisticado",
    color: "#0F3460",
    accent: "#E94560",
    tag: "Popular",
  },
  {
    id: "criativo",
    name: "Criativo",
    desc: "Moderno e ousado",
    color: "#533483",
    accent: "#00D2D3",
    tag: "Novo",
  },
  {
    id: "classico",
    name: "Clássico",
    desc: "Formal e elegante",
    color: "#1A1A2E",
    accent: "#F9A825",
    tag: null,
  },
  {
    id: "tech",
    name: "Tech",
    desc: "Minimalista e moderno",
    color: "#0D7377",
    accent: "#14FFEC",
    tag: "Novo",
  },
  {
    id: "primeiro-emprego",
    name: "Primeiro Emprego",
    desc: "Destaca formação",
    color: "#E94560",
    accent: "#FFFFFF",
    tag: null,
  },
];

// ─── Document Types (Coming Soon) ───
export const DOC_TYPES = [
  { id: "compra-venda", name: "Compra e Venda", icon: "FileText", available: false },
  { id: "aluguel", name: "Contrato de Aluguel", icon: "Home", available: false },
  { id: "procuracao", name: "Procuração", icon: "Shield", available: false },
  { id: "doacao", name: "Doação", icon: "Award", available: false },
  { id: "declaracao-residencia", name: "Decl. Residência", icon: "Home", available: false },
  { id: "uniao-estavel", name: "União Estável", icon: "User", available: false },
  { id: "oficio", name: "Ofício", icon: "FileText", available: false },
  { id: "parceria", name: "Contrato Parceria", icon: "Briefcase", available: false },
];

// ─── Wizard Steps Definition ───
export const STEPS = [
  { label: "Dados Pessoais", icon: "User", key: "personal" },
  { label: "Objetivo", icon: "Star", key: "objective" },
  { label: "Experiência", icon: "Briefcase", key: "experience" },
  { label: "Formação", icon: "GraduationCap", key: "education" },
  { label: "Habilidades", icon: "Star", key: "skills" },
  { label: "Idiomas", icon: "Globe", key: "languages" },
  { label: "Extras", icon: "Award", key: "extras" },
];

// ─── Step Descriptions ───
export const STEP_DESCRIPTIONS = {
  0: "Informações básicas de identificação",
  1: "Descreva seu objetivo profissional",
  2: "Seu histórico profissional",
  3: "Formação acadêmica",
  4: "Competências técnicas e comportamentais",
  5: "Proficiência em idiomas",
  6: "Cursos, certificações e mais",
};

// ─── Pre-defined Skills Options ───
export const SKILLS_OPTIONS = [
  // Technical
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "Git",
  "Figma", "Tailwind CSS", "Docker", "AWS", "MongoDB", "GraphQL", "Next.js",
  // Soft Skills
  "Comunicação", "Liderança", "Trabalho em Equipe", "Resolução de Problemas",
  "Gestão de Projetos", "Inglês Técnico", "Scrum", "Design Thinking",
];

// ─── Language Levels ───
export const LANGUAGE_LEVELS = [
  "Básico",
  "Intermediário",
  "Avançado",
  "Fluente",
  "Nativo",
];

// ─── Education Status Options ───
export const EDUCATION_STATUS = [
  "Completo",
  "Cursando",
  "Trancado",
  "Incompleto",
];

// ─── Field Hints para o Currículo (ajudas para usuários leigos) ───
export const FIELD_HINTS = {
  // ETAPA 1: Dados Pessoais
  nome: {
    placeholder: "Seu nome completo",
    hint: "Use o nome que aparece nos seus documentos (RG, CPF)",
    example: "João da Silva",
    whereFind: "Nos seus documentos de identidade",
    optional: false,
  },
  email: {
    placeholder: "seu@email.com",
    hint: "Endereço de e-mail que você usa com frequência",
    example: "joao@email.com",
    whereFind: "Pode ser Gmail, Outlook, Yahoo, etc.",
    optional: false,
  },
  telefone: {
    placeholder: "(11) 99999-9999",
    hint: "Número de telefone com DDD para contato",
    example: "(11) 98765-4321",
    whereFind: "No seu celular",
    optional: false,
  },
  cidade: {
    placeholder: "São Paulo, SP",
    hint: "Cidade e estado onde você mora",
    example: "Rio de Janeiro, RJ",
    optional: true,
    skipLabel: "Não tenho / Prefiro não informar",
  },
  linkedin: {
    placeholder: "linkedin.com/in/seu-perfil",
    hint: "Link do seu perfil no LinkedIn (opcional)",
    example: "linkedin.com/in/joao-silva",
    whereFind: "LinkedIn > Perfil > URL do perfil",
    optional: true,
    skipLabel: "Não tenho LinkedIn",
    helpLink: "https://www.linkedin.com/help/linkedin/answer/63",
  },

  // ETAPA 2: Objetivo
  objetivo: {
    placeholder: "Busco minha primeira oportunidade de trabalho...",
    hint: "O que você quer fazer na sua carreira? Uma frase que mostre seus objetivos",
    whatIs: "Objetivo profissional é uma frase curta que mostra o que você busca e oferece",
    examples: {
      basic: "Busco minha primeira oportunidade de trabalho. Sou comunicativo e aprendo rápido.",
      medium: "Procuro uma posição na área de vendas onde posso desenvolver minhas habilidades de comunicação.",
      advanced: "Desenvolvedor Full Stack com 3 anos de experiência, buscando posição de liderança técnica em empresa de tecnologia.",
    },
    optional: false,
  },

  // ETAPA 3: Experiência
  experiencia_empresa: {
    placeholder: "Nome da empresa ou 'Freelancer'",
    hint: "Onde você trabajó. Se nunca trabajó formalmente, pode usar trabalho informal.",
    examples: [
      "Empresa XYZ (trabalho formal)",
      "Freelancer (trabalhos por conta própria)",
      "Bico / Serviços pontuais",
      "Trabalho voluntário",
      "Projeto pessoal",
    ],
    whatIfNeverWorked: "Se você nunca trabalhou formalmente, pode incluir: trabalhos informais, projetos pessoais, freelâncias, ou trabalho voluntário.",
    optional: true,
    skipLabel: "Não tenho experiência profissional",
  },
  experiencia_cargo: {
    placeholder: "Seu cargo ou função",
    hint: "Qual era o seu cargo ou o que você fazia?",
    examples: [
      "Auxiliar administrativo",
      "Atendente",
      "Desenvolvedor web",
      "Estagiário",
      "Autônomo",
    ],
    optional: false,
  },
  experiencia_periodo: {
    placeholder: "Jan 2022 - Atual",
    hint: "Quando você trabalhou lá (mês/ano início - fim)",
    example: "Mar 2023 - Dez 2023",
    whereFind: "Na carteira de trabalho ou contracts",
    optional: true,
    skipLabel: "Não lembro as datas",
  },
  experiencia_descricao: {
    placeholder: "O que você fazia no dia a dia?",
    hint: "Liste suas principais atividades e conquistas",
    examples: {
      basic: "Atendia clientes, organizava documentos, auxiliava no departamento",
      medium: "Realizava atendimento ao cliente, gerenciava agenda, organizava arquivos",
      advanced: "Desenvolvi API RESTful com Node.js, reduzi tempo de carregamento em 40%, liderei equipe de 3 desenvolvedores",
    },
    tip: "Use verbos de ação: realizei, coordenei, desenvolvi, etc.",
    optional: true,
  },

  // ETAPA 4: Formação
  formacao_curso: {
    placeholder: "Nome do curso",
    hint: "Graduação, técnico, curso livre...",
    examples: [
      "Administração - Universidade São Paulo",
      "Técnico em Informática - ETEC",
      "Curso de Python - Udemy (40h)",
      "Ensino Médio - Escola Estadual",
    ],
    whatIfStudying: "Se ainda está estudando, marque 'Cursando' no status",
    optional: true,
  },
  formacao_instituicao: {
    placeholder: "Universidade / Escola",
    hint: "Onde você estudou",
    example: "Universidade Federal de São Paulo",
    optional: true,
  },

  // ETAPA 5: Habilidades
  habilidades: {
    hint: "O que você sabe fazer bem?",
    whatIs: "Suas competências técnicas e comportamentais",
    categories: {
      tecnicas: "Habilidades técnicas (programação, idiomas, softwares)",
      comportamentais: "Habilidades comportamentais (comunicação, trabalho em equipe)",
      basic: "Se não tem experiência: Office, digitação, atendimento básico",
    },
    tip: "Selecione no máximo 10 habilidades mais relevantes",
  },

  // ETAPA 6: Idiomas
  idiomas: {
    nivel: {
      basic: "Básico - Sei o básico, preciso de dicionário",
      intermediario: "Intermediário - Me viro bem, mas não sou fluente",
      avançado: "Avançado - Falo com confiança",
      fluente: "Fluente - Falo perfeitamente",
      nativo: "Nativo - Minha língua mater",
    },
    tip: "Sea honesto ao avaliar seu nível. Empresas podem testar.",
  },

  // ETAPA 7: Extras
  extras: {
    placeholder: "Cursos, certificações, projetos...",
    hint: "O que mais agrega ao seu currículo?",
    examples: [
      "Curso de Excel Avançado - 40h (2024)",
      "Certificação Google Analytics",
      "Projeto pessoal: App de tarefas (GitHub)",
      "Trabalho voluntário - ONG local",
      "Palestra sobre tecnologia (2023)",
    ],
    whatIsRelevant: "Qualquer curso, certificação ou atividade que mostre suas habilidades e interesses",
  },
};

// ─── Objective Suggestions ───
export const PRICING_PLANS = [
  {
    id: "avulso",
    name: "Avulso",
    price: "R$ 9,90",
    sub: "por documento",
    features: [
      "1 download PDF",
      "Edição por 30 dias",
      "Envio via WhatsApp",
      "Suporte por e-mail",
    ],
    highlight: false,
  },
  {
    id: "mensal",
    name: "Mensal",
    price: "R$ 19,90",
    sub: "/mês",
    features: [
      "Documentos ilimitados",
      "Todos os modelos",
      "Edição ilimitada",
      "Suporte prioritário",
    ],
    highlight: true,
  },
  {
    id: "empresarial",
    name: "Empresarial",
    price: "R$ 49,90",
    sub: "/mês",
    features: [
      "Múltiplos usuários",
      "Branding customizado",
      "API de geração",
      "Suporte dedicado",
    ],
    highlight: false,
  },
];

// ─── Payment Methods ───
export const PAYMENT_METHODS = [
  { id: "pix", label: "PIX", desc: "Pagamento instantâneo", badge: "Recomendado", icon: "⚡" },
  { id: "card", label: "Cartão de Crédito", desc: "Visa, Master, Elo", badge: null, icon: "💳" },
  { id: "boleto", label: "Boleto Bancário", desc: "Compensação em 1-2 dias", badge: null, icon: "📄" },
];

// ─── Initial Form Data ───
export const INITIAL_FORM_DATA = {
  nome: "",
  email: "",
  telefone: "",
  cidade: "",
  linkedin: "",
  objetivo: "",
  experiencias: [{ empresa: "", cargo: "", periodo: "", descricao: "" }],
  formacoes: [{ instituicao: "", curso: "", periodo: "", status: "Completo" }],
  habilidades: [],
  idiomas: [{ idioma: "Português", nivel: "Nativo" }],
  cursos: "",
};

// ─── Theme Colors ───
export const THEME = {
  colors: {
    navy: "#0F0F1E",
    navyLight: "#1A1A2E",
    blue: "#0F3460",
    coral: "#E94560",
    coralLight: "#FF6B81",
    purple: "#533483",
    teal: "#00D2D3",
    gold: "#F9A825",
    surface: "#16162A",
    surface2: "#1E1E36",
    surface3: "#26264A",
    text: "#F0F0F5",
    textMuted: "#8888A8",
    border: "#2A2A4A",
    success: "#00C897",
  },
  fonts: {
    display: "'Outfit', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif",
  },
};

// ─── Document Types - Contratos Jurídicos ───
// Agora usa o sistema de legalDocuments.js para dados completos.
// Este array mantém compatibilidade com componentes que usam LEGAL_DOCUMENT_TYPES.
import { LEGAL_DOCUMENTS } from "./legalDocuments";

export const LEGAL_DOCUMENT_TYPES = LEGAL_DOCUMENTS.map((doc) => ({
  id: doc.id,
  name: doc.name,
  description: doc.description,
  icon: doc.icon,
  available: doc.available,
  variants: doc.variants,
  defaultVariant: doc.defaultVariant,
}));

// ─── Wizard Steps para Contratos ───
export const LEGAL_DOCUMENT_STEPS = [
  { label: "Tipo de Documento", key: "type" },
  { label: "Partes Envolvidas", key: "parties" },
  { label: "Detalhes", key: "details" },
  { label: "Revisão", key: "review" },
];