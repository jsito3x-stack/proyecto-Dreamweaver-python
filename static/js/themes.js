/**
 * ═══════════════════════════════════════════════════════════════
 * THEMES - Gestión de temas visuales
 * ═══════════════════════════════════════════════════════════════
 */

const Themes = {
    current: 'dark',
    available: ['dark', 'light'],
    
    /**
     * Inicializar temas
     */
    init() {
        // Cargar tema guardado
        const saved = localStorage.getItem('dw-theme');
        if (saved && this.available.includes(saved)) {
            this.current = saved;
        }
        
        // Aplicar tema
        this.apply(this.current);
        
        console.log('✅ Temas inicializados');
    },
    
    /**
     * Cambiar tema
     */
    toggle() {
        const nextTheme = this.current === 'dark' ? 'light' : 'dark';
        this.apply(nextTheme);
        this.current = nextTheme;
        localStorage.setItem('dw-theme', nextTheme);
        
        App.showSuccess(`Tema ${nextTheme === 'dark' ? 'oscuro' : 'claro'} activado`);
    },
    
    /**
     * Aplicar tema
     */
    apply(theme) {
        // Actualizar clase del body
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${theme}`);
        
        // Actualizar tema de CodeMirror
        const cmTheme = theme === 'dark' ? 'dracula' : 'default';
        
        if (Editor.instances.main) {
            Editor.instances.main.setOption('theme', cmTheme);
        }
        
        if (Editor.instances.codeOnly) {
            Editor.instances.codeOnly.setOption('theme', cmTheme);
        }
        
        // Actualizar CSS si es necesario
        const link = document.getElementById('theme-stylesheet');
        if (link) {
            link.href = `/static/css/theme-${theme}.css`;
        }
        
        // Actualizar config
        App.config.theme = theme;
        App.saveConfig();
    },
    
    /**
     * Obtener tema actual
     */
    getCurrent() {
        return this.current;
    },
    
    /**
     * Verificar si es tema oscuro
     */
    isDark() {
        return this.current === 'dark';
    }
};
