# SCRAPPER DE MODELOS JURÍDICOS

Scripts executáveis para coletar modelos de documentos jurídicos de sites brasileiros, desenvolvido para uso independente (sem necessidade de IA).

---

## 📁 Arquivos Criados

| Arquivo | Descrição |
|--------|-----------|
| `scraper.py` | Script principal em Python |
| `run_scraper.bat` | Script para executar no Windows |
| `requirements.txt` | Bibliotecas necessárias |
| `ARQUITECTURA.md` | Documentação da estrutura |

---

## 🚀 Como Usar

### Pré-requisitos

1. **Instalar Python 3.8+** (se não tiver)
2. **Instalar bibliotecas:**
   ```bash
   pip install requests beautifulsoup4
   ```

### Opção 1: Executar no Windows (duplo clique)

1. Dê dois cliques em `run_scraper.bat`
2. Siga as instruções na tela

### Opção 2: Executar via linha de comando

```bash
# Lista todos os sites configurados
python scraper.py --list

# Coleta modelo de uma URL específica
python scraper.py --fetch "https://www.99contratos.com.br/contrato-uniao-estavel"

# Coleta todos os modelos de um tipo
python scraper.py --tipo uniao-estavel

# Coleta todos os modelos configurados
python scraper.py --all

# Ajuda completa
python scraper.py --help
```

---

## 🔧 O que foi usado para criar

### Ferramentas Python

| Biblioteca | Para que serve |
|------------|----------------|
| `requests` | Fazer requisições HTTP aos sites |
| `beautifulsoup4` | Parsear HTML e extrair texto |
| `argparse` | Criar interface de linha de comando |
| `re` | Expressões regulares para limpar texto |
| `os` | Manipular arquivos e pastas |

### Lógica de Funcionamento

1. **Acessa sites** via HTTP (como um navegador)
2. **Baixa o HTML** de cada página de modelo
3. **Extrai o texto** principal (remove menus, scripts, etc.)
4. **Salva em .md** na pasta correspondente ao tipo

### Fontes Configuradas

- 99 Contratos (contratos diversos)
- Normas Legais (compra/venda, comodato)
- Recibo Gratuito (recibos)
- PROCON-SP (procurações)
- CNJ (autorizações de viagem)

---

## 📂 Estrutura de Saída

Os modelos são salvos em:

```
DOCUMENTOS-MODELO/
├── AUTORIZACAO-VIAGEM/
├── COMODATO/
├── COMPRA-E-VENDA/
├── DOACAO/
├── LOCACAO/
├── OUTROS-MODELOS/
├── PERMUTA/
├── PROCURACAO/
├── RECIBO/
└── UNIAO-ESTAVEL/
```

---

## ⚠️ Observações Importantes

1. **Bloqueios:** Alguns sites podem bloquear o acesso automatizado
2. **Paywall:** Modelos pagos não serão capturados completamente
3. **Revisão:** Sempre revise os documentos coletados manualmente
4. **Respeito:** O script inclui delays para não sobrecarregar os servidores

---

## 🔄 Adicionar Novos Sites

Para adicionar novos sites ao scraper, edite o arquivo `scraper.py` e adicione na seção `SITES_CONFIGURADOS`:

```python
SITES_CONFIGURADOS = {
    "nome_do_site": {
        "nome": "Nome Legível",
        "url_base": "https://www.exemplo.com.br",
        "documentos": [
            {"nome": "pagina-do-modelo", "tipo": "pasta-correspondente"},
        ]
    },
}
```

---

## 📝 Licença e Créditos

- **Desenvolvido:** KRIOU-DOCS Project
- **Data:** Abril 2026
- **Objetivo:** Automatizar coleta de modelos jurídicos para IA

---

*Para mais detalhes, consulte ARQUITECTURA.md*
