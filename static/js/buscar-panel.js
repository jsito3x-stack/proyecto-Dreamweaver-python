/**
 * PANEL DE BUSCAR - Resultados de búsqueda en archivos
 */
const BuscarPanel = {
    init() { console.log('🔍 Panel de Buscar inicializado'); },

    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="BuscarPanel.clear()">
                    <div class="item-main"><i class="fas fa-eraser"></i>Borrar resultados</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="BuscarPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="BuscarPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="BuscarPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-search"></i> Buscar
                </div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div style="color: var(--text-muted); text-align: center; margin-top: 20px;">
                        No hay resultados de búsqueda recientes.
                    </div>
                </div>
            </div>
        `;
    },

    clear() { App.showInfo('Resultados de búsqueda borrados.'); },
    help() { App.showInfo('Muestra los resultados de las operaciones de búsqueda y reemplazo en el sitio.'); },
    close() { Panels.closeSpecificPanel('buscar'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('buscar'); }
};
