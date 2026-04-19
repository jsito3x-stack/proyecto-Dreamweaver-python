/**
 * Layout Manager for Dreamweaver Python
 * Handles resizing and collapsing of side panels.
 */

const Layout = {
    // === CONFIGURACIÓN DE ANCHOS (Puedes cambiar estos números) ===
    MIN_LEFT_WIDTH: 240,  // Ancho mínimo del panel izquierdo (Archivos)
    MIN_RIGHT_WIDTH: 240, // Ancho mínimo del panel derecho (Propiedades)
    DEFAULT_LEFT_WIDTH: 260,
    DEFAULT_RIGHT_WIDTH: 320,

    init() {
        this.leftPanel = document.querySelector('.left-panel');
        this.rightPanel = document.querySelector('.right-panel');
        this.appContainer = document.querySelector('.app-container');
        this.resizerLeft = document.getElementById('resizer-left');
        this.resizerRight = document.getElementById('resizer-right');

        this.leftWidth = parseInt(localStorage.getItem('layout-left-width')) || this.DEFAULT_LEFT_WIDTH;
        this.rightWidth = parseInt(localStorage.getItem('layout-right-width')) || this.DEFAULT_RIGHT_WIDTH;
        this.leftCollapsed = localStorage.getItem('layout-left-collapsed') === 'true';
        this.rightCollapsed = localStorage.getItem('layout-right-collapsed') === 'true';

        this.setupResizers();
        this.applyLayout();
        
        // Exponer a la ventana para acceso desde HTML
        window.Layout = this;
    },

    setupResizers() {
        // Resizer Izquierdo
        this.resizerLeft.addEventListener('mousedown', (e) => {
            document.body.style.cursor = 'col-resize';
            const startX = e.clientX;
            const startWidth = this.leftWidth;

            const onMouseMove = (moveEvent) => {
                const delta = moveEvent.clientX - startX;
                const newWidth = Math.max(this.MIN_LEFT_WIDTH, startWidth + delta);
                this.leftWidth = newWidth;
                this.leftCollapsed = false;
                this.applyLayout();
            };

            const onMouseUp = () => {
                document.body.style.cursor = 'default';
                localStorage.setItem('layout-left-width', this.leftWidth);
                localStorage.setItem('layout-left-collapsed', 'false');
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });

        // Resizer Derecho
        this.resizerRight.addEventListener('mousedown', (e) => {
            document.body.style.cursor = 'col-resize';
            const startX = e.clientX;
            const startWidth = this.rightWidth;

            const onMouseMove = (moveEvent) => {
                const delta = startX - moveEvent.clientX; // Invertido para el panel derecho
                const newWidth = Math.max(this.MIN_RIGHT_WIDTH, startWidth + delta);
                this.rightWidth = newWidth;
                this.rightCollapsed = false;
                this.applyLayout();
            };

            const onMouseUp = () => {
                document.body.style.cursor = 'default';
                localStorage.setItem('layout-right-width', this.rightWidth);
                localStorage.setItem('layout-right-collapsed', 'false');
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    },

    toggleLeft() {
        this.leftCollapsed = !this.leftCollapsed;
        localStorage.setItem('layout-left-collapsed', this.leftCollapsed);
        this.applyLayout();
        
        // Forzar redimensionamiento de CodeMirror si existe
        if (window.editor) window.editor.refresh();
    },

    toggleRight() {
        this.rightCollapsed = !this.rightCollapsed;
        localStorage.setItem('layout-right-collapsed', this.rightCollapsed);
        this.applyLayout();
        
        // Forzar redimensionamiento de CodeMirror si existe
        if (window.editor) window.editor.refresh();
    },

    applyLayout() {
        const lw = this.leftCollapsed ? '0px' : `${this.leftWidth}px`;
        const rw = this.rightCollapsed ? '0px' : `${this.rightWidth}px`;

        this.appContainer.style.gridTemplateColumns = `${lw} 4px 1fr 4px ${rw}`;
        
        // Clases de estado para animaciones o estilos específicos
        if (this.leftCollapsed) {
            this.leftPanel.classList.add('collapsed');
            this.resizerLeft.classList.add('collapsed');
        } else {
            this.leftPanel.classList.remove('collapsed');
            this.resizerLeft.classList.remove('collapsed');
        }

        if (this.rightCollapsed) {
            this.rightPanel.classList.add('collapsed');
            this.resizerRight.classList.add('collapsed');
        } else {
            this.rightPanel.classList.remove('collapsed');
            this.resizerRight.classList.remove('collapsed');
        }
    }
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Layout.init();
});
