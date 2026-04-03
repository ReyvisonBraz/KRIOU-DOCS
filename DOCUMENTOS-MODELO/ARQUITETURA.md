# ARQUITETURA DE COLETA DE MODELOS JURÍDICOS

## Visão Geral

Este documento descreve a metodologia utilizada para coletar, organizar e criar modelos de documentos jurídicos brasileiros. Foi desenvolvido para permitir continuidade, melhorias e expansões futuras.

---

## 1. COMO TUDO COMEÇOU

### 1.1 Objetivo Inicial
Criar um sistema de coleta de modelos de documentos legais/jurídicos de sites especializados, com:
- Análise de cada site (HTML, campos, bloqueios)
- Preenchimento automático com dados fictícios
- Estrutura de pastas organizada por tipo de documento
- Documentação de variantes conforme casos específicos

### 1.2 Requisitos do Usuário
- Documentos comuns muito usados para autenticação em cartório
- Contratos básicos e comuns: compra e venda, aluguel, união estável, dissolução, recibos, procuração, declaração de doação, autorização de viagem de menor
- Dados fictícios para preenchimento quando necessário
- Formato .md para fácil uso no projeto

---

## 2. FONTES UTILIZADAS

### 2.1 Sites Privados Especializados

| Site | URL | Documentos Coletados |
|------|-----|----------------------|
| 99 Contratos | 99contratos.com.br | União Estável, Dissolução, Permuta |
| Normas Legais | normaslegais.com.br | Compra/Venda com Sinal, Comodato |
| ADVBOX | advbox.com.br | (identificado como fonte) |
| Jurídico AI | juridico.ai | (identificado como fonte) |
| EasyJur | easyjur.com.br | (identificado como fonte) |
| ReciboGratuito | recibogratuito.com.br | Recibos |
| PROCON-SP | procon.sp.gov.br | Procuração Particular |

### 2.2 Sites Governamentais

| Site | URL | Documentos Coletados |
|------|-----|----------------------|
| CNJ | cnj.jus.br | Autorização de Viagem Internacional |
| TJAM | tjam.jus.br | Autorização de Viagem Nacional |
| Receita Federal | gov.br/receitafederal | Procurações |

### 2.3 Como Identificar Novas Fontes
1. Pesquisar no Google: "modelo contrato [tipo] site:.br"
2. Sites como 99contratos, ADVBOX, Normas Legais são referências
3. Verificar se têm formulários interativos (gera modelos personalizados)
4. Governamentais (CNJ, TJ, Receita) são fontes oficiais confiáveis

---

## 3. FERRAMENTAS E MÉTODOS

### 3.1 Ferramentas Utilizadas

| Ferramenta | Função |
|------------|--------|
| WebFetch | Acessar e extrair conteúdo dos sites |
| Glob | Listar arquivos e estrutura de pastas |
| Read | Ler documentos existentes |
| Write | Criar novos arquivos .md |
| Edit | Modificar documentos existentes |

### 3.2 Método de Coleta

#### Passo 1: Acessar Site
```bash
webfetch --format markdown --url "https://www.exemplo.com.br/modelo"
```

#### Passo 2: Extrair Modelo
- Copiar o texto completo do modelo
- Identificar campos obrigatórios (marcados com ________)
- Notar cláusulas específicas

#### Passo 3: Criar Arquivo
- Usar estrutura padronizada (descrita abaixo)
- Preencher com dados fictícios quando aplicável
- Adicionar observações sobre variações

### 3.3 Tratamento de Bloqueios

| Tipo de Bloqueio | Como Resolver |
|-------------------|---------------|
| Paywall | Pular e marcar para pesquisa externa |
| Formulário necessário | Preencher com dados fictícios |
| HTML parcial | Usar "Inspecionar elemento" no navegador |
| PDF | Converter para texto (se possível) |

### 3.4 Dados Fictícios Padrão

| Campo | Valor |
|-------|-------|
| Nome | João da Silva |
| CPF | 123.456.789-00 |
| RG | 12.345.678-9 |
| Estado Civil | Solteiro(a) |
| Nacionalidade | Brasileiro(a) |
| Profissão | Empresário |
| Endereço | Rua das Flores, 123 |
| Cidade | São Paulo |
| Estado | SP |
| CEP | 01234-567 |

---

## 4. ESTRUTURA DE PASTAS

### 4.1 Arquitetura Criada

```
DOCUMENTOS-MODELO/
├── AUTORIZACAO-VIAGEM/
│   ├── AUTORIZACAO-VIAGEM-NACIONAL.md
│   └── AUTORIZACAO-VIAGEM-INTERNACIONAL.md
├── COMODATO/
│   ├── CONTRATO-COMODATO-IMOVEL.md
│   └── VARIANTES/
│       └── COMODATO-RURAL-PARCERIA.md
├── COMPRA-E-VENDA/
│   ├── CONTRATO-COMPRA-VENDA-IMOVEL-COM-SINAL.md
│   └── VARIANTES/
│       ├── COMPRA-VENDA-VEICULO.md
│       └── COMPRA-VENDA-TERRENO.md
├── DOACAO/
│   ├── DOACAO-IMOVEL.md
│   └── VARIANTES/
│       ├── DOACAO-COM-USUFRUTO.md
│       └── DOACAO-COM-REVERSAO.md
├── LOCACAO/
│   ├── LOCACAO-RESIDENCIAL.md
│   └── VARIANTES/
│       └── LOCACAO-COMERCIAL.md
├── OUTROS-MODELOS/
│   ├── DECLARACAO-UNIAO-ESTAVEL-SOLTEIRO.md
│   ├── DECLARACAO-RESIDENCIA.md
│   ├── DECLARACAO-POBREZA.md
│   ├── DECLARACAO-VINCULO-EMPREGATICIO.md
│   ├── PACTO-ANTENUPCIAL.md
│   ├── TERMO-QUITACAO-DIVIDA.md
│   ├── DECLARACAO-AUSENCIA-DIVIDAS.md
│   ├── DECLARACAO-GUARDA-COMPARTILHADA.md
│   └── DECLARACAO-RECEBIMENTO-PENSAO.md
├── PERMUTA/
│   └── CONTRATO-PERMUTA.md
├── PROCURACAO/
│   ├── PROCURACAO-PARTICULAR.md
│   └── VARIANTES/
│       └── PROCURACAO-AD-JUDICIA.md
├── RECIBO/
│   ├── RECIBO-PAGAMENTO.md
│   └── VARIANTES/
│       └── RECIBO-ALUGUEL.md
└── UNIAO-ESTAVEL/
    ├── CONTRATO-UNIAO-ESTAVEL.md
    ├── DISSOLUCAO-UNIAO-ESTAVEL.md
    └── VARIANTES/
        ├── UNIAO-ESTAVEL-COM-PENSAO.md
        ├── DISSOLUCAO-COM-PARTILHA.md
        └── DISSOLUCAO-COM-PENSAO.md
```

### 4.2 Regra de Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Modelo Principal | NOME-DO-DOCUMENTO.md | CONTRATO-COMPRA-VENDA-IMOVEL.md |
| Variante | NOME-DOCUMENTO-VARIANTE.md | COMPRA-VENDA-VEICULO.md |
| Pasta | NOME_EM_MAIUSCULO | COMPRA-E-VENDA |

### 4.3 Quando Criar Pasta de VarianTES

- Quando o documento tem variações significativas de caso para caso
- Exemplo: Compra/Venda → Veículo (diff suficiente), Terreno (diff suficiente)
- Evitar criar variante apenas para mudanças menores de campos

---

## 5. ESTRUTURA DE CADA DOCUMENTO

### 5.1 Template Padrão

```markdown
# NOME DO DOCUMENTO

## Descrição
Breve descrição do documento e sua aplicação.

## Legislação Aplicável
- Lei ou artigo específico

---

[CONTEÚDO DO DOCUMENTO
em formato editável com _____ para campos]

---

## Observações

- **Campos obrigatórios:** Lista de campos que devem ser preenchidos
- **Campos opcionais:** Lista de campos opcionais
- **Variantes identificadas:** Possíveis variações do documento
- **Legislação especial:** Observações legais importantes
- **Fonte:** Site de origem
- **Data de coleta:** Mês/Ano
```

### 5.2 Campos Obrigatórios em Cada Tipo

| Tipo de Documento | Campos Obrigatórios |
|-------------------|---------------------|
| Contratos | Nome das partes, CPF, RG, endereço, objeto, preço, prazo |
| Declarações | Nome, CPF, RG, declaração específica, data, assinatura |
| Procuração | Outorgante, outorgado, poderes, data, assinatura |
| Recibos | Recebedor, pagador, valor, descrição, data, assinatura |

---

## 6. COMO ADICIONAR NOVOS DOCUMENTOS

### 6.1 Passo a Passo

1. **Identificar a Necessidade**
   - Qual documento você precisa adicionar?
   - É um documento novo ou variante?

2. **Pesquisar Fontes**
   - Acessar sites especializados
   - Buscar modelos gratuitos
   - Verificar fontes governamentais

3. **Criar o Arquivo**
   - Escolher a pasta correta
   - Usar o template padrão
   - Preencher com modelo completo

4. **Testar e Revisar**
   - Verificar se campos estão corretos
   - Confirmar que variantes estão bem diferenciadas
   - Atualizar este documento de arquitetura

### 6.2 Checklist de Qualidade

- [ ] Nome do arquivo segue padrão
- [ ] Descrição clara e objetiva
- [ ] Legislação aplicável citada
- [ ] Modelo completo com campos editáveis
- [ ] Observações com campos obrigatórios
- [ ] Fonte citada
- [ ] Data de coleta atualizada

---

## 7. LEGISLAÇÃO DE REFERÊNCIA

### 7.1 Códigos e Leis Principais

| Código/Lei | Assunto |
|------------|---------|
| Código Civil (Lei 10.406/2002) | Contratos em geral |
| Lei 8.245/91 | Locação (Lei do Inquilinato) |
| Lei 9.278/96 | União Estável |
| ECA (Lei 8.069/90) | Menores e viagens |
| Lei 6.766/79 | Parcelamento do solo |
| Resolução CNJ 131/2011 | Autorização de viagem |

### 7.2 Artigos Importantes

| Artigo | Assunto |
|--------|---------|
| Arts. 481-532 CC | Compra e Venda |
| Arts. 533-538 CC | Permuta |
| Arts. 538-564 CC | Doação |
| Arts. 579-585 CC | Comodato |
| Arts. 1.723-1.727 CC | União Estável |
| Arts. 1.694-1.710 CC | Alimentos |
| Arts. 105-119 CC | Procuração |

---

## 8. FONTES ADICIONAIS POSSÍVEIS

### 8.1 Sites para Consultar Futuramente

- **Jurisway** (jurisway.com.br)
- **Portal Direito Brasil** (direitobrasil.com.br)
- **Dúvidas Solucionadas** (duvidas.srv.br)
- **TJs** (diversos estados)
- **Cartórios** (modelos específicos)

### 8.2 Quando Usar Cada Fonte

| Situação | Fonte Recomendada |
|----------|-------------------|
| Contrato padrão | 99contratos, Normas Legais |
| Documento gov. | CNJ, Receita Federal, TJ |
| Declaração simples | PROCON, recibogratuito |
| Documento específico | Cartórios (quando necessário) |

---

## 9. REGISTRO DE COLETA

### 9.1 Documentos Criados (32 total)

| # | Data | Documento | Fonte |
|---|------|-----------|-------|
| 1 | Abr/2026 | Contrato Compra/Venda Imóvel c/ Sinal | Normas Legais |
| 2 | Abr/2026 | Contrato União Estável | 99 Contratos |
| 3 | Abr/2026 | Dissolução União Estável | 99 Contratos |
| 4 | Abr/2026 | Recibo Pagamento | ReciboGratuito |
| 5 | Abr/2026 | Contrato Comodato Imóvel | Normas Legais |
| 6 | Abr/2026 | Procuração Particular | PROCON-SP |
| 7 | Abr/2026 | Contrato Permuta | 99 Contratos |
| 8 | Abr/2026 | Autorização Viagem Nacional | TJAM |
| 9 | Abr/2026 | Autorização Viagem Internacional | CNJ |
| ... | ... | ... | ... |

### 9.2 Problemas Encontrados

| Problema | Solução |
|----------|---------|
| Site 99contratos redireciona para formulário | Usar texto da página como base |
| CNJ retorna PDF | Extrair texto do formulário |
| Alguns sites com paywall | Pular e marcar para pesquisa externa |

---

## 10. METADADOS

- **Data de Criação:** Abril 2026
- **Última Atualização:** Abril 2026
- **Total de Documentos:** 32
- **Total de Pastas:** 10
- **Autor:** Modelo coletado via WebFetch

---

## 11. COMO CONTRIBUIR

Se precisar adicionar novos documentos:

1. Siga a estrutura de pastas definida
2. Use o template padrão para cada documento
3. Inclua sempre a legislação aplicável
4. Documente as variantes identificadas
5. Atualize este documento de arquitetura

---

*Este documento serve como guia para continuidade e expansão da base de modelos jurídicos.*
