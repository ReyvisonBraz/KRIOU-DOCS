#!/usr/bin/env python3
"""
SCRAPPER DE MODELOS JURÍDICOS
=============================
Script para coletar modelos de documentos jurídicos de sites brasileiros.

UTILIZAÇÃO:
    python scraper.py [opção] [parâmetro]

OPÇÕES:
    python scraper.py --list              - Lista todos os sites configurados
    python scraper.py --fetch URL         - Coleta modelo de uma URL específica
    python scraper.py --tipo compravenda   - Coleta todos os modelos de um tipo
    python scraper.py --all               - Coleta todos os modelos configurados
    python scraper.py --help               - Mostra esta ajuda

EXEMPLOS:
    python scraper.py --fetch "https://www.99contratos.com.br/contrato-uniao-estavel"
    python scraper.py --tipo uniao-estavel
    python scraper.py --all

REQUISITOS:
    pip install requests beautifulsoup4

AUTOR: KRIOU-DOCS Scraper
DATA: Abril 2026
"""

import sys
import os
import argparse
import time
import re
from datetime import datetime

# Verifica se as bibliotecas estão instaladas
try:
    import requests
    from bs4 import BeautifulSoup
    REQUESTS_DISPONIVEL = True
except ImportError:
    REQUESTS_DISPONIVEL = False
    print("AVISO: Biblioteca 'requests' ou 'beautifulsoup4' não encontrada.")
    print("Instale com: pip install requests beautifulsoup4")


# ==============================================================================
# CONFIGURAÇÕES
# ==============================================================================

PASTA_OUTPUT = "DOCUMENTOS-MODELO"

# URLs dos sites com modelos jurídicos
SITES_CONFIGURADOS = {
    "99contratos": {
        "nome": "99 Contratos",
        "url_base": "https://www.99contratos.com.br",
        "documentos": [
            {"nome": "contrato-uniao-estavel", "tipo": "uniao-estavel"},
            {"nome": "declaracao-dissolucao-uniao-estavel", "tipo": "uniao-estavel"},
            {"nome": "contrato-permuta", "tipo": "permuta"},
            {"nome": "contrato-comodato", "tipo": "comodato"},
        ]
    },
    "normaslegais": {
        "nome": "Normas Legais",
        "url_base": "https://www.normaslegais.com.br",
        "documentos": [
            {"nome": "modelo-compra-venda-imovel-com-sinal", "tipo": "compra-e-venda"},
            {"nome": "modelo-contrato-comodato-imovel", "tipo": "comodato"},
        ]
    },
    "recibogratuito": {
        "nome": "Recibo Gratuito",
        "url_base": "https://recibogratuito.com.br",
        "documentos": [
            {"nome": "recibo-de-pagamento", "tipo": "recibo"},
            {"nome": "recibo-de-aluguel", "tipo": "recibo"},
        ]
    },
    "procon-sp": {
        "nome": "PROCON-SP",
        "url_base": "https://www.procon.sp.gov.br",
        "documentos": [
            {"nome": "modelo-de-procuracao", "tipo": "procuracao"},
        ]
    },
    "cnj": {
        "nome": "CNJ",
        "url_base": "https://www.cnj.jus.br",
        "documentos": [
            {"nome": "formulario-padrao-de-autorizacao-de-viagem-internacional", "tipo": "autorizacao-viagem"},
        ]
    }
}

# Mapeamento de tipos para pastas
TIPOS_PASTAS = {
    "compra-e-venda": "COMPRA-E-VENDA",
    "locacao": "LOCACAO",
    "uniao-estavel": "UNIAO-ESTAVEL",
    "dissolucao": "UNIAO-ESTAVEL",
    "recibo": "RECIBO",
    "procuracao": "PROCURACAO",
    "doacao": "DOACAO",
    "autorizacao-viagem": "AUTORIZACAO-VIAGEM",
    "comodato": "COMODATO",
    "permuta": "PERMUTA",
}


# ==============================================================================
# FUNÇÕES PRINCIPAIS
# ==============================================================================

def listar_sites():
    """Lista todos os sites configurados."""
    print("\n" + "="*60)
    print("SCRAPPER DE MODELOS JURÍDICOS - SITES CONFIGURADOS")
    print("="*60 + "\n")
    
    for chave, dados in SITES_CONFIGURADOS.items():
        print(f"[{chave}] {dados['nome']}")
        print(f"    URL: {dados['url_base']}")
        print(f"    Modelos disponíveis: {len(dados['documentos'])}")
        for doc in dados['documentos']:
            print(f"      - {doc['nome']} ({doc['tipo']})")
        print()
    
    print("="*60 + "\n")


def criar_estrutura_pastas():
    """Cria a estrutura de pastas se não existir."""
    pastas = [
        PASTA_OUTPUT,
        f"{PASTA_OUTPUT}/AUTORIZACAO-VIAGEM",
        f"{PASTA_OUTPUT}/COMODATO",
        f"{PASTA_OUTPUT}/COMODATO/VARIANTES",
        f"{PASTA_OUTPUT}/COMPRA-E-VENDA",
        f"{PASTA_OUTPUT}/COMPRA-E-VENDA/VARIANTES",
        f"{PASTA_OUTPUT}/DOACAO",
        f"{PASTA_OUTPUT}/DOACAO/VARIANTES",
        f"{PASTA_OUTPUT}/LOCACAO",
        f"{PASTA_OUTPUT}/LOCACAO/VARIANTES",
        f"{PASTA_OUTPUT}/OUTROS-MODELOS",
        f"{PASTA_OUTPUT}/PERMUTA",
        f"{PASTA_OUTPUT}/PROCURACAO",
        f"{PASTA_OUTPUT}/PROCURACAO/VARIANTES",
        f"{PASTA_OUTPUT}/RECIBO",
        f"{PASTA_OUTPUT}/RECIBO/VARIANTES",
        f"{PASTA_OUTPUT}/UNIAO-ESTAVEL",
        f"{PASTA_OUTPUT}/UNIAO-ESTAVEL/VARIANTES",
    ]
    
    for pasta in pastas:
        os.makedirs(pasta, exist_ok=True)
        print(f"✓ Pasta criada/verificada: {pasta}")


def fetch_url(url, timeout=30):
    """
    Faz fetch de uma URL e retorna o conteúdo.
    Equivalent ao WebFetch mas em Python local.
    """
    if not REQUESTS_DISPONIVEL:
        print("ERRO: Instale as bibliotecas necessárias:")
        print("      pip install requests beautifulsoup4")
        return None
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"ERRO ao acessar {url}: {e}")
        return None


def extrair_texto_html(html_content):
    """
    Extrai texto principal do HTML.
    Remove scripts, styles e elementos desnecessários.
    """
    if not html_content:
        return ""
    
    if not REQUESTS_DISPONIVEL:
        return "Bibliotecas não instaladas"
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove elementos desnecessários
    for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
        tag.decompose()
    
    # pega o texto principal
    texto = soup.get_text(separator='\n')
    
    # Limpa espaços extras
    linhas = [linha.strip() for linha in texto.split('\n')]
    texto = '\n'.join([linha for linha in linhas if linha])
    
    return texto


def salvar_documento(conteudo, nome_arquivo, pasta):
    """
    Salva o conteúdo em um arquivo markdown.
    """
    # Cria nome de arquivo válido
    nome_valido = re.sub(r'[^\w\-]', '-', nome_arquivo.lower())
    nome_valido = re.sub(r'-+', '-', nome_valido)
    
    # Garante que termine em .md
    if not nome_valido.endswith('.md'):
        nome_valido += '.md'
    
    caminho = os.path.join(pasta, nome_valido)
    
    with open(caminho, 'w', encoding='utf-8') as f:
        f.write(conteudo)
    
    print(f"✓ Documento salvo: {caminho}")
    return caminho


def coletar_modelo(url, nome_modelo, tipo):
    """
    Coleta um modelo específico de uma URL.
    """
    print(f"\n[coletando] {url}")
    
    html = fetch_url(url)
    if not html:
        print(f"✗ ERRO: Não foi possível acessar {url}")
        return None
    
    # Extrai o texto principal
    texto = extrair_texto_html(html)
    
    # Determina a pasta
    pasta = TIPOS_PASTAS.get(tipo, "OUTROS-MODELOS")
    pasta_completa = os.path.join(PASTA_OUTPUT, pasta)
    
    # Cria o conteúdo em formato markdown
    conteudo_md = f"""# {nome_modelo.replace('-', ' ').title()}

## Descrição
Modelo coletado automaticamente em {datetime.now().strftime('%B/%Y')}.

## Fonte
URL: {url}

---

{texto}

---

## Observações

- **Data de coleta:** {datetime.now().strftime('%B %Y')}
- **Automação:** Scraper KRIOU-DOCS
- **Status:** Revisão manual necessária
"""
    
    return salvar_documento(conteudo_md, nome_modelo, pasta_completa)


def coletar_por_tipo(tipo):
    """
    Coleta todos os modelos de um tipo específico.
    """
    print(f"\n>> Coletando modelos do tipo: {tipo}")
    
    for site_chave, dados in SITES_CONFIGURADOS.items():
        for doc in dados['documentos']:
            if doc['tipo'] == tipo:
                url = f"{dados['url_base']}/{doc['nome']}"
                coletar_modelo(url, doc['nome'], doc['tipo'])
                time.sleep(1)  # Espera 1 segundo entre requisições


def coletar_tudo():
    """
    Coleta todos os modelos configurados.
    """
    print("\n" + "="*60)
    print("INICIANDO COLETA COMPLETA DE MODELOS")
    print("="*60)
    
    criar_estrutura_pastas()
    
    for site_chave, dados in SITES_CONFIGURADOS.items():
        print(f"\n>> Processando: {dados['nome']}")
        
        for doc in dados['documentos']:
            url = f"{dados['url_base']}/{doc['nome']}"
            coletar_modelo(url, doc['nome'], doc['tipo'])
            time.sleep(1)  # Respeitar o servidor
    
    print("\n" + "="*60)
    print("COLETA COMPLETA FINALIZADA!")
    print("="*60)


# ==============================================================================
# INTERFACE DE LINHA DE COMANDO
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description='Scrapper de Modelos Jurídicos KRIOU-DOCS',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument('--list', '-l', action='store_true',
                        help='Lista todos os sites configurados')
    parser.add_argument('--fetch', '-f', metavar='URL',
                        help='Coleta modelo de uma URL específica')
    parser.add_argument('--tipo', '-t', metavar='TIPO',
                        help='Coleta todos os modelos de um tipo (ex: uniao-estavel)')
    parser.add_argument('--all', '-a', action='store_true',
                        help='Coleta todos os modelos configurados')
    parser.add_argument('--help', '-h', action='store_true',
                        help='Mostra esta ajuda')
    
    args = parser.parse_args()
    
    # Executa a ação solicitada
    if args.list or (not args.fetch and not args.tipo and not args.all):
        listar_sites()
        print("Para ajuda: python scraper.py --help")
    
    elif args.all:
        coletar_tudo()
    
    elif args.tipo:
        coletar_por_tipo(args.tipo)
    
    elif args.fetch:
        print(f"Coletando: {args.fetch}")
        html = fetch_url(args.fetch)
        if html:
            texto = extrair_texto_html(html)
            print("\n" + "="*60)
            print("TEXTO EXTRAÍDO:")
            print("="*60)
            print(texto[:5000])  # Primeiros 5000 caracteres
            print("\n[...] (texto truncado)")
        else:
            print("ERRO: Não foi possível acessar a URL")


if __name__ == "__main__":
    main()
