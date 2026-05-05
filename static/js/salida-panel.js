/**
 * PANEL DE SALIDA (OUTPUT) - Registro de procesos y mensajes del sistema
 */
const SalidaPanel = {
    init() { 
        console.log('🖥️ Panel de Salida inicializado'); 
    },

    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="SalidaPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="SalidaPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="SalidaPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-terminal"></i> Salida
                </div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto; font-family: monospace; font-size: 11px; background: #000; color: #fff;">
                    <div style="color: #0f0;">[${new Date().toLocaleTimeString()}] Sistema listo.</div>
                    <div style="color: #ccc;">> Escaneando archivos del proyecto...</div>
                    <div style="color: #ccc;">> No se han detectado problemas críticos.</div>
                </div>
            </div>
        `;
    },

    help() {
        App.showInfo('El panel de Salida muestra mensajes detallados sobre las operaciones del sistema y procesos en segundo plano.');
    },

    close() {
        Panels.closeSpecificPanel('salida');
    },

    closeTabGroup() {
        Panels.closeTabGroupOfPanel('salida');
    }
};
