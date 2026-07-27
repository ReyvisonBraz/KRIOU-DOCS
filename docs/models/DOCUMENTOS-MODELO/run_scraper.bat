@echo off
REM ============================================================================
REM SCRAPPER DE MODELOS JURÍDICOS - KRIOU-DOCS
REM ============================================================================
REM Script para executar o scraper de modelos jurídicos
REM 
REM USO:
REM   run_scraper --list         - Lista todos os sites configurados
REM   run_scraper --fetch URL   - Coleta modelo de uma URL específica
REM   run_scraper --tipo uniao  - Coleta todos os modelos de um tipo
REM   run_scraper --all         - Coleta todos os modelos
REM
REM INSTALAÇÃO PRÉVIA:
REM   pip install requests beautifulsoup4
REM ============================================================================

echo.
echo ================================================================
echo   SCRAPPER DE MODELOS JURÍDICOS - KRIOU-DOCS
echo ================================================================
echo.

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python não encontrado. Instale Python 3.8+
    pause
    exit /b 1
)

REM Verifica se as bibliotecas estão instaladas
python -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo AVISO: Biblioteca requests não encontrada
    echo Instalando...
    pip install requests
)

python -c "import bs4" >nul 2>&1
if errorlevel 1 (
    echo AVISO: Biblioteca beautifulsoup4 não encontrada
    echo Instalando...
    pip install beautifulsoup4
)

echo.
echo Iniciando scraper...
echo.

REM Executa o scraper com os parâmetros passados
python "%~dp0scraper.py" %*

echo.
echo ================================================================
echo   EXECUÇÃO FINALIZADA
echo ================================================================
pause
