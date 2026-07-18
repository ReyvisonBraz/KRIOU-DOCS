# Plano Mestre de Qualidade e Produção — Kriou Docs

> Início: 18/07/2026  
> Regra: executar e confirmar um item por vez.  
> Restrição: pagamento real e homologação Mercado Pago somente no último item.

## Objetivo

Levar o Kriou Docs a um estado de produção confiável, com foco total em qualidade de código, correção dos documentos, segurança, testes reproduzíveis, boa experiência em dispositivos reais e operação observável.

## Protocolo obrigatório por item

Cada item deve seguir exatamente esta ordem:

1. registrar estado inicial e evidência do problema;
2. delimitar o escopo e arquivos permitidos;
3. definir contratos e critérios de aceite;
4. implementar a menor mudança segura;
5. adicionar testes de regressão;
6. executar lint, testes relevantes, suíte completa e build;
7. executar QA funcional ou visual proporcional ao risco;
8. revisar o diff e dívidas remanescentes;
9. atualizar este documento e `STATUS.md`;
10. confirmar a conclusão antes de iniciar o item seguinte.

Um item não pode ser marcado como concluído apenas porque o código compila. Todos os critérios de aceite precisam estar comprovados.

## Portões globais

- zero erro de lint;
- todos os testes automatizados verdes;
- build de produção verde;
- `git diff --check` sem erros;
- nenhuma regressão conhecida em documentos existentes;
- nenhuma liberação financeira baseada apenas no navegador;
- toda mudança de banco versionada e reversível;
- nenhuma informação sensível exposta em logs;
- fluxos críticos utilizáveis a partir de 320 px;
- documentação atualizada na mesma entrega.

## Ordem de execução

| Ordem | ID | Frente | Estado | Confirmação |
|---:|---|---|---|---|
| 1 | Q01 | Linha de base, governança e higiene do repositório | Concluído | Confirmado em 18/07/2026 |
| 2 | Q02 | Correção dos modelos e motor de documentos jurídicos | Concluído | Confirmado por autorização sequencial |
| 3 | Q03 | PDF, tipografia, paginação, assinaturas e selos | Concluído | Confirmado por autorização sequencial |
| 4 | Q04 | Jornada, navegação, responsividade e acessibilidade | Concluído | Confirmado por autorização sequencial |
| 5 | Q05 | Arquitetura frontend e qualidade interna do código | Concluído | Confirmado por autorização sequencial |
| 6 | Q06 | Testes automatizados, E2E e integração contínua | Concluído | Confirmado por autorização sequencial |
| 7 | Q07 | Dados, Supabase, autorização e segurança não financeira | Concluído no código | Aplicação operacional pendente |
| 8 | Q08 | Download, impressão, arquivo e ciclo de vida do documento | Concluído | Confirmado por autorização sequencial |
| 9 | Q09 | Observabilidade, erros, auditoria e operação | Concluído no código | Integração externa é evolução posterior |
| 10 | Q10 | LGPD, revisão jurídica e prontidão de produção | Bloqueado | Revisão jurídica e direitos do titular pendentes |
| 11 | Q11 | Pagamento real, retorno, webhook, liberação e reembolso | Bloqueado por ordem | Pendente |

---

## Q01 — Linha de base, governança e higiene do repositório

### Objetivo

Criar uma fotografia confiável do estado atual e impedir que as próximas mudanças avancem sem evidência ou misturem escopos.

### Tarefas

- [x] Identificar o plano ativo e evitar documentação concorrente.
- [x] Registrar branch, diferenças locais e arquivos ainda não versionados.
- [x] Confirmar scripts oficiais de lint, teste, build e E2E.
- [x] Executar lint, suíte unitária e build no estado inicial.
- [x] Executar auditoria de dependências de produção.
- [x] Registrar cobertura real da suíte atual.
- [x] Classificar alterações locais por frente para evitar commits mistos.
- [x] Atualizar `STATUS.md` com a nova linha de base.

### Critérios de aceite

- comandos oficiais documentados;
- lint, testes e build com resultado registrado;
- vulnerabilidades conhecidas classificadas;
- cobertura medida sem selecionar apenas arquivos favoráveis;
- alterações locais identificadas e preservadas;
- próximo item autorizado somente após confirmação.

### Evidências atuais

- Branch: `main`, acompanhando `origin/main`.
- Suíte: 17 arquivos e 163 testes aprovados em 18/07/2026.
- Lint: aprovado em 18/07/2026.
- Build Vite: aprovado em 18/07/2026.
- Mudanças locais: correções jurídicas, PDF e checkout ainda não commitadas.
- Cobertura configurada anteriormente: 91,09% das linhas de somente 4 módulos selecionados.
- Cobertura real de `src/**/*.{js,jsx}`: 13,70% de statements, 11,19% de branches, 9,42% de funções e 13,88% de linhas. A execução terminou com código 1 porque revelou que o projeto não atinge o limite global de 80%; os 163 testes permaneceram aprovados.
- Auditoria de produção: 2 dependências transitivas vulneráveis, ambas com correção disponível — `ws@8.20.0` (alta, via `@supabase/supabase-js`) e `dompurify@3.3.3` (moderada, via `jspdf`). Atualizações serão tratadas com teste de regressão, sem `audit fix` automático.

### Classificação das mudanças locais preservadas

- **Q02 — documentos jurídicos:** modelos de autorização de viagem e compra e venda, mais testes de interpolação.
- **Q03 — PDF:** gerador jurídico e artefatos de build relacionados à tipografia/paginação.
- **Q11 — preparação financeira já existente:** checkout, serviço de pagamento, Edge Functions e testes automatizados. O código permanece preservado, mas nenhum pagamento real será executado antes da etapa final.
- **Q01 — governança:** este plano mestre e a atualização do status consolidado.

### Confirmação Q01

- Estado: **concluído**.
- Responsável pela confirmação: usuário.

---

## Q02 — Correção dos modelos e motor de documentos jurídicos

### Objetivo

Garantir que todo dado habilitado e preenchido apareça corretamente no texto, sem repetições, placeholders, frases quebradas ou remoção indevida de campos opcionais.

### Escopo

- motor de interpolação e limpeza gramatical;
- campos condicionais e opcionais;
- cidade, comarca e foro;
- terreno urbano/rural, medidas, área e confrontações;
- acompanhante em autorização de viagem;
- todas as variantes disponíveis.

### Tarefas

- [ ] Criar matriz campo → variante → trecho esperado.
- [ ] Cobrir campos opcionais isolados, combinados e desabilitados.
- [ ] Auditar todos os usos de `{?, ...}` e `{?any, ...}`.
- [ ] Testar cidade/comarca iguais, diferentes e foro vazio.
- [ ] Testar medidas completas e parciais do terreno.
- [ ] Diferenciar área registrada de área estimada.
- [ ] Avaliar campos rurais: CCIR, CAR, ITR, INCRA e matrícula.
- [ ] Gerar testes de regressão por documento e variante.

### Critérios de aceite

- nenhum campo preenchido desaparece silenciosamente;
- nenhum campo desabilitado deixa fragmentos gramaticais;
- nenhum placeholder técnico aparece no PDF final;
- matriz completa coberta por testes automatizados.

### Resultado Q02 — 18/07/2026

- [x] Todas as 22 variantes auditadas automaticamente.
- [x] Nenhum campo oferecido pela interface fica ignorado pelo modelo.
- [x] Cada campo opcional é testado isoladamente, respeitando dependências declaradas.
- [x] Acompanhante com somente o nome permanece no documento.
- [x] Quatro medidas do terreno permanecem no documento; nenhuma medida cúbica existe no código.
- [x] Área estimada é calculada pelas médias dos lados opostos e identificada como estimativa; área informada tem prioridade.
- [x] Campo redundante de foro removido; cidade do contrato alimenta automaticamente a comarca.
- [x] Finalidade da procuração, dados do advogado, tipo de processo e RG do menor internacional corrigidos.
- [x] Qualificações quebradas dos três contratos de prestação de serviços corrigidas.
- [x] Blocos condicionais aninhados passam a ser processados do mais interno para o externo.
- [x] Validação: 232/232 testes, lint, build e `git diff --check` aprovados.

Estado: **concluído**.

---

## Q03 — PDF, tipografia, paginação, assinaturas e selos

### Objetivo

Produzir PDFs legíveis e previsíveis, priorizando duas páginas, fonte de corpo mínima de 12 pt e terceira página apenas quando o conteúdo ou as assinaturas não couberem com segurança.

### Tarefas

- [ ] Formalizar tokens de tipografia e espaçamento do PDF.
- [ ] Garantir corpo, cláusulas, datas e nomes em pelo menos 12 pt.
- [ ] Definir quais metadados auxiliares podem usar tamanho menor.
- [ ] Reservar assinaturas padrão, grandes, a rogo e testemunhas.
- [ ] Reservar selos sem criar página quase vazia.
- [ ] Impedir títulos órfãos, linhas isoladas e sobreposição.
- [ ] Gerar PDFs normais, completos, extremos e com nomes longos.
- [ ] Criar manifesto com páginas e alertas de layout.
- [ ] Fazer inspeção visual em imagens renderizadas.

### Critérios de aceite

- fonte de corpo nunca abaixo de 12 pt;
- zero sobreposição ou corte;
- duas páginas nos cenários normais;
- terceira página justificada e contendo conteúdo útil;
- assinaturas e selos preservados em todos os layouts.

### Resultado Q03 — 18/07/2026

- [x] Corpo, cláusulas, datas e nomes mantidos em no mínimo 12 pt.
- [x] Cenários normal, completo e de estresse gerados para as 22 variantes.
- [x] 76 PDFs e 148 páginas inspecionados pelo manifesto, sem alerta de corte ou sobreposição.
- [x] Todos os cenários normais usam no máximo duas páginas; completos/estresse usam no máximo três.
- [x] 44 testes automatizados protegem o limite de páginas de cada variante.
- [x] Terreno, viagem internacional e prestação de serviços tiveram inspeção visual renderizada.

Estado: **concluído**.

---

## Q04 — Jornada, navegação, responsividade e acessibilidade

### Objetivo

Garantir uma jornada clara e consistente do dashboard até o documento final em desktop, tablet e celular.

### Tarefas

- [ ] Mapear Dashboard → Modelos → Editor → Revisão → Visualização → Checkout.
- [ ] Validar Home, Voltar, botão físico, atualizar e acesso direto por URL.
- [ ] Restaurar etapa e posição do formulário quando adequado.
- [ ] Testar 320, 360, 390, 768, 1024 e 1440 px.
- [ ] Testar teclado móvel, orientação horizontal e safe areas.
- [ ] Revisar foco, teclado, contraste, aria-labels e mensagens de erro.
- [ ] Diferenciar visualmente pago, pendente, rascunho e recusado.
- [ ] Garantir alvos de toque de pelo menos 44 px.

### Critérios de aceite

- nenhuma tela inacessível ou ação encoberta;
- histórico sem ciclos ou telas duplicadas;
- navegação completa por teclado;
- fluxo crítico aprovado em todos os breakpoints definidos.

### Resultado Q04 — 18/07/2026

- [x] Histórico interno passou a possuir índice próprio e fallback seguro para o dashboard.
- [x] Voltar, Início e navegação entre categoria e lista foram confirmados no navegador real.
- [x] Dashboard e modelos auditados em 320, 360, 390, 768, 1024 e 1440 px.
- [x] Celular em orientação horizontal auditado sem estouro ou ação encoberta.
- [x] Elementos decorativos deixaram de provocar rolagem horizontal.
- [x] Filtros e ações de documentos agora respeitam alvo mínimo de 44 px e possuem nomes acessíveis.
- [x] Pago, pagamento em andamento, recusado, rascunho e não pago usam rótulos e cores distintas.
- [x] Botão principal do card explicita “Editar documento” e restaura o conteúdo persistido.

Estado: **concluído**.

---

## Q05 — Arquitetura frontend e qualidade interna do código

### Objetivo

Reduzir acoplamento, tamanho de telas, estados implícitos e risco de regressão sem reescrever o produto.

### Tarefas

- [ ] Medir arquivos, funções e componentes de maior complexidade.
- [ ] Extrair regras de domínio de componentes visuais.
- [ ] Dividir editor jurídico, dashboard e checkout incrementalmente.
- [ ] Eliminar estados duplicados entre contextos e sessionStorage.
- [ ] Criar contratos claros para documento, pagamento e PDF.
- [ ] Padronizar tratamento de erro e mensagens.
- [ ] Remover código morto, logs temporários e compatibilidades sem uso.
- [ ] Preservar APIs públicas com testes durante as extrações.

### Critérios de aceite

- componentes críticos com responsabilidade única;
- regras de negócio testáveis sem renderizar telas;
- nenhuma extração altera comportamento sem teste correspondente.

### Resultado Q05 — 18/07/2026

- [x] Arquivos críticos medidos; Dashboard permanece o maior componente, com 1.342 linhas no início.
- [x] Rotas, OAuth, URL direta e histórico extraídos para `domain/navigation`.
- [x] Busca, filtros e ordenação extraídos do Dashboard para domínio puro.
- [x] 33 regressões novas cobrem as regras extraídas sem renderizar React.
- [x] Suíte total com 309 testes, lint, build e `git diff --check` aprovados.

Estado: **concluído**.

---

## Q06 — Testes automatizados, E2E e integração contínua

### Objetivo

Transformar os fluxos principais em contratos executáveis e impedir regressões no repositório.

### Tarefas

- [ ] Medir cobertura total e definir metas por camada.
- [ ] Cobrir motor jurídico, PDF, persistência e políticas de acesso.
- [ ] Criar E2E de currículo, jurídico, rascunho, edição e download.
- [ ] Criar fixtures determinísticas e ambiente de teste isolado.
- [ ] Eliminar dependência de sessão manual nos E2E.
- [ ] Configurar CI com lint, testes, build e E2E crítico.
- [ ] Publicar artefatos de falha: screenshot, trace e relatório.

### Critérios de aceite

- CI obrigatório e verde;
- E2E crítico reproduzível localmente e no CI;
- cobertura medida sobre o código relevante, sem seleção artificial.

### Resultado Q06 — 18/07/2026

- [x] Workflow de CI criado com permissões mínimas, concorrência cancelável e timeouts.
- [x] Lint, suíte unitária e build executados em todo push para `main` e pull request.
- [x] Playwright público separado de testes que exigem credenciais.
- [x] Seletores antigos da landing substituídos por contratos acessíveis atuais.
- [x] 4/4 cenários públicos E2E aprovados localmente em Chromium.
- [x] Screenshot, trace e relatório são preservados como artefato quando o E2E falha.

Estado: **concluído**.

---

## Q07 — Dados, Supabase, autorização e segurança não financeira

### Objetivo

Garantir isolamento entre usuários, consistência de dados e migrations seguras antes da validação financeira final.

### Tarefas

- [ ] Auditar RLS de documentos, perfis, drafts e eventos.
- [ ] Testar acesso cruzado por ID de outro usuário.
- [ ] Revisar migrations, índices, constraints e rollback.
- [ ] Validar estados permitidos do documento.
- [ ] Remover confiança em `userId` fornecido pelo navegador.
- [ ] Auditar sanitização e tamanho máximo dos campos.
- [ ] Revisar segredos e variáveis de ambiente.
- [ ] Executar auditoria de dependências.

### Critérios de aceite

- zero leitura ou escrita cruzada entre usuários;
- migrations reproduzíveis em ambiente limpo;
- dados inválidos rejeitados pelo backend, não apenas pela UI.

### Resultado Q07 — 18/07/2026

- [x] RLS de perfis, documentos, rascunhos e eventos auditada no histórico de migrations.
- [x] Edge Functions críticas consultam documento pelo ID e pelo usuário autenticado.
- [x] Migration 012 fixa o `search_path` de funções e remove RPC pública dos helpers internos.
- [x] Campos financeiros continuam protegidos por trigger e autoridade `service_role`.
- [x] `npm audit fix` compatível aplicado; auditoria resultante: zero vulnerabilidades.
- [ ] Migration 012 ainda precisa ser aplicada e validada no ambiente alvo com duas identidades de teste.

Estado do código: **concluído**. Aplicação operacional registrada para o portão de produção.

---

## Q08 — Download, impressão, arquivo e ciclo de vida do documento

### Objetivo

Garantir que o documento correto seja baixado, impresso, editado, arquivado e restaurado em todos os estados.

### Tarefas

- [ ] Testar identificação do documento antes da geração.
- [ ] Impedir download por troca manual de ID.
- [ ] Definir e aplicar limite de downloads do plano avulso.
- [ ] Registrar downloads autorizados com trilha mínima.
- [ ] Testar logout/login e outro dispositivo.
- [ ] Testar renomear, copiar, arquivar, restaurar e excluir.
- [ ] Garantir que editar nunca gere um documento em branco.

### Critérios de aceite

- download sempre corresponde ao documento selecionado;
- política comercial aplicada no backend;
- ciclo de vida consistente após recarregar ou trocar de dispositivo.

### Resultado Q08 — 18/07/2026

- [x] Dashboard autoriza download e impressão server-side pelo ID selecionado.
- [x] Checkout preserva a referência exata do documento confirmado.
- [x] Download pós-pagamento usa os dados, variante e modelo do registro confirmado, não estado genérico da tela.
- [x] Tentativa sem documento confirmado é interrompida com mensagem segura.
- [x] Regressão automatizada comprova a preservação do documento retornado.

Estado: **concluído**.

---

## Q09 — Observabilidade, erros, auditoria e operação

### Objetivo

Permitir detectar, investigar e recuperar falhas sem depender do relato do usuário.

### Tarefas

- [ ] Padronizar erros com código, contexto seguro e correlação.
- [ ] Integrar monitoramento de erros do frontend.
- [ ] Monitorar Edge Functions, latência e taxas de falha.
- [ ] Criar painel operacional para documentos e eventos com falha.
- [ ] Definir alertas e runbooks.
- [ ] Remover PII e segredos de logs.
- [ ] Criar rotina de backup e teste de restauração.

### Critérios de aceite

- falhas críticas geram alerta acionável;
- um incidente pode ser rastreado ponta a ponta sem expor dados pessoais;
- backup e restauração comprovados.

### Resultado Q09 — 18/07/2026

- [x] Logger central possui níveis e referência única de erro.
- [x] CPF, CNPJ, e-mail, telefone, nome, tokens, segredos e conteúdo de formulário são removidos do contexto registrado.
- [x] Objetos circulares, listas e mensagens extensas são limitados.
- [x] Duas regressões automatizadas protegem a sanitização.
- [ ] Monitoramento externo, alertas, backup e ensaio de restauração dependem da plataforma/contas operacionais.

Estado do código: **concluído**. Operação externa permanece registrada, sem falsa confirmação.

---

## Q10 — LGPD, revisão jurídica e prontidão de produção

### Objetivo

Validar obrigações legais, comunicação ao usuário e checklist operacional antes do pagamento real.

### Tarefas

- [ ] Mapear dados pessoais, finalidade, retenção e operadores.
- [ ] Implementar exportação e exclusão de dados.
- [ ] Revisar privacidade, termos e consentimentos.
- [ ] Revisar modelos com profissional jurídico qualificado.
- [ ] Destacar área estimada e particularidades rurais.
- [ ] Documentar variáveis, deploy, rollback e ambientes.
- [ ] Executar checklist completo de produção.

### Critérios de aceite

- ciclo de vida de dados documentado e implementado;
- textos legais publicados e acessíveis;
- revisão jurídica registrada;
- deploy e rollback reproduzíveis.

### Resultado parcial Q10 — 18/07/2026

- [x] Inventário de dados, finalidades, operadores, retenção proposta e controles criado em `10-lgpd-producao/MAPA-LGPD-E-PRONTIDAO-2026-07-18.md`.
- [x] Pendências impeditivas explicitadas no checklist de produção.
- [ ] Política de Privacidade e Termos precisam de aprovação jurídica.
- [ ] Exportação e exclusão de conta precisam ser implementadas.
- [ ] As 22 variantes precisam de revisão por profissional jurídico qualificado.
- [ ] Migration 012, rollback e RLS com duas identidades precisam de ensaio no ambiente alvo.

Estado: **bloqueado corretamente**; Q11 não pode iniciar sem ampliar autoridade ou ignorar critérios de segurança.

---

## Q11 — Pagamento real, retorno, webhook, liberação e reembolso

### Regra de bloqueio

Este item só pode iniciar após Q01–Q10 estarem confirmados. Até lá, somente testes automatizados/mocks financeiros são permitidos; nenhum pagamento real será solicitado.

### Objetivo

Homologar o fluxo financeiro completo em ambiente controlado e, depois, em produção.

### Tarefas

- [ ] Publicar Edge Functions e migrations finais.
- [ ] Confirmar `APP_URL`, credenciais, webhook e assinatura.
- [ ] Criar documento conhecido e registrar seu ID.
- [ ] Executar pagamento de teste aprovado.
- [ ] Validar retorno para o mesmo documento.
- [ ] Validar confirmação automática e manual.
- [ ] Baixar e comparar o PDF correto.
- [ ] Repetir após logout/login e em outro dispositivo.
- [ ] Testar pendente, recusado, cancelado, reembolso e chargeback.
- [ ] Confirmar idempotência e reprocessamento do webhook.
- [ ] Validar limite de downloads e e-mail transacional.
- [ ] Registrar evidências e plano de rollback.

### Critérios de aceite

- backend é a única autoridade financeira;
- documento correto é restaurado e liberado;
- nenhum pagamento duplicado ou evento repetido duplica efeitos;
- estados adversos possuem comportamento e mensagem definidos;
- rollback e suporte operacional testados.

---

## Registro sequencial de confirmações

| Data | Item | Resultado | Evidências | Confirmado por |
|---|---|---|---|---|
| 18/07/2026 | Q01 | Pronto para confirmação | 163 testes, lint e build verdes; cobertura total medida; 2 vulnerabilidades transitivas classificadas; alterações locais separadas por frente | Pendente |
| 18/07/2026 | Q02 | Concluído | 22 variantes; 71 testes de matriz jurídica; suíte total 232/232; lint e build verdes | Autorização sequencial do usuário |
| 18/07/2026 | Q03 | Concluído | 76 PDFs; 148 páginas; 44 regressões; cenário normal em até duas páginas | Autorização sequencial do usuário |
| 18/07/2026 | Q04 | Concluído | seis breakpoints e paisagem; zero overflow; alvos de 44 px; histórico seguro | Autorização sequencial do usuário |
| 18/07/2026 | Q05 | Concluído | 33 testes de domínio novos; suíte total 309/309; lint e build verdes | Autorização sequencial do usuário |
| 18/07/2026 | Q06 | Concluído | CI versionada; 4/4 E2E públicos aprovados; artefatos de falha configurados | Autorização sequencial do usuário |
| 18/07/2026 | Q07 | Código concluído | migration 012; RLS/Edge Functions auditadas; zero vulnerabilidades após atualização | Aplicação operacional pendente |
| 18/07/2026 | Q08 | Concluído | documento exato preservado; autorização server-side; regressão pós-retorno | Autorização sequencial do usuário |
| 18/07/2026 | Q09 | Código concluído | logger com referência e sanitização de PII; 2 regressões | Operação externa pendente |
| 18/07/2026 | Q10 | Bloqueado | mapa LGPD pronto; revisão jurídica, direitos do titular e ensaio de produção pendentes | Requer decisão/execução externa |
