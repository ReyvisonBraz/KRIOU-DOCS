# Diagnóstico crítico

## O que está bom

O projeto já passou da fase de protótipo. Ele tem:

- autenticação com Supabase;
- fluxo de criação de currículo e documentos jurídicos;
- geração de PDF;
- integração Mercado Pago;
- webhook com validação de assinatura;
- controle de pagamento por documento;
- dashboard;
- testes unitários relevantes;
- deploy Vercel funcional.

Isso é uma base real de produto.

## Problemas principais

### 1. Lint completo falha

Resultado atual:

- 30 erros;
- 4 avisos.

Categorias:

- hooks condicionais;
- Fast Refresh por misturar exports de componentes com helpers/contextos;
- variáveis não usadas;
- `coverage` sendo analisado pelo ESLint;
- `process` não configurado em e2e;
- effects com dependências incompletas;
- `setState` síncrono em effect.

Impacto:

- baixa confiança em refatorações;
- risco de bugs em renderização;
- dificulta CI;
- dificulta colaboração futura.

### 2. Regras de negócio ainda próximas demais da UI

Exemplo: `CheckoutPage` concentra decisões de:

- salvar documento;
- criar preferência;
- abrir Mercado Pago;
- aguardar pagamento;
- validar edição de documento pago;
- aplicar correção gratuita;
- liberar PDF.

Impacto:

- página grande demais;
- difícil testar fluxo inteiro;
- alto risco de regressão.

### 3. Contextos grandes

`AppContext`, `ResumeContext`, `LegalContext` e `AuthContext` acumulam muitas responsabilidades.

Impacto:

- acoplamento;
- renderizações desnecessárias;
- dificuldade de entender origem dos dados;
- refatoração mais arriscada.

### 4. Backend ainda não garante todas as regras comerciais

O backend já valida pagamento, mas a política de edição sensível ainda está fortemente no frontend.

Impacto:

- usuário avançado poderia tentar manipular chamadas;
- domínio crítico fica dividido;
- difícil auditar.

### 5. Testes cobrem utilitários, mas faltam fluxos críticos

Hoje há bons testes de:

- validação;
- sanitização;
- pagamento service;
- assinatura webhook;
- identidade paga.

Faltam testes de:

- edição de documento pago;
- primeira correção sensível;
- segunda correção sensível bloqueada;
- webhook atualizando snapshot;
- checkout completo.

### 6. Estrutura de componentes já teve problema de case

O problema `UI` vs `ui` foi corrigido, mas revela falta de convenção automatizada.

Impacto:

- builds Linux quebram;
- Windows mascara erros;
- deploy fica menos previsível.

## Risco atual

| Risco | Nível | Observação |
|---|---:|---|
| Deploy quebrar por lint | Médio | Build passa, lint falha. |
| Regressão no checkout | Médio/alto | Checkout tem responsabilidade demais. |
| Bug em edição paga | Médio | Regra nova precisa de mais teste de fluxo. |
| Abuso comercial | Médio | Backend deve reforçar regra. |
| Crescimento do código jurídico | Médio | Dados legais podem virar gargalo. |

## Conclusão

O projeto está funcional, mas precisa de saneamento técnico antes de adicionar muitas features novas. A prioridade não deve ser visual ou feature; deve ser confiabilidade, separação de domínio e testes de fluxo.
