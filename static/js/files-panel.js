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

        // Setup del menú de contexto con manejo de submenús
        this.setupMenuHandling();
    },

    /**
     * Configurar el manejo de menús contextuales y submenús
     */
    setupMenuHandling() {
        const contextMenu = document.querySelector('.files-context-menu');
        if (!contextMenu) return;

        // Manejar hover en items con submenú
        const itemsWithSubmenu = contextMenu.querySelectorAll('.dropdown-item .submenu');
        itemsWithSubmenu.forEach(submenu => {
            const parentItem = submenu.closest('.dropdown-item');
            parentItem.addEventListener('mouseenter', () => {
                // Cerrar otros submenús
                contextMenu.querySelectorAll('.submenu').forEach(s => {
                    if (s !== submenu) s.style.display = 'none';
                });
            });
        });
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
    close() {
        console.log('❌ Cerrar panel de archivos');
        Panels.hidePanel('archivos');
    },

    /**
     * Cerrar grupo de fichas
     */
    closeTabGroup() {
        console.log('❌ Cerrar grupo de fichas');
        App.showInfo('Grupo de fichas cerrado');
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
