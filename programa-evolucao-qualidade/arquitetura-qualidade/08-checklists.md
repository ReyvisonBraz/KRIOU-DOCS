# Checklists

## Checklist diário de saúde

```powershell
git status --short --branch
npm run lint
npm test -- --run
npm run build
```

## Checklist antes de deploy frontend

- [ ] Git limpo ou mudanças entendidas.
- [ ] `npm run lint` passou.
- [ ] `npm test -- --run` passou.
- [ ] `npm run build` passou.
- [ ] Não há arquivos `dist` alterados para commit sem necessidade.
- [ ] Deploy Vercel feito.
- [ ] Domínio principal respondeu 200.

## Checklist antes de deploy Supabase

- [ ] Migration revisada.
- [ ] Migration aplicada:

```powershell
npx supabase db push
```

- [ ] Edge Functions publicadas quando necessário:

```powershell
npx supabase functions deploy create-preference
npx supabase functions deploy verify-payment
npx supabase functions deploy mercadopago-webhook
```

- [ ] Secrets conferidos no painel Supabase.

## Checklist Mercado Pago

- [ ] `MP_ACCESS_TOKEN` produção configurado.
- [ ] `MP_WEBHOOK_SECRET` configurado.
- [ ] Webhook aponta para a Edge Function correta.
- [ ] Pix testado com comprador diferente do vendedor.
- [ ] Cartão testado.
- [ ] Boleto não aparece.
- [ ] Pagamento aprovado libera documento.
- [ ] Pagamento pendente não libera PDF.

## Checklist documento pago

- [ ] Documento pago mostra selo `Pago`.
- [ ] Editar endereço não cobra.
- [ ] Editar cláusula/texto não cobra.
- [ ] Editar nome/CPF mostra aviso.
- [ ] Confirmar primeira correção funciona.
- [ ] Segunda edição de nome/CPF bloqueia.
- [ ] Troca de tipo jurídico bloqueia.

## Checklist Git

```powershell
git status --short --branch
git add .
git commit -m "mensagem"
git push origin main
```

Nunca commitar:

- `.env`;
- tokens;
- secrets;
- builds gerados sem necessidade;
- arquivos temporários.
