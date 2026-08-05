# Decomposição segura do `RequirementsModal` — KRIOU-DOCS

Data-base: 2026-08-05

Estado: em execução; R0 concluída e R1 iniciada com domínio puro extraído

Responsável inicial: proprietário do produto + implementação assistida

Risco: alto para impressão e médio para a interface em tela

## 1. Objetivo e relação com os planos ativos

Este plano detalha a decomposição incremental do `RequirementsModal`, atualmente
um hotspot de aproximadamente 1.253 linhas. O objetivo não é diminuir linhas por
si só: é separar regras, apresentação em tela e documento de impressão para que
mudanças futuras sejam localizáveis, testáveis e reversíveis.

Ele executa uma parte específica de:

- DT-09 e TD3 do [Programa de dívida técnica](./PLANO-DIVIDA-TECNICA-2026-08-03.md);
- M03 do [Plano Mestre de Modernização](./PLANO-MESTRE-MODERNIZACAO-2026-08-03.md);
- V3 e dos critérios do [Plano de auditoria visual e PWA](./PLANO-AUDITORIA-VISUAL-PWA-2026-08-04.md).

A fundação compartilhada de overlays já está pronta. A decomposição deve manter
o portal e o `useOverlayFocus` atuais, sem criar um segundo mecanismo de modal.
Este documento planeja a mudança; não autoriza alteração de regra de negócio,
conteúdo jurídico ou aparência do documento impresso.

## 2. Critério de encerramento

O plano termina quando:

1. seleção e agrupamento estiverem em domínio puro, coberto por caracterização;
2. tela e impressão consumirem o mesmo modelo derivado;
3. a API pública `{ doc, variant, onClose }` e o import atual forem preservados;
4. acessibilidade, responsividade, conteúdo e impressão passarem pela matriz;
5. domínio, tela, impressão e CSS deixarem de estar no mesmo arquivo;
6. não houver regressão material de bundle, console, foco ou navegação;
7. ambiguidades de produto estiverem registradas, sem correção silenciosa.

## 3. Diagnóstico atual

O componente mistura responsabilidades que mudam por motivos diferentes:

- metadados dos três níveis de preenchimento;
- coleta e classificação dos campos;
- percentuais dos níveis mínimo e essencial;
- estado e derivação de título, variante, data, listas e contagem;
- modal interativo e responsivo;
- árvore A4 exclusiva de impressão;
- estilos de tela e regras globais de `@media print`;
- chamada a `window.print()`;
- portal, foco, teclado, inércia da aplicação e scroll lock.

Tela e impressão renderizam separadamente os mesmos grupos, documentos e dicas,
o que permite divergência. A data depende diretamente do relógio do navegador,
dificultando snapshots e previsibilidade de fuso.

### Evidências da execução R0 — 05/08/2026

- baseline inicial: 1.253 linhas; após retirar somente a regra pura, a fachada
  permanece com 1.205 linhas e o domínio possui 48 linhas;
- consumidores confirmados: barrel `components/UI.jsx` e `LegalEditorPage`;
- 14 testes de caracterização cobrem regra, níveis, fallback, imutabilidade,
  tela, impressão, fechamento, foco, scroll lock e CSS A4;
- E2E local percorre modelos → editor → requisitos em Chromium desktop,
  Android 360 px, iPhone e tablet;
- o E2E mede os limites de cada seletor, executa Axe, emula `media: print` e
  gera um PDF A4 real nos projetos Chromium;
- screenshots foram inspecionadas nos temas claro/escuro e em 390 px; a
  proteção persistente usa medidas de layout, Axe e contrato de impressão para
  evitar snapshots frágeis por fonte/plataforma;
- baseline de produção: `LegalEditorPage` 49,27 kB/13,56 kB gzip e chunk `UI`
  94,08 kB/20,72 kB gzip;
- achados corrigidos antes da extração: seletor “Completo” cortado no mobile,
  contraste do badge obrigatório, região rolável sem foco e ícone `Scale`
  ausente;
- a execução real não produz mais aviso de ícone ausente; o E2E bloqueia sua
  reintrodução;
- a duplicação `required && disableable` e as demais decisões da seção 10
  continuam congeladas, não corrigidas.

## 4. Escopo e não objetivos

Incluído:

- congelar comportamento por testes e fixtures;
- extrair domínio e criar um view model único;
- extrair componentes visuais e a árvore de impressão;
- isolar CSS de papel somente após comparação do JSX;
- preservar uma fachada compatível;
- validar temas, larguras, teclado, Axe e PDF;
- registrar ambiguidades sem resolvê-las durante a refatoração.

Não incluído:

- mudar percentuais, níveis, schema ou significado jurídico;
- redesenhar o modal ou o documento A4;
- corrigir redação e acentos junto da extração;
- adicionar backend, persistência, telemetria ou nova biblioteca;
- reorganizar o editor além do necessário para preservar o import;
- deduplicar, traduzir ou reordenar campos;
- adicionar memoização sem medição.

## 5. Contratos que não podem mudar

### 5.1 API e ciclo de vida

- export e props continuam compatíveis;
- `doc` ausente não renderiza nem acessa seus campos;
- nível inicial continua `essencial` a cada nova abertura;
- variante permanece opcional;
- data continua no padrão `pt-BR` até decisão específica.

### 5.2 Coleta e classificação

- coletar `doc.commonSections` e todas as entradas de `doc.variantSections`;
- preservar a ordem atual de seções e campos;
- tolerar coleções ausentes como hoje;
- `obrigatorios`: `required` verdadeiro;
- `opcionais`: sem `required` e sem `disableable`;
- `extras`: `disableable` verdadeiro;
- preservar rótulos, repetições e ordem.

Ambiguidade importante: um campo `required && disableable` entra hoje em
`obrigatorios` e `extras`. A refatoração deve preservar e testar esse resultado.
Corrigi-lo exige decisão de produto separada, pois muda conteúdo e contagem.

### 5.3 Níveis

| Nível | Obrigatórios | Opcionais | Extras | Contagem |
|---|---|---|---|---|
| `minimo` | primeiros `ceil(50%)` | nenhum | nenhum | seleção |
| `essencial` | todos | primeiros `ceil(60%)` | nenhum | soma |
| `completo` | todos | todos | todos | soma |
| desconhecido | todos | nenhum | nenhum | obrigatórios |

Arredondamento, corte no início da lista e identificadores são contratos.

### 5.4 Tela

- exatamente três níveis selecionáveis;
- contagem e badge refletem o nível ativo;
- `whenUse` aparece em tela somente no essencial;
- opcionais não aparecem no mínimo; extras, somente no completo;
- `requiredDocs` aparece quando tiver itens;
- `tips` aparece quando tiver itens e o nível não for mínimo;
- título, variante, ações e conteúdo mantêm o comportamento atual.

### 5.5 Overlay e acessibilidade

- portal no `document.body`, título e descrição associados;
- foco inicial no botão de fechar;
- contenção de `Tab`/`Shift+Tab` e fechamento por Escape;
- botão e backdrop chamam `onClose` uma vez; clique interno não fecha;
- restauração de foco, raiz inerte e bloqueio de scroll;
- overlays empilhados não liberam recursos antes da hora;
- região rolável, alvos de toque e nomes acessíveis são preservados.

### 5.6 Impressão

- botão chama `window.print()` uma vez;
- árvore interativa fica oculta e somente o A4 é impresso;
- tamanho, margens, cores, cabeçalho, rodapé e página ficam equivalentes;
- listas, ordem e contagem correspondem ao nível visto em tela;
- conteúdo longo não é cortado nem sobreposto silenciosamente;
- tema da aplicação não altera a legibilidade em papel/PDF;
- regras de print não revelam elementos externos ao modal.

## 6. Arquitetura-alvo

```text
src/features/requirements/
  domain/
    requirements.js
    requirements.test.js
  model/
    createRequirementsViewModel.js
    createRequirementsViewModel.test.js
  components/
    RequirementsDialog.jsx
    RequirementsLevelSelector.jsx
    RequirementsSummary.jsx
    RequirementGroup.jsx
  print/
    RequirementsPrintDocument.jsx
    requirements-print.css
  RequirementsModal.jsx

src/components/UI/RequirementsModal.jsx
  # fachada/reexportação compatível
```

Arquivos são orientativos: não criar componentes minúsculos sem fronteira real.

- `domain`: coleta, classificação, nível e contagem; sem React, DOM, tema ou data.
- `model`: combina doc, variante, nível e data; produz snapshot e flags únicas.
- `components`: apenas apresentação e callbacks; nunca reclassifica campos.
- `print`: recebe o mesmo view model; sem estado, tema global ou efeitos.
- fachada: estado do nível, refs/IDs, overlay e impressão.

Fluxo obrigatório:

```text
consumidor → RequirementsModal → createRequirementsViewModel
                                      ├─ RequirementsDialog
                                      └─ RequirementsPrintDocument
```

Tela e impressão não podem recalcular o domínio separadamente.

## 7. Fases incrementais e gates

Cada fase deve ser um commit pequeno e revertível. Só avançar com gate verde.

### R0 — Congelar baseline

- [x] registrar tamanho, imports, consumidores e bundle;
- [x] criar fixtures literais para vazio, comum, variantes, flags ambíguas,
      spec completa, coleções ausentes e conteúdo longo;
- [x] caracterizar algoritmo, DOM acessível, teclado e fechamento;
- [x] registrar screenshots de tela e baseline de PDF/print;
- [x] comprovar a suíte atual verde.

Gate: testes detectam mudança de ordem, percentual, duplicação, visibilidade,
contagem, fechamento e conteúdo impresso.

### R1 — Extrair domínio puro

- [x] mover a regra pura sem alterar seu resultado;
- [ ] mover os metadados estáveis dos níveis após definir seu contrato;
- [x] comparar saída antiga e nova nas fixtures antes de apagar a cópia;
- [x] testar bordas, fallback e ausência de mutação da entrada;
- [x] executar qualidade e interações.

Gate: nenhuma mudança visual/DOM; uma única regra ativa e testada.

### R2 — Criar view model único

- [ ] definir contrato explícito do modelo;
- [ ] centralizar grupos, contagem, flags, variante, spec e data;
- [ ] entregar o mesmo snapshot à tela e impressão;
- [ ] estabilizar relógio nos testes, preservando `pt-BR` em produção.

Gate: todas as condições têm uma fonte e tela/print não importam o domínio.

### R3 — Extrair apresentação de tela

- [ ] extrair seletor, resumo e grupos semanticamente equivalentes;
- [ ] manter estado, ações e overlay na fachada;
- [ ] comparar DOM acessível e screenshot após cada extração;
- [ ] medir antes de usar `memo` ou callbacks artificiais.

Gate: quatro larguras e dois temas sem overflow, perda de foco ou mudança.

### R4 — Extrair árvore de impressão

- [ ] mover primeiro somente JSX, mantendo CSS no lugar;
- [ ] receber apenas view model, sem efeitos;
- [ ] comparar texto, ordem, contagem, páginas e screenshot/PDF;
- [ ] testar vazio, curto, completo e longo.

Gate: zero diferença não explicada. Em falha, reverter só R4.

### R5 — Isolar CSS de impressão

- [ ] mover CSS após R4 estável e escopar seletores;
- [ ] revisar `visibility`, posição, quebra de página e margens;
- [ ] testar ordem de import no build;
- [ ] validar Chromium e, manualmente, outro motor disponível;
- [ ] comparar papel nos temas claro e escuro.

Gate: sem página vazia, corte, fundo indevido ou conteúdo duplicado.

### R6 — Consolidar fachada

- [ ] mover coordenação para a feature e manter reexport legado;
- [ ] remover código morto somente após busca global;
- [ ] documentar contratos e medir bundle/dependências;
- [ ] confirmar que consumidores não mudaram dados ou ciclo de vida.

Gate: fachada apenas coordena; domínio não está no JSX; imports não quebram.

### R7 — Validar e encerrar

- [ ] executar lint, tipos, testes, build e E2E afetado;
- [ ] executar matriz visual, Axe, teclado e impressão;
- [ ] abrir o modal pelo editor real;
- [ ] procurar warnings, listeners e scroll locks residuais;
- [ ] atualizar planos, `STATUS.md`, métricas e decisões adiadas.

## 8. Matriz obrigatória de testes

### Domínio

| Caso | Prova |
|---|---|
| coleções ausentes/vazias | resultado tolerante e contagem zero |
| apenas seções comuns | coleta e ordem corretas |
| múltiplas variantes | todas coletadas na ordem atual |
| seção sem `fields` | ignorada sem erro |
| 0, 1, 2, 3 e 5 obrigatórios | `ceil(50%)` |
| 0, 1, 2, 3 e 5 opcionais | `ceil(60%)` |
| `required && disableable` | duplicação atual congelada |
| rótulos repetidos | repetição e ordem preservadas |
| nível desconhecido | fallback atual |
| entrada congelada | nenhuma mutação |

### Componente e acessibilidade

- render com e sem `doc`, nível inicial e alternância dos três níveis;
- listas, contagem, conteúdo auxiliar e variante em cada nível;
- fechar por botão, backdrop e Escape exatamente uma vez;
- clique interno, ciclo de Tab, restauração de foco e scroll lock;
- nomes/descrição/seleção e Axe sem violações graves ou críticas;
- impressão chamada uma vez; console sem warnings e erros.

### Impressão

- `media: print` mostra apenas A4;
- texto contém título, variante, nível, data, grupos e rodapé;
- listas e contagens são iguais ao snapshot da tela;
- documento curto sem página vazia e longo sem sobreposição/corte;
- condições de `requiredDocs`, `tips` e `whenUse` congeladas;
- claro/escuro geram papel equivalente;
- CSS não revela o restante da aplicação.

### Visual e responsivo

| Largura | Perfil | Temas | Níveis |
|---:|---|---|---|
| 360 px | Android estreito | claro/escuro | todos |
| 390 px | iPhone | claro/escuro | essencial/completo |
| 768 px | tablet | claro/escuro | todos |
| 1280 px | desktop | claro/escuro | todos |

Também validar 200% de zoom, alvo de toque, contraste e overflow horizontal.

## 9. Fixtures mínimas

- `emptyDocument`;
- `commonFieldsDocument`;
- `variantFieldsDocument`;
- `ambiguousFlagsDocument`;
- `completeSpecDocument`;
- `longPrintDocument`;
- `missingCollectionsDocument`.

Expectativas devem ser literais. Nunca calcular a expectativa com a própria
função testada, pois teste e bug poderiam mudar juntos.

## 10. Riscos e decisões separadas

| Risco/ambiguidade | Controle na refatoração | Decisão posterior |
|---|---|---|
| tela e print divergirem | view model único + comparação | invariante |
| `required && disableable` duplicado | preservar e testar | produto/jurídico |
| mínimo usar só 50% dos obrigatórios | não mudar percentual | validar significado |
| ordem de `Object.values` | fixture congela ordem atual | ordenação de domínio |
| data e fuso | relógio controlável em teste | timezone de negócio |
| `doc` mudar ainda montado | caracterizar ciclo real | política de reset |
| CSS print global | extrair por último + teste completo | escopo definitivo |
| conteúdo longo | fixture/PDF longo | política de paginação |
| motores diferentes | Chromium + inspeção adicional | navegadores suportados |
| tema vazar no papel | cores explícitas | tokens de print |
| texto atual sem acentos | preservar snapshot | revisão editorial |
| emoji/ícone de variante | testar fallback | política de ícones |
| `window.print()` sem sucesso observável | testar invocação | feedback futuro |

Nada da última coluna entra no mesmo commit da decomposição.

## 11. Rollback e commits

- uma fase por commit; não misturar redesign, texto ou regra;
- preservar export legado até o fim;
- apagar caminho antigo somente após ativar e comparar o novo;
- não deixar duas fontes de verdade após merge;
- falha em quality, Axe, responsividade ou PDF bloqueia o merge;
- diferença de impressão inexplicada reverte somente sua fase.

Ordem sugerida:

1. `test: characterize requirements modal behavior`;
2. `refactor: extract requirements domain rules`;
3. `refactor: share requirements view model`;
4. `refactor: extract requirements screen components`;
5. `refactor: isolate requirements print document`;
6. `refactor: scope requirements print styles`;
7. `refactor: consolidate requirements modal facade`;
8. `docs: close requirements decomposition plan`.

## 12. Critérios finais de qualidade

- zero alteração não aprovada em listas, ordem, contagem e condições;
- zero violação Axe grave/crítica e zero overflow na matriz;
- zero warning/erro novo, listener ou scroll lock residual;
- bundle não cresce mais de 2 kB gzip sem justificativa;
- nenhuma dependência nova apenas para a decomposição;
- domínio cobre branches de níveis e fallbacks;
- fachada preferencialmente entre 100 e 150 linhas, sem meta mecânica;
- impressão curta e longa aprovada automática e visualmente;
- `npm run quality` e E2E afetado verdes no build de produção.

Esta decomposição deve acontecer antes de redesign ou mudança jurídica nos
requisitos. Não bloqueia correções críticas de segurança, pagamento ou perda de
dados. O plano só termina quando a mudança futura estiver protegida por uma
fronteira clara e falhar nos testes antes de alcançar o usuário ou o PDF.
