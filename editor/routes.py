# -*- coding: utf-8 -*-
"""
Rutas Flask - API endpoints del editor
"""


from bs4 import BeautifulSoup
import os
import json
from flask import Flask, render_template, request, jsonify, redirect, send_file
from .core import EditorCore, ArchivoProyecto

# Instancia global del editor
editor = EditorCore()


def create_app():
    """Crear y configurar la aplicación Flask"""
    app = Flask(__name__,
                 template_folder='../templates',
                 static_folder='../static')
    
    # Configuración
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max
    app.config['SECRET_KEY'] = 'dreamweaver-python-secret-key-2024'
    
    # Registrar rutas
    register_routes(app)
    
    return app


def register_routes(app: Flask):
    """Registrar todas las rutas de la API"""
    
    # ═══════════════════════════════════════════════════════
    # PÁGINA PRINCIPAL
    # ═══════════════════════════════════════════════════════
    
    @app.route('/')
    def index():
        """Página principal del editor"""
        return render_template('index.html')
    
    # ═══════════════════════════════════════════════════════
    # PROYECTO Y ARCHIVOS
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/project')
    def api_project():
        """Obtener lista de archivos del proyecto"""
        global editor
        
        if not editor:
            return jsonify({'archivos': [], 'proyecto': None})
        
        archivos = []
        for nombre, archivo in editor.proyecto.items():
            archivos.append({
                'nombre': nombre,
                'tipo': archivo.tipo,
                'activo': nombre == editor.archivo_actual,
                'modificado': archivo.modificado
            })
        
        return jsonify({
            'archivos': archivos,
            'proyecto': editor.archivo_principal
        })
    
    @app.route('/api/load-file', methods=['POST'])
    def api_load_file():
        """Cargar archivo desde el navegador"""
        global editor
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No se proporcionó archivo'})
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Nombre de archivo vacío'})
        
        try:
            contenido = file.read().decode('utf-8')
            nombre = file.filename
            ext = os.path.splitext(nombre)[1].lower()
            tipo = 'html' if ext in ['.html', '.htm'] else 'css' if ext == '.css' else 'js' if ext == '.js' else 'otro'
            
            if not editor:
                editor = EditorCore()
            
            editor.proyecto[nombre] = type('ArchivoProyecto', (), {
                'ruta': nombre,
                'nombre': nombre,
                'tipo': tipo,
                'contenido': contenido,
                'modificado': False
            })()
            
            if tipo == 'html':
                editor.archivo_actual = nombre
                from bs4 import BeautifulSoup
                editor.soup = BeautifulSoup(contenido, 'html.parser')
            
            return jsonify({'success': True, 'nombre': nombre})
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})

    
    
    @app.route('/api/open-project', methods=['POST'])
    def api_open_project():
        """Abrir directorio como proyecto"""
        global editor
        
        directorio = request.json.get('directorio') if request.json else None
        
        if not directorio:
            return jsonify({'success': False, 'error': 'No se proporcionó directorio'})
        
        if not editor:
            editor = EditorCore()
        
        success = editor.cargar_proyecto(directorio)
        
        return jsonify({'success': success})

    @app.route('/api/load-folder', methods=['POST'])
    def api_load_folder():
        """Abrir ventana de Windows sin bloquear el servidor (Hilos)"""
        global editor
        
        import threading
        import tkinter as tk
        from tkinter import filedialog
        
        resultado = {'ruta': None}
        
        # Función que abre la ventana
        def abrir_ventana():
            try:
                root = tk.Tk()
                root.withdraw() # Ocultar ventana principal fea
                root.attributes('-topmost', True) # Ponerla por delante de todo
                
                # Abrir el diálogo de carpetas
                ruta = filedialog.askdirectory(
                    title="Selecciona la carpeta de tu proyecto web",
                    mustexist=True
                )
                
                resultado['ruta'] = ruta
                root.quit()
                root.destroy()
            except Exception as e:
                print(f"Error en Tkinter: {e}")
                resultado['ruta'] = None
        
        # Ejecutar en un hilo aparte para no congelar Flask
        hilo = threading.Thread(target=abrir_ventana)
        hilo.start()
        hilo.join() # Esperar a que el usuario termine de elegir
        
        if not resultado['ruta']:
            return jsonify({'success': False, 'error': 'Cancelado'})
            
        print(f"✅ Carpeta seleccionada: {resultado['ruta']}")
        
        # Reiniciar el proyecto por si venía de otra carpeta antes
        if not editor:
            from .core import EditorCore
            editor = EditorCore()
        else:
            editor.proyecto = {}
            
        # Cargar la carpeta
        success = editor.cargar_proyecto(resultado['ruta'])
        
        if success:
            print(f"✅ Proyecto cargado. Archivos encontrados: {len(editor.proyecto)}")
            return jsonify({'success': True, 'archivos': len(editor.proyecto)})
        else:
            print("❌ Error al cargar el proyecto")
            return jsonify({'success': False, 'error': 'No se pudo leer la carpeta'})
    
    @app.route('/api/select-file', methods=['POST'])
    def api_select_file():
        """Seleccionar archivo actual y devolver su contenido"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'error': 'No hay editor'})
        
        nombre = request.json.get('archivo')
        
        if nombre in editor.proyecto:
            editor.archivo_actual = nombre
            archivo = editor.proyecto[nombre]
            
            if archivo.tipo == 'html':
                from bs4 import BeautifulSoup
                editor.soup = BeautifulSoup(archivo.contenido, 'html.parser')
            
            # DEVOLVEMOS EL CONTENIDO PARA QUE JS LO MUESTRE
            return jsonify({
                'success': True, 
                'tipo': archivo.tipo,
                'contenido': archivo.contenido
            })
        
        return jsonify({'success': False, 'error': 'Archivo no encontrado'})
    
    # ═══════════════════════════════════════════════════════
    # ESTRUCTURA Y CONTENIDO
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/structure')
    def api_structure():
        """Obtener estructura jerárquica del documento"""
        global editor
        
        if not editor:
            return jsonify({})
        
        return jsonify(editor.obtener_estructura_jerarquica())
    
    @app.route('/api/html')
    def api_html():
        """Obtener código HTML"""
        global editor
        
        if not editor:
            return "<!DOCTYPE html><html><body><h1>Carga un archivo HTML</h1></body></html>"
        
        return editor.obtener_html()

    @app.route('/api/css')
    def api_css():
        """Obtener código CSS (Prioridad: Archivo externo > Inline)"""
        global editor
        
        if not editor: return ""
        
        # 1. Buscar si hay un archivo CSS externo en el proyecto (ej: css/style.css)
        for nombre, archivo in editor.proyecto.items():
            if archivo.tipo == 'css':
                # Ponemos un comentario para que sepas qué archivo estás editando
                return f"/* ========================================== */\n/* Archivo externo: {nombre} */\n/* ========================================== */\n\n{archivo.contenido}"
                
        # 2. Si no hay archivo externo, buscar estilos dentro del HTML (<style>)
        return editor.obtener_css()


    @app.route('/api/js')
    def api_js():
        """Obtener código JavaScript (Prioridad: Archivo externo > Inline)"""
        global editor
        
        if not editor: return ""
        
        # 1. Buscar si hay un archivo JS externo en el proyecto (ej: js/script.js)
        for nombre, archivo in editor.proyecto.items():
            if archivo.tipo == 'js':
                return f"// ==========================================\n// Archivo externo: {nombre}\n// ==========================================\n\n{archivo.contenido}"
                
        # 2. Si no hay archivo externo, buscar scripts dentro del HTML (<script>)
        return editor.obtener_js()
    
    
    
    
    @app.route('/api/html-preview')
    def api_html_preview():
        """Obtener HTML para vista previa"""
        global editor
        
        if not editor:
            return "<!DOCTYPE html><html><body><h1>Carga un archivo HTML</h1></body></html>"
        
        return editor.obtener_html_para_preview()
    
    # ═══════════════════════════════════════════════════════
    # OPERACIONES CON ELEMENTOS
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/element')
    def api_element():
        """Obtener detalle de un elemento"""
        global editor
        
        if not editor:
            return jsonify({})
        
        xpath = request.args.get('xpath', '')
        elemento = editor.obtener_elemento(xpath)
        
        return jsonify(elemento if elemento else {})
    
    @app.route('/api/element-by-dwid')
    def api_element_by_dwid():
        """Obtener elemento por su ID secreto de vista previa"""
        global editor
        if not editor: return jsonify({})
        
        dw_id = request.args.get('dwid', type=int)
        if dw_id is None: return jsonify({})
        
        elem = editor.obtener_elemento_por_dw_id(dw_id)
        return jsonify(elem if elem else {})

    @app.route('/api/update', methods=['POST'])
    def api_update():
        """Actualizar un elemento"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'error': 'No hay editor'})
        
        data = request.get_json()
        success = editor.actualizar_elemento(data['xpath'], data['datos'])
        
        return jsonify({'success': success})
    
    @app.route('/api/create', methods=['POST'])
    def api_create():
        """Crear nuevo elemento"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'error': 'No hay editor'})
        
        data = request.get_json()
        success, new_xpath = editor.crear_elemento(
            data['padre_xpath'],
            data['tag'],
            data.get('atributos', {}),
            data.get('contenido', '')
        )
        
        return jsonify({'success': success, 'xpath': new_xpath})
    
    @app.route('/api/delete', methods=['POST'])
    def api_delete():
        """Eliminar elemento"""
        global editor
        
        if not editor:
            return jsonify({'success': False})
        
        data = request.get_json()
        success, info = editor.eliminar_elemento(data['xpath'])
        
        return jsonify({'success': success, 'info': info})
    
    @app.route('/api/duplicate', methods=['POST'])
    def api_duplicate():
        """Duplicar elemento"""
        global editor
        
        if not editor:
            return jsonify({'success': False})
        
        data = request.get_json()
        success, new_xpath = editor.duplicar_elemento(data['xpath'])
        
        return jsonify({'success': success, 'xpath': new_xpath})
    
    @app.route('/api/move', methods=['POST'])
    def api_move():
        """Mover elemento"""
        global editor
        
        if not editor:
            return jsonify({'success': False})
        
        data = request.get_json()
        success = editor.mover_elemento(
            data['xpath_origen'],
            data['xpath_destino'],
            data.get('posicion', 'dentro')
        )
        
        return jsonify({'success': success})
    
    @app.route('/api/toggle-visibility', methods=['POST'])
    def api_toggle_visibility():
        """Toggle visibilidad de elemento"""
        global editor
        
        if not editor:
            return jsonify({'success': False})
        
        data = request.get_json()
        success = editor.toggle_visibilidad(data['xpath'])
        
        return jsonify({'success': success})
    
    # ═══════════════════════════════════════════════════════
    # ACTUALIZACIÓN DE CÓDIGO
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/update-code', methods=['POST'])
    def api_update_code():
        """Actualizar código desde el editor"""
        global editor
        
        if not editor:
            return jsonify({'success': False})
        
        data = request.get_json()
        tipo = data.get('tipo', 'html')
        codigo = data.get('codigo', '')
        
        from bs4 import BeautifulSoup
        
        if tipo == 'html':
            editor.soup = BeautifulSoup(codigo, 'html.parser')
            if editor.archivo_actual in editor.proyecto:
                editor.proyecto[editor.archivo_actual].contenido = str(editor.soup)
                editor.proyecto[editor.archivo_actual].modificado = True
        
        elif tipo == 'css':
            style = editor.soup.find('style')
            if style:
                style.string = codigo
                if editor.archivo_actual in editor.proyecto:
                    editor.proyecto[editor.archivo_actual].modificado = True
        
        elif tipo == 'js':
            script = editor.soup.find('script', src=False)
            if script:
                script.string = codigo
                if editor.archivo_actual in editor.proyecto:
                    editor.proyecto[editor.archivo_actual].modificado = True
        
        return jsonify({'success': True})
    
    # ═══════════════════════════════════════════════════════
    # GUARDADO Y EXPORTACIÓN
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/save', methods=['POST'])
    def api_save():
        """Guardar archivo actual"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'error': 'No hay editor'})
        
        # get_json(silent=True) evita el error 415 si el navegador no envía JSON válido
        data = request.get_json(silent=True)
        ruta = data.get('ruta') if data else None
        
        ruta_final = editor.guardar_archivo(ruta)
        
        return jsonify({'success': True, 'ruta': ruta_final})
    
    @app.route('/api/export-zip', methods=['POST'])
    def api_export_zip():
        """Exportar proyecto como ZIP"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'error': 'No hay editor'})
        
        import zipfile
        import tempfile
        
        try:
            temp_dir = tempfile.mkdtemp()
            zip_path = os.path.join(temp_dir, 'proyecto.zip')
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                for nombre, archivo in editor.proyecto.items():
                    zf.writestr(nombre, archivo.contenido)
            
            return send_file(zip_path, as_attachment=True, download_name='proyecto.zip')
            
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)})
    
    # ═══════════════════════════════════════════════════════
    # HISTORIAL (UNDO/REDO)
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/undo', methods=['POST'])
    def api_undo():
        """Deshacer última acción"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'message': 'No hay editor'})
        
        success, msg = editor.deshacer()
        
        return jsonify({'success': success, 'message': msg})
    
    @app.route('/api/redo', methods=['POST'])
    def api_redo():
        """Rehacer última acción"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'message': 'No hay editor'})
        
        success, msg = editor.rehacer()
        
        return jsonify({'success': success, 'message': msg})
    
    # ═══════════════════════════════════════════════════════
    # SNIPPETS Y COMPONENTES
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/snippets')
    def api_snippets():
        """Obtener lista de snippets disponibles"""
        componentes_dir = os.path.join(os.path.dirname(__file__), '..', 'components')
        snippets = {}
        
        try:
            for archivo in os.listdir(componentes_dir):
                if archivo.endswith('.json'):
                    categoria = archivo[:-5]
                    ruta = os.path.join(componentes_dir, archivo)
                    with open(ruta, 'r', encoding='utf-8') as f:
                        snippets[categoria] = json.load(f)
        except:
            pass
        
        return jsonify(snippets)
    
    @app.route('/api/snippets/<categoria>')
    def api_snippets_categoria(categoria):
        """Obtener snippets por categoría"""
        ruta = os.path.join(os.path.dirname(__file__), '..', 'components', f'{categoria}.json')
        
        try:
            with open(ruta, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        except:
            return jsonify([])
    
    @app.route('/api/insert-snippet', methods=['POST'])
    def api_insert_snippet():
        """Insertar snippet de código"""
        global editor
        
        if not editor:
            return jsonify({'success': False, 'error': 'No hay editor'})
        
        data = request.get_json()
        success, xpath = editor.insertar_snippet(
            data['xpath_padre'],
            data['snippet_html']
        )
        
        return jsonify({'success': success, 'xpath': xpath})
    
    # ═══════════════════════════════════════════════════════
    # TEMAS
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/theme', methods=['GET', 'POST'])
    def api_theme():
        """Obtener o establecer tema"""
        global editor
        
        if request.method == 'POST':
            tema = request.json.get('tema', 'dark')
            if editor:
                editor.tema_actual = tema
            return jsonify({'success': True, 'tema': tema})
        
        return jsonify({'tema': editor.tema_actual if editor else 'dark'})
    
    # ═══════════════════════════════════════════════════════
    # AUTOCOMPLETADO
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/autocomplete')
    def api_autocomplete():
        """Obtener sugerencias de autocompletado"""
        tipo = request.args.get('tipo', 'html')
        query = request.args.get('q', '').lower()
        
        sugerencias = {
            'html': [
                {'text': '<div class="">', 'label': 'div - Contenedor genérico'},
                {'text': '<section>', 'label': 'section - Sección'},
                {'text': '<header>', 'label': 'header - Cabecera'},
                {'text': '<footer>', 'label': 'footer - Pie de página'},
                {'text': '<nav>', 'label': 'nav - Navegación'},
                {'text': '<main>', 'label': 'main - Contenido principal'},
                {'text': '<article>', 'label': 'article - Artículo'},
                {'text': '<aside>', 'label': 'aside - Contenido lateral'},
                {'text': '<h1>', 'label': 'h1 - Título principal'},
                {'text': '<h2>', 'label': 'h2 - Subtítulo'},
                {'text': '<p>', 'label': 'p - Párrafo'},
                {'text': '<a href="">', 'label': 'a - Enlace'},
                {'text': '<img src="" alt="">', 'label': 'img - Imagen'},
                {'text': '<button>', 'label': 'button - Botón'},
                {'text': '<form>', 'label': 'form - Formulario'},
                {'text': '<input type="text">', 'label': 'input - Campo de entrada'},
                {'text': '<ul>', 'label': 'ul - Lista desordenada'},
                {'text': '<ol>', 'label': 'ol - Lista ordenada'},
                {'text': '<li>', 'label': 'li - Elemento de lista'},
                {'text': '<table>', 'label': 'table - Tabla'},
                {'text': '<span>', 'label': 'span - Contenedor inline'},
            ],
            'css': [
                {'text': 'display: flex;', 'label': 'display: flex'},
                {'text': 'display: grid;', 'label': 'display: grid'},
                {'text': 'display: block;', 'label': 'display: block'},
                {'text': 'display: none;', 'label': 'display: none'},
                {'text': 'position: relative;', 'label': 'position: relative'},
                {'text': 'position: absolute;', 'label': 'position: absolute'},
                {'text': 'position: fixed;', 'label': 'position: fixed'},
                {'text': 'background-color: #', 'label': 'background-color'},
                {'text': 'color: #', 'label': 'color'},
                {'text': 'font-size: ', 'label': 'font-size'},
                {'text': 'font-weight: bold;', 'label': 'font-weight'},
                {'text': 'margin: ', 'label': 'margin'},
                {'text': 'padding: ', 'label': 'padding'},
                {'text': 'border: 1px solid #', 'label': 'border'},
                {'text': 'border-radius: ', 'label': 'border-radius'},
                {'text': 'width: ', 'label': 'width'},
                {'text': 'height: ', 'label': 'height'},
                {'text': 'max-width: ', 'label': 'max-width'},
                {'text': 'text-align: center;', 'label': 'text-align'},
                {'text': 'align-items: center;', 'label': 'align-items'},
                {'text': 'justify-content: center;', 'label': 'justify-content'},
            ],
            'js': [
                {'text': 'document.getElementById("")', 'label': 'getElementById'},
                {'text': 'document.querySelector("")', 'label': 'querySelector'},
                {'text': 'document.querySelectorAll("")', 'label': 'querySelectorAll'},
                {'text': 'addEventListener("click", function() {})', 'label': 'addEventListener'},
                {'text': 'function name() {}', 'label': 'function'},
                {'text': 'const name = () => {}', 'label': 'arrow function'},
                {'text': 'if (condition) {}', 'label': 'if statement'},
                {'text': 'for (let i = 0; i < length; i++) {}', 'label': 'for loop'},
                {'text': 'forEach(item => {})', 'label': 'forEach'},
                {'text': 'map(item => {})', 'label': 'map'},
                {'text': 'filter(item => {})', 'label': 'filter'},
                {'text': 'fetch(url).then(response => {})', 'label': 'fetch'},
                {'text': 'console.log()', 'label': 'console.log'},
                {'text': 'return ', 'label': 'return'},
                {'text': 'try {} catch(error) {}', 'label': 'try/catch'},
            ]
        }
        
        lista = sugerencias.get(tipo, [])
        
        if query:
            lista = [s for s in lista if query in s['text'].lower() or query in s['label'].lower()]
        
        return jsonify(lista)
    
    # ═══════════════════════════════════════════════════════
    # VISTA RESPONSIVA
    # ═══════════════════════════════════════════════════════
    
    @app.route('/api/preview/<int:width>')
    def api_preview_width(width):
        """Obtener HTML para preview con ancho específico"""
        global editor
        
        if not editor:
            return ""
        
        html = editor.obtener_html_para_preview()
        
        # Inyectar script de responsividad
        script = f"""
        <script>
            (function() {{
                const targetWidth = {width};
                const scale = window.innerWidth / targetWidth;
                document.body.style.transform = 'scale(' + scale + ')';
                document.body.style.transformOrigin = 'top left';
                document.body.style.width = targetWidth + 'px';
            }})();
        </script>
        """
        
        return html.replace('</body>', script + '</body>')

    # ═══════════════════════════════════════════════════════
    # SERVIDOR DE ARCHIVOS DEL PROYECTO (IMÁGENES, ETC)
    # ═══════════════════════════════════════════════════════
    
    @app.route('/project-files/<path:filename>')
    def serve_project_files(filename):
        """Sirve imágenes buscando en la carpeta del proyecto y en las adicionales"""
        global editor
        
        rutas_para_buscar = []
        
        # 1. Ruta principal del proyecto
        if editor and editor.archivo_principal:
            rutas_para_buscar.append(editor.archivo_principal)
            
        # 2. Rutas adicionales (las que el usuario vaya añadiendo)
        if editor and editor.carpetas_adicionales:
            rutas_para_buscar.extend(editor.carpetas_adicionales)
            
        # Buscar en todas las rutas permitidas
        for base_dir in rutas_para_buscar:
            safe_path = os.path.join(base_dir, filename)
            if os.path.abspath(safe_path).startswith(os.path.abspath(base_dir)):
                if os.path.exists(safe_path):
                    return send_file(safe_path)
                    
        return "Archivo no encontrado", 404
    
    @app.route('/api/fix-missing-path', methods=['POST'])
    def api_fix_missing_path():
        """Abre ventana para buscar la carpeta de una imagen rota"""
        global editor
        
        data = request.get_json()
        missing_src = data.get('src', '')
        
        import tkinter as tk
        from tkinter import filedialog
        
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        
        # Mensaje para el usuario
        msg = f"No se encontró: {missing_src}\n\nSelecciona la carpeta donde están las imágenes:"
        nueva_carpeta = filedialog.askdirectory(title=msg)
        root.destroy()
        
        if nueva_carpeta and editor:
            # Guardamos la carpeta para futuras búsquedas
            if nueva_carpeta not in editor.carpetas_adicionales:
                editor.carpetas_adicionales.append(nueva_carpeta)
                
            return jsonify({'success': True, 'carpeta': nueva_carpeta})
            
        return jsonify({'success': False})

    return app
