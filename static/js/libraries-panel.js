/**
 * PANEL DE BIBLIOTECAS CC - Recursos en la nube
 */
const LibrariesPanel = {
    init() { console.log('☁️ Panel de Bibliotecas inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="LibrariesPanel.login()"><div class="item-main"><i class="fas fa-sign-in-alt"></i> Iniciar sesión...</div></div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-cloud"></i> Bibliotecas CC</div>
                <div class="files-panel-content-area" style="flex:1; padding: 20px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <i class="fas fa-cloud-download-alt" style="font-size:40px; margin-bottom:15px; opacity:0.1;"></i>
                    <p style="font-size:11px; color:var(--text-muted); text-align:center; margin-bottom:15px;">Accede a tus pinceles, colores y gráficos desde cualquier lugar.</p>
                    <button class="prop-input" style="padding: 6px 12px; cursor:pointer; font-size:11px;" onclick="LibrariesPanel.login()">Iniciar sesión</button>
                </div>
            </div>
        `;
    },
    login() { App.showInfo('Abriendo ventana de inicio de sesión de Adobe...'); }
};
