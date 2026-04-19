/**
 * ═gly══════════════════════════════════════════════════════════
 * PREVIEW - El Visor inteligente (Sin parpadeos ni errores de rutas)
 * ═gly════════════════════════════════════════════════════════════
 */

const Preview = {
    frame: null,
    currentViewport: 'desktop',
    cachedHtml: '',
    isUpdating: false,
    watcher: null, // Nuestro vigilante

    init() {
        console.log('✅ Preview inicializado');

        // Crear el vigilante (se queda mirando el visor en todo momento)
        this.watcher = new MutationObserver((mutations) => {
            if (mutations.length === 0) return; // Si no hay cambios, no hacemos nada
            this.arreglarRutasEnIframe(); // Llamamos a nuestra función mágica
        });

        // Escuchar los mensajes del iframe (clics en elementos)
        window.addEventListener('message', (e) => {
            if (!e.data) return;
            if (e.data.type === 'element-selected') this.handleElementClick(e.data);
            if (e.data.type === 'missing-image') App.buscarCarpetaPerdida(e.data.src);
        });
    },

    /**
     * Conectar el vigilante al visor (se hace una sola vez)
     */
    conectarVisor() {
        const isVisualMode = App.currentView === 'visual';
        const targetId = isVisualMode ? 'visual-only-frame' : 'preview-frame';
        const targetFrame = document.getElementById(targetId);

        if (this.watcher && targetFrame) {
            this.watcher.disconnect(); // Desconectamos el vigilante antiguo
            this.watcher.observe(targetFrame, { childList: true, subtree: true }); // Empieza a vigilar todo lo que hay dentro del visor
        }
    },

    /**
     * Actualizar contenido
     */
    update() {
        if (this.isUpdating) {
            console.log('%c🛑 [VISOR] Bloqueado. Ya se está actualizando.', 'color: grey;');
            return;
        }
        this.isUpdating = true;

        const isVisualMode = App.currentView === 'visual';
        const targetId = isVisualMode ? 'visual-only-frame' : 'preview-frame';
        const targetFrame = document.getElementById(targetId);

        if (this.cachedHtml && targetFrame) {
            console.log('%c🟢 [VISOR] Tenía memoria. Inyectando y conectando el vigilante.', 'color: green;');
            targetFrame.srcdoc = this.cachedHtml;

            // LA MAGIA: En lugar de usar un setTimeout, conectamos al vigilante.
            // El vigilante esperará a que el navegador termine de dibujar todo.
            // Si falla la carga de una imagen (404), el vigilante lo detecta y lo reemplaza al instante.
            this.conectarVisor();

            this.isUpdating = false;
            return;
        }

        console.log('%c🔴 [VISOR] Sin memoria. Pidiendo a Python por única vez...', 'color: red;');
        fetch('/api/html-preview')
            .then(r => r.text())
            .then(html => {
                this.cachedHtml = html;
                if (targetFrame) targetFrame.srcdoc = html;

                // Conectamos el vigilante de nuevo
                this.conectarVisor();

                this.isUpdating = false;
            });
    },

    /**
     * EL SUPER PODER: Arreglar rutas rotas sin importar nada y sin parpadeos
     */
    arreglarRutasEnIframe() {
        try {
            const isVisualMode = App.currentView === 'visual';
            const targetFrame = document.getElementById(isVisualMode ? 'visual-only-frame' : 'preview-frame');
            const doc = targetFrame ? targetFrame.contentDocument : null;
            if (!doc) return;

            // Buscar todas las imágenes y CSS que no sean de internet
            const elementosRotos = doc.querySelectorAll('img[src]:not([data-cargado]), link[href]:not([data-cargado])');

            elementosRotos.forEach(elemento => {
                let srcOriginal = elemento.getAttribute('src') || elemento.getAttribute('href');
                // Si la ruta no empieza por http (no es de internet) y no empieza por /project-files (no es de nuestro servidor), la arreglamos
                if (srcOriginal && !srcOriginal.startsWith('http') && !srcOriginal.startsWith('/project-files')) {
                    // Si es un enlace <link> es 'href', si es una imagen es 'src'
                    const atributo = elemento.tagName.toLowerCase() === 'link' ? 'href' : 'src';
                    elemento.setAttribute(atributo, '/project-files' + srcOriginal);
                }
            });

        } catch (error) {
            console.error('Error al leer el visor:', error);
        }
    },

    forceUpdate() {
        console.log('%c⚠️ [VISOR] forceUpdate() forzado.', 'color: purple;');
        this.cachedHtml = '';
        this.isUpdating = false;
        this.update();
    },

    handleElementClick(data) {
        fetch(`/api/element-by-dwId?dwid=${data.dwId}`)
            .then(r => r.json())
            .then(elemData => {
                if (elemData && elemData.tag) {
                    Properties.currentXPath = elemData.xpath;
                    Properties.showProperties(elemData);
                    let searchTerm = elemData.tag;
                    if (elemData.id) searchTerm += `#${elemData.id}`;
                    else if (elemData.clases) searchTerm += `.${elemData.clases.split(' ')[0]}`;
                    if (typeof Tree !== 'undefined') Tree.highlightByTag(searchTerm);
                }
            });
    },

    setViewport(type) {
        this.currentViewport = type;
        const frame = document.getElementById('visual-only-frame') || document.getElementById('preview-frame');
        if (!frame) return;

        // Limpiar clase activa de todos los botones de viewport
        document.querySelectorAll('.view-toggle .btn-icon').forEach(btn => btn.classList.remove('active'));
        
        // Marcar el actual como activo
        const activeBtn = document.querySelector(`.btn-icon[onclick*="${type}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        const widths = { desktop: '100%', tablet: '768px', mobile: '375px' };
        frame.style.maxWidth = widths[type] || '100%';
        frame.style.margin = type === 'desktop' ? '0' : '0 auto';
        frame.style.boxShadow = type === 'desktop' ? 'none' : '0 0 20px rgba(0,0,0,0.3)';
        frame.style.border = type === 'desktop' ? 'none' : '1px solid var(--border)';
    }
};