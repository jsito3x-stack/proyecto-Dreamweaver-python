/**
 * ════════════════════════════════════════════════════════════════
 * THEMES MANAGER - Gestor de Temas Independientes
 * Soporta múltiples temas sin interferencia entre ellos
 * ════════════════════════════════════════════════════════════════
 */

const Themes = {
    // Lista de temas disponibles
    availableThemes: ['default', 'light', 'dark'],

    // Tema actual
    currentTheme: 'default',

    // Clase del body para el tema
    bodyClassPrefix: 'theme-',

    /**
     * Inicializar gestor de temas
     */
    init() {
        // Cargar tema guardado o usar default
        const savedTheme = localStorage.getItem('dw-theme') || 'default';
        this.setTheme(savedTheme, false); // false = no guardar de nuevo

        console.log(`%c🎨 [THEMES] Tema inicializado: ${savedTheme}`,
            'color: #bd93f9; font-weight: bold;');

        // Configurar botón de cambio de tema si existe
        this.setupToggleButton();
    },

    /**
     * Cambiar a un tema específico
     * @param {string} themeName - Nombre del tema ('default', 'light', 'dark')
     * @param {boolean} save - Si guardar en localStorage
     */
    setTheme(themeName, save = true) {
        // Validar que el tema existe
        if (!this.availableThemes.includes(themeName)) {
            console.error(`[THEMES] Temo no válido: ${themeName}`);
            return false;
        }

        const previousTheme = this.currentTheme;

        // 1. Remover clase anterior del body
        document.body.classList.remove(`${this.bodyClassPrefix}${previousTheme}`);

        // 2. Agregar nueva clase al body
        document.body.classList.add(`${this.bodyClassPrefix}${themeName}`);

        // 3. Deshabilitar todos los CSS de tema
        this.availableThemes.forEach(theme => {
            const link = document.getElementById(`theme-${theme}`);
            if (link) {
                link.disabled = true;
            }
        });

        // 4. Habilitar SOLO el tema seleccionado
        const activeLink = document.getElementById(`theme-${themeName}`);
        if (activeLink) {
            activeLink.disabled = false;
        }

        // 5. Actualizar estado
        this.currentTheme = themeName;

        // 6. Guardar preferencia
        if (save) {
            localStorage.setItem('dw-theme', themeName);
        }

        // 7. Refrescar editor si existe
        if (typeof Editor !== 'undefined' && Editor.refresh) {
            setTimeout(() => Editor.refresh(), 100);
        }

        console.log(`%c🎨 [THEMES] Cambiado: ${previousTheme} → ${themeName}`,
            'color: #50fa7b; font-weight: bold;');

        // 8. Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeName, previous: previousTheme }
        }));

        return true;
    },

    /**
     * Cambiar al siguiente tema (ciclo)
     */
    cycleTheme() {
        const currentIndex = this.availableThemes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.availableThemes.length;
        const nextTheme = this.availableThemes[nextIndex];

        return this.setTheme(nextTheme);
    },

    /**
     * Obtener nombre legible del tema actual
     */
    getThemeDisplayName() {
        const names = {
            'default': 'Cobalt2 🔵',
            'light': 'WLA-DX Claro ☀️',
            'dark': 'Dracula 🧛‍♂️'
        };
        return names[this.currentTheme] || this.currentTheme;
    },

    /**
     * Configurar botón toggle de tema
     */
    setupToggleButton() {
        const btn = document.querySelector('[onclick*="Themes.toggle()"]') ||
            document.getElementById('theme-toggle-btn');

        if (btn) {
            // Actualizar tooltip/title
            btn.title = `Tema: ${this.getThemeDisplayName()} (Click para cambiar)`;

            // Agregar evento adicional para actualizar tooltip
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    btn.title = `Tema: ${this.getThemeDisplayName()} (Click para cambiar)`;
                }, 100);
            });
        }
    },

    /**
     * Toggle simple (usado por el botón actual)
     */
    toggle() {
        this.cycleTheme();
        this.setupToggleButton(); // Actualizar tooltip

        // Mostrar notificación sutil
        if (typeof App !== 'undefined' && App.showSuccess) {
            App.showSuccess(`Tema: ${this.getThemeDisplayName()}`);
        }
    }
};
