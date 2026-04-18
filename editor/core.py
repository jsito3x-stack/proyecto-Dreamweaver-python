# -*- coding: utf-8 -*-
"""
Core del Editor - Lógica principal del editor visual
"""

import os
import re
import json
from datetime import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Set
from bs4 import BeautifulSoup, Tag, NavigableString
from .structure import ESTRUCTURA_WEB


@dataclass
class ArchivoProyecto:
    """Representa un archivo del proyecto"""
    ruta: str
    nombre: str
    tipo: str  # 'html', 'css', 'js', 'img', 'folder'
    contenido: str = ""
    hijos: List['ArchivoProyecto'] = field(default_factory=list)
    modificado: bool = False


@dataclass
class HistorialEntry:
    """Entrada del historial de cambios"""
    accion: str
    xpath: str
    antes: str = ""
    despues: str = ""
    timestamp: str = ""
    
    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now().isoformat()


class EditorCore:
    """
    Núcleo del editor con todas las funcionalidades:
    - Parsing y manipulación de HTML/CSS/JS
    - Gestión de estructura jerárquica
    - Sistema de historial (undo/redo)
    - Exportación y guardado
    """
    
    def __init__(self):
        self.archivo_principal: Optional[str] = None
        self.proyecto: Dict[str, ArchivoProyecto] = {}
        self.archivo_actual: Optional[str] = None
        self.soup: Optional[BeautifulSoup] = None
        self.historial: List[HistorialEntry] = []
        self.historial_index: int = -1
        self.elementos_ocultos: Set[str] = set()
        self.tema_actual: str = 'dark'
        self.max_historial: int = 50
        self.carpetas_adicionales: List[str] = []
        
    # ═══════════════════════════════════════════════════════
    # CARGA DE ARCHIVOS
    # ═══════════════════════════════════════════════════════
    
    def cargar_archivo(self, ruta: str) -> bool:
        """Cargar un archivo HTML, CSS o JS"""
        try:
            with open(ruta, 'r', encoding='utf-8') as f:
                contenido = f.read()
            
            nombre = os.path.basename(ruta)
            self.archivo_actual = nombre
            
            ext = os.path.splitext(ruta)[1].lower()
            tipo = 'html' if ext in ['.html', '.htm'] else 'css' if ext == '.css' else 'js' if ext == '.js' else 'otro'
            
            self.proyecto[nombre] = ArchivoProyecto(
                ruta=ruta,
                nombre=nombre,
                tipo=tipo,
                contenido=contenido
            )
            
            if tipo == 'html':
                self.soup = BeautifulSoup(contenido, 'html.parser')
                self._detectar_archivos_vinculados()
                self.archivo_principal = ruta
            
            self._limpiar_historial()
            return True
            
        except FileNotFoundError:
            return False
        except Exception as e:
            print(f"Error cargando {ruta}: {e}")
            return False
    
    def cargar_proyecto(self, directorio: str) -> bool:
        """Cargar un directorio completo como proyecto"""
        try:
            directorio = os.path.abspath(directorio)
            
            for raiz, dirs, archivos in os.walk(directorio):
                # Ignorar carpetas ocultas y comunes
                dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__', 'venv']]
                
                for archivo in archivos:
                    ext = os.path.splitext(archivo)[1].lower()
                    ruta = os.path.join(raiz, archivo)
                    nombre_relativo = os.path.relpath(ruta, directorio)
                    
                    # Extensiones de código (Las leemos para el editor)
                    if ext in ['.html', '.htm', '.css', '.js']:
                        try:
                            with open(ruta, 'r', encoding='utf-8') as f:
                                contenido = f.read()
                            tipo_real = 'html' if ext in ['.html', '.htm'] else 'css' if ext == '.css' else 'js'
                        except:
                            continue
                    # Extensiones multimedia y otras (Solo las anotamos, NO leemos su contenido)
                    else:
                        contenido = None
                        tipo_real = ext.lstrip('.') # El tipo será 'jpg', 'png', etc.
                    
                    self.proyecto[nombre_relativo] = ArchivoProyecto(
                        ruta=ruta,
                        nombre=nombre_relativo,
                        tipo=tipo_real,
                        contenido=contenido
                    )
            
            # ═══ REGISTRAR CARPETAS VACÍAS (Para que el árbol las dibuje) ═══
            for raiz_dir, subdirs, _ in os.walk(directorio):
                for subcarpeta in subdirs:
                    if subcarpeta.startswith('.') or subcarpeta in ['node_modules', '__pycache__', 'venv']:
                        continue
                    
                    ruta_completa = os.path.join(raiz_dir, subcarpeta)
                    nombre_relativo = os.path.relpath(ruta_completa, directorio).replace('\\', '/')
                    
                    # Si la carpeta NO existe en el proyecto, la creamos marcándola como 'folder'
                    if nombre_relativo not in self.proyecto:
                        self.proyecto[nombre_relativo] = ArchivoProyecto(
                            ruta=ruta_completa,
                            nombre=nombre_relativo,
                            tipo='folder', # Tipo especial para carpetas vacías
                            contenido=None
                        )

            # ═══ NUEVO COMPORTAMIENTO: NO auto-abrir archivos ═══
            # El usuario debe hacer clic en el explorador para abrir archivos
            self.archivo_actual = None       # ← Ningún archivo activo al inicio
            self.soup = None                  # ← Sin HTML procesado
            self.archivo_principal = directorio
            self._limpiar_historial()
            
            print(f"✅ Proyecto cargado: {len(self.proyecto)} archivos")
            print(f"ℹ️  Esperando que el usuario seleccione un archivo...")
            
            return True
            
        except Exception as e:
            print(f"Error cargando proyecto: {e}")
            return False
    
    def _detectar_archivos_vinculados(self):
        """Detectar archivos CSS y JS vinculados en el HTML"""
        if not self.soup:
            return
        
        base_dir = os.path.dirname(self.archivo_principal) if self.archivo_principal else '.'
        
        # CSS
        for link in self.soup.find_all('link', rel='stylesheet'):
            href = link.get('href', '')
            if href and not href.startswith(('http', '//', 'data:')):
                ruta_css = os.path.normpath(os.path.join(base_dir, href))
                if os.path.exists(ruta_css):
                    nombre = os.path.basename(ruta_css)
                    if nombre not in self.proyecto:
                        try:
                            with open(ruta_css, 'r', encoding='utf-8') as f:
                                self.proyecto[nombre] = ArchivoProyecto(
                                    ruta=ruta_css,
                                    nombre=nombre,
                                    tipo='css',
                                    contenido=f.read()
                                )
                        except:
                            pass
        
        # JavaScript
        for script in self.soup.find_all('script', src=True):
            src = script.get('src', '')
            if src and not src.startswith(('http', '//')):
                ruta_js = os.path.normpath(os.path.join(base_dir, src))
                if os.path.exists(ruta_js):
                    nombre = os.path.basename(ruta_js)
                    if nombre not in self.proyecto:
                        try:
                            with open(ruta_js, 'r', encoding='utf-8') as f:
                                self.proyecto[nombre] = ArchivoProyecto(
                                    ruta=ruta_js,
                                    nombre=nombre,
                                    tipo='js',
                                    contenido=f.read()
                                )
                        except:
                            pass
    
    # ═══════════════════════════════════════════════════════
    # ESTRUCTURA DEL DOCUMENTO
    # ═══════════════════════════════════════════════════════
    
    def obtener_estructura_jerarquica(self) -> Dict:
        """Obtener estructura del documento en formato jerárquico"""
        if not self.soup:
            return {'name': 'Documento vacío', 'icono': '📄', 'color': '#64748b', 'children': []}
        
        html_elem = self.soup.find('html')
        if not html_elem:
            return {'name': 'Sin documento', 'icono': '📄', 'color': '#64748b', 'children': []}
        
        return self._construir_nodo(html_elem, 0)
    
    def _construir_nodo(self, elemento: Tag, nivel: int) -> Dict:
        """Construir nodo del árbol recursivamente"""
        if not elemento or not hasattr(elemento, 'name'):
            return None
        
        tag = elemento.name
        id_elem = elemento.get('id', '')
        clases = ' '.join(elemento.get('class', []))
        
        # Texto truncado
        texto = ' '.join(list(elemento.stripped_strings)[:2])[:50]
        
        # Info de clasificación
        info = self._clasificar_elemento(elemento)
        xpath = self._obtener_xpath(elemento)
        
        nodo = {
            'name': tag.upper(),
            'tag': tag,
            'id': id_elem,
            'clases': clases,
            'texto': texto,
            'icono': info.get('icono', '📦'),
            'color': info.get('color', '#94a3b8'),
            'seccion': info.get('nombre', tag.upper()),
            'descripcion': info.get('descripcion', ''),
            'xpath': xpath,
            'nivel': nivel,
            'visible': xpath not in self.elementos_ocultos,
            'children': []
        }
        
        # Agregar ID o clase al nombre
        if id_elem:
            nodo['name'] += f' #{id_elem}'
        elif clases:
            nodo['name'] += f' .{clases.split()[0]}'
        
        # Construir hijos
        for hijo in elemento.children:
            if isinstance(hijo, Tag) and hijo.name not in ['[document]']:
                nodo_hijo = self._construir_nodo(hijo, nivel + 1)
                if nodo_hijo:
                    nodo['children'].append(nodo_hijo)
        
        return nodo
    
    def _clasificar_elemento(self, elem: Tag) -> Dict:
        """Clasificar elemento según estructura web"""
        tag = elem.name.lower()
        id_elem = (elem.get('id', '') or '').lower()
        clases = ' '.join(elem.get('class', [])).lower()
        padre = elem.parent.name if elem.parent else ''
        
        combined = f"{id_elem} {clases}".lower()
        
        # Buscar en estructura predefinida
        for key, data in ESTRUCTURA_WEB.items():
            if key == tag:
                return data
            if key in combined:
                return data
        
        # Por contexto
        if padre in ['head']:
            return {'nombre': tag.upper(), 'icono': '🔤', 'color': '#8b5cf6', 'descripcion': f'En <{padre}>'}
        
        # Por defecto
        return {'nombre': tag.upper(), 'icono': '📦', 'color': '#94a3b8', 'descripcion': f'Elemento {tag}'}
    
    def _obtener_xpath(self, elemento: Tag) -> str:
        """Obtener XPath de un elemento"""
        partes = []
        actual = elemento
        
        while actual and hasattr(actual, 'name') and actual.name != '[document]':
            idx = 0
            hermano = actual.previous_sibling
            
            while hermano:
                if hasattr(hermano, 'name') and hermano.name == actual.name:
                    idx += 1
                hermano = hermano.previous_sibling
            
            tag = actual.name.lower()
            if idx > 0:
                tag += f'[{idx + 1}]'
            partes.insert(0, tag)
            actual = actual.parent
        
        return '/' + '/'.join(partes)
    
    # ═══════════════════════════════════════════════════════
    # OPERACIONES CON ELEMENTOS
    # ═══════════════════════════════════════════════════════
    
    def obtener_elemento(self, xpath: str) -> Optional[Dict]:
        """Obtener detalles de un elemento"""
        elem = self._buscar_por_xpath(xpath)
        if not elem:
            return None
        
        return {
            'tag': elem.name,
            'id': elem.get('id', ''),
            'clases': ' '.join(elem.get('class', [])),
            'atributos': dict(elem.attrs),
            'contenido': elem.decode_contents() if elem.name not in ['img', 'br', 'hr', 'input', 'meta', 'link'] else '',
            'texto': elem.get_text()[:200],
            'xpath': xpath,
            'estilos': self._extraer_estilos(elem)
        }
    
    def _extraer_estilos(self, elem: Tag) -> Dict:
        """Extraer estilos inline"""
        estilo = elem.get('style', '')
        estilos = {}
        if estilo:
            for decl in estilo.split(';'):
                if ':' in decl:
                    prop, valor = decl.split(':', 1)
                    estilos[prop.strip()] = valor.strip()
        return estilos
    
    def actualizar_elemento(self, xpath: str, datos: Dict) -> bool:
        """Actualizar un elemento con nuevos datos"""
        elem = self._buscar_por_xpath(xpath)
        if not elem:
            return False
        
        # Guardar estado anterior en historial
        estado_anterior = str(elem)
        
        # Actualizar ID
        if 'id' in datos:
            if datos['id']:
                elem['id'] = datos['id']
            elif 'id' in elem.attrs:
                del elem['id']
        
        # Actualizar clases
        if 'clases' in datos:
            if datos['clases']:
                elem['class'] = datos['clases'].split()
            elif 'class' in elem.attrs:
                del elem['class']
        
        # Actualizar atributos adicionales
        if 'atributos' in datos:
            for attr, valor in datos['atributos'].items():
                if valor:
                    elem[attr] = valor
                elif attr in elem.attrs:
                    del elem[attr]
        
        # Actualizar contenido
        if 'contenido' in datos and elem.name not in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            elem.clear()
            elem.append(NavigableString(datos['contenido']))
        
        # Actualizar estilos inline
        if 'estilos' in datos:
            estilo_str = '; '.join(f"{k}: {v}" for k, v in datos['estilos'].items() if v)
            if estilo_str:
                elem['style'] = estilo_str
            elif 'style' in elem.attrs:
                del elem['style']
        
        # Guardar en historial
        self._agregar_historial('actualizar', xpath, estado_anterior, str(elem))
        
        return True
    
    def crear_elemento(self, padre_xpath: str, tag: str, atributos: Dict = None, contenido: str = '') -> tuple:
        """Crear nuevo elemento"""
        padre = self._buscar_por_xpath(padre_xpath)
        if not padre:
            return False, None
        
        nuevo = self.soup.new_tag(tag)
        
        if atributos:
            for k, v in atributos.items():
                nuevo[k] = v
        
        if contenido and tag not in ['img', 'br', 'hr', 'input', 'meta', 'link']:
            nuevo.string = contenido
        
        padre.append(nuevo)
        
        nuevo_xpath = self._obtener_xpath(nuevo)
        
        self._agregar_historial('crear', nuevo_xpath, '', str(nuevo))
        
        return True, nuevo_xpath
    
    def eliminar_elemento(self, xpath: str) -> tuple:
        """Eliminar elemento"""
        elem = self._buscar_por_xpath(xpath)
        if not elem:
            return False, None
        
        info = self.obtener_elemento(xpath)
        estado_anterior = str(elem)
        elem.decompose()
        
        self._agregar_historial('eliminar', xpath, estado_anterior, '')
        
        return True, info
    
    def duplicar_elemento(self, xpath: str) -> tuple:
        """Duplicar elemento"""
        elem = self._buscar_por_xpath(xpath)
        if not elem:
            return False, None
        
        padre = elem.parent
        if not padre:
            return False, None
        
        copia = BeautifulSoup(str(elem), 'html.parser').find()
        padre.append(copia)
        
        nuevo_xpath = self._obtener_xpath(copia)
        
        self._agregar_historial('duplicar', nuevo_xpath, '', str(copia))
        
        return True, nuevo_xpath
    
    def mover_elemento(self, xpath_origen: str, xpath_destino: str, posicion: str = 'dentro') -> bool:
        """Mover elemento a otra posición"""
        elem = self._buscar_por_xpath(xpath_origen)
        destino = self._buscar_por_xpath(xpath_destino)
        
        if not elem or not destino:
            return False
        
        estado_anterior = str(elem)
        elem.extract()
        
        if posicion == 'antes':
            destino.insert_before(elem)
        elif posicion == 'despues':
            destino.insert_after(elem)
        else:
            destino.append(elem)
        
        self._agregar_historial('mover', xpath_origen, estado_anterior, str(elem))
        
        return True
    
    def toggle_visibilidad(self, xpath: str) -> bool:
        """Toggle visibilidad de un elemento"""
        if xpath in self.elementos_ocultos:
            self.elementos_ocultos.discard(xpath)
        else:
            self.elementos_ocultos.add(xpath)
        return True
    
    # ═══════════════════════════════════════════════════════
    # HISTORIAL (UNDO/REDO)
    # ═══════════════════════════════════════════════════════
    
    def _agregar_historial(self, accion: str, xpath: str, antes: str = '', despues: str = ''):
        """Agregar entrada al historial"""
        entry = HistorialEntry(accion=accion, xpath=xpath, antes=antes, despues=despues)
        
        # Eliminar entradas futuras si estamos en medio del historial
        if self.historial_index < len(self.historial) - 1:
            self.historial = self.historial[:self.historial_index + 1]
        
        self.historial.append(entry)
        
        # Limitar tamaño del historial
        if len(self.historial) > self.max_historial:
            self.historial = self.historial[-self.max_historial:]
        
        self.historial_index = len(self.historial) - 1
    
    def _limpiar_historial(self):
        """Limpiar historial"""
        self.historial = []
        self.historial_index = -1
    
    def deshacer(self) -> tuple:
        """Deshacer última acción"""
        if self.historial_index < 0:
            return False, "Nada que deshacer"
        
        entry = self.historial[self.historial_index]
        
        if entry.accion == 'eliminar':
            # Restaurar elemento eliminado
            elem = self._buscar_por_xpath(entry.xpath)
            if elem:
                padre = elem.parent
                if padre:
                    nuevo = BeautifulSoup(entry.antes, 'html.parser').find()
                    padre.append(nuevo)
        
        self.historial_index -= 1
        self._reconstruir_soup()
        
        return True, f"Deshecho: {entry.accion}"
    
    def rehacer(self) -> tuple:
        """Rehacer última acción deshecha"""
        if self.historial_index >= len(self.historial) - 1:
            return False, "Nada que rehacer"
        
        self.historial_index += 1
        self._reconstruir_soup()
        
        entry = self.historial[self.historial_index]
        return True, f"Rehecho: {entry.accion}"
    
    def _reconstruir_soup(self):
        """Reconstruir soup desde el historial"""
        # Esta es una versión simplificada
        # En una implementación completa, se reconstruiría desde el historial
        pass
    
    # ═══════════════════════════════════════════════════════
    # BÚSQUEDA
    # ═══════════════════════════════════════════════════════
    
    def _buscar_por_xpath(self, xpath: str) -> Optional[Tag]:
        """Buscar elemento por XPath"""
        if not self.soup:
            return None
        
        try:
            partes = xpath.strip('/').split('/')
            elem = self.soup
            
            for parte in partes:
                if '[' in parte:
                    tag = parte.split('[')[0]
                    idx = int(parte.split('[')[1].rstrip(']')) - 1
                    hijos = elem.find_all(tag, recursive=False)
                    if idx < len(hijos):
                        elem = hijos[idx]
                    else:
                        return None
                else:
                    elem = elem.find(parte, recursive=False)
                
                if not elem:
                    return None
            
            return elem
        except:
            return None
    
    # ═══════════════════════════════════════════════════════
    # EXPORTACIÓN
    # ═══════════════════════════════════════════════════════
    
    def obtener_elemento_por_dw_id(self, dw_id: int) -> Optional[Dict]:
        """Buscar elemento exacto usando el índice inyectado en la vista previa"""
        if not self.soup: return None
        
        count = 0
        def recorrer(elem):
            nonlocal count
            from bs4 import Tag
            if isinstance(elem, Tag):
                if count == dw_id:
                    # ¡Lo encontramos! Extraemos sus datos reales
                    return {
                        'tag': elem.name,
                        'id': elem.get('id', ''),
                        'clases': ' '.join(elem.get('class', [])),
                        'contenido': elem.decode_contents() if elem.name not in ['img', 'br', 'hr', 'input', 'meta', 'link'] else '',
                        'texto': elem.get_text()[:200],
                        'xpath': self._obtener_xpath(elem), # Ahora sí sabemos su XPath real
                        'estilos': self._extraer_estilos(elem)
                    }
                count += 1
                for child in elem.children:
                    res = recorrer(child)
                    if res: return res # <-- Esta línea es vital para que no siga buscando si ya lo encontró
            return None
            
        return recorrer(self.soup)

    def obtener_html(self) -> str:
        """Obtener HTML completo"""
        if self.soup:
            return str(self.soup.prettify())
        return ''
    
    def obtener_html_para_preview(self) -> str:
        """Obtener HTML para preview con estilos de resaltado"""
        if not self.soup:
            return ''
        
        soup_preview = BeautifulSoup(str(self.soup), 'html.parser')
        # Inyectar etiqueta <base> para que las imágenes y CSS relativos funcionen
        head = soup_preview.find('head')
        if head:
            base_tag = soup_preview.new_tag('base')
            base_tag.attrs['href'] = '/project-files/'
            head.insert(0, base_tag)
            
            # INYECTAR DETECTOR DE IMÁGENES ROTAS Y CLICS EN ELEMENTOS
            script_detect = soup_preview.new_tag('script')
            script_detect.string = """
                document.addEventListener('DOMContentLoaded', function() {
                    // 1. Detectar imágenes rotas
                    document.querySelectorAll('img').forEach(img => {
                        img.onerror = function() {
                            this.style.border = '2px dashed red';
                            this.alt = 'IMAGEN ROTA';
                            window.parent.postMessage({ type: 'missing-image', src: this.getAttribute('src') }, '*');
                        };
                    });

                    // 2. TURBO: Solo vigilar etiquetas importantes, ignorar <head>, <script>, <br>, etc.
                    const tagsUtiles = ['DIV','SECTION','HEADER','FOOTER','MAIN','NAV','ARTICLE','ASIDE','P','H1','H2','H3','H4','H5','H6','A','BUTTON','IMG','UL','OL','LI','TABLE','FORM','INPUT','TEXTAREA','SELECT','SPAN','VIDEO','AUDIO'];
                    
                    let index = 0;
                    document.querySelectorAll(tagsUtiles.join(',')).forEach(elem => {
                        elem.setAttribute('data-dw-id', index++);
                        elem.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.parent.postMessage({ 
                                type: 'element-selected', 
                                dwId: this.getAttribute('data-dw-id'),
                                tag: this.tagName.toLowerCase(),
                                id: this.id || '',
                                classes: this.className || ''
                            }, '*');
                        });
                        elem.addEventListener('mouseenter', function() {
                            this.style.outline = '2px dashed #22c55e';
                            this.style.outlineOffset = '2px';
                        });
                        elem.addEventListener('mouseleave', function() {
                            this.style.outline = '';
                            this.style.outlineOffset = '';
                        });
                    });
                });
            """
            head.append(script_detect)
        # Agregar estilos para elementos ocultos y seleccionados
        style = soup_preview.new_tag('style')
        style.string = """
        .dw-hidden { opacity: 0.3; outline: 2px dashed #ef4444 !important; }
        .dw-selected { outline: 2px solid #3b82f6 !important; outline-offset: 2px; }
        .dw-hover:hover { outline: 2px dashed #22c55e !important; cursor: pointer; }
        """
        
        head = soup_preview.find('head')
        if head:
            head.append(style)
        else:
            soup_preview.insert(0, style)
        
        # Marcar elementos ocultos
        for xpath in self.elementos_ocultos:
            elem = self._buscar_por_xpath_en(xpath, soup_preview)
            if elem:
                classes = elem.get('class', [])
                if 'dw-hidden' not in classes:
                    classes.append('dw-hidden')
                    elem['class'] = classes
        
        return str(soup_preview.prettify())
    
    def _buscar_por_xpath_en(self, xpath: str, soup: BeautifulSoup) -> Optional[Tag]:
        """Buscar por XPath en un soup específico"""
        try:
            partes = xpath.strip('/').split('/')
            elem = soup
            
            for parte in partes:
                if '[' in parte:
                    tag = parte.split('[')[0]
                    idx = int(parte.split('[')[1].rstrip(']')) - 1
                    hijos = elem.find_all(tag, recursive=False)
                    if idx < len(hijos):
                        elem = hijos[idx]
                    else:
                        return None
                else:
                    elem = elem.find(parte, recursive=False)
                
                if not elem:
                    return None
            
            return elem
        except:
            return None
    
    def obtener_css(self) -> str:
        """Obtener CSS extraído"""
        css = ''
        if self.soup:
            for style in self.soup.find_all('style'):
                if style.string:
                    css += f"/* === STYLE INLINE === */\n{style.string}\n\n"
        return css
    
    def obtener_js(self) -> str:
        """Obtener JavaScript extraído"""
        js = ''
        if self.soup:
            for script in self.soup.find_all('script'):
                if script.string and not script.get('src'):
                    js += f"// === SCRIPT INLINE ===\n{script.string}\n\n"
        return js
    
    def guardar_archivo(self, ruta: str = None) -> str:
        """Guardar archivo actual"""
        # Freno de seguridad: si no hay HTML cargado, no guardar
        if not self.soup:
            print("Aviso: No se puede guardar porque no hay ningún documento HTML cargado.")
            return ""
            
        if not ruta:
            ruta = f"edited_{self.archivo_actual or 'document.html'}"
        
        os.makedirs('./exports', exist_ok=True)
        ruta_completa = os.path.join('./exports', os.path.basename(ruta))
        
        # Obtener el HTML sin el error
        html_para_guardar = str(self.soup.prettify())
        
        with open(ruta_completa, 'w', encoding='utf-8') as f:
            f.write(html_para_guardar)
        
        # Actualizar en proyecto
        if self.archivo_actual in self.proyecto:
            self.proyecto[self.archivo_actual].contenido = html_para_guardar
            self.proyecto[self.archivo_actual].modificado = False
        
        return ruta_completa
    
    def exportar_proyecto(self, ruta_directorio: str) -> str:
        """Exportar proyecto completo"""
        os.makedirs(ruta_directorio, exist_ok=True)
        
        for nombre, archivo in self.proyecto.items():
            ruta = os.path.join(ruta_directorio, nombre)
            os.makedirs(os.path.dirname(ruta), exist_ok=True)
            
            with open(ruta, 'w', encoding='utf-8') as f:
                f.write(archivo.contenido)
        
        return ruta_directorio
    
    # ═══════════════════════════════════════════════════════
    # SNIPPETS Y COMPONENTES
    # ═══════════════════════════════════════════════════════
    
    def insertar_snippet(self, xpath_padre: str, snippet_html: str) -> tuple:
        """Insertar un snippet de código"""
        padre = self._buscar_por_xpath(xpath_padre)
        if not padre:
            return False, None
        
        nuevo = BeautifulSoup(snippet_html, 'html.parser')
        for elem in nuevo.children:
            if isinstance(elem, Tag):
                padre.append(elem)
        
        self._agregar_historial('insertar_snippet', xpath_padre, '', snippet_html)
        
        return True, xpath_padre
