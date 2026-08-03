# KRIOU DOCS - Melhorias de UX e Acessibilidade

## Visão Geral
Melhorias no designer e experiência do cliente para usuários leigos em tecnologia, focando em acessibilidade, ajuda contextual e facilidade de preenchimento.

---

## Checklist de Implementação

### 1. Tela Inicial do Editor
- [x] Criar modal/tela de configuração inicial antes de editar
- [x] Campos obrigatórios:
  - [x] **ID** - Gerado automaticamente (UUID/sequencial)
  - [x] **Título** - Nome do documento (ex: "Currículo Dev Jr")
  - [x] **Tipo** - Selector (Currículo, Compra/Venda, Locação, etc)
  - [x] **Partes** - Lista dinâmica de participantes
    - [x] Nome da parte
    - [x] Papel (Vendedor, Comprador, Locador, etc)
    - [x] CPF/CNPJ
    - [x] RG
    - [x] Endereço
    - [x] Contato
- [x] Gerar ID único ao criar documento

### 2. Sistema de Abas no Dashboard
- [x] Criar navegação por abas
- [x] Abas principais:
  - [x] Currículos
  - [x] Compra/Venda
  - [x] Locação
  - [x] Procuração
  - [x] Outros (via "Todos")
- [x] Implementar filtros específicos por aba
- [x] Barra de pesquisa por aba

### 3. Campos com Ajuda e Exemplos
- [x] Criar componente `<FieldHint>` (melhorado do HelpTooltip)
  - [x] Botão "💡 Ver dica" para expandir
  - [x] Hint com explicação simples
  - [x] Exemplo prático do que escrever
  - [x] Onde encontrar a informação
  - [x] Botão "Não tenho" para campos opcionais
- [x] Criar componente `<QuickSuggestion>`
  - [x] Sugestões rápidas em chips
  - [x] Clique para adicionar ao campo
- [x] Criar componente `<ExperienceTypeSelector>`
  - [x] Para usuários que nunca trabalharam formalmente
- [x] Criar componentes visuais:
  - [x] `<FieldWithIcon>` - Ícones emoji antes dos labels
  - [x] `<VisualExample>` - Cards visuais com formato esperado
  - [x] `<QuickFillCard>` - Exemplos por nível (Iniciante/Intermediário/Avançado)
- [x] Integrar em todas as etapas do currículo:
  - [x] Etapa 1: Dados Pessoais
  - [x] Etapa 2: Objetivo
  - [x] Etapa 3: Experiência
  - [x] Etapa 4: Formação
  - [x] Etapa 5: Habilidades
  - [x] Etapa 6: Idiomas
  - [x] Etapa 7: Extras
- [x] Adicionar FIELD_HINTS em constants.js

### 4. Opção "Preencher Depois"
- [x] Para campos opcionais:
  - [x] Adicionar botão "Não tenho" / "Pular"
  - [x] Visual diferente (borda pontilhada suave)
  - [x] Marcar campo como "pendente"
- [x] Permite salvar rascunho com campos incompletos

### 5. Sistema de Auto-Salvamento
- [x] Manter auto-save existente (já tem)
- [x] Adicionar botão "Salvar Rascunho" destacado
- [x] Indicador visual mais claro:
  - [x] Animação "Salvando..."
  - [x] Check "Salvo" com timestamp
- [ ] Criar tela de listagem de rascunhos

### 6. Botões de Navegação Acessíveis
- [x] Aumentar tamanho dos botões
- [x] Destacar botão "Próximo" com:
  - [x] Cor diferenciada (coral)
  - [x] Ícone de seta grande
  - [x] Texto claro "Avançar →"
- [x] Botão "Anterior" mais visível (← Voltar)
- [x] Botão "Salvar Rascunho" separado e acessível
- [x] Botão "✓ Visualizar" com animação

### 7. Validação Amigável
- [x] Mensagens de erro com exemplo:
  - [x] "Preencha o nome completo. Ex: João da Silva"
  - [x] "Informe um e-mail válido. Ex: joao@email.com"
  - [x] "Informe um telefone com DDD. Ex: (11) 98765-4321"
- [x] Destacar campos com erro (borda coral + box-shadow)

---

## Estrutura de Dados do Documento

```javascript
{
  id: "0001",                    // ID único gerado
  titulo: "Contrato Compra/Venda", // Título definido pelo usuário
  tipo: "compra-venda",          // Tipo do documento
  partes: [
    {
      id: 1,
      papel: "Vendedor",
      nome: "João Silva",
      cpf: "123.456.789-00",
      rg: "12.345.678-9",
      endereco: "Rua X, 123",
      telefone: "(11) 99999-9999"
    },
    {
      id: 2,
      papel: "Comprador",
      nome: "Maria Santos",
      cpf: "987.654.321-00",
      rg: "98.765.432-1",
      endereco: "Av Y, 456",
      telefone: "(11) 88888-8888"
    }
  ],
  status: "rascunho",            // rascunho | preenchimento | completo
  createdAt: "2026-04-02",
  updatedAt: "2026-04-02"
}
```

---

## Estrutura Proposta da Lista de Documentos

```
┌─────────────────────────────────────────────────────────────┐
│  [Currículos] [Compra/Venda] [Locação] [Procuração] [+]  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Pesquisar por nome, ID...                             │
├─────────────────────────────────────────────────────────────┤
│  ID    │ Título              │ Partes          │ Data │ ✓ │
│  #0003 │ Currículo - João    │ João Silva      │ HOJE │ ● │
│  #0002 │ Currículo - Maria   │ Maria Santos    │ ONTM │ ○ │
│  #0001 │ Compra/Venda Imóvel │ Vend./Compr.    │ ONTM │ ● │
└─────────────────────────────────────────────────────────────┘
```

---

## Prioridades de Implementação

1. **Alta Prioridade**
   - Tela inicial com ID, Título e Partes
   - Campos com ajuda/tooltips
   - Botões de navegação acessíveis

2. **Média Prioridade**
   - Sistema de abas no dashboard
   - Opção "Preencher depois"
   - Auto-salvamento melhorado

3. **Baixa Prioridade**
   - Validação amigável
   - Filtros específicos por aba

---

## Notas Adicionais

- Usuários leigos precisam de exemplos claros
- Evitar campos muito técnicos sem explicação
- Destacar botões de ação principal
- Permitir salvamento parcial (rascunho)
- ID deve ser gerado automaticamente pelo sistema
