/**
 * PANEL DE TRANSICIONES CSS - Animaciones visuales
 */
const CSSTransitionsPanel = {
    init() { console.log('✨ Panel de Transiciones CSS inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="CSSTransitionsPanel.create()"><div class="item-main"><i class="fas fa-plus"></i> Nueva transición</div></div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CSSTransitionsPanel.help()"><div class="item-main">Ayuda</div></div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-magic"></i> Transiciones CSS</div>
                <div class="files-panel-content-area" style="flex:1; padding: 30px 15px; text-align: center; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <i class="fas fa-wand-magic-sparkles" style="font-size:40px; margin-bottom:15px; opacity:0.1; color:var(--accent);"></i>
                    <p style="font-size:11px; color:var(--text-muted); margin-bottom:15px;">Usa el panel de transiciones para crear animaciones fluidas sin escribir código.</p>
                    <button class="prop-input" style="padding: 6px 12px; cursor:pointer; font-size:11px;" onclick="CSSTransitionsPanel.create()">Crear nueva transición</button>
                </div>
            </div>
        `;
    },
    create() { App.showInfo('Abriendo editor de transiciones y keyframes...'); },
    help() { App.showInfo('Define estados iniciales y finales para animar propiedades CSS automáticamente.'); }
};
