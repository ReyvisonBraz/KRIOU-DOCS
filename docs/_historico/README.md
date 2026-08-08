# Histórico — não é plano ativo

⛔ **Nada nesta pasta deve ser usado para decidir o que fazer.**

O plano ativo é o [ROADMAP.md](../../ROADMAP.md) na raiz.
O estado atual verificado é o [STATUS.md](../../STATUS.md).

---

## Por que isto foi arquivado

Em 2026-08-08 o repositório tinha **48 documentos de planejamento em 3 gerações
sobrepostas**, que se contradiziam. Alguns exemplos reais:

- `programa-evolucao-qualidade/README.md` marcava as etapas 02 a 10 como "Planejada",
  enquanto o `PLANO-MESTRE` do mesmo diretório as dava por concluídas.
- `STATUS.md` se contradizia **dentro do próprio arquivo**: o topo dizia que a Q02 não
  deveria iniciar, o corpo listava Q01–Q09 como concluídas.
- `plano-evolucao/08-CHECKLIST-EXECUCAO.md` tinha ~180 checkboxes e **nenhum marcado**,
  incluindo itens comprovadamente prontos e testados. Foi abandonado, não reprovado.
- `README.md` prometia entrega por WhatsApp, que nunca existiu.
- `PROJECT_STRUCTURE.md` descrevia TypeScript, Zustand, React Router e Puppeteer —
  nenhum deles no `package.json`.

Manter esses arquivos como plano ativo levava a dois erros caros: **refazer trabalho que já
estava pronto**, ou **declarar pronto o que não estava**.

**Todo item ainda pendente foi extraído para o [ROADMAP.md](../../ROADMAP.md) antes do
arquivamento.** Nada foi perdido — só deixou de competir como fonte de verdade.

---

## O que tem aqui

| Pasta | O que é | Período |
|---|---|---|
| `programa-evolucao-qualidade/` | Programa Q01–Q11. A geração mais recente e mais precisa. É a melhor leitura para entender **como** o sistema chegou ao estado atual | jul/2026 |
| `plano-evolucao/` | Plano de 6 fases em 7 semanas. Explicitamente aposentado pelo programa acima | abr/2026 |
| `legado/` | Documentos avulsos anteriores, incluindo a análise original e o histórico do projeto | abr/2026 |

### Vale a pena ler

Apesar do aviso, três documentos aqui têm valor real de referência:

- `programa-evolucao-qualidade/PLANO-MESTRE-QUALIDADE-2026-07-18.md` — a descrição mais
  completa do que foi feito em cada frente, com critérios de aceite
- `programa-evolucao-qualidade/10-lgpd-producao/MAPA-LGPD-E-PRONTIDAO-2026-07-18.md` —
  o inventário de dados pessoais, que fundamenta a frente F2 do roadmap
- `legado/HISTORICO-PROJETO-KRIOU-DOCS.md` — a origem dos modelos jurídicos

---

## Regra

Se algo aqui divergir do `ROADMAP.md` ou do `STATUS.md`, **os arquivos da raiz vencem**.
Se você encontrar aqui um pendente que não está no roadmap, mova para lá — não reviva o
documento antigo.
