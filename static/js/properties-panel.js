/**
 * PANEL DE PROPIEDADES - Estructura tipo Dreamweaver
 * Maneja los controles y menús del panel de propiedades
 */

const PropertiesPanel = {
    /**
     * Inicializar el panel después de renderizar
     */
    init() {
        console.log('🛠️ Panel de Propiedades inicializado');
    },

    /**
     * Devuelve el HTML del menú contextual de la cabecera
     */
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="PropertiesPanel.reset()">
                    <div class="item-main"><i class="fas fa-sync-alt"></i>Restablecer</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="PropertiesPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <!-- Opción para cerrar el panel -->
                <div class="dropdown-item" onclick="Panels.hidePanel('propiedades')">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar panel</div>
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
                    <i class="fas fa-sliders-h"></i> Propiedades del elemento
                </div>
                
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div class="prop-row">
                        <div class="prop-label">ID del elemento</div>
                        <input type="text" class="prop-input" placeholder="mi_element" style="width: 100%; box-sizing: border-box;">
                    </div>
                    <div class="prop-row" style="margin-top: 10px;">
                        <div class="prop-label">Clase (CSS)</div>
                        <input type="text" class="prop-input" placeholder="clase1 clase2" style="width: 100%; box-sizing: border-box;">
                    </div>
                    
                    <div class="divider" style="margin: 15px 0;"></div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="prop-row">
                            <div class="prop-label">Ancho</div>
                            <input type="text" class="prop-input" placeholder="auto" style="width: 100%; box-sizing: border-box;">
                        </div>
                        <div class="prop-row">
                            <div class="prop-label">Alto</div>
                            <input type="text" class="prop-input" placeholder="auto" style="width: 100%; box-sizing: border-box;">
                        </div>
                    </div>
                </div>
                
                <div class="files-panel-footer" style="padding: 5px 10px; border-top: 1px solid var(--border); font-size: 10px; color: var(--text-muted); text-align: right;">
                    Dreamweaver Python v2.0
                </div>
            </div>
        `;
    },

    /**
     * Restablecer los valores
     */
    reset() {
        console.log('🛠️ Restablecer propiedades');
        App.showInfo('Valores de propiedades restablecidos');
        // Aquí iría la lógica para limpiar los inputs
    },

    /**
     * Mostrar ayuda
     */
    help() {
        console.log('🛠️ Ayuda de propiedades');
        App.showInfo('Guía de uso: Selecciona un elemento en el editor para ver sus propiedades aquí.');
    }
};
