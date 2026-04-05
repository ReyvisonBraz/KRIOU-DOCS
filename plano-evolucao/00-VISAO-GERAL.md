# Plano de Evolução — Kriou Docs
> Versão 1.0 | Criado em: 2026-04-05

---

## O que é este plano

Este plano cobre a transformação do Kriou Docs de **protótipo funcional** em uma **aplicação de produção segura, performática e maintível**. Foi construído com base em análise estática completa do código-fonte atual (11.041 linhas em `/src`, mais 2.626 linhas de código morto na raiz).

---

## Estado Atual — Diagnóstico Rápido

| Dimensão           | Nota | Situação                                          |
|--------------------|------|---------------------------------------------------|
| Segurança          | 2/10 | PII em localStorage sem criptografia, CPF inválido aceito |
| Arquitetura        | 3/10 | Contexto monolítico, componentes gigantes, zero separação de concerns |
| Performance        | 3/10 | Sem code splitting, renders desnecessários, PDF no thread principal |
| Qualidade de Código| 3/10 | ~800 linhas duplicadas, 2.626 linhas de código morto |
| Testes             | 0/10 | Nenhum arquivo de teste encontrado                |
| Acessibilidade     | 2/10 | Sem ARIA, sem navegação por teclado em modais      |
| Tipagem            | 0/10 | Sem TypeScript, sem PropTypes                     |
| Tratamento de Erros| 2/10 | `console.error()` sem feedback ao usuário         |

---

## Estrutura do Plano

```
plano-evolucao/
├── 00-VISAO-GERAL.md          ← Este arquivo
├── 01-SEGURANCA.md            ← Vulnerabilidades críticas e correções
├── 02-ARQUITETURA.md          ← Reestruturação de componentes e contextos
├── 03-PERFORMANCE.md          ← Otimizações de bundle e renderização
├── 04-QUALIDADE.md            ← Limpeza de código, duplicações, padrões
├── 05-UX-FUNCIONALIDADES.md   ← Melhorias de experiência e novos recursos
├── 06-TESTES.md               ← Estratégia de testes
├── 07-CRONOGRAMA.md           ← Roadmap semanal detalhado
└── 08-CHECKLIST-EXECUCAO.md   ← Checklist de implementação
```

---

## Resumo do Impacto por Fase

| Fase | Tema              | Semanas | Impacto Principal                           |
|------|-------------------|---------|---------------------------------------------|
| 1    | Segurança         | 1       | Elimina riscos críticos antes de qualquer publicação |
| 2    | Limpeza           | 1       | Remove 2.626 linhas mortas, extrai duplicações |
| 3    | Arquitetura       | 2       | Torna o projeto mantível e escalável        |
| 4    | Performance       | 1       | Reduz bundle, melhora TTI e responsividade   |
| 5    | Qualidade & UX    | 1       | Garante experiência profissional ao usuário |
| 6    | Testes            | 1       | Cobertura mínima de segurança e regressão   |

**Total estimado: 7 semanas para produção robusta**

---

## Princípios Guia

1. **Segurança primeiro** — nenhum dado sensível pode estar exposto antes de ir a produção
2. **Iterativo** — cada fase entrega valor independente, sem quebrar o que funciona
3. **Sem over-engineering** — simplificar antes de adicionar abstrações
4. **Usuário no centro** — performance e UX são métricas reais, não estéticas
