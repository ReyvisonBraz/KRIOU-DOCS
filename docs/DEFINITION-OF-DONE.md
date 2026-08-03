# Definition of Done

Uma mudança só está pronta quando os itens aplicáveis abaixo possuem evidência.

## Escopo e comportamento

- [ ] objetivo e comportamento esperado estão claros;
- [ ] alteração está limitada ao escopo, sem mudanças acidentais;
- [ ] compatibilidade ou migração foi considerada;
- [ ] bug corrigido possui teste de regressão quando viável.

## Qualidade

- [ ] `npm ci` funciona em instalação limpa;
- [ ] `npm run lint` passa;
- [ ] `npm run typecheck` passa;
- [ ] `npm run test:ci` passa;
- [ ] `npm run build` passa;
- [ ] E2E/teste manual do fluxo afetado foi executado e registrado.

## Segurança e dados

- [ ] diff não contém segredo, token, PII ou arquivo local;
- [ ] autorização é validada no backend, não apenas na UI;
- [ ] logs e erros não expõem CPF, documento, token ou payload bruto;
- [ ] dependências novas foram justificadas e auditadas;
- [ ] migration possui teste negativo e estratégia de rollback quando aplicável.

## Operação e manutenção

- [ ] erro novo possui mensagem útil e contexto sanitizado para diagnóstico;
- [ ] documentação, `.env.example`, ADR e planos foram atualizados quando necessário;
- [ ] impacto de performance/bundle foi verificado quando relevante;
- [ ] arquivos gerados e configuração pessoal não foram versionados;
- [ ] identidade do autor está correta e o commit tem escopo coerente;
- [ ] `git status` está limpo após o commit.
