/**
 * PANEL DE INSPECTOR DE CÓDIGO - Análisis de etiquetas y atributos
 */
const CodeInspectorPanel = {
    init() { console.log('🔍 Inspector de código inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="CodeInspectorPanel.refresh()"><div class="item-main"><i class="fas fa-sync"></i> Actualizar</div></div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.help()"><div class="item-main">Ayuda</div></div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-code"></i> Inspector de código</div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; font-family: 'Courier New', monospace; font-size: 11px; background: rgba(0,0,0,0.2);">
                    <div style="color:var(--accent);">&lt;html&gt;</div>
                    <div style="padding-left:12px; color:var(--accent);">&lt;head&gt;...&lt;/head&gt;</div>
                    <div style="padding-left:12px; color:var(--accent); font-weight:bold;">&lt;body&gt;</div>
                    <div style="padding-left:24px; color:var(--text-primary); background: rgba(255,255,255,0.05); border-left: 2px solid var(--accent);">&lt;div id="main"&gt;</div>
                    <div style="padding-left:36px; color:var(--text-secondary);">&lt;h1&gt;Bienvenido&lt;/h1&gt;</div>
                    <div style="padding-left:24px; color:var(--text-primary);">&lt;/div&gt;</div>
                    <div style="padding-left:12px; color:var(--accent); font-weight:bold;">&lt;/body&gt;</div>
                    <div style="color:var(--accent);">&lt;/html&gt;</div>
                </div>
                <div class="files-panel-footer" style="padding:4px 10px; font-size:10px; border-top:1px solid var(--border); color:var(--accent);">body > div#main</div>
            </div>
        `;
    },
    refresh() { App.showInfo('Analizando DOM para el inspector...'); },
    help() { App.showInfo('Muestra la jerarquía exacta de etiquetas HTML del documento actual.'); }
};
