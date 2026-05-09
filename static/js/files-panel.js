/**
 * PANEL DE ARCHIVOS - Explorador real del sistema de archivos
 * Conectado dinámicamente con el backend Flask
 */

const FilePanel = {
    // ─── Estado ────────────────────────────────────────────
    selectedFile: null,
    clipboardData: null,
    clipboardMode: 'copy',
    _treeState: {},          // Guarda qué carpetas están expandidas/colapsadas

    // ─── Iconos por tipo de archivo ─────────────────────────
    _icons: {
        'folder':  { icon: 'fas fa-folder',         color: 'var(--accent)' },
        'html':    { icon: 'fas fa-code',            color: '#e67e22' },
        'css':     { icon: 'fab fa-css3-alt',        color: '#3498db' },
        'js':      { icon: 'fab fa-js-square',       color: '#f1c40f' },
        'json':    { icon: 'fas fa-file-code',       color: '#2ecc71' },
        'png':     { icon: 'fas fa-file-image',      color: '#9b59b6' },
        'jpg':     { icon: 'fas fa-file-image',      color: '#9b59b6' },
        'jpeg':    { icon: 'fas fa-file-image',      color: '#9b59b6' },
        'gif':     { icon: 'fas fa-file-image',      color: '#9b59b6' },
        'svg':     { icon: 'fas fa-vector-square',   color: '#27ae60' },
        'ico':     { icon: 'fas fa-image',           color: '#8e44ad' },
        'pdf':     { icon: 'fas fa-file-pdf',        color: '#e74c3c' },
        'md':      { icon: 'fas fa-file-alt',        color: '#95a5a6' },
        'txt':     { icon: 'fas fa-file-alt',        color: '#95a5a6' },
        'py':      { icon: 'fab fa-python',          color: '#3776ab' },
        'php':     { icon: 'fab fa-php',             color: '#7952b3' },
        'xml':     { icon: 'fas fa-file-code',       color: '#e67e22' },
        '_default':{ icon: 'fas fa-file',            color: '#7f8c8d' },
    },

    // ────────────────────────────────────────────────────────
    //  INICIALIZACIÓN
    // ────────────────────────────────────────────────────────
    init() {
        console.log('📁 Panel de Archivos inicializado');
        this.loadAndRender();
    },

    // ────────────────────────────────────────────────────────
    //  CARGA Y RENDERIZADO DEL ÁRBOL
    // ────────────────────────────────────────────────────────

    /** Solicita el árbol al servidor y lo pinta */
    async loadAndRender() {
        const container = document.getElementById('fp-tree-container');
        if (!container) return;

        container.innerHTML = this._renderLoading();

        try {
            const res  = await fetch('/api/file-tree');
            const data = await res.json();

            if (!data.success || !data.tree || data.tree.length === 0) {
                container.innerHTML = this._renderEmpty();
                return;
            }

            // Guardar archivo activo
            this._activeFile = data.archivo_actual;

            // Actualizar nombre del proyecto en cabecera
            const titleEl = document.getElementById('fp-project-name');
            if (titleEl) titleEl.textContent = data.nombre_proyecto || 'Proyecto';

            // Renderizar árbol
            container.innerHTML = this._buildTree(data.tree, 0);

            // Restaurar scroll y selección
            if (this._activeFile) {
                const activeEl = container.querySelector(`[data-ruta="${CSS.escape(this._activeFile)}"]`);
                if (activeEl) activeEl.classList.add('fp-item-active');
            }
        } catch (err) {
            console.error('Error cargando árbol de archivos:', err);
            container.innerHTML = this._renderEmpty();
        }
    },

    /** Construye el HTML del árbol recursivamente */
    _buildTree(nodos, nivel) {
        if (!nodos || nodos.length === 0) return '';

        let html = '';
        for (const nodo of nodos) {
            if (nodo.tipo === 'folder') {
                html += this._renderFolder(nodo, nivel);
            } else {
                html += this._renderFile(nodo, nivel);
            }
        }
        return html;
    },

    _renderFolder(nodo, nivel) {
        const id      = this._slugify(nodo.nombre + '-' + nivel);
        const isOpen  = this._treeState[id] !== false; // abierto por defecto
        const arrow   = isOpen ? 'fa-chevron-down' : 'fa-chevron-right';
        const display = isOpen ? 'block'           : 'none';
        const indent  = nivel * 14;

        const childrenHTML = this._buildTree(nodo.hijos || [], nivel + 1);

        return `
        <div class="fp-folder-item">
            <div class="fp-row fp-folder-row"
                 style="padding-left:${8 + indent}px"
                 onclick="FilePanel.toggleFolder('${id}', this)">
                <i class="fas ${arrow} fp-arrow" id="fp-arrow-${id}"></i>
                <i class="fas fa-folder fp-icon" style="color:var(--accent)"></i>
                <span class="fp-name">${this._escape(nodo.nombre)}</span>
            </div>
            <div id="fp-children-${id}" style="display:${display}">
                ${childrenHTML || ''}
            </div>
        </div>`;
    },

    _renderFile(nodo, nivel) {
        const icon  = this._icons[nodo.tipo] || this._icons['_default'];
        const indent = nivel * 14;
        const isActive = nodo.ruta && nodo.ruta === this._activeFile;
        const activeClass = isActive ? ' fp-item-active' : '';
        const rutaEscaped = this._escape(nodo.ruta || '');
        const rutaAttr    = this._escape(nodo.ruta || '', true);

        return `
        <div class="fp-row fp-file-row${activeClass}"
             style="padding-left:${22 + indent}px"
             data-ruta="${rutaAttr}"
             title="${rutaAttr}"
             ondblclick="FilePanel.openFile('${rutaAttr}')">
            <i class="${icon.icon} fp-icon" style="color:${icon.color}"></i>
            <span class="fp-name">${this._escape(nodo.nombre)}</span>
        </div>`;
    },

    // ────────────────────────────────────────────────────────
    //  ACCIONES
    // ────────────────────────────────────────────────────────

    /** Abrir carpeta real usando tkinter */
    async loadFolder() {
        App.showInfo('Abriendo selector de carpeta...');
        try {
            const res  = await fetch('/api/load-folder', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                App.showSuccess(`✅ Carpeta cargada (${data.archivos} archivos)`);
                this._treeState = {};   // Reset expansión
                this.loadAndRender();
            } else {
                App.showWarning('Selección cancelada');
            }
        } catch (err) {
            App.showError('Error al abrir el selector de carpeta');
        }
    },

    /** Abrir archivo en el editor */
    async openFile(ruta) {
        if (!ruta) return;
        try {
            const res  = await fetch('/api/select-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archivo: ruta })
            });
            const data = await res.json();

            if (data.success) {
                // Determinar modo del editor
                const modeMap = { html: 'html', css: 'css', js: 'js' };
                const mode    = modeMap[data.tipo] || 'html';

                // Cargar en el editor
                if (window.Editor) {
                    Editor.setValue(data.contenido, mode);
                    Editor.refresh();
                }

                // Actualizar vista previa
                if (window.Preview) Preview.update();

                // Actualizar estructura
                if (window.App) App.loadStructure();

                // Marcar item activo visualmente
                this._activeFile = ruta;
                document.querySelectorAll('.fp-file-row').forEach(el => {
                    el.classList.toggle('fp-item-active', el.dataset.ruta === ruta);
                });

                App.showSuccess(`📄 ${ruta.split(/[\\/]/).pop()}`);
            } else {
                App.showWarning('No se pudo abrir el archivo');
            }
        } catch (err) {
            App.showError('Error al abrir el archivo');
        }
    },

    /** Expandir / contraer carpeta */
    toggleFolder(id, rowEl) {
        const children = document.getElementById(`fp-children-${id}`);
        const arrow    = document.getElementById(`fp-arrow-${id}`);
        if (!children) return;

        const isOpen = children.style.display !== 'none';
        children.style.display = isOpen ? 'none' : 'block';
        this._treeState[id] = !isOpen;

        if (arrow) {
            arrow.classList.toggle('fa-chevron-down', !isOpen);
            arrow.classList.toggle('fa-chevron-right', isOpen);
        }

        // Cambiar icono de la carpeta
        const folderIcon = rowEl.querySelector('.fa-folder, .fa-folder-open');
        if (folderIcon) {
            folderIcon.classList.toggle('fa-folder', isOpen);
            folderIcon.classList.toggle('fa-folder-open', !isOpen);
        }
    },

    /** Actualizar árbol (F5) */
    refresh() {
        this.loadAndRender();
        App.showSuccess('Panel de archivos actualizado');
    },

    // ────────────────────────────────────────────────────────
    //  STUBS DE MENÚ
    // ────────────────────────────────────────────────────────
    newFile()        { App.showInfo('Nuevo archivo: próximamente'); },
    newFolder()      { App.showInfo('Nueva carpeta: próximamente'); },
    open()           { this.loadFolder(); },
    rename()         { App.showInfo('Cambiar nombre: próximamente'); },
    delete()         { App.showInfo('Eliminar: próximamente'); },
    unlock()         { App.showInfo('Desbloquear: próximamente'); },
    checkFiles()     { App.showInfo('Comprobando archivos...'); },
    previewChrome()  { App.showInfo('Abriendo en Chrome...'); },
    previewIE()      { App.showInfo('Abriendo en IE...'); },
    previewEdge()    { App.showInfo('Abriendo en Edge...'); },
    editBrowsersList(){ App.showInfo('Editar lista de navegadores...'); },
    cut()            { App.showWarning('Selecciona un archivo primero'); },
    copy()           { App.showWarning('Selecciona un archivo primero'); },
    paste()          { App.showInfo('Pegar: próximamente'); },
    duplicate()      { App.showInfo('Duplicar: próximamente'); },
    selectAll()      { App.showInfo('Seleccionar todo: próximamente'); },
    manageSite()     { App.showInfo('Administrar sitios: próximamente'); },
    expandPanel()    { App.showInfo('Expandir panel: próximamente'); },
    help()           { App.showInfo('Haz doble clic en un archivo para abrirlo en el editor.'); },
    close()          { Panels.closeSpecificPanel('archivos'); },
    closeTabGroup()  { Panels.closeTabGroupOfPanel('archivos'); },

    // ────────────────────────────────────────────────────────
    //  HELPERS DE RENDERIZADO
    // ────────────────────────────────────────────────────────
    _renderLoading() {
        return `
        <div class="fp-status-msg">
            <i class="fas fa-spinner fa-spin" style="font-size:22px; color:var(--accent); margin-bottom:10px;"></i>
            <p>Cargando archivos...</p>
        </div>`;
    },

    _renderEmpty() {
        return `
        <div class="fp-status-msg">
            <i class="fas fa-folder-open" style="font-size:32px; color:var(--accent); opacity:.5; margin-bottom:10px;"></i>
            <p style="margin:0 0 14px;">No hay ningún proyecto abierto</p>
            <button class="fp-open-btn" onclick="FilePanel.loadFolder()">
                <i class="fas fa-folder-open"></i> Abrir carpeta...
            </button>
        </div>`;
    },

    _slugify(str) {
        return str.replace(/[^a-zA-Z0-9]/g, '-');
    },

    _escape(str, forAttr = false) {
        if (!str) return '';
        const s = str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
        return forAttr ? s.replace(/'/g, '&#39;') : s;
    },

    // ────────────────────────────────────────────────────────
    //  HTML ESTÁTICO DEL PANEL (esqueleto)
    // ────────────────────────────────────────────────────────
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <!-- Archivo -->
                <div class="dropdown-item has-submenu" style="font-weight:600; cursor:pointer;">
                    <div class="item-main"><i class="fas fa-file"></i>Archivo</div>
                    <i class="fas fa-chevron-right arrow-sub"></i>
                    <div class="submenu">
                        <div class="dropdown-item" onclick="FilePanel.newFile()">
                            <div class="item-main"><i class="fas fa-file-alt"></i>Nuevo archivo</div>
                            <span class="shortcut">Ctrl+Mayús+N</span>
                        </div>
                        <div class="dropdown-item" onclick="FilePanel.newFolder()">
                            <div class="item-main"><i class="fas fa-folder-plus"></i>Nueva carpeta</div>
                            <span class="shortcut">Ctrl+Alt+Mayús+N</span>
                        </div>
                        <div class="dropdown-item" onclick="FilePanel.open()">
                            <div class="item-main"><i class="fas fa-folder-open"></i>Abrir carpeta...</div>
                        </div>
                        <div class="divider"></div>
                        <div class="dropdown-item" onclick="FilePanel.rename()">
                            <div class="item-main"><i class="fas fa-i-cursor"></i>Cambiar nombre</div>
                            <span class="shortcut">F2</span>
                        </div>
                        <div class="dropdown-item" onclick="FilePanel.delete()">
                            <div class="item-main"><i class="fas fa-trash"></i>Eliminar</div>
                            <span class="shortcut">Supr</span>
                        </div>
                        <div class="divider"></div>
                        <div class="dropdown-item" onclick="FilePanel.checkFiles()">
                            <div class="item-main"><i class="fas fa-check-circle"></i>Comprobar archivos</div>
                        </div>
                        <div class="dropdown-item has-submenu" style="cursor:pointer;">
                            <div class="item-main"><i class="fas fa-eye"></i>Vista previa en tiempo real</div>
                            <i class="fas fa-chevron-right arrow-sub"></i>
                            <div class="submenu">
                                <div class="dropdown-item" onclick="FilePanel.previewChrome()">
                                    <div class="item-main"><i class="fab fa-chrome"></i>Google Chrome</div>
                                </div>
                                <div class="dropdown-item" onclick="FilePanel.previewEdge()">
                                    <div class="item-main"><i class="fab fa-edge"></i>Microsoft Edge</div>
                                </div>
                                <div class="divider"></div>
                                <div class="dropdown-item" onclick="FilePanel.editBrowsersList()">
                                    <div class="item-main"><i class="fas fa-edit"></i>Editar lista de navegadores...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Edición -->
                <div class="dropdown-item has-submenu" style="font-weight:600; cursor:pointer;">
                    <div class="item-main"><i class="fas fa-pen"></i>Edición</div>
                    <i class="fas fa-chevron-right arrow-sub"></i>
                    <div class="submenu">
                        <div class="dropdown-item" onclick="FilePanel.cut()">
                            <div class="item-main"><i class="fas fa-cut"></i>Cortar</div>
                            <span class="shortcut">Ctrl+X</span>
                        </div>
                        <div class="dropdown-item" onclick="FilePanel.copy()">
                            <div class="item-main"><i class="fas fa-copy"></i>Copiar</div>
                            <span class="shortcut">Ctrl+C</span>
                        </div>
                        <div class="dropdown-item" onclick="FilePanel.paste()">
                            <div class="item-main"><i class="fas fa-paste"></i>Pegar</div>
                            <span class="shortcut">Ctrl+V</span>
                        </div>
                        <div class="divider"></div>
                        <div class="dropdown-item" onclick="FilePanel.selectAll()">
                            <div class="item-main">Seleccionar todo</div>
                            <span class="shortcut">Ctrl+A</span>
                        </div>
                    </div>
                </div>
                <!-- Administrar sitio -->
                <div class="dropdown-item" onclick="FilePanel.manageSite()">
                    <div class="item-main"><i class="fas fa-cogs"></i>Administrar sitio...</div>
                </div>
                <!-- Abrir carpeta -->
                <div class="dropdown-item" onclick="FilePanel.loadFolder()">
                    <div class="item-main"><i class="fas fa-folder-open"></i>Abrir carpeta de proyecto...</div>
                </div>
                <!-- Actualizar -->
                <div class="dropdown-item" onclick="FilePanel.refresh()">
                    <div class="item-main"><i class="fas fa-sync-alt"></i>Actualizar</div>
                    <span class="shortcut">F5</span>
                </div>
                <div class="divider"></div>
                <!-- Ayuda -->
                <div class="dropdown-item" onclick="FilePanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <!-- Cerrar grupo de fichas -->
                <div class="dropdown-item" onclick="FilePanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
        <div class="fp-shell">
            <!-- Cabecera: nombre del proyecto + botón abrir carpeta -->
            <div class="fp-header">
                <i class="fas fa-folder-open" style="color:var(--accent); margin-right:5px;"></i>
                <span id="fp-project-name" class="fp-project-name">Sin proyecto</span>
                <button class="fp-btn-open" onclick="FilePanel.loadFolder()" title="Abrir carpeta de proyecto">
                    <i class="fas fa-folder-open"></i>
                </button>
                <button class="fp-btn-refresh" onclick="FilePanel.refresh()" title="Actualizar (F5)">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>

            <!-- Cabecera de columnas -->
            <div class="files-columns-header">
                <div class="files-col-name">Archivos locales <i class="fas fa-arrow-down"></i></div>
                <div class="files-col-size">Tipo</div>
            </div>

            <!-- Árbol de archivos dinámico -->
            <div id="fp-tree-container" class="files-tree-scroll fp-tree-container">
                <div class="fp-status-msg">
                    <i class="fas fa-folder-open" style="font-size:32px; color:var(--accent); opacity:.5; margin-bottom:10px;"></i>
                    <p style="margin:0 0 14px;">No hay ningún proyecto abierto</p>
                    <button class="fp-open-btn" onclick="FilePanel.loadFolder()">
                        <i class="fas fa-folder-open"></i> Abrir carpeta...
                    </button>
                </div>
            </div>

            <!-- Footer -->
            <div class="files-panel-footer">
                <button class="files-footer-btn" onclick="FilePanel.refresh()" title="Actualizar">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="files-footer-btn" onclick="FilePanel.loadFolder()" title="Abrir carpeta">
                    <i class="fas fa-folder-open"></i>
                </button>
            </div>
        </div>
        `;
    }
};

// ────────────────────────────────────────────────────────────
//  Bootstrap: reinicializar cuando el panel se renderice
// ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const existing = document.getElementById('fp-tree-container');
    if (existing) FilePanel.init();
});

const _origRender = Panels.renderPanelContent;
if (_origRender) {
    Panels.renderPanelContent = function(container, panelId) {
        _origRender.call(this, container, panelId);
        if (panelId === 'archivos') {
            setTimeout(() => FilePanel.init(), 50);
        }
    };
}
