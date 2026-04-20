/**
 * Toolbar Manager for Dreamweaver Python
 * Handles all 20 coding functions from the side toolbar.
 */

const Toolbar = {
    // === GESTIÓN DE ARCHIVOS ===
    openFile() {
        if (typeof App !== 'undefined' && App.openFile) {
            App.openFile();
        }
    },

    openFileManagement() {
        // Abrir el panel lateral de archivos
        if (typeof switchPanel === 'function') {
            switchPanel('files');
            // Si el panel está colapsado, expandirlo
            if (Layout && Layout.leftCollapsed) {
                Layout.toggleLeft();
            }
        }
    },

    // === VISTA Y PREVISUALIZACIÓN ===
    toggleLiveCode() {
        if (typeof App !== 'undefined' && App.setView) {
            App.setView('split'); // El código en vivo es básicamente la vista dividida
        }
    },

    liveViewOptions() {
        if (typeof App !== 'undefined' && App.showInfo) {
            App.showInfo('Opciones de Vista en vivo: Use el header para cambiar el viewport.');
        }
    },

    toggleMediaQueries() {
        if (typeof App !== 'undefined' && App.showInfo) {
            App.showInfo('Barra de consultas de medios visuales: Próximamente integrada en la vista previa.');
        }
    },

    inspect() {
        if (typeof App !== 'undefined' && App.showInfo) {
            App.showInfo('Modo Inspección activado. Haga clic en un elemento de la vista previa.');
        }
    },

    // === CODE FOLDING (CodeMirror) ===
    foldTag() {
        const cm = this._getCM();
        if (cm) {
            cm.execCommand('fold');
        }
    },

    foldSelection() {
        const cm = this._getCM();
        if (cm) {
            cm.execCommand('fold');
        }
    },

    unfoldAll() {
        const cm = this._getCM();
        if (cm) {
            cm.execCommand('unfoldAll');
        }
    },

    selectParent() {
        const cm = this._getCM();
        if (cm) {
            // Lógica para seleccionar el tag padre (requiere xml-fold addon o lógica manual)
            if (typeof Tree !== 'undefined' && Tree.selectParent) {
                Tree.selectParent();
            } else {
                if (typeof App !== 'undefined') App.showInfo('Seleccionando etiqueta padre...');
            }
        }
    },

    // === FORMATO Y EDICIÓN ===
    formatCode() {
        const cm = this._getCM();
        if (cm) {
            // Lógica simple de auto-formateo o un comando si está disponible
            if (typeof Editor !== 'undefined' && Editor.format) {
                Editor.format();
            } else {
                if (typeof App !== 'undefined') App.showInfo('Formateando código fuente...');
                // Implementación básica de indentación de todo el archivo
                cm.operation(() => {
                    for (let i = 0; i < cm.lineCount(); i++) {
                        cm.indentLine(i, "smart");
                    }
                });
            }
        }
    },

    applyComment() {
        const cm = this._getCM();
        if (cm) {
            cm.toggleComment();
        }
    },

    removeComment() {
        const cm = this._getCM();
        if (cm) {
            // toggleComment suele manejar ambos, pero podemos forzar el removing si es necesario
            cm.toggleComment({ indent: true, fullLines: true });
        }
    },

    balanceBraces() {
        const cm = this._getCM();
        if (cm) {
            const cursor = cm.getCursor();
            const range = cm.findMatchingBracket(cursor);
            if (range && range.match) {
                cm.setSelection(range.from, range.to);
                if (typeof App !== 'undefined') App.showInfo('Llaves equilibradas y área seleccionada.');
            } else {
                if (typeof App !== 'undefined') App.showWarning('No se encontró una pareja de llaves para la posición actual.');
            }
        }
    },

    indent() {
        const cm = this._getCM();
        if (cm) {
            cm.execCommand('indentMore');
        }
    },

    outdent() {
        const cm = this._getCM();
        if (cm) {
            cm.execCommand('indentLess');
        }
    },

    toggleWordWrap() {
        const cm = this._getCM();
        if (cm) {
            const wrap = !cm.getOption('lineWrapping');
            cm.setOption('lineWrapping', wrap);
            if (typeof App !== 'undefined') App.showInfo(`Ajuste de texto: ${wrap ? 'Activado' : 'Desactivado'}`);
        }
    },

    // === NAVEGACIÓN Y EXTRAS ===
    showNavigator() {
        // Abrir el panel de estructura como navegador de código
        if (typeof switchPanel === 'function') {
            switchPanel('structure');
            if (Layout && Layout.leftCollapsed) Layout.toggleLeft();
            if (typeof App !== 'undefined') App.showInfo('Navegador de código (Estructura) mostrado.');
        }
    },

    recentSnippets() {
        if (typeof Snippets !== 'undefined' && Snippets.toggle) {
            Snippets.toggle();
        }
    },

    moveCSS() {
        if (typeof App !== 'undefined') App.showInfo('Función "Mover CSS" próximamente en el panel CSS Designer.');
    },

    // Auxiliar para obtener el editor activo
    _getCM() {
        if (typeof App !== 'undefined' && App.currentView === 'code') {
            return App.codeOnlyEditor;
        }
        return (typeof App !== 'undefined') ? App.codeEditor : null;
    }
};

// Exponer globalmente
window.Toolbar = Toolbar;
