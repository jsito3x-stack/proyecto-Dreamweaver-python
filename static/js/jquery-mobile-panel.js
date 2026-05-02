/**
 * PANEL DE JQUERY MOBILE - Componentes y widgets optimizados para móvil
 */

const jQueryMobilePanel = {
    /**
     * Inicializar el panel después de renderizar
     */
    init() {
        console.log('📱 Panel de jQuery Mobile inicializado');
    },

    /**
     * Devuelve el HTML del menú contextual de la cabecera
     */
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="jQueryMobilePanel.refresh()">
                    <div class="item-main"><i class="fas fa-sync-alt"></i>Actualizar componentes</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="jQueryMobilePanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
            </div>
        `;
    },

    /**
     * Devuelve el HTML del contenido principal del panel
     */
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-mobile-alt"></i> Componentes jQuery Mobile
                </div>
                
                <div class="files-panel-content-area" style="flex:1; padding: 15px; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px;">
                        ${this._renderWidgetItem('toggle-on', 'Switch')}
                        ${this._renderWidgetItem('list-ul', 'Listview')}
                        ${this._renderWidgetItem('th', 'Grid')}
                        ${this._renderWidgetItem('window-maximize', 'Navbar')}
                        ${this._renderWidgetItem('minus', 'Divider')}
                        ${this._renderWidgetItem('check-square', 'Checkbox')}
                        ${this._renderWidgetItem('dot-circle', 'Radio')}
                        ${this._renderWidgetItem('font', 'Text Input')}
                    </div>
                    
                    <div style="margin-top: 25px; padding: 12px; background: rgba(52, 152, 219, 0.1); border-radius: 4px; border-left: 3px solid var(--accent);">
                        <div style="font-weight:bold; font-size:11px; margin-bottom:5px; color: var(--accent);">CONSEJO</div>
                        <p style="font-size: 10px; margin: 0; color: var(--text-muted); line-height: 1.4;">
                            Haz clic o arrastra un widget para insertarlo en la posición actual del cursor en el editor.
                        </p>
                    </div>
                </div>
                
                <div class="files-panel-footer" style="padding: 5px 10px; border-top: 1px solid var(--border); font-size: 10px; color: var(--text-muted); text-align: center;">
                    Soporte para jQuery Mobile 1.4.5
                </div>
            </div>
        `;
    },

    /**
     * Renderiza un ítem de widget individual
     */
    _renderWidgetItem(icon, label) {
        return `
            <div class="jq-widget-item" style="padding: 12px 5px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; text-align: center; cursor: pointer; transition: transform 0.1s, border-color 0.1s;" 
                 onmouseover="this.style.borderColor='var(--accent)';" 
                 onmouseout="this.style.borderColor='var(--border)';"
                 onclick="App.showInfo('Insertando componente ${label}...')">
                <i class="fas fa-${icon}" style="display:block; margin-bottom:8px; font-size:18px; color: var(--text-primary);"></i>
                <span style="font-size: 9px; color: var(--text-secondary); text-transform: uppercase; font-weight: 600;">${label}</span>
            </div>
        `;
    },

    /**
     * Actualizar lista
     */
    refresh() {
        App.showInfo('Buscando nuevos componentes de jQuery Mobile...');
    },

    /**
     * Ayuda
     */
    help() {
        App.showInfo('Los componentes de jQuery Mobile están diseñados para adaptarse automáticamente a cualquier tamaño de pantalla móvil.');
    }
};
