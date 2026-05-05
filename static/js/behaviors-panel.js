/**
 * PANEL DE COMPORTAMIENTOS (BEHAVIORS) - Eventos JS visuales
 */
const BehaviorsPanel = {
    init() { console.log('⚡ Panel de Comportamientos inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="BehaviorsPanel.edit()">
                    <div class="item-main"><i class="fas fa-edit"></i>Editar comportamiento...</div>
                </div>
                <div class="dropdown-item" onclick="BehaviorsPanel.remove()">
                    <div class="item-main"><i class="fas fa-trash-alt"></i>Eliminar comportamiento...</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="BehaviorsPanel.addListItem()">
                    <div class="item-main"><i class="fas fa-list-ul"></i>Añadir nuevo elemento de lista</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="BehaviorsPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="BehaviorsPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="BehaviorsPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
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
    edit() { App.showInfo('Editando los parámetros del comportamiento seleccionado...'); },
    remove() { App.showInfo('Comportamiento eliminado del elemento seleccionado.'); },
    addListItem() { App.showInfo('Añadiendo nuevo elemento a la lista de comportamientos disponibles...'); },
    help() { App.showInfo('Los comportamientos permiten añadir interactividad sin escribir código manualmente.'); },
    close() { Panels.closeSpecificPanel('comportamientos'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('comportamientos'); }
};
