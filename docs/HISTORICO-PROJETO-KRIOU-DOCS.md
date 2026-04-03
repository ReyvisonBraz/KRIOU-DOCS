# HISTÓRICO DO PROJETO KRIOU-DOCS - COLETA DE MODELOS JURÍDICOS

## Visão Geral do Projeto

Este documento registra a história, metodologia e decisões do projeto de coleta de modelos de documentos jurídicos brasileiros. O objetivo é criar uma base de documentos para uso em automação e processamento de IA.

**Data de Início:** Abril 2026  
**Status:** Coleta inicial concluída  
**Total de Documentos:** 32 modelos + 5 arquivos de sistema

---

## 1. COMO COMEÇOU

### 1.1 Requisitos Iniciais do Usuário

O usuário solicitou um sistema para:

1. **Analisar sites de modelos jurídicos** - HTML, campos bloqueados, formulários
2. **Preencher automaticamente** - Usar dados fictícios quando necessário
3. **Criar estrutura de pastas** - Por tipo de documento
4. **Documentar variantes** - Casos específicos (com filhos, sem bens, com partilha, etc.)
5. **Manter executável** - Um scraper que possa rodar independente da IA

### 1.2 Tipos de Documentos Solicitados

Os documentos prioritários solicitados foram:

- Contrato de Compra e Venda (imóvel, veículo, terreno)
- Contrato de Locação (residencial, comercial)
- Contrato de União Estável
- Declaração de Dissolução de União Estável
- Recibos (simples, aluguel, quitação)
- Procuração Particular
- Declaração de Doação
- Autorização de Viagem de Menor (nacional, internacional)
- Termo de Parceria / Comodato Rural

### 1.3 Documentos Adicionais Sugeridos

Durante o processo, foram adicionados documentos muito usados em cartórios:

- Declaração de União Estável (sem contrato)
- Declaração de Residência
- Declaração de Pobreza
- Declaração de Vínculo Empregatício
- Pacto Antenupcial
- Termo de Quitação de Dívida
- Declaração de Ausência de Dívidas
- Declaração de Guarda Compartilhada
- Declaração de Recebimento de Pensão

---

## 2. FONTES UTILIZADAS

### 2.1 Sites Privados Acessados

| Site | URL | Documentos Coletados |
|------|-----|----------------------|
| 99 Contratos | 99contratos.com.br | União Estável, Dissolução, Permuta, Comodato |
| Normas Legais | normaslegais.com.br | Compra/Venda com Sinal, Comodato |
| Recibo Gratuito | recibogratuito.com.br | Recibos |
| PROCON-SP | procon.sp.gov.br | Procuração Particular |

### 2.2 Sites Governamentais

| Site | URL | Documentos Coletados |
|------|-----|----------------------|
| CNJ | cnj.jus.br | Autorização Viagem Internacional |
| TJAM | tjam.jus.br | Autorização Viagem Nacional |
| Receita Federal | gov.br/receitafederal | Procurações |

### 2.3 Fontes Identificadas (não acessadas por bloqueios)

- ADVBOX (advbox.com.br)
- Jurídico AI (juridico.ai)
- EasyJur (easyjur.com.br)
- Sebrae (sebraepr.com.br)
- Creci-SP (creci-sp.gov.br)

---

## 3. METODOLOGIA UTILIZADA

### 3.1 Processo de Coleta

1. **Identificação das Fontes**
   - Pesquisar sites com modelos jurídicos gratuitos
   - Verificar se têm formulários interativos
   - Listar documentos disponíveis em cada site

2. **Acesso aos Sites**
   - Usar WebFetch para extrair conteúdo markdown
   - Analisar HTML quando necessário
   - Identificar modelos pagos (pular se bloquear)

3. **Extração de Modelo**
   - Copiar texto completo do modelo
   - Identificar campos obrigatórios (marcados com _____)
   - Notar cláusulas específicas

4. **Criação de Arquivo**
   - Usar template padronizado em markdown
   - Preencher com dados fictícios
   - Adicionar observações sobre variações

5. **Organização**
   - Criar pasta por tipo de documento
   - Criar sub-pasta VARIANTES quando necessário
   - Documentar no arquivo de arquitetura

### 3.2 Tratamento de Bloqueios

| Tipo de Problema | Solução Aplicada |
|------------------|------------------|
| Paywall / Pago | Pular e registrar para pesquisa externa |
| Formulário necessário | Usar modelo base da página |
| PDF binário | Extrair texto quando possível |
| Redirecionamento | Usar texto de preview disponível |

### 3.3 Dados Fictícios Usados

| Campo | Valor Padrão |
|-------|--------------|
| Nome | João da Silva |
| CPF | 123.456.789-00 |
| RG | 12.345.678-9 |
| Estado Civil | Solteiro(a) |
| Nacionalidade | Brasileiro(a) |
| Profissão | Empresário |
| Endereço | Rua das Flores, 123, São Paulo, SP |
| CEP | 01234-567 |

---

## 4. ESTRUTURA CRIADA

### 4.1 Arquitetura de Pastas

```
KRIOU-DOCS/
├── DOCUMENTOS-MODELO/
│   ├── ARQUITECTURA.md           (Este documento - guia completo)
│   ├── scraper.py               (Script executável)
│   ├── run_scraper.bat          (Executável Windows)
│   ├── requirements.txt         (Bibliotecas Python)
│   ├── README-SCRAPER.md         (Manual do scraper)
│   │
│   ├── AUTORIZACAO-VIAGEM/
│   │   ├── AUTORIZACAO-VIAGEM-NACIONAL.md
│   │   └── AUTORIZACAO-VIAGEM-INTERNACIONAL.md
│   │
│   ├── COMODATO/
│   │   ├── CONTRATO-COMODATO-IMOVEL.md
│   │   └── VARIANTES/
│   │       └── COMODATO-RURAL-PARCERIA.md
│   │
│   ├── COMPRA-E-VENDA/
│   │   ├── CONTRATO-COMPRA-VENDA-IMOVEL-COM-SINAL.md
│   │   └── VARIANTES/
│   │       ├── COMPRA-VENDA-VEICULO.md
│   │       └── COMPRA-VENDA-TERRENO.md
│   │
│   ├── DOACAO/
│   │   ├── DOACAO-IMOVEL.md
│   │   └── VARIANTES/
│   │       ├── DOACAO-COM-USUFRUTO.md
│   │       └── DOACAO-COM-REVERSAO.md
│   │
│   ├── LOCACAO/
│   │   ├── LOCACAO-RESIDENCIAL.md
│   │   └── VARIANTES/
│   │       └── LOCACAO-COMERCIAL.md
│   │
│   ├── OUTROS-MODELOS/
│   │   ├── DECLARACAO-UNIAO-ESTAVEL-SOLTEIRO.md
│   │   ├── DECLARACAO-RESIDENCIA.md
│   │   ├── DECLARACAO-POBREZA.md
│   │   ├── DECLARACAO-VINCULO-EMPREGATICIO.md
│   │   ├── PACTO-ANTENUPCIAL.md
│   │   ├── TERMO-QUITACAO-DIVIDA.md
│   │   ├── DECLARACAO-AUSENCIA-DIVIDAS.md
│   │   ├── DECLARACAO-GUARDA-COMPARTILHADA.md
│   │   └── DECLARACAO-RECEBIMENTO-PENSAO.md
│   │
│   ├── PERMUTA/
│   │   └── CONTRATO-PERMUTA.md
│   │
│   ├── PROCURACAO/
│   │   ├── PROCURACAO-PARTICULAR.md
│   │   └── VARIANTES/
│   │       └── PROCURACAO-AD-JUDICIA.md
│   │
│   ├── RECIBO/
│   │   ├── RECIBO-PAGAMENTO.md
│   │   └── VARIANTES/
│   │       └── RECIBO-ALUGUEL.md
│   │
│   └── UNIAO-ESTAVEL/
│       ├── CONTRATO-UNIAO-ESTAVEL.md
│       ├── DISSOLUCAO-UNIAO-ESTAVEL.md
│       └── VARIANTES/
│           ├── UNIAO-ESTAVEL-COM-PENSAO.md
│           ├── DISSOLUCAO-COM-PARTILHA.md
│           └── DISSOLUCAO-COM-PENSAO.md
```

### 4.2 Template de Cada Documento

Todos os documentos seguem o mesmo padrão:

```markdown
# NOME DO DOCUMENTO

## Descrição
Breve descrição do documento e aplicação.

## Legislação Aplicável
- Lei ou artigo específico

---

[CONTEÚDO DO MODELO]
(Com campos editáveis _____ para preenchimento)

---

## Observações

- **Campos obrigatórios:** Lista
- **Variantes identificadas:** Possíveis variações
- **Fonte:** Site de origem
- **Data de coleta:** Mês/Ano
```

---

## 5. SCRAPER EXECUTÁVEL

### 5.1 O que foi criado

Para permitir uso independente da IA, foi desenvolvido um scraper em Python:

| Arquivo | Função |
|---------|--------|
| `scraper.py` | Script principal em Python |
| `run_scraper.bat` | Executável para Windows |
| `requirements.txt` | Bibliotecas necessárias |
| `README-SCRAPER.md` | Manual de uso |

### 5.2 Como usar

```bash
# Instalar dependências
pip install requests beautifulsoup4

# Executar
python scraper.py --list              # Lista sites
python scraper.py --fetch "URL"       # Coleta uma URL
python scraper.py --tipo nome          # Coleta por tipo
python scraper.py --all                # Coleta tudo
```

### 5.3 Bibliotecas Utilizadas

- `requests` - Requisições HTTP
- `beautifulsoup4` - Parse HTML
- `argparse` - Interface CLI
- `re` - Expressões regulares
- `os` - Manipulação de arquivos

---

## 6. LEGISLAÇÃO DE REFERÊNCIA

### 6.1 Códigos e Leis Principais

| Código/Lei | Assunto |
|------------|---------|
| Código Civil (Lei 10.406/2002) | Contratos em geral |
| Lei 8.245/91 | Locação (Lei do Inquilinato) |
| Lei 9.278/96 | União Estável |
| ECA (Lei 8.069/90) | Menores |
| Resolução CNJ 131/2011 | Viagem de menor |

### 6.2 Artigos Importantes por Tipo

| Documento | Artigos |
|-----------|---------|
| Compra/Venda | Arts. 481-532 CC |
| Permuta | Arts. 533-538 CC |
| Doação | Arts. 538-564 CC |
| Comodato | Arts. 579-585 CC |
| União Estável | Arts. 1.723-1.727 CC |
| Alimentos | Arts. 1.694-1.710 CC |
| Procuração | Arts. 105-119 CC |

---

## 7. ITENS PENDENTES / MELHORIAS FUTURAS

### 7.1 Documentos para Pesquisar Externamente

Alguns documentos não puderam ser coletados por bloqueios:

- [ ] Modelos ADVBOX pagos
- [ ] Modelos EasyJur pagos
- [ ] Escritura de Inventário Extrajudicial
- [ ] Contrato de Namoro (para distinguir de União Estável)
- [ ] Carta de Anuência

### 7.2 Melhorias no Scraper

- [ ] Adicionar mais sites configurados
- [ ] Tratar formulários interativos (preencher e submeter)
- [ ] Suporte a autenticação
- [ ] Detecção automática de tipo de documento
- [ ] Exportação para outros formatos (PDF, DOCX)

### 7.3 Revisão de Documentos

Os 32 modelos precisam de revisão manual para:

- [ ] Verificar se cláusulas estão completas
- [ ] Validar legislação aplicável
- [ ] Testar variantes em diferentes cenários
- [ ] Ajustar campos conforme necessidade do projeto

### 7.4 Possíveis Novas Adições

| Documento | Prioridade |
|-----------|-----------|
| Inventário Extrajudicial | Alta |
| Contrato de Namoro | Alta |
| Carta de Anuência | Média |
| Reconhecimento de Firma | Baixa |
| Testamento | Baixa |

---

## 8. PRÓXIMOS PASSOS RECOMENDADOS

### 8.1 Revisão Individual

1. Ler cada documento individualmente
2. Verificar se cláusulas estão conforme legislação vigente
3. Identificar campos que precisam ser dinâmicos (preenchidos pela IA)
4. Mapear variantes que serão necessárias para cada caso

### 8.2 Integração com IA

1. Definir variáveis de cada documento (nome, cpf, valores, etc.)
2. Criar lógica para selecionar variante correta
3. Implementar geração de documento final
4. Testar com casos reais

### 8.3 Expansão

1. Adicionar mais fontes de modelos
2. Implementar coleta automática periódica
3. Criar validação de documentos
4. Adicionar mais variantes conforme uso

---

## 9. FONTES ADICIONAIS PARA CONSULTA

- Jurisway (jurisway.com.br)
- Portal Direito Brasil (direitobrasil.com.br)
- Dúvidas Solucionadas (duvidas.srv.br)
- Sites dos Tribunais de Justiça (diversos)
- Cartórios de Notas (modelos específicos)

---

## 10. REGISTRO DE CRÉDITOS

- **Desenvolvedor/IA:** opencode (minimax-m2.5-free)
- **Usuário:** Reyvison (KRIOU-DOCS)
- **Data de Criação:** Abril 2026
- **Propósito:** Base de modelos jurídicos para automação

---

## 11. CONTEXTO DO PROJETO

Este projeto faz parte do **KRIOU-DOCS**, um sistema de gerenciamento de documentos jurídicos com suporte a IA. O objetivo é:

1. **Coletar** modelos de documentos de fontes confiáveis
2. **Organizar** de forma estruturada e acessível
3. **Automatizar** preenchimento com dados variáveis
4. **Personalizar** conforme caso específico (variantes)
5. **Validar** conforme legislação brasileira vigente

A base de documentos criada será utilizada para treinar e implementar modelos de IA que gerarão documentos jurídicos automaticamente.

---

*Documento gerado em Abril 2026*
*Última atualização: Abril 2026*
