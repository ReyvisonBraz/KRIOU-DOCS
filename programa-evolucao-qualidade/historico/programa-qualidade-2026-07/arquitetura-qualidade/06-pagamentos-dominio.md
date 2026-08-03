# Plano de pagamentos e domínio comercial

## Regra comercial atual

Plano avulso:

```txt
1 pagamento libera 1 documento.
Edições normais são ilimitadas.
Dados principais têm 1 correção gratuita.
Novo documento ou nova pessoa exige novo pagamento.
```

## O que já existe

- `external_reference = userId::documentId`
- webhook Mercado Pago;
- verificação manual por payment ID;
- snapshot de identidade paga;
- controle `sensitive_edit_used`;
- comparação de dados principais;
- dashboard exibe `Pago`.

## Melhorias necessárias

### 1. Mover regra para domínio

Atual:

- parte da regra está no checkout.

Alvo:

```txt
src/domain/paidDocuments/
  identity.js
  policy.js
  messages.js
```

### 2. Backend validar edição paga

Hoje o frontend aplica a barreira principal. O backend deve confirmar.

Opções:

#### Opção A — Edge Function

```txt
validate-paid-document-edit
```

Recebe:

- `documentId`;
- novos dados;
- confirmação de uso da correção gratuita.

Retorna:

- `allowed`;
- `requiresConfirmation`;
- `requiresNewPayment`;
- `message`.

#### Opção B — RPC Postgres

Mais rígido, mas mais trabalhoso para comparar JSON complexo.

Recomendação: Edge Function.

### 3. Auditar decisões

Criar tabela:

```sql
paid_document_edit_events
```

Campos:

- document_id;
- user_id;
- decision;
- score;
- changed_fields;
- created_at.

### 4. Expiração de checkout pendente

Evitar reabrir preferência antiga.

Adicionar:

- created_at no pending payment;
- expiração visual;
- criar nova preferência se antigo passou de X horas.

## Testes necessários

- comparação ignora endereço;
- comparação detecta CPF;
- primeira correção permite;
- segunda correção bloqueia;
- tipo jurídico diferente bloqueia;
- backend rejeita manipulação indevida.

## Mensagens oficiais

### Primeira correção

```txt
Atenção: você está alterando dados principais deste documento.

Você pode fazer uma correção gratuita agora caso seja apenas ajuste de dados digitados incorretamente. Após confirmar, novas alterações em dados principais poderão exigir a criação de um novo documento.
```

### Correção já usada

```txt
Este documento já utilizou a correção gratuita de dados principais.

Para alterar Nome, CPF, RG, CNPJ ou partes principais novamente, crie um novo documento.
Você ainda pode editar livremente endereço, datas, valores, cláusulas e textos gerais.
```

### Novo documento detectado

```txt
As alterações indicam um novo documento.

O plano avulso libera edições do mesmo documento pago, mas não cobre troca de pessoa, CPF/CNPJ ou tipo de documento.
```
