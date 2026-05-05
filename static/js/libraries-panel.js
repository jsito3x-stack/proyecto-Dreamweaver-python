/**
 * PANEL DE BIBLIOTECAS CC - Recursos en la nube
 */
const LibrariesPanel = {
    init() { console.log('☁️ Panel de Bibliotecas inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="LibrariesPanel.info()">
                    <div class="item-main"><i class="fas fa-info-circle"></i>Más información</div>
                </div>
                <div class="dropdown-item" onclick="LibrariesPanel.news()">
                    <div class="item-main"><i class="fas fa-bullhorn"></i>Novedades</div>
                </div>
                <div class="dropdown-item" onclick="LibrariesPanel.feedback()">
                    <div class="item-main"><i class="fas fa-comment-alt"></i>Facilitar comentarios</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="LibrariesPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="LibrariesPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
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
    login() { App.showInfo('Abriendo ventana de inicio de sesión de Adobe...'); },
    info() { App.showInfo('Explora las capacidades de Creative Cloud Libraries.'); },
    news() { App.showInfo('Descubre las últimas novedades en la gestión de recursos en la nube.'); },
    feedback() { App.showInfo('Tu opinión nos ayuda a mejorar. Cuéntanos qué piensas.'); },
    close() { Panels.closeSpecificPanel('bibliotecas'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('bibliotecas'); }
};
