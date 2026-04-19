/**
 * ═══════════════════════════════════════════════════════════════
 * TREE - Explorador de Archivos y Estructura (VS Code Style)
 * ═══════════════════════════════════════════════════════════════
 */

const Tree = {
    container: null,
    structureContainer: null,
    data: null,
    selectedXPath: null,

    /**
     * Inicializar árbol
     */
    init() {
        this.container = document.getElementById('file-tree');
        this.structureContainer = document.getElementById('structure-tree');
        console.log('✅ Árbol inicializado');
    },

    /**
     * RENDERIZAR EXPLORADOR DE ARCHIVOS
     */
    renderFileTree(archivos, nombreCarpetaRaiz = 'Proyecto') {
        const container = this.container;
        if (!container) return;
        container.innerHTML = '';

        if (!archivos || archivos.length === 0) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);"><img src="/static/icons/files.png" style="height:32px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;opacity:0.5;">No hay archivos cargados</div>`;
            return;
        }

        // 1. Crear estructura lógica
        const root = { files: [], folders: {} };

        archivos.forEach(archivo => {
            const partes = archivo.nombre.replace(/\\/g, '/').split('/').filter(Boolean);
            let nodoActual = root;

            for (let i = 0; i < partes.length - 1; i++) {
                if (!nodoActual.folders[partes[i]]) nodoActual.folders[partes[i]] = { files: [], folders: {} };
                nodoActual = nodoActual.folders[partes[i]];
            }

            // LA MAGIA: Si Python nos envía una carpeta vacía (tipo 'folder'), la tratamos como carpeta, no como archivo
            if (archivo.tipo === 'folder') {
                const nombreCarpeta = partes[partes.length - 1];
                if (!nodoActual.folders[nombreCarpeta]) {
                    nodoActual.folders[nombreCarpeta] = { files: [], folders: {} };
                }
            } else {
                nodoActual.files.push(archivo);
            }
        });

        // 2. Dibujar la carpeta madre (Raíz) - EMPIEZA ABIERTA
        const raiz = document.createElement('div');
        raiz.className = 'file-item';
        raiz.innerHTML = `<img src="/static/icons/folder-open.png" onerror="this.src='/static/icons/file.png'" class="tree-folder-icon" style="width:16px; cursor: pointer;"> <span class="file-name" style="cursor: pointer;"><strong>${nombreCarpetaRaiz}</strong></span>`;
        container.appendChild(raiz);

        const contenedorHijos = document.createElement('div');
        contenedorHijos.style.display = 'block'; // Empezar abierta
        container.appendChild(contenedorHijos);

        raiz.onclick = () => {
            const icono = raiz.querySelector('.tree-folder-icon');
            if (icono.src.includes('folder-open')) {
                icono.src = '/static/icons/closed.png';
            } else {
                icono.src = '/static/icons/folder-open.png';
            }
            contenedorHijos.style.display = contenedorHijos.style.display === 'none' ? 'block' : 'none';
        };

        // 3. Función para dibujar el resto (hijos)
        const construirDOM = (nodo, padre, nivel = 0) => {
            Object.keys(nodo.folders).sort().forEach(nombre => {
                const carpeta = document.createElement('div');
                carpeta.className = 'file-item';
                carpeta.style.paddingLeft = `${(nivel + 1) * 20}px`; // Margen dinámico
                // Las subcarpetas EMPIEZAN CERRADAS
                carpeta.innerHTML = `<img src="/static/icons/closed.png" onerror="this.src='/static/icons/file.png'" class="tree-folder-icon" style="width:16px; cursor: pointer;"> <span class="file-name" style="cursor: pointer;"><strong>${nombre}</strong></span>`;
                padre.appendChild(carpeta);

                const hijos = document.createElement('div');
                hijos.style.display = 'none';
                padre.appendChild(hijos);

                carpeta.onclick = () => {
                    const icono = carpeta.querySelector('.tree-folder-icon');
                    if (icono.src.includes('folder-open')) {
                        icono.src = '/static/icons/closed.png';
                    } else {
                        icono.src = '/static/icons/folder-open.png';
                    }
                    hijos.style.display = hijos.style.display === 'none' ? 'block' : 'none';
                };

                construirDOM(nodo.folders[nombre], hijos, nivel + 1);
            });

            nodo.files.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(archivo => {
                const item = document.createElement('div');

                // LA MAGIA: Quitar la ruta y dejar SOLO el nombre del archivo
                const nombreSolo = archivo.nombre.split('/').pop().split('\\').pop();

                item.className = 'file-item' + (archivo.activo ? ' active' : '');
                item.style.paddingLeft = `${(nivel + 1) * 20}px`;
                item.style.cursor = 'pointer';
                item.title = archivo.nombre;
                item.dataset.nombre = archivo.nombre;

                item.innerHTML = `${this.getFileIcon(archivo.tipo, nombreSolo)}<span class="file-name">${nombreSolo}</span>`;

                // OPCIÓN A: Un solo clic abre el archivo (estilo VS Code)
                item.onclick = () => this.openFile(archivo.nombre);

                // OPCIÓN B: Mantener doble clic (descomenta si prefieres):
                //item.onclick = () => this.selectFile(archivo.nombre);
                //item.ondblclick = () => this.openFile(archivo.nombre);
                padre.appendChild(item);
            });
        };

        // 4. Ejecutar dentro de la carpeta madre
        construirDOM(root, contenedorHijos);
    },

    /**
     * ICONOS REALES
     */
    getFileIcon(tipo, nombre) {
        if (!nombre) return '<img src="/static/icons/default.png" style="width:20px; height:20px; vertical-align:middle;">';

        const ext = nombre.split('.').pop().toLowerCase();

        // Ruta de tu icono personalizado
        const iconPath = `/static/icons/${ext}.png`;

        // Devolvemos la imagen. Si no existe el icono específico, usa el genérico 'file.png'
        return `<img src="${iconPath}" onerror="this.src='/static/icons/file.png'" style="width:16px; height:16px; vertical-align:middle;">`;
    },

    /**
     * SELECCIONAR ARCHIVO (La Magia: Código o Visor Multimedia)
     */
    // Un clic -> Solo selecciona (Pinta de azul)
    async selectFile(nombre) {
        // Actualizar selección visual en el árbol
        document.querySelectorAll('.file-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.nombre === nombre) item.classList.add('active');
        });

        // Actualizar barra de estado
        App.updateStatusBar(`Seleccionado: ${nombre}`);
    },

    // Doble clic -> Aquí SÍ lee el archivo y lo abre
    async openFile(nombre) {
        const ext = nombre.split('.').pop().toLowerCase();
        const mediaExts = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'avif', 'gif', 'mp4', 'webm', 'ogv', 'mp3', 'wav', 'ogg', 'pdf', 'woff', 'woff2', 'ttf', 'otf'];

        // Si es multimedia o fuente, abrimos el Visor
        if (mediaExts.includes(ext)) {
            this.abrirVisorMultimedia(nombre, ext);
            return;
        }

        // Si es código, lo abrimos en el editor
        try {
            const response = await fetch('/api/select-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archivo: nombre })
            });

            const data = await response.json();
            if (data.success) {
                // Forzar vista de código si estamos en visual puro
                if (App.currentView === 'visual') App.setView('split');

                if (data.tipo === 'html') {
                    Editor.setValue(data.contenido);
                    App.loadStructure();
                    Preview.update();
                    Editor.setMode('html');
                } else if (data.tipo === 'css') {
                    Editor.setValue(data.contenido);
                    Editor.setMode('css');
                } else if (data.tipo === 'js') {
                    Editor.setValue(data.contenido);
                    Editor.setMode('javascript');
                }

                App.updateStatusBar(`Editando: ${nombre}`);
            }
        } catch (error) {
            App.showError('Error al leer el archivo');
        }
    },
    /**
     * VISOR MULTIMEDIA (Abre imágenes, videos, PDFs en la vista previa)
     */
    abrirVisorMultimedia(nombre, ext) {
        // 1. Cambiar a la pestaña Visor usando nuestra nueva función
        App.switchTab('visor');

        // 2. Apuntar al NUEVO iframe del visor (en lugar del de la vista previa)
        const frame = document.getElementById('visor-frame');
        if (!frame) return;

        let htmlContenido = '';
        const urlArchivo = `/project-files/${nombre}`;

        if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'avif', 'gif'].includes(ext)) {
            htmlContenido = `<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e1e1e;"><img src="${urlArchivo}" style="max-width:100%;max-height:100%;object-fit:contain;"></body>`;
        }
        else if (['mp4', 'webm', 'ogv'].includes(ext)) {
            htmlContenido = `<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#000;"><video controls autoplay style="max-width:100%;max-height:100%;"><source src="${urlArchivo}" type="video/mp4">Tu navegador no soporta el video.</video></body>`;
        }
        else if (['mp3', 'wav', 'ogg'].includes(ext)) {
            htmlContenido = `<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e1e1e;"><audio controls autoplay src="${urlArchivo}"></audio></body>`;
        }
        else if (ext === 'pdf') {
            htmlContenido = `<body style="margin:0;"><iframe src="${urlArchivo}" style="width:100%;height:100vh;border:none;"></iframe></body>`;
        }
        else {
            htmlContenido = `<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;color:white;background:#1e1e1e;"><h2>Vista previa no disponible para este tipo de archivo</h2></body>`;
        }

        frame.srcdoc = `<!DOCTYPE html><html><head><style>body{overflow:hidden;}</style></head>${htmlContenido}</html>`;
        App.updateStatusBar(`Visualizando: ${nombre}`);
    },

    /**
     * CONTROLES DE EXPANDIR / COLAPSAR
     */
    expandAll() {
        document.querySelectorAll('.tree-subfolder').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.tree-folder-icon').forEach(icon => {
            icon.classList.remove('fa-folder');
            icon.classList.add('fa-folder-open');
        });
        document.querySelectorAll('.tree-children').forEach(el => el.classList.add('expanded'));
        document.querySelectorAll('.fa-chevron-right').forEach(icon => {
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        });
    },

    collapseAll() {
        document.querySelectorAll('.tree-subfolder').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tree-folder-icon').forEach(icon => {
            icon.classList.remove('fa-folder-open');
            icon.classList.add('fa-folder');
        });
        document.querySelectorAll('.tree-children').forEach(el => el.classList.remove('expanded'));
        document.querySelectorAll('.fa-chevron-down').forEach(icon => {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        });
    },

    /**
     * RENDERIZAR ESTRUCTURA HTML (Simplificada para que no pete)
     */
    renderStructure(data) {
        const container = this.structureContainer;
        if (!container) return;
        this.data = data;
        container.innerHTML = '';

        if (!data || !data.name) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                    <img src="/static/icons/documento_vacio.png" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5; display: block; margin-left: auto; margin-right: auto;">
                    <p style="margin: 0; font-size: 14px;">Carga un archivo HTML para ver su estructura</p>
                </div>
            `;
            return;
        }
        container.appendChild(this.createStructureNode(data, 0));
    },

    createStructureNode(node, level) {
        const div = document.createElement('div');
        div.className = 'tree-node';
        div.style.marginLeft = `${level * 8}px`;

        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = level < 1; // Solo expander el primer nivel por defecto para no colapsar

        const header = document.createElement('div');
        header.className = 'tree-header';
        header.dataset.xpath = node.xpath || '';
        header.draggable = true;

        const chevron = hasChildren ? `<i class="fas fa-chevron-${isExpanded ? 'down' : 'right'} tree-icon" style="font-size:10px;cursor:pointer;"></i>` : '<span class="tree-icon" style="width:10px;display:inline-block;"></span>';

        header.innerHTML = `${chevron}<span class="tree-icon" style="color:${node.color || '#94a3b8'}">${node.icono || '📦'}</span><span class="tree-label">${node.name || node.tag}</span>`;

        header.onclick = (e) => {
            // Si hizo clic en la flechita, expandir/colapsar
            if (e.target.classList.contains('fa-chevron-down') || e.target.classList.contains('fa-chevron-right')) {
                this.toggleStructureNode(header);
            } else {
                // Si hizo clic en el nombre, seleccionar elemento
                this.selectStructureNode(node.xpath);
            }
        };

        div.appendChild(header);

        if (hasChildren) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'tree-children' + (isExpanded ? ' expanded' : '');
            node.children.forEach(child => childrenDiv.appendChild(this.createStructureNode(child, level + 1)));
            div.appendChild(childrenDiv);
        }

        return div;
    },

    toggleStructureNode(header) {
        const icon = header.querySelector('.fa-chevron-down, .fa-chevron-right');
        const children = header.parentElement.querySelector('.tree-children');
        if (children && icon) {
            children.classList.toggle('expanded');
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-right');
        }
    },

    async selectStructureNode(xpath) {
        if (!xpath) return;
        document.querySelectorAll('.tree-header').forEach(h => h.classList.remove('selected'));
        const header = document.querySelector(`.tree-header[data-xpath="${xpath}"]`);
        if (header) header.classList.add('selected');

        // Cargar propiedades
        if (typeof Properties !== 'undefined') await Properties.load(xpath);
        // Resaltar en vista previa
        if (typeof Preview !== 'undefined') Preview.highlight(xpath);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};