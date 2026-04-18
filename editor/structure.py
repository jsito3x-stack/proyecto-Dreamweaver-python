# -*- coding: utf-8 -*-
"""
Estructura Web - Definición de elementos y secciones web estándar
"""

ESTRUCTURA_WEB = {
    # ════════════════════════════════════════════════════════
    # NIVEL 0: DOCUMENTO RAÍZ
    # ════════════════════════════════════════════════════════
    'doctype': {
        'orden': 0, 'nombre': 'DOCTYPE', 'descripcion': 'Declaración de tipo documento',
        'icono': '📄', 'color': '#94a3b8', 'padre': None
    },
    'html': {
        'orden': 1, 'nombre': 'HTML', 'descripcion': 'Elemento raíz del documento',
        'icono': '🌐', 'color': '#f59e0b', 'padre': None
    },
    
    # ════════════════════════════════════════════════════════
    # NIVEL 1: HEAD Y BODY
    # ════════════════════════════════════════════════════════
    'head': {
        'orden': 10, 'nombre': 'HEAD', 'descripcion': 'Metadatos e información técnica',
        'icono': '🧠', 'color': '#6366f1', 'padre': 'html'
    },
    'body': {
        'orden': 90, 'nombre': 'BODY', 'descripcion': 'Cuerpo visible de la página',
        'icono': '👤', 'color': '#10b981', 'padre': 'html'
    },
    
    # ════════════════════════════════════════════════════════
    # DENTRO DE HEAD
    # ════════════════════════════════════════════════════════
    'meta_charset': {
        'orden': 11, 'nombre': 'Meta Charset', 'descripcion': 'Codificación UTF-8',
        'icono': '🔤', 'color': '#8b5cf6', 'padre': 'head'
    },
    'meta_viewport': {
        'orden': 12, 'nombre': 'Meta Viewport', 'descripcion': 'Configuración responsive',
        'icono': '📱', 'color': '#06b6d4', 'padre': 'head'
    },
    'meta_description': {
        'orden': 13, 'nombre': 'Meta Description', 'descripcion': 'Descripción para SEO',
        'icono': '📝', 'color': '#84cc16', 'padre': 'head'
    },
    'meta_keywords': {
        'orden': 14, 'nombre': 'Meta Keywords', 'descripcion': 'Palabras clave SEO',
        'icono': '🏷️', 'color': '#a3e635', 'padre': 'head'
    },
    'title': {
        'orden': 15, 'nombre': 'Title', 'descripcion': 'Título de la pestaña',
        'icono': '🏷️', 'color': '#f59e0b', 'padre': 'head'
    },
    'link_favicon': {
        'orden': 16, 'nombre': 'Favicon', 'descripcion': 'Icono de la pestaña',
        'icono': '🔖', 'color': '#ec4899', 'padre': 'head'
    },
    'link_css': {
        'orden': 17, 'nombre': 'CSS Externo', 'descripcion': 'Archivos CSS enlazados',
        'icono': '🎨', 'color': '#8b5cf6', 'padre': 'head'
    },
    'style_inline': {
        'orden': 18, 'nombre': 'CSS Inline', 'descripcion': 'Estilos embebidos',
        'icono': '🎭', 'color': '#d946ef', 'padre': 'head'
    },
    'script_head': {
        'orden': 19, 'nombre': 'Scripts Head', 'descripcion': 'JavaScript en head',
        'icono': '⚡', 'color': '#fbbf24', 'padre': 'head'
    },
    'og_tags': {
        'orden': 20, 'nombre': 'Open Graph', 'descripcion': 'Metadatos redes sociales',
        'icono': '📘', 'color': '#1877f2', 'padre': 'head'
    },
    
    # ════════════════════════════════════════════════════════
    # DENTRO DE BODY - HEADER
    # ════════════════════════════════════════════════════════
    'skip_link': {
        'orden': 91, 'nombre': 'Skip Link', 'descripcion': 'Enlace de accesibilidad',
        'icono': '♿', 'color': '#a78bfa', 'padre': 'body'
    },
    'header': {
        'orden': 100, 'nombre': 'HEADER', 'descripcion': 'Cabecera de la página',
        'icono': '🎭', 'color': '#ef4444', 'padre': 'body'
    },
    'header_logo': {
        'orden': 101, 'nombre': 'Logo', 'descripcion': 'Logo del sitio',
        'icono': '🏢', 'color': '#f59e0b', 'padre': 'header'
    },
    'nav_principal': {
        'orden': 103, 'nombre': 'Navegación', 'descripcion': 'Menú principal',
        'icono': '🧭', 'color': '#6366f1', 'padre': 'header'
    },
    'nav_menu': {
        'orden': 104, 'nombre': 'Menú', 'descripcion': 'Enlaces del menú',
        'icono': '📋', 'color': '#8b5cf6', 'padre': 'nav_principal'
    },
    'header_busqueda': {
        'orden': 107, 'nombre': 'Búsqueda', 'descripcion': 'Barra de búsqueda',
        'icono': '🔍', 'color': '#06b6d4', 'padre': 'header'
    },
    'header_usuario': {
        'orden': 108, 'nombre': 'Usuario', 'descripcion': 'Login, registro, carrito',
        'icono': '👤', 'color': '#ef4444', 'padre': 'header'
    },
    
    # ════════════════════════════════════════════════════════
    # DENTRO DE BODY - HERO
    # ════════════════════════════════════════════════════════
    'hero': {
        'orden': 120, 'nombre': 'HERO', 'descripcion': 'Banner principal',
        'icono': '🌟', 'color': '#8b5cf6', 'padre': 'body'
    },
    'hero_titulo': {
        'orden': 121, 'nombre': 'Título Hero', 'descripcion': 'Título principal',
        'icono': '💬', 'color': '#ec4899', 'padre': 'hero'
    },
    'hero_cta': {
        'orden': 123, 'nombre': 'CTA Hero', 'descripcion': 'Botón llamada a la acción',
        'icono': '🎯', 'color': '#f59e0b', 'padre': 'hero'
    },
    
    # ════════════════════════════════════════════════════════
    # DENTRO DE BODY - MAIN
    # ════════════════════════════════════════════════════════
    'main': {
        'orden': 140, 'nombre': 'MAIN', 'descripcion': 'Contenido principal',
        'icono': '📑', 'color': '#10b981', 'padre': 'body'
    },
    'section_features': {
        'orden': 150, 'nombre': 'Features', 'descripcion': 'Características',
        'icono': '✨', 'color': '#8b5cf6', 'padre': 'main'
    },
    'section_about': {
        'orden': 160, 'nombre': 'About', 'descripcion': 'Sobre nosotros',
        'icono': 'ℹ️', 'color': '#a78bfa', 'padre': 'main'
    },
    'section_services': {
        'orden': 170, 'nombre': 'Services', 'descripcion': 'Servicios',
        'icono': '⚙️', 'color': '#6366f1', 'padre': 'main'
    },
    'section_portfolio': {
        'orden': 180, 'nombre': 'Portfolio', 'descripcion': 'Galería de trabajos',
        'icono': '🖼️', 'color': '#ec4899', 'padre': 'main'
    },
    'section_testimonios': {
        'orden': 190, 'nombre': 'Testimonios', 'descripcion': 'Opiniones',
        'icono': '💬', 'color': '#f59e0b', 'padre': 'main'
    },
    'section_pricing': {
        'orden': 200, 'nombre': 'Pricing', 'descripcion': 'Planes y precios',
        'icono': '💰', 'color': '#10b981', 'padre': 'main'
    },
    'section_blog': {
        'orden': 240, 'nombre': 'Blog', 'descripcion': 'Artículos y noticias',
        'icono': '📰', 'color': '#f59e0b', 'padre': 'main'
    },
    'section_contacto': {
        'orden': 290, 'nombre': 'Contact', 'descripcion': 'Formulario contacto',
        'icono': '📧', 'color': '#10b981', 'padre': 'main'
    },
    
    # ════════════════════════════════════════════════════════
    # DENTRO DE BODY - ASIDE
    # ════════════════════════════════════════════════════════
    'aside': {
        'orden': 310, 'nombre': 'ASIDE', 'descripcion': 'Barra lateral',
        'icono': '📋', 'color': '#f59e0b', 'padre': 'body'
    },
    
    # ════════════════════════════════════════════════════════
    # DENTRO DE BODY - FOOTER
    # ════════════════════════════════════════════════════════
    'footer': {
        'orden': 500, 'nombre': 'FOOTER', 'descripcion': 'Pie de página',
        'icono': '🔻', 'color': '#1f2937', 'padre': 'body'
    },
    'footer_legal': {
        'orden': 510, 'nombre': 'Legal', 'descripcion': 'Copyright, términos',
        'icono': '⚖️', 'color': '#64748b', 'padre': 'footer'
    },
    'footer_social': {
        'orden': 506, 'nombre': 'Social', 'descripcion': 'Redes sociales',
        'icono': '📱', 'color': '#06b6d4', 'padre': 'footer'
    },
    
    # ════════════════════════════════════════════════════════
    # DENTRO DE BODY - SCRIPTS
    # ════════════════════════════════════════════════════════
    'scripts_footer': {
        'orden': 800, 'nombre': 'Scripts', 'descripcion': 'JavaScript al final',
        'icono': '⚡', 'color': '#fbbf24', 'padre': 'body'
    },
    
    # ════════════════════════════════════════════════════════
    # ELEMENTOS GENÉRICOS
    # ════════════════════════════════════════════════════════
    'div': {'orden': 999, 'nombre': 'Div', 'descripcion': 'Contenedor genérico', 'icono': '📦', 'color': '#64748b'},
    'section': {'orden': 999, 'nombre': 'Section', 'descripcion': 'Sección genérica', 'icono': '📄', 'color': '#64748b'},
    'article': {'orden': 999, 'nombre': 'Article', 'descripcion': 'Artículo', 'icono': '📰', 'color': '#64748b'},
    'p': {'orden': 999, 'nombre': 'Párrafo', 'descripcion': 'Párrafo de texto', 'icono': '📝', 'color': '#94a3b8'},
    'h1': {'orden': 999, 'nombre': 'H1', 'descripcion': 'Título principal', 'icono': '📌', 'color': '#ef4444'},
    'h2': {'orden': 999, 'nombre': 'H2', 'descripcion': 'Subtítulo', 'icono': '📌', 'color': '#f97316'},
    'h3': {'orden': 999, 'nombre': 'H3', 'descripcion': 'Sub-subtítulo', 'icono': '📌', 'color': '#f59e0b'},
    'h4': {'orden': 999, 'nombre': 'H4', 'descripcion': 'Título nivel 4', 'icono': '📌', 'color': '#eab308'},
    'h5': {'orden': 999, 'nombre': 'H5', 'descripcion': 'Título nivel 5', 'icono': '📌', 'color': '#84cc16'},
    'h6': {'orden': 999, 'nombre': 'H6', 'descripcion': 'Título nivel 6', 'icono': '📌', 'color': '#22c55e'},
    'a': {'orden': 999, 'nombre': 'Enlace', 'descripcion': 'Hipervínculo', 'icono': '🔗', 'color': '#3b82f6'},
    'img': {'orden': 999, 'nombre': 'Imagen', 'descripcion': 'Imagen', 'icono': '🖼️', 'color': '#ec4899'},
    'ul': {'orden': 999, 'nombre': 'Lista UL', 'descripcion': 'Lista desordenada', 'icono': '📋', 'color': '#8b5cf6'},
    'ol': {'orden': 999, 'nombre': 'Lista OL', 'descripcion': 'Lista ordenada', 'icono': '🔢', 'color': '#8b5cf6'},
    'li': {'orden': 999, 'nombre': 'Item Lista', 'descripcion': 'Elemento de lista', 'icono': '•', 'color': '#a78bfa'},
    'span': {'orden': 999, 'nombre': 'Span', 'descripcion': 'Contenedor inline', 'icono': '📄', 'color': '#94a3b8'},
    'button': {'orden': 999, 'nombre': 'Botón', 'descripcion': 'Botón interactivo', 'icono': '🔘', 'color': '#ef4444'},
    'input': {'orden': 999, 'nombre': 'Input', 'descripcion': 'Campo de entrada', 'icono': '✏️', 'color': '#6366f1'},
    'form': {'orden': 999, 'nombre': 'Form', 'descripcion': 'Formulario', 'icono': '📋', 'color': '#10b981'},
    'table': {'orden': 999, 'nombre': 'Tabla', 'descripcion': 'Tabla de datos', 'icono': '📊', 'color': '#06b6d4'},
    'video': {'orden': 999, 'nombre': 'Video', 'descripcion': 'Video', 'icono': '🎬', 'color': '#ef4444'},
    'iframe': {'orden': 999, 'nombre': 'Iframe', 'descripcion': 'Contenido embebido', 'icono': '🖼️', 'color': '#8b5cf6'},
    'figure': {'orden': 999, 'nombre': 'Figure', 'descripcion': 'Figura con caption', 'icono': '🖼️', 'color': '#ec4899'},
    'figcaption': {'orden': 999, 'nombre': 'Figcaption', 'descripcion': 'Caption de figura', 'icono': '📝', 'color': '#94a3b8'},
}

# Iconos para tipos de archivo
ICONOS_ARCHIVOS = {
    'html': ('fab fa-html5', '#e34f26'),
    'htm': ('fab fa-html5', '#e34f26'),
    'css': ('fab fa-css3-alt', '#264de4'),
    'js': ('fab fa-js-square', '#f7df1e'),
    'json': ('fas fa-code', '#292929'),
    'png': ('fas fa-image', '#10b981'),
    'jpg': ('fas fa-image', '#10b981'),
    'jpeg': ('fas fa-image', '#10b981'),
    'svg': ('fas fa-vector-square', '#fbbf24'),
    'gif': ('fas fa-image', '#ec4899'),
    'folder': ('fas fa-folder', '#fbbf24'),
}
