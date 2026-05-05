/**
 * PANEL DE VERIFICADOR DE VÍNCULOS - Gestión de enlaces rotos
 */
const VinculosPanel = {
    init() { console.log('🔗 Panel de Vínculos inicializado'); },

    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="VinculosPanel.openFile()">
                    <div class="item-main"><i class="fas fa-external-link-alt"></i>Abrir archivo</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="VinculosPanel.saveResults()">
                    <div class="item-main"><i class="fas fa-save"></i>Guardar resultados...</div>
                </div>
                <div class="dropdown-item" onclick="VinculosPanel.clearResults()">
                    <div class="item-main"><i class="fas fa-trash"></i>Borrar resultados</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="VinculosPanel.checkDoc()">
                    <div class="item-main"><i class="fas fa-file-code"></i>Comprobar vínculos del documento actual</div>
                </div>
                <div class="dropdown-item" onclick="VinculosPanel.checkSite()">
                    <div class="item-main"><i class="fas fa-globe"></i>Buscar sitio local actual completo en vínculos</div>
                </div>
                <div class="dropdown-item" onclick="VinculosPanel.checkSelected()">
                    <div class="item-main"><i class="fas fa-folder-open"></i>Buscar archivos seleccionados en el sitio en vínculos</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="VinculosPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="VinculosPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="VinculosPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-link"></i> Verificador de vínculos
                </div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div style="color: var(--text-muted); text-align: center; margin-top: 20px;">
                        No se han encontrado vínculos rotos.
                    </div>
                </div>
            </div>
        `;
    },

    openFile() { App.showInfo('Abriendo archivo seleccionado...'); },
    saveResults() { App.showInfo('Resultados guardados en un archivo externo.'); },
    clearResults() { App.showInfo('Lista de vínculos borrada.'); },
    checkDoc() { App.showInfo('Comprobando vínculos en el documento activo...'); },
    checkSite() { App.showInfo('Comprobando vínculos en todo el proyecto...'); },
    checkSelected() { App.showInfo('Comprobando vínculos en los archivos seleccionados...'); },
    help() { App.showInfo('Muestra los vínculos rotos, externos o huérfanos del proyecto.'); },
    close() { Panels.closeSpecificPanel('vinculos'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('vinculos'); }
};
