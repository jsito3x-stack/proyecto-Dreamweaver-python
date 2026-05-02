/**
 * PANEL DE ACTIVOS (ASSETS) - Gestión de imágenes y recursos
 */
const AssetsPanel = {
    init() { console.log('💎 Panel de Activos inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="AssetsPanel.refresh()"><div class="item-main"><i class="fas fa-sync"></i> Actualizar</div></div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="AssetsPanel.help()"><div class="item-main">Ayuda</div></div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-gem"></i> Activos del sitio</div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                        <div style="aspect-ratio:1; background:var(--bg-secondary); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; opacity:0.3;"><i class="fas fa-image"></i></div>
                        <div style="aspect-ratio:1; background:var(--bg-secondary); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; opacity:0.3;"><i class="fas fa-image"></i></div>
                        <div style="aspect-ratio:1; background:var(--bg-secondary); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; opacity:0.3;"><i class="fas fa-image"></i></div>
                    </div>
                </div>
            </div>
        `;
    },
    refresh() { App.showInfo('Buscando nuevos activos...'); },
    help() { App.showInfo('Aquí se muestran todas las imágenes y colores usados en tu proyecto.'); }
};
