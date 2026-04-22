/**
 * ═══════════════════════════════════════════════════════════════
 * APLICACIÓN PRINCIPAL - Dreamweaver Python
 * ═══════════════════════════════════════════════════════════════
 */

// Estado global de la aplicación
const App = {
    // Estado
    currentTab: 'html',
    currentView: 'split',
    previousView: 'split', // <-- AÑADE ESTO
    selectedXPath: null,
    selectedElement: null,
    isDirty: false,

    // Editores
    codeEditor: null,
    codeOnlyEditor: null,

    // Configuración
    config: {
        autoSave: true,
        autoSaveInterval: 30000, // 30 segundos
        theme: 'dark',
        fontSize: 13,
        tabSize: 2,
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        autoCloseTags: true,
    },

    // Timers
    autoSaveTimer: null,
    debounceTimer: null,

    // Historial de archivos
    recentFiles: [],

    /**
     * Marcar el archivo actual como modificado
     */
    markDirty() {
        if (!this.isDirty) {
            this.isDirty = true;
            console.log("📝 Cambios detectados sin guardar");
            // Aquí podrías cambiar el título de la ventana o mostrar un asterisco
            this.updateStatusBar('Archivo modificado (sin guardar)');
        }
    },

    /**
     * Inicializar aplicación
     */
    async init() {
        console.trace('%c🚨 EJECUTANDO APP.INIT() - TRAZA DEL CULPABLE', 'color: red; font-size: 14px; font-weight: bold;');
        console.log('🚀 Iniciando Dreamweaver Python...');

        // Cargar configuración guardada
        this.loadConfig();

        // Inicializar editores CodeMirror
        await Editor.init();

        // Inicializar árbol de estructura
        Tree.init();

        // Inicializar panel de propiedades
        Properties.init();

        // Inicializar vista previa
        Preview.init();

        // Inicializar atajos de teclado
        Keyboard.init();

        // Inicializar snippets
        Snippets.init();

        // Inicializar temas
        Themes.init();

        // Cargar datos iniciales
        await this.loadInitialData();

        // Configurar auto-guardado
        this.setupAutoSave();

        // Configurar eventos globales
        this.setupGlobalEvents();

        console.log('✅ Aplicación iniciada correctamente');
    },

    /**
     * Cargar datos iniciales
     * 
     * ⚠️ CAMBIO IMPORTANTE: Ya NO carga código/estructura automáticamente.
     * Ahora espera a que el usuario haga clic en un archivo del explorador.
     */
    async loadInitialData() {
        try {
            // 1. Cargar proyecto (explorador de archivos) ✅ SIEMPRE
            await this.loadProject();

            // 2. Verificar si hay un archivo seleccionado
            const response = await fetch('/api/project');
            const data = await response.json();

            const tieneArchivoActual = data.archivos?.some(a => a.activo);

            if (tieneArchivoActual) {
                // Si ya había uno activo, lo cargamos
                await this.loadStructure();
                Preview.update();
            } else {
                // Si no hay nada, mostramos el estado de bienvenida limpio
                this.mostrarEstadoVacio();
            }

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.mostrarEstadoVacio();
        }
    },

    /**
     * Mostrar estado vacío cuando no hay archivo abierto
     */
    mostrarEstadoVacio() {
        // Limpiar editor si existe
        if (Editor && Editor.setValue) {
            Editor.setValue('<!-- Selecciona un archivo del explorador para comenzar -->');
        }

        // Limpiar estructura
        const structureContainer = document.getElementById('structure-tree');
        if (structureContainer) {
            structureContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--text-muted);">
                    <img src="/static/icons/documento_vacio.png" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5; display: block; margin-left: auto; margin-right: auto;">
                    <p style="margin: 0; font-size: 14px;">Selecciona un archivo para ver su estructura</p>
                </div>
            `;
        }

        // Actualizar barra de estado
        this.updateStatusBar('Esperando selección de archivo...');
    },

    /**
     * Cargar proyecto (Explorador)
     */
    async loadProject() {
        try {
            const response = await fetch('/api/project');
            const data = await response.json();
            if (data.success) {
                Tree.renderFileTree(data.archivos, data.nombre_proyecto || 'Proyecto');
            }
        } catch (error) {
            this.showError('No se pudo cargar el proyecto');
        }
    },

    /**
     * Cargar estructura HTML
     */
    async loadStructure() {
        try {
            const response = await fetch('/api/structure');
            const data = await response.json();
            if (data.success) {
                Tree.renderStructure(data.structure);
            } else {
                Tree.renderStructure(null);
            }
        } catch (error) {
            Tree.renderStructure(null);
        }
    },

    /**
     * Guardar archivo actual
     */
    async saveFile() {
        const content = Editor.getValue();
        const mode = Editor.getMode();
        let tipo = 'html';

        if (mode === 'css') tipo = 'css';
        else if (mode === 'javascript') tipo = 'js';

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: content, tipo: tipo })
            });

            const data = await response.json();
            if (data.success) {
                this.isDirty = false;
                this.showSuccess('Archivo guardado correctamente');

                // Si es HTML, actualizar estructura y vista previa
                if (tipo === 'html') {
                    this.loadStructure();
                    Preview.update();
                }
            } else {
                this.showError('Error al guardar: ' + data.error);
            }
        } catch (error) {
            this.showError('Error de conexión al guardar');
        }
    },

    /**
     * Abrir archivo (API externa)
     */
    async openFile() {
        try {
            const response = await fetch('/api/open-file', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                await this.loadProject();
                // Si el archivo ya está en el proyecto, Tree.renderFileTree lo marcará activo
            }
        } catch (error) {
            this.showError('Error al abrir el selector de archivos');
        }
    },

    /**
     * Abrir carpeta de proyecto (API externa)
     */
    async openProject() {
        try {
            const response = await fetch('/api/open-project', { method: 'POST' });
            const data = await response.json();
            if (data.success) {
                window.location.reload(); // Recargar para limpiar todo el estado
            }
        } catch (error) {
            this.showError('Error al abrir el selector de carpetas');
        }
    },

    // Alias para openProject (retrocompatibilidad)
    async openFolder() {
        return this.openProject();
    },

    /**
     * STUBS PARA NUEVAS FUNCIONES DE MENÚ
     */
    newFile() { this.showInfo('Función "Nuevo" próximamente'); },
    openRecent() { this.showInfo('Función "Abrir reciente" próximamente'); },
    closeFile() { this.showInfo('Función "Cerrar" próximamente'); },
    closeAllFiles() { this.showInfo('Función "Cerrar todos" próximamente'); },
    saveAs() { this.showInfo('Función "Guardar como" próximamente'); },
    saveAll() { this.showInfo('Función "Guardar todo" próximamente'); },
    saveRelated() { this.showInfo('Función "Guardar archivos relacionados" próximamente'); },
    saveAsTemplate() { this.showInfo('Función "Guardar como plantilla" próximamente'); },
    revert() { this.showInfo('Función "Restituir" próximamente'); },
    attachStylesheet() { this.showInfo('Función "Adjuntar hoja de estilos" próximamente'); },
    importFile() { this.showInfo('Función "Importar" próximamente'); },
    exportFile() { this.showInfo('Función "Exportar" próximamente'); },
    printCode() { this.showInfo('Función "Imprimir código" próximamente'); },
    livePreview() { this.showInfo('Iniciando "Vista previa en tiempo real"...'); Preview.update(); },
    validate() { this.showInfo('Función "Validar" próximamente'); },
    compareRemote() { this.showInfo('Función "Comparar con servidor remoto" próximamente'); },
    designNotes() { this.showInfo('Función "Design Notes" próximamente'); },
    pageProperties() { this.showInfo('Función "Propiedades de página" próximamente'); },
    exit() {
        if (confirm('¿Estás seguro de que quieres salir?')) {
            window.close();
            this.showInfo('Saliendo...');
        }
    },

    /**
     * AYUDA STUBS
     */
    helpTutorial() { this.showInfo('Iniciando Tutorial de Dreamweaver Python...'); },
    helpQuickTutorial() { this.showInfo('Iniciando Tutorial rápido...'); },
    helpResetSuggestions() { this.showInfo('Sugerencias contextuales restablecidas'); },
    helpMain() { this.showInfo('Abriendo Ayuda de Dreamweaver Python...'); },
    helpAccount() { this.showInfo('Accediendo a Administrar mi cuenta...'); },
    helpLogin() { this.showInfo('Iniciando sesión...'); },
    helpUpdates() { this.showInfo('Buscando actualizaciones...'); },
    helpAbout() { this.showConfirm('Acerca de', 'Dreamweaver Python v2.0 Pro\nInspirado en el flujo de trabajo profesional.', () => { }); },

    showInfo(msg) { this.notify(msg, 'var(--info)'); },

    /**
     * Gestión de vistas
     */
    setView(view) {
        // Guardar vista previa si vamos a cambiar
        if (this.currentView !== view) {
            this.previousView = this.currentView;
        }

        this.currentView = view;

        // Actualizar botones UI
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === view);
        });

        // Ocultar todas las vistas
        document.getElementById('split-view').classList.remove('active');
        document.getElementById('code-view').classList.remove('active');
        document.getElementById('visual-view').classList.remove('active');
        document.getElementById('visor-view').classList.remove('active');

        // Mostrar la elegida
        const activeViewElement = document.getElementById(`${view}-view`);
        if (activeViewElement) {
            activeViewElement.classList.add('active');
        }

        // Refrescar CodeMirror y Vista Previa
        setTimeout(() => {
            Editor.refresh();
            if (view !== 'code') Preview.update();
        }, 50);

        this.updateStatusBar(`Vista: ${view.toUpperCase()}`);
    },

    /**
     * Control de pestañas del panel lateral (VS Code Style)
     */
    // Se gestiona fuera de este objeto para ser más flexible, 
    // pero guardamos el estado aquí por si acaso.

    /**
     * Control de pestañas del Visor (Visor multimedia interno)
     */
    switchTab(tab) {
        this.currentTab = tab;
        this.setView(tab);
    },

    /**
     * Barra de estado
     */
    updateStatusBar(message) {
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            statusBar.innerHTML = `<span style="opacity:0.8;">${time}</span> | ${message}`;
        }
    },

    /**
     * Notificaciones sutiles (Estilo Toast)
     */
    showSuccess(msg) { this.notify(msg, 'var(--success)'); },
    showError(msg) { this.notify(msg, 'var(--error)'); },
    showWarning(msg) { this.notify(msg, 'var(--warning)'); },

    notify(msg, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 40px;
            right: 20px;
            background: var(--bg-secondary);
            color: ${color};
            padding: 10px 20px;
            border-radius: 4px;
            border-left: 4px solid ${color};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-size: 13px;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
        `;
        notification.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    showConfirm(titulo, msg, onConfirm) {
        if (confirm(msg)) onConfirm();
    },

    /**
     * Configuración
     */
    saveConfig() {
        localStorage.setItem('dw_config', JSON.stringify(this.config));
    },

    loadConfig() {
        const saved = localStorage.getItem('dw_config');
        if (saved) {
            try {
                this.config = { ...this.config, ...JSON.parse(saved) };
            } catch (e) { console.error('Error cargando config:', e); }
        }
    },

    /**
     * Eventos
     */
    setupAutoSave() {
        if (this.config.autoSave) {
            this.autoSaveTimer = setInterval(() => {
                if (this.isDirty) this.saveFile();
            }, this.config.autoSaveInterval);
        }
    },

    setupGlobalEvents() {
        // Detectar cambios en el editor
        window.addEventListener('editor-change', () => {
            if (!this.isDirty) {
                this.isDirty = true;
                this.updateStatusBar('Modificado *');
            }
        });

        // Detectar clics en la vista previa
        window.addEventListener('preview-click', (e) => {
            if (e.detail && e.detail.xpath) {
                Tree.selectStructureNode(e.detail.xpath);
            }
        });
    },

    // Funciones de conveniencia para comandos
    undo() { Editor.undo(); },
    redo() { Editor.redo(); },

    // === NUEVOS COMANDOS DE MENÚ ===
    // Edición
    cut() { this.notify('Cortar: No implementado en esta versión', 'var(--warning)'); },
    copy() { this.notify('Copiar: No implementado en esta versión', 'var(--warning)'); },
    paste() { this.notify('Pegar: No implementado en esta versión', 'var(--warning)'); },
    selectAll() { if (this.codeEditor) this.codeEditor.execCommand('selectAll'); },
    selectTag() { this.notify('Seleccionando etiqueta...', 'var(--accent)'); },
    preferences() { this.openDialog('modal-preferences'); },
    preferencias() { this.openDialog('modal-preferences'); },

    // Edición - Nuevas funciones
    line() { this.goToLine(); },
    code() { this.notify('Sugerencias de código...', 'var(--accent)'); },
    editor() { this.notify('Quick Tag Editor...', 'var(--accent)'); },
    vinculo() { this.notify('Editando vínculo...', 'var(--accent)'); },
    tabla() { this.openDialog('modal-table'); },
    imagen() { this.notify('Editando imagen...', 'var(--accent)'); },
    plantilla() { this.notify('Propiedades de plantilla...', 'var(--accent)'); },
    entradas() { this.notify('Entradas repetidas...', 'var(--accent)'); },
    text() { this.notify('Edición de texto...', 'var(--accent)'); },
    format() { this.notify('Formato de párrafo...', 'var(--accent)'); },
    list() { this.notify('Edición de lista...', 'var(--accent)'); },
    teclado() { this.notify('Métodos abreviados de teclado...', 'var(--accent)'); },

    // Ver
    toggleLive() { this.notify('Alternando modo En Vivo...', 'var(--accent)'); },
    toggleRulers() { this.notify('Código en vivo...', 'var(--accent)'); },
    toggleGrid() { this.notify('Inspeccionar...', 'var(--accent)'); },
    toggleGuides() { this.notify('Opciones de vista Código...', 'var(--accent)'); },
    toggleFullScreen() {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    },

    // Insertar
    insertDiv() { this.notify('Insertando elemento...', 'var(--success)'); },
    insertImage() { this.notify('Selector de imágenes no disponible', 'var(--warning)'); },
    insertLink() { this.notify('Insertando Hipervínculo...', 'var(--success)'); },
    insertTable() { this.openDialog('modal-table'); },
    insertHeader() { this.notify('Insertando <header>...', 'var(--success)'); },
    insertNav() { this.notify('Insertando <nav>...', 'var(--success)'); },
    insertMain() { this.notify('Insertando <main>...', 'var(--success)'); },
    insertFooter() { this.notify('Insertando <footer>...', 'var(--success)'); },

    // Herramientas
    formatCode() { this.notify('Formateando código...', 'var(--accent)'); },
    cleanHTML() { this.notify('Limpiando HTML...', 'var(--accent)'); },
    checkLinks() { this.notify('Comprobando vínculos...', 'var(--accent)'); },

    // Archivo (diálogos)
    pageProperties() { this.openDialog('modal-page-props'); },

    // Sitio
    newSite() { this.openDialog('modal-site-config'); },
    manageSites() { this.openDialog('modal-site-config'); },

    // Ventana
    togglePanel(panel) {
        this.notify(`Alternando panel: ${panel}`, 'var(--accent)');
    },


    // === SISTEMA DE DIÁLOGOS ===
    openDialog(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.classList.add('show'));
        }
    },

    closeDialog(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = 'none'; }, 250);
        }
    },

    switchDialogTab(btn, tabId) {
        // Desactivar todas las pestañas del mismo modal
        const tabsContainer = btn.parentElement;
        tabsContainer.querySelectorAll('.modal-tab-btn').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');

        // Mostrar la pestaña correspondiente
        const modalBody = tabsContainer.nextElementSibling;
        modalBody.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');
    },

    // === ACCIONES DE DIÁLOGOS ===
    applyPageProps() {
        this.notify('Propiedades de página aplicadas', 'var(--success)');
    },

    applyPreferences() {
        this.notify('Preferencias guardadas', 'var(--success)');
    },

    doInsertTable() {
        const rows = document.getElementById('tbl-rows')?.value || 3;
        const cols = document.getElementById('tbl-cols')?.value || 3;
        this.notify(`Tabla ${rows}×${cols} insertada`, 'var(--success)');
        this.closeDialog('modal-table');
    },

    // Buscar
    showFind() {
        const panel = document.getElementById('search-panel');
        if (panel) panel.style.display = 'block';
    },

    goToLine() {
        const line = prompt('Número de línea:');
        if (line && !isNaN(line)) Editor.goToLine(parseInt(line));
    },

    refresh() {
        this.loadStructure();
        Preview.update();
    }
};


// Auto-iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
