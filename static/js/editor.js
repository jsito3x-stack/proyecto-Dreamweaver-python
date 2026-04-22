
/**
* Función de utilidad para limitar la frecuencia de ejecución
*/
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}
/**
 * ═══════════════════════════════════════════════════════════════
 * EDITOR - Gestión de CodeMirror y sincronización
 * ═══════════════════════════════════════════════════════════════
 */

const Editor = {
    instances: {},
    currentMode: 'htmlmixed',



    /**
     * Inicializar editores
     */
    async init() {
        // Editor principal (vista dividida)
        const mainTextArea = document.getElementById('code-editor');
        if (mainTextArea) {
            this.instances.main = CodeMirror.fromTextArea(mainTextArea, {
                mode: 'htmlmixed',
                theme: App.config.theme === 'dark' ? 'dracula' : 'default',
                lineNumbers: App.config.lineNumbers,
                lineWrapping: App.config.lineWrapping,
                tabSize: App.config.tabSize,
                autoCloseBrackets: App.config.autoCloseBrackets,
                autoCloseTags: App.config.autoCloseTags,
                matchBrackets: true,
                indentUnit: App.config.tabSize,
                styleActiveLine: true,
                foldGutter: true,
                gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                extraKeys: {
                    'Ctrl-Space': 'autocomplete',
                    'Ctrl-/': 'toggleComment',
                    'Ctrl-S': (cm) => { App.saveFile(); },
                    'Ctrl-Z': () => { App.undo(); },
                    'Ctrl-Y': () => { App.redo(); },
                    'Ctrl-D': () => { Properties.duplicateElement(); },
                }
            });

            // Eventos
            this.instances.main.on('change', () => {
                this.onCodeChange();
            });

            this.instances.main.on('cursorActivity', () => {
                this.onCursorChange();
            });

            // Vincular con App
            App.codeEditor = this.instances.main;
        }

        // Editor solo código
        const codeOnlyTextArea = document.getElementById('code-only-editor');
        if (codeOnlyTextArea) {
            this.instances.codeOnly = CodeMirror.fromTextArea(codeOnlyTextArea, {
                mode: 'htmlmixed',
                theme: App.config.theme === 'dark' ? 'dracula' : 'default',
                lineNumbers: true,
                lineWrapping: true,
                tabSize: App.config.tabSize
            });

            this.instances.codeOnly.on('change', () => {
                this.onCodeChange();
            });

            // Vincular con App
            App.codeOnlyEditor = this.instances.codeOnly;
        }

        console.log('✅ Editores inicializados');
    },



    /**
     * Establecer valor del código
     */
    setValue(code, mode = null) {
        if (mode) {
            this.setMode(mode);
        }

        if (this.instances.main) {
            this.instances.main.setValue(code);
        }

        if (this.instances.codeOnly) {
            this.instances.codeOnly.setValue(code);
        }
    },

    /**
     * Obtener valor del código
     */
    getValue() {
        return this.instances.main ? this.instances.main.getValue() : '';
    },

    /**
     * Establecer modo del editor
     */
    setMode(mode) {
        this.currentMode = mode;

        const modeMap = {
            'html': 'htmlmixed',
            'css': 'css',
            'js': 'javascript'
        };

        const cmMode = modeMap[mode] || 'htmlmixed';

        if (this.instances.main) {
            this.instances.main.setOption('mode', cmMode);
        }

        if (this.instances.codeOnly) {
            this.instances.codeOnly.setOption('mode', cmMode);
        }
    },

    /**
     * Refrescar editores
     */
    refresh() {
        if (this.instances.main) {
            this.instances.main.refresh();
        }

        if (this.instances.codeOnly) {
            this.instances.codeOnly.refresh();
        }
    },

    /**
     * Cuando cambia el código
     */
    onCodeChange: debounce(function () {
        // Marcar como modificado
        App.markDirty();

        // Sincronizar con servidor
        syncCodeToServer();

        // Actualizar preview
        Preview.update();
    }, 500),

    /**
     * Cuando cambia el cursor
     */
    onCursorChange() {
        // Obtener línea y posición actual
        const cursor = this.instances.main.getCursor();

        // Actualizar status bar
        App.updateStatusBar(`Línea ${cursor.line + 1}, Columna ${cursor.ch + 1}`);

        // Buscar elemento correspondiente en el árbol (opcional)
        this.highlightElementAtPosition(cursor);
    },

    /**
     * Resaltar elemento en la posición del cursor
     */
    highlightElementAtPosition(cursor) {
        // Obtener línea actual
        const line = this.instances.main.getLine(cursor.line);

        // Buscar etiqueta en la línea
        const tagMatch = line.match(/<(\w+)/);
        if (tagMatch) {
            // Buscar en el árbol
            Tree.highlightByTag(tagMatch[1]);
        }
    },

    /**
     * Insertar texto en la posición del cursor
     */
    insertText(text) {
        if (this.instances.main) {
            const cursor = this.instances.main.getCursor();
            this.instances.main.replaceRange(text, cursor);
            this.instances.main.focus();
        }
    },

    /**
     * Obtener selección actual
     */
    getSelection() {
        if (this.instances.main) {
            return this.instances.main.getSelection();
        }
        return '';
    },

    /**
     * Establecer selección
     */
    setSelection(from, to) {
        if (this.instances.main) {
            this.instances.main.setSelection(from, to);
        }
    },

    /**
     * Buscar y reemplazar
     */
    findAndReplace(findText, replaceText, all = false) {
        if (this.instances.main) {
            const cursor = this.instances.main.getSearchCursor(findText);

            if (all) {
                while (cursor.findNext()) {
                    cursor.replace(replaceText);
                }
            } else {
                if (cursor.findNext()) {
                    cursor.replace(replaceText);
                }
            }
        }
    },

    /**
     * Formatear código
     */
    formatCode() {
        if (this.instances.main) {
            const code = this.instances.main.getValue();
            // Aquí podrías usar una librería de formateo como js-beautify
            // Por ahora solo reindentamos
            const totalLines = this.instances.main.lineCount();
            for (let i = 0; i < totalLines; i++) {
                this.instances.main.indentLine(i, 'smart');
            }
        }
    },

    /**
     * Ir a línea
     */
    goToLine(lineNumber) {
        if (this.instances.main) {
            this.instances.main.setCursor(lineNumber - 1, 0);
            this.instances.main.focus();
        }
    }
};

/**
 * Sincronizar código con servidor
 */
async function syncCodeToServer() {
    const code = Editor.getValue();
    const type = App.currentTab;

    try {
        await fetch('/api/update-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: type,
                codigo: code
            })
        });

        // Actualizar estructura si es HTML
        if (type === 'html') {
            await App.loadStructure();
        }

    } catch (error) {
        console.error('Error sincronizando:', error);
    }
}
