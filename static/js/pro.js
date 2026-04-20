/**
 * ════════════════════════════════════════════════════════════════
 * DREAMWEAVER PRO - Lógica de Workspace Avanzado
 * Maneja los nuevos paneles, barras y comportamientos "Pro"
 * ════════════════════════════════════════════════════════════════
 */

const Pro = {
    init() {
        console.log('%c👑 [PRO] Workspace activado', 'color: #bb86fc; font-weight: bold;');
        
        // Escuchar cambios de tema para ajustar el layout
        window.addEventListener('themeChanged', (e) => {
            if (e.detail.theme === 'pro') {
                this.enableProLayout();
            } else {
                this.disableProLayout();
            }
        });

        // Inicializar si ya estamos en modo Pro
        if (Themes.currentTheme === 'pro') {
            this.enableProLayout();
        }
    },

    /**
     * Activar elementos exclusivos del modo Pro
     */
    enableProLayout() {
        document.body.classList.add('mode-pro');
        this.updateInspector();
    },

    /**
     * Desactivar elementos Pro
     */
    disableProLayout() {
        document.body.classList.remove('mode-pro');
    },

    /**
     * Cambiar el panel lateral desde la Side Toolbar
     */
    switchSidebar(panelId) {
        // 1. Actualizar iconos activos
        document.querySelectorAll('.side-icon').forEach(icon => {
            icon.classList.remove('active');
            if (icon.title.toLowerCase().includes(panelId)) {
                icon.classList.add('active');
            }
        });

        // 2. Si el panel es de los básicos (Archivos/Estructura)
        if (panelId === 'files' || panelId === 'structure') {
            if (typeof switchPanel === 'function') {
                switchPanel(panelId);
            }
            // Asegurarse de que el panel izquierdo esté abierto
            if (Layout.leftCollapsed) Layout.toggleLeft();
        }

        // 3. Lógica para nuevos paneles (CSS Designer / Inserción)
        if (panelId === 'css') {
            App.showInfo('Módulo CSS Designer Pro: Próximamente en la versión final');
        }
        if (panelId === 'insert') {
            App.showInfo('Biblioteca de Componentes Pro: Próximamente');
        }
    },

    /**
     * Actualizar el Inspector Inferior con el elemento seleccionado
     */
    updateInspector(data = null) {
        const inspector = document.getElementById('pro-inspector');
        if (!inspector) return;

        if (!data) {
            // Valores por defecto
            document.getElementById('ins-tag').innerText = 'SEL';
            document.getElementById('ins-id').value = '';
            document.getElementById('ins-classes').value = '';
            return;
        }

        document.getElementById('ins-tag').innerText = (data.tag || 'DIV').toUpperCase();
        document.getElementById('ins-id').value = data.id || '';
        document.getElementById('ins-classes').value = data.clases || '';
        
        if (data.estilos && data.estilos.color) {
            document.getElementById('ins-color').value = this.rgbToHex(data.estilos.color) || '#ffffff';
        }
    },

    /**
     * Aplicar cambios desde el Inspector Inferior
     */
    async applyInspectorChanges() {
        if (typeof Properties === 'undefined' || !Properties.currentXPath) {
            App.showWarning('Selecciona un elemento para editar');
            return;
        }

        const datos = {
            id: document.getElementById('ins-id').value,
            clases: document.getElementById('ins-classes').value,
            estilos: {
                'color': document.getElementById('ins-color').value
            }
        };

        // Reutilizamos la lógica de Properties para no duplicar código
        await fetch('/api/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xpath: Properties.currentXPath, datos: datos })
        })
        .then(r => r.json())
        .then(res => {
            if (res.success) {
                App.showSuccess('Actualizado desde Pro Inspector');
                App.refresh();
            }
        });
    },

    rgbToHex(rgb) {
        if (!rgb || !rgb.startsWith('rgb')) return rgb;
        const parts = rgb.match(/\d+/g);
        if (!parts || parts.length < 3) return '#ffffff';
        const r = parseInt(parts[0]).toString(16).padStart(2, '0');
        const g = parseInt(parts[1]).toString(16).padStart(2, '0');
        const b = parseInt(parts[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
};

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
    Pro.init();
});
