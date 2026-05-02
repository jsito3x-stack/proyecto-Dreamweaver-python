/**
 * PANEL DE COMPORTAMIENTOS (BEHAVIORS) - Eventos JS visuales
 */
const BehaviorsPanel = {
    init() { console.log('⚡ Panel de Comportamientos inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="BehaviorsPanel.add()"><div class="item-main"><i class="fas fa-plus"></i> Añadir comportamiento</div></div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="BehaviorsPanel.help()"><div class="item-main">Ayuda</div></div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-bolt"></i> Comportamientos</div>
                <div class="files-panel-content-area" style="flex:1; padding: 15px; font-size: 11px; color: var(--text-muted); text-align:center;">
                    <i class="fas fa-bolt" style="font-size: 30px; display:block; margin-bottom:10px; opacity:0.1;"></i>
                    Selecciona un objeto para asignarle un comportamiento (onclick, onmouseover, etc.)
                </div>
            </div>
        `;
    },
    add() { App.showInfo('Selecciona un elemento en el editor primero.'); },
    help() { App.showInfo('Los comportamientos permiten añadir interactividad sin escribir código manualmente.'); }
};
