/**
 * PANEL DE ARCHIVOS - Menús y funcionalidades tipo Dreamweaver
 * Maneja todos los eventos del panel de archivos
 */

const FilePanel = {
    // Estado del panel
    currentSite: 'root',
    selectedFiles: [],
    clipboardData: null,
    clipboardMode: 'copy', // 'copy' o 'cut'

    /**
     * Inicializar el panel de archivos después de renderizar
     */
    init() {
        console.log('📁 Panel de Archivos inicializado');
        
        // Setup del dropdown de sitios
        const siteDropdown = document.getElementById('site-dropdown');
        if (siteDropdown) {
            siteDropdown.addEventListener('change', (e) => {
                if (e.target.value === 'manage') {
                    this.manageSite();
                } else {
                    this.changeSite(e.target.value);
                }
            });
        }
    },

    /**
     * Alternar la visibilidad del árbol de archivos
     */
    toggleTree(treeId, event) {
        event.preventDefault();
        event.stopPropagation();

        const container = document.getElementById(`tree-${treeId}`);
        const arrow = document.getElementById(`arrow-${treeId}`);

        if (!container || !arrow) return;

        const isHidden = container.style.display === 'none';

        if (isHidden) {
            container.style.display = 'block';
            arrow.classList.add('rotated');
        } else {
            container.style.display = 'none';
            arrow.classList.remove('rotated');
        }

        console.log(`📁 Árbol ${treeId}: ${isHidden ? 'Expandido' : 'Contraído'}`);
    },

    // ═══════════════════════════════════════════════════════
    // MENÚ ARCHIVO
    // ═══════════════════════════════════════════════════════

    /**
     * Crear un nuevo archivo
     */
    newFile() {
        const fileName = prompt('Nombre del nuevo archivo:', 'nuevo_archivo.html');
        if (!fileName) return;

        console.log('📄 Nuevo archivo:', fileName);
        App.showSuccess(`Archivo "${fileName}" creado`);
    },

    /**
     * Crear una nueva carpeta
     */
    newFolder() {
        const folderName = prompt('Nombre de la nueva carpeta:', 'nueva_carpeta');
        if (!folderName) return;

        console.log('📁 Nueva carpeta:', folderName);
        App.showSuccess(`Carpeta "${folderName}" creada`);
    },

    /**
     * Abrir archivo/carpeta
     */
    open() {
        console.log('📂 Abrir...');
        App.openFile();
    },

    /**
     * Cambiar nombre de archivo/carpeta
     */
    rename() {
        if (this.selectedFiles.length === 0) {
            App.showWarning('Selecciona un archivo para renombrar');
            return;
        }

        const currentName = this.selectedFiles[0];
        const newName = prompt('Nuevo nombre:', currentName);
        if (!newName || newName === currentName) return;

        console.log(`🔤 Renombrar: "${currentName}" → "${newName}"`);
        App.showSuccess(`Renombrado a "${newName}"`);
    },

    /**
     * Eliminar archivo/carpeta
     */
    delete() {
        if (this.selectedFiles.length === 0) {
            App.showWarning('Selecciona un archivo para eliminar');
            return;
        }

        const confirmed = confirm(`¿Eliminar ${this.selectedFiles.length} elemento(s)?`);
        if (!confirmed) return;

        console.log('🗑️ Eliminados:', this.selectedFiles);
        this.selectedFiles = [];
        App.showSuccess('Elemento(s) eliminado(s)');
    },

    /**
     * Desbloquear archivo
     */
    unlock() {
        if (this.selectedFiles.length === 0) {
            App.showWarning('Selecciona un archivo para desbloquear');
            return;
        }

        console.log('🔓 Desbloqueados:', this.selectedFiles);
        App.showSuccess('Archivo(s) desbloqueado(s)');
    },

    /**
     * Comprobar archivos
     */
    checkFiles() {
        console.log('✅ Comprobando archivos...');
        App.showInfo('Comprobación de archivos iniciada');
    },

    /**
     * Vista previa en tiempo real - Google Chrome
     */
    previewChrome() {
        console.log('🌐 Abriendo en Google Chrome');
        App.showInfo('Abriendo en Google Chrome...');
    },

    /**
     * Vista previa en tiempo real - Internet Explorer
     */
    previewIE() {
        console.log('🌐 Abriendo en Internet Explorer');
        App.showInfo('Abriendo en Internet Explorer...');
    },

    /**
     * Vista previa en tiempo real - Microsoft Edge
     */
    previewEdge() {
        console.log('🌐 Abriendo en Microsoft Edge');
        App.showInfo('Abriendo en Microsoft Edge...');
    },

    /**
     * Editar lista de navegadores
     */
    editBrowsersList() {
        console.log('⚙️ Editar lista de navegadores');
        App.showInfo('Abriendo configuración de navegadores...');
    },

    // ═══════════════════════════════════════════════════════
    // MENÚ EDICIÓN
    // ═══════════════════════════════════════════════════════

    /**
     * Cortar archivo(s)
     */
    cut() {
        if (this.selectedFiles.length === 0) {
            App.showWarning('Selecciona un archivo para cortar');
            return;
        }

        this.clipboardData = this.selectedFiles;
        this.clipboardMode = 'cut';
        console.log('✂️ Cortados:', this.selectedFiles);
        App.showSuccess('Archivo(s) cortado(s)');
    },

    /**
     * Copiar archivo(s)
     */
    copy() {
        if (this.selectedFiles.length === 0) {
            App.showWarning('Selecciona un archivo para copiar');
            return;
        }

        this.clipboardData = this.selectedFiles;
        this.clipboardMode = 'copy';
        console.log('📋 Copiados:', this.selectedFiles);
        App.showSuccess('Archivo(s) copiado(s)');
    },

    /**
     * Pegar archivo(s)
     */
    paste() {
        if (!this.clipboardData || this.clipboardData.length === 0) {
            App.showWarning('No hay archivos en el portapapeles');
            return;
        }

        const mode = this.clipboardMode;
        const files = this.clipboardData;
        console.log(`📌 ${mode === 'cut' ? 'Movidos' : 'Pegados'}:`, files);
        App.showSuccess(`Archivo(s) ${mode === 'cut' ? 'movido' : 'pegado'}(s)`);

        if (mode === 'cut') {
            this.clipboardData = null;
            this.clipboardMode = 'copy';
        }
    },

    /**
     * Duplicar archivo(s)
     */
    duplicate() {
        if (this.selectedFiles.length === 0) {
            App.showWarning('Selecciona un archivo para duplicar');
            return;
        }

        console.log('📑 Duplicados:', this.selectedFiles);
        App.showSuccess('Archivo(s) duplicado(s)');
    },

    /**
     * Seleccionar todo
     */
    selectAll() {
        console.log('👁️ Seleccionar todo');
        App.showSuccess('Todos los elementos seleccionados');
    },

    // ═══════════════════════════════════════════════════════
    // OTRAS FUNCIONES
    // ═══════════════════════════════════════════════════════

    /**
     * Cambiar sitio/ubicación
     */
    changeSite(siteValue) {
        this.currentSite = siteValue;
        const siteNames = {
            'root': 'Escritorio',
            'a': 'Unidad de disquete (A:)',
            'c': 'Disco local (C:)',
            'd': 'Unidad de CD (D:)'
        };

        console.log('🗂️ Cambiado a:', siteNames[siteValue] || siteValue);
        App.showInfo(`Ubicación: ${siteNames[siteValue] || siteValue}`);
    },

    /**
     * Administrar sitios
     */
    manageSite() {
        console.log('⚙️ Administrar sitios');
        App.showInfo('Abriendo administrador de sitios...');
        // Aquí se abriría un diálogo de administración de sitios
    },

    /**
     * Expandir panel de archivos
     */
    expandPanel() {
        console.log('📈 Expandir panel de archivos');
        const container = document.querySelector('#panel-file-tree-container');
        if (container) {
            container.style.flex = '1';
        }
        App.showInfo('Panel de archivos expandido');
    },

    /**
     * Actualizar
     */
    refresh() {
        console.log('🔄 Actualizar');
        App.showSuccess('Panel de archivos actualizado');
    },

    /**
     * Ayuda
     */
    help() {
        console.log('❓ Ayuda');
        App.showInfo('Abriendo ayuda del panel de archivos...');
    },

    /**
     * Contraer el panel de archivos
     */
    collapsePanel() {
        console.log('◀ Contraer panel de archivos');
        const panel = document.querySelector('.panel-group');
        if (panel) {
            // Contraer la altura del panel
            panel.style.minHeight = '32px'; // Solo mostrar la pestaña
            panel.style.flex = '0';
            App.showInfo('Panel de archivos contraído');
        }
    },

    /**
     * Cerrar el panel
     */
    close() { Panels.closeSpecificPanel('archivos'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('archivos'); },

    /**
     * Devuelve el HTML del menú contextual de la cabecera
     */
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
                            <div class="item-main"><i class="fas fa-folder-open"></i>Abrir</div>
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
                        <div class="dropdown-item" onclick="FilePanel.unlock()">
                            <div class="item-main"><i class="fas fa-lock-open"></i>Desbloquear</div>
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
                                <div class="dropdown-item" onclick="FilePanel.previewIE()">
                                    <div class="item-main"><i class="fab fa-internet-explorer"></i>Internet Explorer</div>
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
                        <div class="dropdown-item" onclick="FilePanel.duplicate()">
                            <div class="item-main"><i class="fas fa-copy"></i>Duplicar</div>
                            <span class="shortcut">Ctrl+D</span>
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
                <!-- Expandir panel -->
                <div class="dropdown-item" onclick="FilePanel.expandPanel()">
                    <div class="item-main"><i class="fas fa-expand"></i>Expandir panel de archivos</div>
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

    /**
     * Devuelve el HTML del contenido principal del panel (sin cabecera)
     */
    getContentHTML() {
        return `
            <div style="display:flex; flex-direction:column; height:100%;">
                <!-- Selector y administrar sitios en la misma fila -->
                <div class="files-location-row">
                    <div class="files-site-selector">
                        <select id="site-dropdown" class="files-dropdown" onchange="FilePanel.changeSite(this.value)">
                            <option value="root">Escritorio</option>
                            <option value="a">Unidad de disquete (A:)</option>
                            <option value="c">Disco local (C:)</option>
                            <option value="d">Unidad de CD (D:)</option>
                        </select>
                    </div>
                    <button class="files-manage-link" onclick="FilePanel.manageSite()">Administrar sitios</button>
                </div>

                <!-- Cabecera de columnas -->
                <div class="files-columns-header">
                    <div class="files-col-name">Archivos locales <i class="fas fa-arrow-down"></i></div>
                    <div class="files-col-size">Tamaño</div>
                </div>

                <!-- Arbol de carpetas y discos -->
                <div id="panel-file-tree-container" class="files-tree-scroll" style="flex:1;">
                    <div class="files-tree-item">
                        <div class="files-tree-header" onclick="FilePanel.toggleTree('desktop', event)">
                            <i class="fas fa-chevron-down files-tree-arrow rotated" id="arrow-desktop"></i>
                            <i class="fas fa-desktop files-node-icon"></i>
                            <span class="files-node-name">Escritorio</span>
                            <span class="files-node-size"></span>
                        </div>
                        <div class="files-tree-children" id="tree-desktop" style="display: block;">
                            <div class="files-tree-item">
                                <div class="files-tree-header" onclick="FilePanel.toggleTree('this-pc', event)">
                                    <i class="fas fa-chevron-down files-tree-arrow rotated" id="arrow-this-pc"></i>
                                    <i class="fas fa-desktop files-node-icon"></i>
                                    <span class="files-node-name">Este equipo</span>
                                    <span class="files-node-size"></span>
                                </div>
                                <div class="files-tree-children" id="tree-this-pc" style="display: block;">
                                    <div class="files-leaf-row">
                                        <span class="files-leaf-name"><i class="fas fa-compact-disc files-node-icon"></i>Unidad de DVD (D:)</span>
                                        <span class="files-leaf-size"></span>
                                    </div>
                                    <div class="files-leaf-row">
                                        <span class="files-leaf-name"><i class="fas fa-hdd files-node-icon"></i>Disco local (C:)</span>
                                        <span class="files-leaf-size">98.40GB</span>
                                    </div>
                                    <div class="files-leaf-row">
                                        <span class="files-leaf-name"><i class="fas fa-floppy-disk files-node-icon"></i>Unidad de disquete (A:)</span>
                                        <span class="files-leaf-size"></span>
                                    </div>
                                </div>
                            </div>

                            <div class="files-tree-item">
                                <div class="files-tree-header" onclick="FilePanel.toggleTree('network', event)">
                                    <i class="fas fa-chevron-down files-tree-arrow rotated" id="arrow-network"></i>
                                    <i class="fas fa-network-wired files-node-icon"></i>
                                    <span class="files-node-name">Red</span>
                                    <span class="files-node-size"></span>
                                </div>
                                <div class="files-tree-children" id="tree-network" style="display: block;">
                                    <div class="files-leaf-row">
                                        <span class="files-leaf-name"><i class="fas fa-folder files-node-icon"></i>DESKTOP-9HU8...</span>
                                        <span class="files-leaf-size"></span>
                                    </div>
                                    <div class="files-leaf-row">
                                        <span class="files-leaf-name"><i class="fas fa-folder files-node-icon"></i>tsclient</span>
                                        <span class="files-leaf-size"></span>
                                    </div>
                                </div>
                            </div>

                            <div class="files-tree-item">
                                <div class="files-tree-header" onclick="FilePanel.toggleTree('desktop-items', event)">
                                    <i class="fas fa-chevron-right files-tree-arrow" id="arrow-desktop-items"></i>
                                    <i class="fas fa-folder files-node-icon"></i>
                                    <span class="files-node-name">Elementos de escritorio</span>
                                    <span class="files-node-size"></span>
                                </div>
                                <div class="files-tree-children" id="tree-desktop-items" style="display: none;">
                                    <div class="files-leaf-row">
                                        <span class="files-leaf-name"><i class="fas fa-file files-node-icon"></i>Vacio</span>
                                        <span class="files-leaf-size"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer del panel -->
                <div class="files-panel-footer">
                    <button class="files-footer-btn" onclick="FilePanel.refresh()" title="Actualizar">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="files-footer-btn" onclick="FilePanel.refresh()" title="Sincronizar">
                        <i class="fas fa-sync"></i>
                    </button>
                </div>
            </div>
        `;
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // El panel se inicializa cuando se renderiza
    const filesPanelContainer = document.querySelector('#panel-file-tree-container');
    if (filesPanelContainer) {
        FilePanel.init();
    }
});

// Reinicializar cuando se renderice nuevamente el panel (por cambios dinámicos)
const originalPanelRender = Panels.renderPanelContent;
if (originalPanelRender) {
    Panels.renderPanelContent = function(container, panelId) {
        originalPanelRender.call(this, container, panelId);
        if (panelId === 'archivos') {
            setTimeout(() => FilePanel.init(), 0);
        }
    };
}
