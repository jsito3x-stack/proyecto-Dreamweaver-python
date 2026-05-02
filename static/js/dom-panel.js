/**
 * PANEL DOM - Estructura jerárquica del documento en tiempo real
 */
const DOMPanel = {
    init() { console.log('🌳 Panel DOM inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="DOMPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i> Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="DOMPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i> Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="DOMPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i> Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-project-diagram"></i> Estructura DOM</div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto; font-size: 11px;">
                    <div class="dom-item" style="display:flex; align-items:center; gap:5px; padding:2px 0;">
                        <i class="fas fa-caret-down" style="width:10px;"></i>
                        <i class="fas fa-globe" style="color:var(--accent);"></i>
                        <span style="font-weight:bold;">html</span>
                    </div>
                    <div class="dom-item" style="display:flex; align-items:center; gap:5px; padding:2px 0; padding-left:15px; opacity:0.6;">
                        <i class="fas fa-caret-right" style="width:10px;"></i>
                        <i class="fas fa-heading"></i>
                        <span>head</span>
                    </div>
                    <div class="dom-item" style="display:flex; align-items:center; gap:5px; padding:2px 0; padding-left:15px;">
                        <i class="fas fa-caret-down" style="width:10px;"></i>
                        <i class="fas fa-address-card"></i>
                        <span style="font-weight:bold;">body</span>
                    </div>
                    <div class="dom-item" style="display:flex; align-items:center; gap:5px; padding:4px 8px; margin:2px 0 2px 30px; background:var(--bg-tertiary); border:1px solid var(--accent); border-radius:3px;">
                        <i class="fas fa-cube" style="color:var(--accent);"></i>
                        <span style="color:var(--text-primary);">div#app-root</span>
                    </div>
                    <div class="dom-item" style="display:flex; align-items:center; gap:5px; padding:2px 0; padding-left:45px; opacity:0.8;">
                        <i class="fas fa-caret-right" style="width:10px;"></i>
                        <i class="fas fa-columns"></i>
                        <span>header.main</span>
                    </div>
                </div>
                <div class="files-panel-footer" style="padding:4px 10px; font-size:9px; border-top:1px solid var(--border); text-transform:uppercase; letter-spacing:1px; opacity:0.5;">
                    Explorador de nodos
                </div>
            </div>
        `;
    },
    refresh() { App.showInfo('Sincronizando estructura DOM con el editor visual...'); },
    help() { App.showInfo('El panel DOM muestra la jerarquía real de los elementos. Haz clic en un nodo para seleccionarlo.'); },
    close() { Panels.closeSpecificPanel('dom'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('dom'); }
};
