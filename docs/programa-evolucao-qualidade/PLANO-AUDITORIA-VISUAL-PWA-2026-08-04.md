# Auditoria visual, responsividade e PWA — KRIOU-DOCS

Data-base: 2026-08-04
Estado: em execução — baseline técnico concluído; inventário e matriz visual em andamento
Relação: detalha M05, M06 e M07 do plano mestre e antecede a reformulação visual do painel administrativo.

## Objetivo

Transformar o KRIOU-DOCS em um produto visualmente consistente, profissional,
rápido e acessível no navegador desktop, no navegador móvel e quando instalado
como PWA. A mudança será incremental, com medidas antes/depois e sem reescrever
as jornadas que já funcionam.

## Decisão de sequência

A base visual e os componentes compartilhados serão estabilizados antes de
desenhar o painel administrativo completo. Assim, dashboard, admin, documentos e
perfil usarão os mesmos contratos de cor, tipografia, espaço, interação e
responsividade.

Não será feita uma troca visual ampla sem antes:

1. inventariar telas e estados;
2. medir acessibilidade e desempenho em build de produção;
3. definir tokens e componentes-base;
4. validar as jornadas públicas e autenticadas em desktop e mobile;
5. criar proteção contra regressões visuais e de acessibilidade.

## Direção visual proposta

Conceito: **documentação profissional contemporânea**.

- azul-tinta estrutura navegação e transmite confiança;
- rubi identifica marca e ações primárias, sem dominar toda a tela;
- superfícies claras levemente quentes dão aparência editorial aos documentos;
- verde-petróleo comunica sucesso e validação;
- dourado sóbrio fica restrito a privilégios, assinatura e detalhes especiais;
- profundidade vem de borda, sombra curta e hierarquia, não de excesso de efeitos;
- animações explicam mudança de estado e respeitam `prefers-reduced-motion`;
- tema escuro permanece opcional e deve ter paridade funcional e de contraste.

O resultado esperado é mais próximo de um serviço documental confiável do que de
um template genérico de SaaS.

## Escopos de experiência

### Web desktop

- larguras de referência: 1280 e 1440 px;
- conteúdo com largura máxima adequada à leitura;
- tabelas, filtros, atalhos de teclado e estados de foco completos;
- painel administrativo com navegação lateral e densidade controlada.

### Web mobile

- larguras de referência: 360 e 390 px, além de 768 px para tablet;
- uso com uma mão, alvos de toque confortáveis e ações principais alcançáveis;
- sem rolagem horizontal acidental;
- formulários sem zoom involuntário no iOS;
- tabelas administrativas convertidas para cards/linhas responsivas quando necessário;
- teclado virtual, notch e barra inferior considerados.

### PWA instalada

- manifesto completo e identidade própria;
- ícones 192, 512 e `maskable`, além de ícone Apple;
- `display: standalone`, cores de tema coerentes e `start_url` seguro;
- service worker com estratégia deliberada de atualização e cache;
- tela offline própria para navegação indisponível;
- nenhum conteúdo privado de cliente armazenado indiscriminadamente no cache;
- botão/educação de instalação somente em contexto útil;
- teste de instalação no Android/Chromium e instalação manual no iOS/Safari;
- scanner de QR planejado para câmera móvel, com fallback de código manual.

## Baseline medido em produção local

Medição realizada em 04/08/2026 contra `vite build` + `vite preview`, não contra
o servidor de desenvolvimento.

| Categoria Lighthouse | Mobile | Desktop |
|---|---:|---:|
| Performance | 77 | 99 |
| Acessibilidade | 95 | 95 |
| Boas práticas | 100 | 100 |
| SEO | 82 | 82 |
| FCP | 3,9 s | 0,7 s |
| LCP | 3,9 s | 0,7 s |
| TBT | 0 ms | 0 ms |
| CLS | 0 | 0,001 |

Esses valores são uma linha de base local sob os perfis de rede/CPU do
Lighthouse. Não substituem métricas de usuários reais, mas tornam a comparação
antes/depois reproduzível.

### Resultado do primeiro lote — 04/08/2026

Após corrigir contraste/SEO, hospedar as fontes no próprio build, eliminar a
colisão entre o token antigo `base` e a classe tipográfica `text-base`, evitar o
barrel completo de UI no bootstrap e remover o chunk manual circular do jsPDF:

| Categoria Lighthouse mobile | Antes | Depois |
|---|---:|---:|
| Performance | 77 | 93 |
| Acessibilidade | 95 | 100 |
| Boas práticas | 100 | 100 |
| SEO | 82 | 100 |
| FCP | 3,9 s | 2,6 s |
| LCP | 3,9 s | 2,6 s |
| JavaScript não usado estimado | 210 KiB | 72 KiB |

O jsPDF deixou de ser pré-carregado na landing e o render-blocking estimado caiu
de aproximadamente 1.050 ms para 150 ms. O LCP de 2,6 s ficou próximo, mas ainda
0,1 s acima do budget-alvo de 2,5 s; continua aberto para estabilização e medição
por múltiplas execuções.

## Achados confirmados

### AV0 — O projeto ainda não é uma PWA instalável completa — crítico

O `index.html` possui viewport e algumas metatags móveis, e o CSS já considera
safe areas. Porém não existem:

- `manifest.webmanifest` ligado à aplicação;
- service worker registrado;
- ícones de instalação 192/512/maskable;
- ícone e configuração completa para iOS;
- experiência offline;
- política de atualização do aplicativo instalado.

Portanto, “funciona no celular” e “pode ser instalado de forma confiável como
aplicativo” ainda não são equivalentes neste projeto.

### AV1 — Desempenho inicial móvel abaixo do objetivo — alto

- a folha do Google Fonts bloqueia renderização e custa aproximadamente 965 ms
  no perfil móvel medido;
- a cadeia crítica CSS → Google Fonts → arquivos WOFF2 chega a aproximadamente
  773 ms;
- o carregamento inicial transfere JavaScript de PDF, Supabase e React que não é
  todo necessário para apresentar a landing page;
- o Lighthouse estima cerca de 210 KiB de JavaScript não usado nessa primeira tela;
- o chunk `vendor-jspdf` transfere cerca de 128 KiB e apresenta aproximadamente
  88% sem uso na landing;
- o chunk Supabase transfere cerca de 48 KiB e apresenta aproximadamente 82% sem
  uso durante a primeira pintura.

Hipótese técnica a validar: barrels de UI e a estratégia manual de chunks fazem
dependências de recursos internos entrarem no grafo público mesmo com páginas
lazy-loaded.

### AV2 — Contraste residual na landing page — alto

O Lighthouse encontrou elementos que ainda não atingem o contraste exigido para
texto normal:

- ação primária coral com texto claro: aproximadamente 4,14:1, abaixo de 4,5:1;
- pequenos rótulos dourados no mock de documento: aproximadamente 3,28:1;
- o logotipo textual também foi sinalizado no cabeçalho, embora logotipos tenham
  exceção normativa; ainda será corrigido por legibilidade visual.

A aplicação já possui tokens semânticos e testes de cálculo de contraste, mas a
landing e os estados menos comuns precisam concluir a migração.

### AV3 — SEO técnico básico incompleto — médio

- falta `meta description`;
- `/robots.txt` recebe o fallback HTML da SPA em vez de um arquivo válido;
- metadados sociais, canonical e dados estruturados precisam ser avaliados;
- o aviso sobre `llms.txt` será tratado como recomendação opcional, não como
  requisito de SEO nem bloqueador.

### AV4 — Proteção visual/mobile insuficiente — alto

- o Playwright usa somente Chromium em 1280 × 720;
- não existem projetos mobile/tablet na configuração;
- não há comparação aprovada de screenshots das telas principais;
- ainda não existe uma suíte dedicada com axe para jornadas públicas e autenticadas;
- instalação, standalone, offline e atualização da PWA não são testados.

### AV5 — Sistema visual ainda híbrido — alto

- foram encontradas 337 ocorrências candidatas de cores/classes visuais fixas;
- tokens novos convivem com aliases antigos e estilos inline;
- quatro usos explícitos de texto entre 8 e 11 px merecem revisão contextual;
- existem componentes/páginas muito grandes, incluindo `DashboardPage` (1.269
  linhas), `RequirementsModal` (1.252), `TemplatesPage` (1.230), `Icons` (1.054)
  e `LegalEditorPage` (1.036);
- mudar aparência nesses arquivos sem decomposição mínima elevaria o risco de
  inconsistência e regressão.

Nem toda ocorrência fixa é defeito: cores dinâmicas de templates e impressão
podem ser legítimas. O inventário classificará cada uso antes de substituí-lo.

### AV6 — Base móvel positiva já existente

- inputs móveis usam 16 px para evitar zoom involuntário no iOS;
- há utilitários de safe area e `100dvh`;
- existe utilitário de alvo de toque com 44 × 44 px;
- `prefers-reduced-motion` já é respeitado globalmente;
- CLS e bloqueio de thread principal estão bons no baseline.

Esses comportamentos devem ser preservados como regressões automatizadas.

### AV7 — Semântica interativa incorreta nos cards do dashboard — alto

A árvore acessível atual expõe cada card de documento como um `button` que contém
outros botões de excluir, editar, renomear, copiar, baixar, imprimir, arquivar e
WhatsApp. Elementos interativos aninhados geram comportamento ambíguo para
teclado, leitores de tela e eventos de clique.

O card deve virar uma região/artigo com link ou ação principal independente; o
menu de ações deve ser um agrupamento irmão, com nomes acessíveis e foco previsível.
Esse ajuste entra em V3 antes do refinamento visual do dashboard.

Resolvido localmente em 04/08/2026: o container passou a ser um `article`, a
área de abertura virou um botão nativo independente e excluir/editar/demais ações
permanecem como irmãos. Testes impedem o retorno de `button` ou `[role=button]`
aninhado.

Refinamento seguinte: editar e baixar/pagar permanecem visíveis; ações
secundárias foram agrupadas em “Mais ações”. O menu possui alvo de 44 px, foco
inicial, fechamento por Escape, retorno do foco e tratamento visual destrutivo.

Fundação seguinte em 04/08/2026: `AppShell` e `PageContainer` passaram a definir
altura dinâmica, fundo, largura, gutters fluidos, safe area e região principal.
O dashboard adotou esses contratos e o `AppNavbar` ganhou largura configurável,
sem alterar as telas estreitas existentes. Uma matriz autenticada adicional cobre
dashboard claro/escuro em desktop, Android 360 px, iPhone e tablet, bloqueando
overflow horizontal e violações axe sérias/críticas.

O primeiro primitive de ação revisado foi `IconButton`: ele centraliza rótulo
acessível, ícone decorativo, alvo mínimo de 44 px, foco, hover, disabled e
variantes semânticas. Perfil e fechamento do diálogo de renomear no dashboard
já usam o contrato, eliminando estilos manuais duplicados.

Em 05/08/2026, `Input`, `Textarea` e `Select` receberam IDs únicos por instância,
`required`/`disabled` nativos, descrição e erro combináveis em
`aria-describedby` e estados visuais consistentes. O diálogo de renomear adotou
o novo `Input`. A inspeção no navegador revelou também que o menu do card era
recortado e permitia que o clique atingisse a aba atrás dele; o menu passou a
ser renderizado em portal com posicionamento fixo, limite de viewport e camada
própria. Renomear foi comprovado no desktop e em 390 px sem salvar alterações.

No lote seguinte, `Button` recebeu `type="button"` seguro por padrão e estado
`loading` com `aria-busy` e bloqueio de clique duplo. O novo `Checkbox` mantém
controle HTML nativo, alvo de 44 px, foco, descrição, erro, required e disabled.
`ConfirmDialog` passou a usar IDs únicos, foco inicial seguro (Cancelar em ações
destrutivas), ciclo de Tab, Escape, restauração do foco e estado busy. O fluxo
real de exclusão foi aberto e cancelado em desktop/mobile; nenhum documento foi
excluído, e o foco retornou a “Mais ações”.

## Fases de execução

### V0 — Inventário e matriz visual

- [x] medir Lighthouse mobile e desktop no build de produção;
- [x] confirmar a situação de instalação PWA;
- [x] localizar cores fixas, textos muito pequenos e fontes externas;
- [x] registrar hotspots estruturais que afetam a consistência;
- [ ] catalogar todas as rotas, estados vazios, carregando, erro e sucesso;
- [ ] capturar matriz claro/escuro em 360, 390, 768, 1280 e 1440 px;
- [ ] classificar problemas por contraste, hierarquia, espaçamento, densidade,
  responsividade, feedback e desempenho.

Aceite: nenhuma tela ou estado crítico fica fora do mapa de revisão.

### V1 — Portões automáticos de interface

- [x] adicionar axe ao Playwright sem duplicar a lógica dos testes unitários;
- [x] criar projetos desktop, tablet, Android e iPhone no Playwright;
- [x] manter smoke rápido separado da matriz visual completa;
- [ ] criar screenshots somente para componentes/jornadas estáveis;
- [ ] adicionar auditoria Lighthouse reproduzível contra build de produção;
- [ ] estabelecer budgets antes de bloquear CI para evitar falsos positivos;
- [x] produzir screenshot e trace do Playwright quando houver falha;
- [ ] publicar os artifacts no CI quando houver falha.

Aceite: regressões graves de acessibilidade, layout ou performance geram falha
reproduzível e evidência visual.

### V2 — Fundação do design system

- [ ] consolidar tokens de cor e remover aliases apenas após migração;
- [ ] definir escala tipográfica fluida e limites mínimos por contexto;
- [ ] definir espaçamento, grid, radius, bordas, sombras e camadas;
- [ ] separar cores de interface das cores fixas do documento/PDF;
- [ ] documentar estados hover, focus, active, disabled, loading e destructive;
- [ ] criar contratos responsivos para container, stack, grid e regiões da tela;
- [ ] garantir paridade claro/escuro sem exigir o tema escuro do cliente final.

Aceite: a maior parte das alterações visuais passa por tokens ou primitives,
sem busca e substituição espalhada por páginas.

### V3 — Componentes fundamentais

- [x] revisar Button, IconButton, Input, Select, Textarea e Checkbox;
- [x] revisar Card, MetricCard, Badge, Alert, Toast e EmptyState;
- [ ] criar Table/DataList responsiva para desktop e mobile;
- [x] substituir cards clicáveis com botões aninhados por semântica válida;
- [x] reduzir a sobrecarga visual dos cards sem remover capacidades;
- [ ] padronizar Modal/Drawer/Confirm com foco e teclado corretos;
- [ ] criar AppShell, cabeçalho, navegação lateral e navegação móvel;
- [ ] criar Skeleton e estados de erro com ação de recuperação;
- [ ] evitar barrels que tragam código pesado para rotas públicas.

Aceite: estados e variantes são previsíveis, acessíveis e cobertos por testes de
interação representativos.

Progresso em 05/08/2026: `Badge`, `Alert` e `EmptyState` possuem contratos
semânticos, variantes compatíveis com temas claro/escuro e testes de
acessibilidade. O erro do checkout já utiliza o `Alert` compartilhado. O item
continuou aberto naquela entrega porque ainda restavam `Card`, `MetricCard` e
`Toast`.

Conclusão em 05/08/2026: `Card` ganhou variantes, espaçamento e interação de
teclado composta; `MetricCard` passou a ser compartilhado pelo dashboard e pelo
painel, com modo compacto e carregamento acessível; `Toast` agora possui região
global sensível ao tema, limite de notificações, fechamento, posicionamento
seguro no mobile e contratos para aviso e operações assíncronas. O conjunto
fundamental deste item está concluído.

A auditoria subsequente encontrou e corrigiu um card de modelo que ainda
combinava `role="button"` com botões descendentes. Os cards agora são artigos
nomeados com ações independentes, e a faixa de filtros ficou contida com rolagem
horizontal em telas estreitas. A matriz dedicada comprova temas claro/escuro em
desktop, tablet, Android e iPhone.

### V4 — Jornada pública e autenticação

- [ ] refinar landing, cabeçalho, hero, demonstração de documento e rodapé;
- [x] corrigir os contrastes confirmados na landing;
- [x] eliminar bloqueio das fontes externas por self-host no bundle;
- [x] retirar jsPDF e o barrel amplo de UI do carregamento público;
- [ ] revisar login, callback, perfil incompleto e onboarding;
- [x] acrescentar description, `robots.txt` e sitemap público mínimo;
- [ ] concluir metadados sociais, canonical e dados estruturados aplicáveis.

Aceite: landing mobile com Performance ≥ 90, Acessibilidade 100 nas verificações
automatizadas aplicáveis e nenhum erro axe sério/crítico.

### V5 — Jornada do cliente

- [ ] refinar dashboard, templates, formulários, editor, preview e checkout;
- [ ] revisar retorno, back/forward, teclado móvel e perda de conexão;
- [ ] tornar progresso, salvamento, erro e confirmação inequívocos;
- [ ] preservar legibilidade do documento em tela pequena sem comprometer o PDF;
- [ ] validar touch, rotação, zoom de texto a 200% e tema escuro.

Aceite: criação e recuperação de documento funcionam sem overflow, ação oculta ou
estado sem feedback nos viewports de referência.

### V6 — Painel administrativo profissional

- [ ] construir o shell sobre os mesmos primitives e tokens aprovados;
- [ ] priorizar saúde operacional, filas, exceções e ações auditáveis;
- [ ] criar visão desktop densa e representação móvel adequada;
- [ ] padronizar busca, filtros, paginação, detalhes e ações administrativas;
- [ ] manter MFA, autorização, motivo e auditoria visíveis nos fluxos sensíveis;
- [ ] mostrar latência/idade dos dados, atualização e falhas recuperáveis.

Aceite: o admin não é apenas um conjunto de métricas; cada tarefa planejada tem
entrada clara, estado, confirmação, resultado e trilha de auditoria.

### V7 — Instalação e confiabilidade PWA

- [ ] gerar manifesto e ícones aprovados visualmente;
- [ ] implementar service worker sem cachear respostas autenticadas/documentos;
- [ ] criar fallback offline e mensagens para recursos que exigem conexão;
- [ ] definir prompt de atualização que não descarte formulário em andamento;
- [ ] criar botão de instalação contextual e instrução específica para iOS;
- [ ] validar login OAuth no modo standalone e retorno ao destino original;
- [ ] validar câmera/QR no navegador móvel e na PWA instalada;
- [ ] testar Android/Chromium e iOS/Safari em dispositivo real antes da publicação.

Aceite: instalação, abertura standalone, atualização, offline seguro, login e
retomada passam no checklist de dispositivos, sem exposição de dados privados.

### V8 — Publicação progressiva

- [ ] publicar primeiro em Preview da Vercel;
- [ ] executar matriz visual, acessibilidade, performance e fluxos críticos;
- [ ] comparar métricas e screenshots com o baseline;
- [ ] validar com conta comum e administrativa;
- [ ] preparar rollback de frontend e service worker;
- [ ] promover ao `main` somente depois da aprovação do Preview.

Aceite: release documentada, monitorada e reversível.

## Critérios obrigatórios de qualidade

- WCAG 2.2 AA como referência de interface;
- contraste mínimo de 4,5:1 para texto normal e 3:1 para texto grande;
- zero violações axe sérias ou críticas nas jornadas cobertas;
- alvo mínimo normativo de 24 × 24 px e meta interna de 44 × 44 px para ações
  principais de toque;
- texto redimensionado a 200% sem perda de conteúdo ou função;
- ausência de rolagem horizontal acidental em 360 px;
- inputs de 16 px ou mais no mobile;
- suporte a teclado, foco visível e redução de movimento;
- mobile Lighthouse: Performance ≥ 90, Acessibilidade ≥ 95 no primeiro gate,
  elevando a meta de acessibilidade para 100 após a migração das jornadas;
- LCP ≤ 2,5 s, CLS ≤ 0,1 e INP ≤ 200 ms como budgets-alvo;
- nenhum documento, token, CPF ou resposta autenticada em cache público/offline;
- PWA atualizável sem apagar trabalho não salvo.

## Ferramentas e papel de cada uma

- Lighthouse: performance, acessibilidade automatizada, boas práticas e SEO;
- axe-core + Playwright: violações de acessibilidade dentro das jornadas reais;
- Playwright: matriz de viewports, interações e regressão por screenshot;
- DevTools/Application: manifesto, service worker, cache e instalação;
- testes em dispositivos reais: teclado, câmera, instalação, standalone e iOS;
- catálogo de componentes: será introduzido depois de estabilizar primitives; não
  será usado para maquiar componentes ainda duplicados.

Ferramentas automáticas não substituem inspeção de hierarquia, clareza, linguagem,
qualidade percebida ou uso com leitor de tela.

## Riscos e controles

| Risco | Controle |
|---|---|
| reformulação quebrar fluxo funcional | mudanças pequenas, testes e Preview |
| screenshot gerar ruído | cobrir somente estados determinísticos |
| PWA servir versão antiga | versionamento, prompt de atualização e rollback |
| cache expor documento | allowlist de assets públicos; negar dados autenticados |
| animações prejudicarem uso | movimento funcional e `prefers-reduced-motion` |
| tema escuro virar segunda interface incompleta | tokens compartilhados e matriz de paridade |
| admin ficar ilegível no celular | DataList/cards e ações progressivas, não tabela espremida |

## Próximo lote executável

1. concluir screenshots e inventário de rotas/estados de V0;
2. implementar V1 em commit isolado;
3. corrigir os três contrastes, fontes bloqueantes e metadados de V4;
4. definir tokens finais e protótipos dos primitives de V2/V3;
5. validar landing e login antes de avançar para dashboard/admin;
6. implementar V7 após a base visual, com revisão específica de segurança do cache.

## Critério de encerramento do plano

O plano termina quando as jornadas públicas, do cliente e administrativas passam
na matriz desktop/mobile, a PWA pode ser instalada e atualizada com segurança,
os budgets acordados passam no build de produção e as regras visuais estão
protegidas por componentes e testes suficientes para manutenção futura.
