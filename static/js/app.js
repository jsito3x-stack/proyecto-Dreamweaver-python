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
     */
    async loadInitialData() {
        try {
            // Cargar proyecto
            await this.loadProject();

            // Cargar estructura
            await this.loadStructure();

            // Cargar código
            await this.loadCode();

            // Cargar snippets
            await Snippets.load();

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showError('Error al cargar los datos iniciales');
        }
    },

    /**
     * Cargar configuración guardada
     */
    loadConfig() {
        const savedConfig = localStorage.getItem('dw-config');
        if (savedConfig) {
            try {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            } catch (e) {
                console.error('Error cargando configuración:', e);
            }
        }
    },

    /**
     * Guardar configuración
     */
    saveConfig() {
        localStorage.setItem('dw-config', JSON.stringify(this.config));
    },

    /**
     * Cargar proyecto
     */
    async loadProject() {
        try {
            const response = await fetch('/api/project');
            const data = await response.json();

            // Extraer el nombre de la carpeta madre (ej: "C:/.../web_prueba" -> "web_prueba")
            let nombreProyecto = 'Proyecto';
            if (data.proyecto) {
                // Quitamos las barras y nos quedamos con la última palabra
                nombreProyecto = data.proyecto.split(/[/\\]/).filter(Boolean).pop();
            }

            Tree.renderFileTree(data.archivos || [], nombreProyecto);
            this.updateStatusBar(`Proyecto: ${nombreProyecto} (${data.archivos?.length || 0} archivos)`);
        } catch (error) {
            console.error('Error cargando proyecto:', error);
            Tree.renderFileTree([]);
        }
    },

    /**
     * Cargar estructura del documento
     */
    async loadStructure() {
        try {
            const response = await fetch('/api/structure');
            const data = await response.json();
            Tree.renderStructure(data);
        } catch (error) {
            console.error('Error cargando estructura:', error);
        }
    },

    /**
     * Cargar código
     */
    async loadCode() {
        console.log('%c📜 [APP] loadCode() ejecutado.', 'color: grey;');
        try {
            const response = await fetch('/api/html');
            const html = await response.text();

            // 1. Metemos el texto en el editor
            Editor.setValue(html);

            // 2. NO llamamos a la vista previa aquí. El visor debe estar apagado al arrancar.

        } catch (error) {
            console.error('Error cargando código:', error);
        }
    },

    /**
     * Configurar auto-guardado
     */
    setupAutoSave() {
        if (this.config.autoSave) {
            this.autoSaveTimer = setInterval(() => {
                if (this.isDirty) {
                    this.saveFile();
                }
            }, this.config.autoSaveInterval);
        }
    },

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Antes de cerrar
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
            // Detectar imágenes rotas que vienen del iframe de vista previa
            if (e.data && e.data.type === 'missing-image') {
                const srcRoto = e.data.src;
                this.showWarning(`Imagen no encontrada: ${srcRoto}`);

                // Crear un botón flotante para buscar la carpeta
                const btnFix = document.createElement('button');
                btnFix.className = 'btn btn-primary';
                btnFix.style.cssText = 'position: fixed; bottom: 50px; right: 20px; z-index: 9999; background: #f59e0b;';
                btnFix.innerHTML = `<i class="fas fa-search"></i> Buscar carpeta para: ${srcRoto}`;
                btnFix.onclick = () => {
                    btnFix.remove();
                    this.buscarCarpetaPerdida(srcRoto);
                };
                document.body.appendChild(btnFix);
            }
        });

        // Evento de teclado global
        document.addEventListener('keydown', (e) => {
            Keyboard.handleGlobal(e);
        });

        // Evento de resize
        window.addEventListener('resize', debounce(() => {
            Editor.refresh();
        }, 250));
    },

    /**
    * Buscar carpeta para imagen perdida
    */
    async buscarCarpetaPerdida(srcRoto) {
        try {
            const response = await fetch('/api/fix-missing-path', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src: srcRoto })
            });

            const data = await response.json();

            if (data.success) {
                this.showSuccess('Carpeta enlazada correctamente. Recargando vista...');
                // Refrescar solo la vista previa para ver si ahora sale la imagen
                setTimeout(() => Preview.update(), 500);
            }
        } catch (error) {
            this.showError('Error al buscar la carpeta');
        }
    },

    /**
     * Cambiar pestaña (HTML/CSS/JavaScript/Visor)
     */
    switchTab(tab) {
        this.currentTab = tab;

        // SEGURIDAD: Apagar el visor siempre que cambiemos a HTML, CSS o JS
        document.getElementById('visor-view')?.classList.remove('active');

        // Si es la pestaña Visor, mostrar y parar
        if (tab === 'visor') {
            this.showOnlyView('visor-view');
            return;
        }

        // INTELIGENCIA: Si veníamos del Visor o del modo Visual, forzar la vista de Código
        let viewToShow = this.currentView;
        if (viewToShow === 'visual') {
            viewToShow = 'code'; // Si le das a un código, mostramos el editor
        }

        // Mostrar la vista correspondiente
        this.showOnlyView(`${viewToShow}-view`);

        // Cambiar el color del editor de código
        Editor.setMode(tab);

        // Cargar contenido de la API
        this.loadTabContent(tab);
    },
    // Función auxiliar nueva para mostrar solo la ventana que queramos
    showOnlyView(viewId) {
        console.log(`%c🔄 [VISTA] Cambiando a: ${viewId}`, 'color: cyan; font-weight: bold;');

        document.getElementById('split-view')?.classList.remove('active');
        document.getElementById('code-view')?.classList.remove('active');
        document.getElementById('visual-view')?.classList.remove('active');
        document.getElementById('visor-view')?.classList.remove('active');

        document.getElementById(viewId)?.classList.add('active');

        setTimeout(() => {
            if (typeof Preview !== 'undefined' && Preview.cachedHtml) {
                const frameDividido = document.getElementById('preview-frame');
                const frameVisual = document.getElementById('visual-only-frame');

                if (frameDividido && frameDividido.classList.contains('active')) {
                    frameDividido.srcdoc = Preview.cachedHtml;
                }
                if (frameVisual && frameVisual.classList.contains('active')) {
                    frameVisual.srcdoc = Preview.cachedHtml;
                }
            }
            Editor.refresh();
        }, 10);
    },

    /**
     * Cargar contenido de pestaña
     */
    async loadTabContent(tab) {
        try {
            const url = `/api/${tab}`;
            const response = await fetch(url);
            const content = await response.text();

            Editor.setValue(content, tab);

        } catch (error) {
            console.error(`Error cargando ${tab}:`, error);
        }
    },

    /**
     * Cambiar vista (Split/Code/Visual)
     */
    setView(view) {
        // Si estábamos en el Visor, volvemos a HTML y aplicamos la vista pedida
        if (this.currentTab === 'visor') {
            this.switchTab('html');
            setTimeout(() => this.showOnlyView(`${view}-view`), 10);
            return;
        }

        this.currentView = view;

        // Actualizar botones inferiores
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.view-btn[onclick="setView('${view}')"]`)?.classList.add('active');

        // Apagar todas las vistas
        this.showOnlyView(`${view}-view`);

        // Refrescar editor SI NO estamos en visual
        if (view !== 'visual') {
            Editor.refresh();
        }

        // ACTUALIZAR VISTA PREVIA solo si cambiamos de vista (evita parpadeos innecesarios)
        if ((view === 'split' || view === 'visual') && this.previousView !== view) {
            Preview.update();
        }

        // Recordar la vista actual para el próximo cambio
        this.previousView = view;
    },

    /**
     * Guardar archivo
     */
    async saveFile() {
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}) // <-- Esto es lo que faltaba
            });
            const data = await response.json();

            if (data.success) {
                this.isDirty = false;
                this.showSuccess(`Guardado: ${data.ruta}`);
                this.updateStatusBar('Guardado ✓');
            } else {
                this.showError('Error al guardar: ' + (data.error || 'Desconocido'));
            }

        } catch (error) {
            console.error('Error guardando:', error);
            this.showError('Error al guardar el archivo');
        }
    },

    /**
     * Deshacer
     */
    async undo() {
        try {
            const response = await fetch('/api/undo', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                await this.refresh();
                this.showSuccess('↩️ ' + data.message);
            } else {
                this.showWarning(data.message || 'Nada que deshacer');
            }

        } catch (error) {
            console.error('Error deshaciendo:', error);
            this.showError('Error al deshacer');
        }
    },

    /**
     * Rehacer
     */
    async redo() {
        try {
            const response = await fetch('/api/redo', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                await this.refresh();
                this.showSuccess('↪️ ' + data.message);
            } else {
                this.showWarning(data.message || 'Nada que rehacer');
            }

        } catch (error) {
            console.error('Error rehaciendo:', error);
            this.showError('Error al rehacer');
        }
    },

    /**
     * Refrescar todo
     */
    async refresh() {
        await this.loadStructure();

    },

    /**
     * Abrir carpeta completa
     */
    openFolder() {
        this.updateStatusBar('Abriendo explorador de carpetas...');

        // Le decimos al visor que borre lo que tenga en memoria, porque viene código nuevo
        if (typeof Preview !== 'undefined') {
            Preview.cachedHtml = '';
        }

        fetch('/api/load-folder', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Ya no necesitamos llamar a loadCode() aquí porque 
                    // loadInitialData() de App.init() ya lo hace al arrancar.
                    
                    // Refrescamos solo lo visual del proyecto (el árbol y la vista previa)
                    this.loadProject();
                    this.loadStructure();
                    Preview.forceUpdate(); // Le decimos al visor que actualice su memoria

                    this.showSuccess(`Carpeta cargada (${data.archivos} archivos)`);
                } else {
                    this.showError('Error: ' + (data.error || 'Desconceido'));
                }
                this.updateStatusBar('Listo');
            })
            .catch(error => {
                console.error("ERROR GRAVE EN JS:", error);
                this.showError('Error al comunicar con Python');
                this.updateStatusBar('Error');
            });
    },

    /**
     * Abrir archivo
     */
    openFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.html,.htm,.css,.js';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const content = await file.text();

                const response = await fetch('/api/load-file', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: file.name,
                        contenido: content
                    })
                });

                const data = await response.json();

                if (data.success) {
                    await this.refresh();
                    this.showSuccess(`Archivo cargado: ${file.name}`);
                } else {
                    this.showError('Error al cargar el archivo');
                }

            } catch (error) {
                console.error('Error:', error);
                this.showError('Error al leer el archivo');
            }
        };

        input.click();
    },

    /**
     * Marcar como modificado
     */
    markDirty() {
        this.isDirty = true;
        this.updateStatusBar('Modificado ●');
        // AVISAR AL VISOR DE QUE DEBE ACTUALIZARSE
        if (typeof Preview !== 'undefined') Preview.forceUpdate();
    },

    /**
     * Actualizar barra de estado
     */
    updateStatusBar(text) {
        const statusEl = document.getElementById('status-message');
        if (statusEl) {
            statusEl.textContent = text;
        }
    },

    /**
     * Mostrar mensaje de éxito
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    },

    /**
     * Mostrar mensaje de error
     */
    showError(message) {
        this.showToast(message, 'error');
    },

    /**
     * Mostrar mensaje de advertencia
     */
    showWarning(message) {
        this.showToast(message, 'warning');
    },

    /**
     * Mostrar toast
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    /**
     * Mostrar modal de confirmación
     */
    showConfirm(title, message, onConfirm) {
        const modal = document.getElementById('modal');
        const titleEl = document.getElementById('modal-title');
        const contentEl = document.getElementById('modal-content');
        const confirmBtn = document.getElementById('modal-confirm');

        if (titleEl) titleEl.textContent = title;
        if (contentEl) contentEl.innerHTML = message;

        if (confirmBtn) {
            confirmBtn.onclick = () => {
                onConfirm();
                this.hideModal();
            };
        }

        if (modal) modal.classList.add('show');
    },

    /**
     * Ocultar modal
     */
    hideModal() {
        const modal = document.getElementById('modal');
        if (modal) modal.classList.remove('show');
    }
};

// Funciones de utilidad
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Si App.init sigue siendo una función, es que no se ha ejecutado aún
    if (typeof App.init === 'function') {
        console.log('🚀 Primera vez. Iniciando...');
        App.init(); // Ejecutamos el código
        App.init = true; // ¡LA MAGIA DE TÚ! Reemplazamos la función por la palabra 'true'
    } else {
        console.log('⚠️ Intento de arranque bloqueado. Ya se inició antes.');
        return; // Si ya no es una función, nos vamos
    }
});





