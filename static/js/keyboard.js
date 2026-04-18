/**
 * ═══════════════════════════════════════════════════════════════
 * KEYBOARD - Atajos de teclado
 * ═══════════════════════════════════════════════════════════════
 */

const Keyboard = {
    shortcuts: {
        'Ctrl+S': { action: 'save', description: 'Guardar archivo' },
        'Ctrl+Z': { action: 'undo', description: 'Deshacer' },
        'Ctrl+Y': { action: 'redo', description: 'Rehacer' },
        'Ctrl+D': { action: 'duplicate', description: 'Duplicar elemento' },
        'Delete': { action: 'delete', description: 'Eliminar elemento' },
        'Ctrl+Shift+?': { action: 'help', description: 'Mostrar ayuda' },
        'Ctrl+P': { action: 'preview', description: 'Cambiar vista' },
        'Ctrl+1': { action: 'viewSplit', description: 'Vista dividida' },
        'Ctrl+2': { action: 'viewCode', description: 'Vista código' },
        'Ctrl+3': { action: 'viewVisual', description: 'Vista visual' },
        'Ctrl+Shift+T': { action: 'toggleTheme', description: 'Cambiar tema' },
        'Escape': { action: 'escape', description: 'Cerrar modal/panel' },
        'F2': { action: 'rename', description: 'Renombrar elemento' },
        'Ctrl+G': { action: 'goToLine', description: 'Ir a línea' },
        'Ctrl+F': { action: 'find', description: 'Buscar' },
        'Ctrl+H': { action: 'findReplace', description: 'Buscar y reemplazar' }
    },
    
    /**
     * Inicializar atajos de teclado
     */
    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        console.log('✅ Atajos de teclado inicializados');
    },
    
    /**
     * Manejar evento de teclado
     */
    handleKeydown(e) {
        // Construir combinación de teclas
        const combo = this.getCombo(e);
        
        // Buscar shortcut
        const shortcut = this.shortcuts[combo];
        
        if (shortcut) {
            e.preventDefault();
            this.executeAction(shortcut.action);
        }
    },
    
    /**
     * Obtener combinación de teclas
     */
    getCombo(e) {
        const parts = [];
        
        if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
        if (e.shiftKey) parts.push('Shift');
        if (e.altKey) parts.push('Alt');
        
        // Agregar tecla principal
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        parts.push(key);
        
        return parts.join('+');
    },
    
    /**
     * Ejecutar acción
     */
    executeAction(action) {
        switch (action) {
            case 'save':
                App.saveFile();
                break;
                
            case 'undo':
                App.undo();
                break;
                
            case 'redo':
                App.redo();
                break;
                
            case 'duplicate':
                Properties.duplicateElement();
                break;
                
            case 'delete':
                if (Properties.currentXPath) {
                    Properties.deleteElement();
                }
                break;
                
            case 'help':
                this.showHelp();
                break;
                
            case 'preview':
                this.cycleView();
                break;
                
            case 'viewSplit':
                App.setView('split');
                break;
                
            case 'viewCode':
                App.setView('code');
                break;
                
            case 'viewVisual':
                App.setView('visual');
                break;
                
            case 'toggleTheme':
                Themes.toggle();
                break;
                
            case 'escape':
                this.handleEscape();
                break;
                
            case 'rename':
                this.renameElement();
                break;
                
            case 'goToLine':
                this.showGoToLine();
                break;
                
            case 'find':
                this.showFind();
                break;
                
            case 'findReplace':
                this.showFindReplace();
                break;
                
            default:
                console.log('Acción no implementada:', action);
        }
    },
    
    /**
     * Manejar Escape
     */
    handleEscape() {
        // Cerrar modal si está abierto
        const modal = document.getElementById('modal');
        if (modal && modal.classList.contains('show')) {
            App.hideModal();
            return;
        }
        
        // Cerrar snippets panel si está abierto
        const snippetsPanel = document.getElementById('snippets-panel');
        if (snippetsPanel && snippetsPanel.classList.contains('open')) {
            snippetsPanel.classList.remove('open');
            return;
        }
        
        // Deseleccionar elemento
        if (Properties.currentXPath) {
            Properties.showEmpty();
            Tree.selectedXPath = null;
            document.querySelectorAll('.tree-header').forEach(h => h.classList.remove('selected'));
        }
    },
    
    /**
     * Ciclar entre vistas
     */
    cycleView() {
        const views = ['split', 'code', 'visual'];
        const currentIndex = views.indexOf(App.currentView);
        const nextIndex = (currentIndex + 1) % views.length;
        App.setView(views[nextIndex]);
    },
    
    /**
     * Mostrar ayuda
     */
    showHelp() {
        const shortcutsList = Object.entries(this.shortcuts)
            .map(([key, value]) => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                    <div style="display: flex; gap: 8px;">
                        ${key.split('+').map(k => `<span class="shortcut-key">${k}</span>`).join('<span>+</span>')}
                    </div>
                    <div style="color: var(--text-secondary);">${value.description}</div>
                </div>
            `)
            .join('');
        
        App.showConfirm(
            '⌨️ Atajos de Teclado',
            `<div style="max-height: 400px; overflow-y: auto;">${shortcutsList}</div>`,
            () => App.hideModal()
        );
    },
    
    /**
     * Renombrar elemento (cambiar ID)
     */
    renameElement() {
        if (!Properties.currentXPath) {
            App.showWarning('Selecciona un elemento primero');
            return;
        }
        
        const idInput = document.getElementById('prop-id');
        if (idInput) {
            idInput.focus();
            idInput.select();
        }
    },
    
    /**
     * Mostrar ir a línea
     */
    showGoToLine() {
        const line = prompt('Número de línea:');
        if (line && !isNaN(line)) {
            Editor.goToLine(parseInt(line));
        }
    },
    
    /**
     * Mostrar buscar
     */
    showFind() {
        const searchTerm = prompt('Buscar:');
        if (searchTerm) {
            Editor.instances.main.execCommand('find', searchTerm);
        }
    },
    
    /**
     * Mostrar buscar y reemplazar
     */
    showFindReplace() {
        const findText = prompt('Buscar:');
        if (findText) {
            const replaceText = prompt('Reemplazar con:');
            const all = confirm('¿Reemplazar todos?');
            Editor.findAndReplace(findText, replaceText || '', all);
        }
    },
    
    /**
     * Manejar eventos globales
     */
    handleGlobal(e) {
        // Ya manejado en handleKeydown
    }
};
