@echo off
title Dreamweaver Python - Iniciando...
color 0A

:: ═══════════════════════════════════════════════════════════════
:: TRUCO: %~dp0 significa "la carpeta donde está este archivo .bat"
:: Así no necesitamos escribir la ruta manualmente nunca más
:: ═══════════════════════════════════════════════════════════════
cd /d "%~dp0"

echo ==========================================
echo    DREAMWEAVER PYTHON - Configurando...
echo ==========================================
echo.

:: 1. Comprobar si el entorno virtual existe
if not exist "venv\Scripts\activate.bat" (
    echo [1/3] Creando entorno virtual por primera vez...
    python -m venv venv
    if errorlevel 1 (
        color 0C
        echo ERROR: No se pudo crear el entorno virtual. ¿Tienes Python instalado?
        pause
        exit
    )
    echo.
) else (
    echo [1/3] Entorno virtual encontrado.
    echo.
)

:: 2. Activar el entorno virtual
echo [2/3] Activando entorno virtual...
call venv\Scripts\activate.bat
echo.

:: 3. Instalar/Actualizar dependencias 
:: (Pip es inteligente: si ya están instaladas, las salta en 1 segundo)
echo [3/3] Comprobando dependencias (pip install -r requirements.txt)...
pip install -r requirements.txt >nul 2>&1
echo Dependencias listas.
echo.

:: 4. Ejecutar la aplicación
cls
echo =================================================
echo    ¡EDITOR INICIADO CORRECTAMENTE!
echo    Abre tu navegador en: http://localhost:5000
    
echo    (Cierra esta ventana para detener el servidor)
echo =================================================
echo.

:: ABRIR EL NAVEGADOR POR DEFECTO DE WINDOWS AL INSTANTE
start http://localhost:5000

:: Usamos cmd /k para que si Python da un error, la ventana NO se cierre sola
:: y puedas leer qué ha fallado
cmd /k python app.py