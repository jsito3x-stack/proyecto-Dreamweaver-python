/**
 * PANEL DE DISEÑADOR CSS - Control visual de estilos tipo Dreamweaver
 */
const CSSDesignerPanel = {
    init() { console.log('🎨 Panel de Diseñador CSS inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="CSSDesignerPanel.addSource()"><div class="item-main"><i class="fas fa-plus"></i> Añadir fuente CSS</div></div>
                <div class="dropdown-item" onclick="CSSDesignerPanel.addMedia()"><div class="item-main"><i class="fas fa-mobile-alt"></i> Añadir Media Query</div></div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CSSDesignerPanel.help()"><div class="item-main">Ayuda</div></div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-palette"></i> CSS Designer</div>
                <div class="files-panel-content-area" style="flex:1; display:flex; flex-direction:column; padding:0; overflow:hidden;">
                    
                    <!-- Fuentes -->
                    <div style="padding:6px 10px; background:var(--bg-tertiary); border-bottom:1px solid var(--border); font-size:9px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                        <span>FUENTES</span>
                        <i class="fas fa-plus" style="cursor:pointer;" onclick="CSSDesignerPanel.addSource()"></i>
                    </div>
                    <div style="height:60px; overflow-y:auto; padding:5px 10px; font-size:11px;">
                        <div style="color:var(--accent);"><i class="fas fa-file-code" style="margin-right:5px;"></i> style.css</div>
                        <div style="opacity:0.5;"><i class="fas fa-link" style="margin-right:5px;"></i> bootstrap.min.css</div>
                    </div>
                    
                    <!-- Media Queries -->
                    <div style="padding:6px 10px; background:var(--bg-tertiary); border-top:1px solid var(--border); border-bottom:1px solid var(--border); font-size:9px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                        <span>@MEDIA</span>
                        <i class="fas fa-plus" style="cursor:pointer;" onclick="CSSDesignerPanel.addMedia()"></i>
                    </div>
                    <div style="height:40px; overflow-y:auto; padding:5px 10px; font-size:10px;">
                        <div style="color:var(--text-primary);">GLOBAL</div>
                        <div style="color:var(--text-muted);">(max-width: 768px)</div>
                    </div>
                    
                    <!-- Selectores -->
                    <div style="padding:6px 10px; background:var(--bg-tertiary); border-top:1px solid var(--border); border-bottom:1px solid var(--border); font-size:9px; font-weight:bold; display:flex; justify-content:space-between; align-items:center;">
                        <span>SELECTORES</span>
                        <i class="fas fa-search" style="cursor:pointer;"></i>
                    </div>
                    <div style="flex:1; overflow-y:auto; padding:5px 10px; font-size:11px;">
                        <div style="padding:2px 0;">.app-container</div>
                        <div style="padding:2px 5px; color:var(--accent); background:rgba(255,255,255,0.05); border-radius:2px;">.header-main</div>
                        <div style="padding:2px 0;">#main-content</div>
                        <div style="padding:2px 0;">.footer-links a</div>
                    </div>
                </div>
            </div>
        `;
    },
    addSource() { App.showInfo('Seleccionando nueva hoja de estilos...'); },
    addMedia() { App.showInfo('Creando nueva regla @media...'); },
    help() { App.showInfo('El Diseñador CSS permite editar estilos visualmente sin escribir código.'); }
};
