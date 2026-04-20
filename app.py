# -*- coding: utf-8 -*-
import os
import sys
"""
Dreamweaver Python - Editor Visual Web Completo
Punto de entrada principal de la aplicación
"""

import os
import sys

# --- AÑADE ESTO PARA WINDOWS ---
if sys.platform == 'win32':
    os.system('chcp 65001 > nul') 
# -------------------------------

# Añadir el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from editor import create_app

# Crear aplicación
app = create_app()

if __name__ == '__main__':
    # Configuración
    HOST = os.environ.get('HOST', 'localhost')
    PORT = int(os.environ.get('PORT', 5000))
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"""
    ----------------------------------------------------------
    DREAMWEAVER PYTHON - Editor Visual Web Completo
    ----------------------------------------------------------
    Abre tu navegador en:
    http://{HOST}:{PORT}

    Atajos de teclado:
    Ctrl+S     Guardar
    Ctrl+Z     Deshacer
    Ctrl+D     Duplicar elemento
    Delete     Eliminar elemento

    Presiona Ctrl+C para detener el servidor
    ----------------------------------------------------------
    """)
    
    app.run(host=HOST, port=PORT, debug=DEBUG, use_reloader=False, threaded=True)
