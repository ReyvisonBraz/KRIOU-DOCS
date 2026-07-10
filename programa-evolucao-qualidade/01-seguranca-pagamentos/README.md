# Etapa 01 — Segurança, pagamentos e autorização

## Objetivo

Eliminar caminhos em que o navegador consegue conceder acesso, escolher preço, agir por outro usuário ou consumir integrações sem autorização.

## Ordem interna

### E01-T01 — Confirmação server-side

- ignorar `status` da URL;
- consultar o Mercado Pago pelo backend;
- validar pagamento aprovado, valor, moeda e referência externa;
- atualizar documento de modo idempotente;
- impedir duplicação do documento no retorno do checkout.

### E01-T02 — Preferência confiável

- extrair identidade do JWT;
- buscar documento pelo backend;
- usar preço definido no servidor;
- rejeitar documento de outro usuário ou inexistente;
- aceitar somente métodos HTTP esperados.

### E01-T03 — Falha segura

- remover liberação gratuita em produção;
- permitir mock somente com flag explícita e apenas em desenvolvimento;
- exibir erro recuperável e manter o conteúdo bloqueado.

### E01-T04 — E-mail

- autenticar requisição;
- permitir destinatário do usuário/pedido;
- usar template server-side;
- limitar tipo e tamanho de anexo;
- aplicar rate limit e auditoria.

### E01-T05 — Pagamentos robustos

- tabela de pagamentos e eventos;
- webhook com assinatura e idempotência;
- unique constraint para IDs do provedor;
- reconciliação de pagamentos pendentes;
- estados explícitos e transições válidas.

### E01-T06 — Segurança transversal

- atualizar dependências vulneráveis;
- CSP e cabeçalhos de segurança;
- remover logs de PII;
- testar RLS e rotas administrativas;
- revisar CORS, JWT, secrets e rate limiting server-side.

## Critérios de aceite

- URL manipulada não libera documento;
- preço do navegador é ignorado;
- pagamento de outro usuário não pode ser associado;
- repetição do callback não duplica nem corrompe dados;
- falha do Mercado Pago nunca vira sucesso;
- testes cobrem aprovado, pendente, recusado, valor incorreto e referência incorreta.

## Implementação iniciada em 10/07/2026

Entregue no código:

- `PaymentService` como fronteira única do frontend;
- documento entra em `aguardando_pagamento` antes do redirecionamento;
- retorno não salva um segundo documento;
- query string apenas dispara verificação, sem conceder acesso;
- Edge Functions autenticam o JWT e derivam o usuário da sessão;
- preço fixado no servidor em BRL 9,90;
- valor, moeda e `external_reference` validados contra o provedor;
- confirmação aprovada atualiza pagamento e documento no backend;
- mock permitido somente em `DEV` com flag explícita;
- migration adiciona unicidade de `payment_id` e valor não negativo.

Pendente para concluir a etapa:

- executar `deno check` em ambiente com Deno;
- aplicar migration 007 em homologação;
- configurar `APP_URL`, `MP_ACCESS_TOKEN` e opcionalmente `MP_WEBHOOK_URL`;
- testar ponta a ponta com conta de teste Mercado Pago;
- implementar webhook assinado e idempotente para confirmação assíncrona.

### E01-T04 implementada em 10/07/2026

- frontend envia somente `documentId`;
- JWT, usuário e propriedade são validados na Edge Function;
- destinatário vem exclusivamente do usuário autenticado;
- assunto e HTML são gerados no servidor;
- conteúdo dinâmico recebe escape de HTML e título recebe normalização;
- anexos arbitrários foram removidos do contrato;
- somente documento finalizado e com pagamento aprovado gera confirmação;
- `Idempotency-Key` do Resend combina documento e pagamento;
- envio já registrado retorna sucesso sem consumir novo envio;
- migration 008 registra data e ID do e-mail transacional.

Para homologar: aplicar a migration 008 e configurar `RESEND_API_KEY` e `RESEND_FROM_EMAIL` como secrets da Edge Function.

### E01-T05 implementada localmente em 10/07/2026

- aplicação Mercado Pago exclusiva `Kriou Docs` criada para Checkout Pro;
- número da aplicação: `1625780794377672`;
- endpoint `mercadopago-webhook` criado sem autenticação JWT, pois a origem é externa;
- origem autenticada por `x-signature` com HMAC-SHA256 e comparação em tempo constante;
- manifesto oficial: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`;
- tolerância temporal de 15 minutos contra replay;
- evento `payment` consultado novamente na API antes de alterar o banco;
- valor, moeda, documento e usuário são novamente validados;
- migration 009 cria trilha privada e idempotente de eventos;
- eventos já processados retornam sucesso sem repetir efeitos;
- eventos anteriormente falhos podem ser reprocessados em nova tentativa;
- testes cobrem assinatura válida, adulterada e expirada.

Pendente de homologação externa:

- aplicar migrations 007, 008 e 009;
- publicar todas as Edge Functions alteradas;
- gravar `MP_ACCESS_TOKEN`, `APP_URL` e `MP_WEBHOOK_SECRET` nos secrets;
- cadastrar a URL do webhook de teste na aplicação;
- selecionar apenas o evento `Pagamentos`;
- executar a simulação oficial e um pagamento de teste.
