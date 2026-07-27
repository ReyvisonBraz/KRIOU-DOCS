# Backlog técnico priorizado

## P0 — Corrigir imediatamente

### P0.1 Zerar lint

Motivo: sem lint verde, não há barreira confiável de qualidade.

Itens:

- Ignorar `coverage/`.
- Configurar globais Node para `e2e`.
- Corrigir hooks condicionais em:
  - `src/components/UI/feedback.jsx`;
  - `src/components/UI/resume-helpers.jsx`.
- Remover imports/variáveis mortas.
- Separar exports que quebram Fast Refresh.

### P0.2 Confirmar deploy limpo

Itens:

- `npm run build`
- `npm test -- --run`
- `npm run lint`
- `npx vercel deploy --prod --yes`

## P1 — Arquitetura crítica

### P1.1 Quebrar `CheckoutPage`

Motivo: é o ponto mais sensível financeiramente e está grande demais.

Resultado esperado:

- página apenas orquestra;
- regra comercial em domínio;
- telas em componentes.

### P1.2 Backend validar regra de edição paga

Motivo: frontend não deve ser a única barreira comercial.

Resultado esperado:

- uma Edge Function ou RPC valida tentativa de edição;
- frontend chama essa validação;
- banco persiste decisão.

### P1.3 Testar regra de plano avulso

Casos:

- edição normal;
- primeira sensível;
- segunda sensível;
- troca de tipo.

## P2 — Manutenção e escala

### P2.1 Reduzir contexts

Motivo: contexts grandes geram acoplamento.

### P2.2 Organizar documentos jurídicos

Motivo: crescimento de documentos pode virar massa difícil de manter.

### P2.3 Melhorar logs e observabilidade

Motivo: pagamentos precisam de auditoria.

Itens:

- log estruturado nas Edge Functions;
- tabela de auditoria para decisões de edição sensível;
- status visível no admin.

## P3 — Produto/UX

### P3.1 Tela clara de plano avulso

Texto recomendado:

```txt
Pagamento único: libera este documento para edição e download.
Alterações em dados principais têm 1 correção gratuita.
Novo documento ou nova pessoa exige novo pagamento.
```

### P3.2 Histórico de pagamentos no perfil

Mostrar:

- documento;
- data;
- valor;
- status;
- método;
- recibo/ID.

### P3.3 Reabrir pagamento pendente

Melhorar experiência:

- status “Pagamento em andamento” no perfil;
- botão de retomar checkout;
- expiração de preferência.
