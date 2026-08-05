# Status consolidado — 2026-08-03

## Foco atual

Concluir TD0 na branch `feat/admin-security-foundation`: testes reais de
autorização/RLS, capacidades administrativas e bloqueios de segurança. Depois,
iniciar erros/contratos/observabilidade antes das refatorações estruturais amplas.

## Painel administrativo

- migrations `014` a `017` aplicadas no Supabase remoto;
- Edge Functions `admin` e `admin-metrics` publicadas;
- conta proprietária configurada como `admin`;
- rota administrativa corrigida para aguardar o carregamento do perfil;
- CORS/preflight da função `admin` corrigido;
- autoelevação por `profiles.role` bloqueada;
- métricas, gráficos, filtro de período, usuários e falhas recentes implementados;
- causa dupla do non-2xx identificada: verbo HTTP incorreto no cliente e falta
  de privilégios SQL explícitos do backend; correções publicadas no Supabase;
- ainda faltam busca/paginação, responsividade da tabela e conclusão das fases P02–P05;
- entrega integrada e publicada no `main` pelo merge `959ddaa`.

## Modernização

Plano ativo: [PLANO-MESTRE-MODERNIZACAO-2026-08-03.md](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md).

- diagnóstico estrutural concluído;
- cobertura global medida em 28,90% de linhas, 17,97% de funções e 20,38% de branches;
- hotspots acima de mil linhas identificados;
- observabilidade externa, contratos e decomposição continuam pendentes;
- primeiro marco: M00 — governança e higiene do repositório.
- `dist/` e `coverage/` removidos do rastreamento;
- planos consolidados em `docs/programa-evolucao-qualidade/`;
- identidade Git local configurada com e-mail `noreply` verificado do GitHub;
- `.claude/settings.local.json` removido do rastreamento e preservado apenas localmente;
- stash temporário revisado e descartado por conter somente build/lockfile obsoletos;
- varredura inicial de padrões de segredo no estado atual e histórico sem credencial real encontrada;
- ambiente oficial padronizado em Node 22.12+ e npm 10/11 por `.nvmrc`,
  `package.json` e CI;
- pacote identificado como `kriou-docs@0.1.0`;
- README, guia de contribuição, convenções, ADRs e Definition of Done criados/atualizados;
- typecheck adicionado ao CI e ao comando agregado `npm run quality`;
- baseline validada: lint, typecheck, testes, build e E2E público/negativo 16/16 aprovados;
- visitante bloqueado nas oito rotas protegidas; refresh público e `/admin`
  autenticado em produção comprovados;
- auto-save sem usuário corrigido e coberto por regressão de console;
- sessões E2E locais determinísticas de usuário comum/admin implementadas; callback
  OAuth completo continua pendente por depender do provedor externo;
- branch local de trabalho: `chore/modernizacao-m00`.

### Sistema visual e temas

- tema claro definido como padrão e tema escuro preservado como preferência opcional;
- paleta profissional adotada: azul tinta para estrutura, rubi para marca/CTA,
  verde petróleo para sucesso e dourado sóbrio para privilégios;
- tokens semânticos de fundo, superfície, texto, borda, ação, estado e foco criados;
- aliases antigos permanecem temporariamente para permitir migração incremental;
- preferência de tema persiste no navegador e possui testes próprios;
- componentes-base, navegação, formulários, feedback, onboarding, login, editor
  jurídico, preview e checkout receberam a primeira correção de contraste;
- inspeção visual em claro/escuro e suíte de 343 testes aprovadas;
- migração visual continua aberta para estados menos comuns, responsividade e
  remoção definitiva das cores fixas antigas antes de publicação na `main`.
- auditoria formal de visual, mobile e PWA iniciada em 04/08/2026;
- baseline Lighthouse no build de produção: mobile 77/95/100/82 e desktop
  99/95/100/82 para Performance/Acessibilidade/Boas práticas/SEO;
- fontes externas bloqueantes, JavaScript inicial desnecessário, três contrastes
  residuais na landing e ausência de manifesto/service worker foram confirmados;
- o site é responsivo, mas ainda não deve ser apresentado como PWA instalável;
- plano detalhado: [PLANO-AUDITORIA-VISUAL-PWA-2026-08-04.md](./PLANO-AUDITORIA-VISUAL-PWA-2026-08-04.md).
- primeiro lote técnico concluído localmente: Lighthouse mobile passou de
  77/95/100/82 para 93/100/100/100;
- jsPDF deixou de ser pré-carregado, fontes passaram ao próprio bundle e o
  JavaScript não utilizado estimado caiu de 210 KiB para 72 KiB;
- matriz Playwright/axe cobre desktop, Android 360 px, iPhone 390 px e tablet em
  claro/escuro; 14 verificações passaram e 2 foram ignoradas por viewport;
- lint, typecheck, 355 testes unitários e build permanecem aprovados.
- cards de documentos não possuem mais botões interativos aninhados: container
  semântico, abertura nativa e ações independentes foram cobertos por regressão;
- baseline após o ajuste: lint, typecheck, 358 testes, build e quatro E2E
  autenticados locais aprovados.
- hierarquia de ações do card refinada: editar e baixar/pagar ficam diretos;
  renomear, copiar, imprimir, arquivar, compartilhar e excluir ficam em menu
  acessível com Escape e devolução de foco;
- baseline atual: lint, typecheck, 359 testes, build e quatro E2E autenticados
  locais aprovados.
- primeiros contratos responsivos de página implementados em `AppShell` e
  `PageContainer`, com largura, gutters fluidos, `100dvh` e safe area reutilizáveis;
- dashboard migrou para essa fundação, recebeu cabeçalho amplo configurável e a
  marca mantém contraste correto no tema claro;
- matriz autenticada do dashboard cobre claro/escuro em desktop, Android 360 px,
  iPhone e tablet: 8/8 sem overflow horizontal ou violações axe sérias/críticas;
- baseline atualizada: lint, typecheck, 361 testes e os 8 E2E responsivos
  autenticados aprovados; build de produção permanece como portão final do lote.
- `IconButton` acessível introduzido como primitive reutilizável, com alvo de
  44 px, foco, hover, disabled e variantes para ambos os temas;
- dashboard migrou as ações de perfil e fechamento do diálogo para o novo
  contrato; matriz responsiva autenticada permaneceu 8/8 aprovada;
- baseline em validação final: 364 testes após as regressões do novo primitive.
- `Input`, `Textarea` e `Select` agora usam IDs únicos, validação HTML nativa,
  descrição/erro associados e estados desabilitados consistentes;
- diálogo de renomear migrou para o novo controle e foi inspecionado no navegador
  em desktop e 390 px;
- menu “Mais ações” deixou de ser recortado pelo card: agora usa portal e camada
  própria, impedindo que Renomear acione a aba posicionada atrás do menu;
- baseline em validação final: 369 testes, incluindo regressões de formulário e
  posicionamento do menu.
- revisão base de Button, IconButton, Input, Select, Textarea e Checkbox concluída;
- Button agora evita submit implícito e expõe loading acessível sem clique duplo;
- Checkbox nativo reutilizável criado com alvo de 44 px, foco, ajuda, erro e
  estados required/disabled;
- ConfirmDialog ganhou IDs únicos, foco seguro, Tab cíclico, Escape, retorno de
  foco e processamento bloqueado; exclusão foi aberta e cancelada no navegador
  em desktop e 390 px sem remover documento;
- baseline em validação final: 376 testes.
- feedback visual começou a ser consolidado em contratos reutilizáveis: `Alert`
  cobre informação, sucesso, aviso e erro; `Badge` ganhou variantes semânticas e
  `EmptyState` agora expõe região, título e descrição corretamente para leitores
  de tela;
- erro do checkout migrou de estilos e cores locais para o `Alert` compartilhado;
- tokens suaves de status agora possuem paridade explícita entre temas claro e
  escuro;
- baseline em validação final: 385 testes.
- card de currículo deixou de aninhar botões dentro de um elemento com papel de
  botão; as ações “Ver ficha” e “Usar” agora são independentes e alcançáveis por
  teclado;
- corrigido overflow horizontal de 609 px em viewport Android de 360 px causado
  pelos filtros de modelos; a faixa agora rola internamente;
- entrada direta em modelos não perde mais a categoria quando o React executa o
  inicializador duas vezes no modo estrito de desenvolvimento;
- nova matriz de modelos: 8 cenários em desktop, tablet, Android e iPhone, nos
  temas claro/escuro, com Axe e verificação de overflow;
- baseline em validação final: 387 testes.
- `Card` possui variantes de superfície, espaçamento padronizado, composição de
  teclado e bloqueio acessível de interação;
- `MetricCard` foi extraído para a UI compartilhada e substituiu tanto o padrão
  local do dashboard quanto a implementação duplicada do painel;
- notificações Sonner agora acompanham o tema, respeitam a navegação móvel,
  limitam acúmulo e oferecem contratos de sucesso, informação, aviso, erro,
  carregamento e promessa;
- matriz autenticada do dashboard permaneceu verde nos 8 cenários responsivos e
  nos temas claro/escuro após a migração;
- baseline em validação final: 397 testes.
- fundação de `DataTable` responsiva criada em arquivos independentes: preserva
  semântica de tabela no desktop e assume leitura de cartões abaixo de 768 px,
  com uma única árvore de conteúdo;
- estados vazio/carregando, legenda, rótulos móveis, colunas de ação e foco já
  possuem contrato e testes; migração do painel aguarda isolamento do WIP de
  papéis administrativos;
- baseline em validação final: 401 testes.

## Segurança

Plano ativo: [PLANO-HARDENING-SEGURANCA-2026-08-03.md](./PLANO-HARDENING-SEGURANCA-2026-08-03.md).

- vulnerabilidade crítica de autoelevação corrigida;
- testes reais de RLS e auditoria append-only estão ativos;
- migrations `018` a `020` aplicadas no Supabase remoto em 04/08/2026;
- Edge Functions `admin`, `admin-metrics`, `authorize-download` e `admin-access`
  publicadas após as migrations; chamadas sem autenticação continuam bloqueadas;
- cadastro TOTP e elevação AAL2 foram comprovados manualmente na conta proprietária
  real, seguidos de acesso bem-sucedido ao painel protegido no ambiente local;
- a rota `/admin` agora monta o painel e inicia suas consultas somente após AAL2;
  logout, novo login Google, desafio TOTP e liberação do painel foram validados
  manualmente na conta proprietária real;
- cobertura de todas as mutações, recuperação de MFA, rate limiting e teste do
  fluxo OAuth no Preview permanecem pendentes;
- auditoria npm de 04/08 registra 5 pacotes (4 altos, 1 moderado) em quatro
  causas; com `--omit=dev`, restam apenas os 2 pacotes da mesma cadeia Router/RSC,
  não usada pelo SPA atual; remediação detalhada em S2.2;
- scripts de instalação pendentes de revisão: `core-js` e `fsevents`;
- `admin-metrics`: migration `017` e função atualizada já estão no Supabase; o
  cliente GET está validado localmente e aguarda publicação do frontend;
- itens S0/S1 devem ser tratados antes da ampliação pública do painel.

## Sincronização, exclusão e auditoria

Plano ativo: [PLANO-SINCRONIZACAO-EXCLUSAO-AUDITORIA-2026-08-03.md](./PLANO-SINCRONIZACAO-EXCLUSAO-AUDITORIA-2026-08-03.md).

- exclusão de documento será confirmada pelo servidor antes de remover o card;
- falha preservará/restaurará o estado e exibirá mensagem acionável;
- painel receberá botão, idade dos dados e refresh por foco;
- polling será opcional e econômico; Realtime foi adiado até existir evidência;
- exclusão real de conta dependerá de backend auditado e política de retenção;
- implementação iniciada por D0; demais fases permanecem planejadas.

Evidência D0 na branch `feat/admin-security-foundation`: limpeza local extraída
para feature/componentes próprios, linguagem corrigida e testes de alcance,
cancelamento, falha e confirmação adicionados. Conta e dados do servidor não são
mais apresentados como excluídos por essa ação.

## Dívida técnica

Plano ativo: [PLANO-DIVIDA-TECNICA-2026-08-03.md](./PLANO-DIVIDA-TECNICA-2026-08-03.md).

- inventário único criado com prioridade por risco, dependências e aceite mensurável;
- reescrita total rejeitada em favor de mudanças incrementais e reversíveis;
- TD0 concentra autorização/RLS, auditoria append-only, capacidades e MFA;
- primeira dívida paga: a limpeza local não promete mais excluir conta/dados do servidor;
- migration `018` e helper compartilhado criam a base append-only de auditoria;
- `npm run test:security:local` comprova RLS entre duas contas reais em perfis,
  documentos e rascunhos, bloqueia autoelevação e valida auditoria append-only;
- migration `019` cria `support`, `finance`, `admin` e `owner` em schema privado,
  sem acesso direto pelo cliente ou `service_role`;
- `admin` e `admin-metrics` autorizam por capacidade; integração local comprova
  respostas 401/403/200 para visitante, usuário comum e administrador;
- admin AAL1 não usa mais bypass de download não pago: recebe `403 mfa_required`;
- perfil possui UI de cadastro TOTP, QR secreto, chave manual, confirmação e
  reforço de sessão, isolada em `features/account`;
- teste local comprova criação/cancelamento do fator e testes de componente
  cobrem cadastro, AAL2 e sessão AAL1 com fator existente;
- gestão segura de papéis foi conectada à interface para `owner` em AAL2;
  recuperação segura e segunda aprovação para mudanças de `owner` continuam
  pendentes;
- migration `020` e Edge Function `admin-access` implementam gestão transacional
  de `support`, `finance` e `admin` exclusivamente por owner em AAL2;
- motivo, `operation_id`, idempotência e auditoria são obrigatórios; admin comum,
  owner AAL1, autoalteração e promoção a owner são rejeitados;
- alterações de owner permanecem bloqueadas até existir segunda aprovação e
  proteção formal do último proprietário.
- migration `021` restringe a leitura dos papéis privados ao backend
  `service_role`; UI, RLS e Edge Functions passaram nos testes locais em
  05/08/2026, mas a migration ainda não foi aplicada no Supabase remoto.

## Controles administrativos

Plano ativo: [PLANO-CONTROLES-ADMINISTRATIVOS-2026-08-03.md](./PLANO-CONTROLES-ADMINISTRATIVOS-2026-08-03.md).

- capacidades propostas para usuários, documentos, pagamentos e operação;
- `Marcar como pago` rejeitado: conciliação usa o provedor e exceção vira
  `Liberar como cortesia`, separada da receita;
- download/visualização de conteúdo de cliente será excepcional, temporário,
  motivado, protegido por MFA e auditado;
- edição administrativa será proposta versionada, sem impersonação e sem apagar original;
- primeira entrega recomendada limita-se a busca/detalhe, arquivamento, suspensão,
  bloqueios, atualização e auditoria;
- implementação ainda não iniciada; A0 é bloqueador obrigatório.

## Dashboard e templates

Plano ativo: [PLANO-DASHBOARD-E-TEMPLATES-2026-08-03.md](./PLANO-DASHBOARD-E-TEMPLATES-2026-08-03.md).

- dashboard será orientado a saúde, filas, drill-down, SLA e ações, não apenas KPIs;
- catálogo separará layouts de currículo e conteúdo jurídico;
- templates publicados serão imutáveis e documentos guardarão a versão utilizada;
- rollback afetará somente novos usos, preservando documentos existentes;
- editor usará schema declarativo validado, nunca HTML/JS arbitrário;
- jurídico exigirá revisão técnica, de conteúdo e jurídica antes da publicação;
- migração será híbrida e gradual, começando por inventário/registry somente leitura;
- implementação ainda não iniciada.

## Autenticidade e QR de documentos

Plano ativo: [PLANO-AUTENTICIDADE-QR-DOCUMENTOS-2026-08-03.md](./PLANO-AUTENTICIDADE-QR-DOCUMENTOS-2026-08-03.md).

- QR de MFA e QR público do documento formalmente separados;
- causa do QR sem tela confirmada: URL fixa para domínio/rota inexistentes;
- código atual é gerado no cliente e não possui vínculo verificável no backend;
- solução planejada com versão imutável, token opaco, hash, revogação e página pública;
- tela pública mostrará metadados mínimos e nomes mascarados por padrão;
- titular poderá entrar com Google, preservar o destino e resolver somente documento próprio;
- scanner no painel será responsivo/PWA, com fallback manual e download ainda
  submetido à autorização backend;
- Q0–Q3 precisam ser concluídos juntos antes de chamar o QR de autenticador.

## Planos históricos

Planos concluídos ou substituídos foram preservados em [historico/](./historico/README.md).
