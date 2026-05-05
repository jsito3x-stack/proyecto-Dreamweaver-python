/**
 * PANEL DE INFORMES - Reportes del sitio
 */
const InformesPanel = {
    init() { console.log('📊 Panel de Informes inicializado'); },

    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="InformesPanel.configure()">
                    <div class="item-main"><i class="fas fa-cog"></i>Configurar informe...</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="InformesPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="InformesPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="InformesPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-file-alt"></i> Informes
                </div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div style="color: var(--text-muted); text-align: center; margin-top: 20px;">
                        Selecciona un tipo de informe para generar resultados.
                    </div>
                </div>
            </div>
        `;
    },

    configure() { App.showInfo('Abriendo configuración de informes...'); },
    help() { App.showInfo('Genera informes sobre el uso de etiquetas, accesibilidad y otros parámetros del sitio.'); },
    close() { Panels.closeSpecificPanel('informes'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('informes'); }
};
