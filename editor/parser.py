from bs4 import BeautifulSoup, NavigableString, Comment
import re

def parse_html(html_content):
    """Convierte texto en un objeto BeautifulSoup de forma segura"""
    if not html_content:
        html_content = "<!DOCTYPE html><html><head></head><body></body></html>"
    return BeautifulSoup(html_content, "lxml")

def get_full_html(html_content):
    """Devuelve el HTML completo asegurándose de que tiene DOCTYPE"""
    soup = parse_html(html_content)
    # BeautifulSoup a veces pierde el DOCTYPE al usar lxml, lo forzamos
    html_str = str(soup)
    if "<!DOCTYPE html>" not in html_str.upper():
        html_str = "<!DOCTYPE html>\n" + html_str
    return html_str

def get_pretty_html(html_content):
    """Devuelve el código HTML ordenado y tabulado correctamente"""
    soup = parse_html(html_content)
    pretty = soup.prettify()
    if "<!DOCTYPE html>" not in pretty.upper():
        pretty = "<!DOCTYPE html>\n" + pretty
    return pretty

def get_body_content(html_content):
    """Extrae SOLO el interior de la etiqueta <body>"""
    soup = parse_html(html_content)
    body = soup.find("body")
    if body:
        return "".join(str(item) for item in body.contents)
    return html_content

def get_head_content(html_content):
    """Extrae SOLO el interior de la etiqueta <head> (para previsualizar CSS)"""
    soup = parse_html(html_content)
    head = soup.find("head")
    if head:
        return str(head)
    return ""

def find_element(html_content, element_id):
    """Busca un elemento por su ID"""
    soup = parse_html(html_content)
    return soup.find(id=element_id)

def find_elements_by_tag(html_content, tag_name):
    """Busca todos los elementos de un tipo (ej: todos los 'div')"""
    soup = parse_html(html_content)
    return soup.find_all(tag_name)

def update_element_content(html_content, element_id, new_content):
    """Cambia el texto/HTML interior de un elemento"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    if element:
        element.clear()
        # Usamos BeautifulSoup para inyectar el nuevo contenido y no romper etiquetas
        new_soup = BeautifulSoup(new_content, "lxml")
        for item in new_soup.contents:
            element.append(item)
    return str(soup)

def update_element_tag(html_content, element_id, new_tag):
    """Cambia el tipo de etiqueta (ej: de <div> a <section>)"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    if element:
        element.name = new_tag
    return str(soup)

def update_attributes(html_content, element_id, attributes_dict):
    """Actualiza los atributos de un elemento (class, style, src, href, etc)"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    if element:
        for key, value in attributes_dict.items():
            if value is None or value == "":
                # Si el valor está vacío, borra el atributo
                if element.has_attr(key):
                    del element[key]
            else:
                element[key] = value
    return str(soup)

def delete_element(html_content, element_id):
    """Elimina un elemento completamente del HTML"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    if element:
        element.decompose()
    return str(soup)

def duplicate_element(html_content, element_id):
    """Duplica un elemento justo debajo de él"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    if element:
        import copy
        clone = copy.copy(element)
        # Le ponemos un ID único para no tener IDs duplicados en el DOM
        if clone.has_attr('id'):
            clone['id'] = f"{clone['id']}_copia"
        element.insert_after(clone)
    return str(soup)

def move_element(html_content, element_id, target_id, position="inside"):
    """Mueve un elemento a otra parte del árbol (drag & drop)"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    target = soup.find(id=target_id)
    
    if element and target and element_id != target_id:
        # Extraemos el elemento de su posición actual
        element.extract()
        
        if position == "inside":
            target.append(element)
        elif position == "before":
            target.insert_before(element)
        elif position == "after":
            target.insert_after(element)
            
    return str(soup)

def wrap_element(html_content, element_id, wrapper_tag="div", wrapper_class=""):
    """Envuelve un elemento dentro de otra etiqueta (ej: meter un <p> en un <div>)"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    if element:
        wrapper = soup.new_tag(wrapper_tag)
        if wrapper_class:
            wrapper['class'] = wrapper_class
        element.wrap(wrapper)
    return str(soup)

def unwrap_element(html_content, element_id):
    """Elimina la etiqueta contenedora pero mantiene su contenido"""
    soup = parse_html(html_content)
    element = soup.find(id=element_id)
    if element:
        element.unwrap()
    return str(soup)

def insert_snippet(html_content, target_id, snippet_html, position="inside"):
    """Inserta un fragmento de código (desde los JSON) en un lugar específico"""
    soup = parse_html(html_content)
    target = soup.find(id=target_id)
    
    if target:
        snippet_soup = BeautifulSoup(snippet_html, "lxml")
        
        if position == "inside":
            for item in snippet_soup.contents:
                target.append(item)
        elif position == "before":
            for item in reversed(list(snippet_soup.contents)):
                target.insert_before(item)
        elif position == "after":
            for item in snippet_soup.contents:
                target.insert_after(item)
    else:
        # Si no hay target, lo añadimos al final del body
        body = soup.find("body")
        if body:
            snippet_soup = BeautifulSoup(snippet_html, "lxml")
            for item in snippet_soup.contents:
                body.append(item)
                
    return str(soup)

def inject_css(html_content, css_code):
    """Añade o reemplaza un bloque <style> en el <head>"""
    soup = parse_html(html_content)
    
    # Buscar si ya existe una etiqueta style principal
    existing_style = soup.find("style")
    
    if existing_style:
        existing_style.string = css_code
    else:
        style_tag = soup.new_tag("style")
        style_tag.string = css_code
        head = soup.find("head")
        if not head:
            head = soup.new_tag("head")
            if soup.html:
                soup.html.insert(0, head)
        head.append(style_tag)
        
    return str(soup)

def clean_empty_tags(html_content):
    """Limpia etiquetas vacías que a veces deja el editor visual"""
    soup = parse_html(html_content)
    for tag in soup.find_all(True):
        if tag.name not in ['br', 'hr', 'img', 'input', 'meta', 'link']:
            if not tag.contents and not tag.string:
                tag.decompose()
    return str(soup)