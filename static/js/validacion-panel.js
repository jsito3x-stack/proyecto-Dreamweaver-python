/**
 * PANEL DE VALIDACIÓN - Comprobación de estándares W3C
 */
const ValidacionPanel = {
    init() { console.log('✅ Panel de Validación inicializado'); },

    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="ValidacionPanel.validateDoc()">
                    <div class="item-main"><i class="fas fa-file-code"></i>Validar documento actual</div>
                </div>
                <div class="dropdown-item" onclick="ValidacionPanel.validateSite()">
                    <div class="item-main"><i class="fas fa-globe"></i>Validar sitio completo...</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="ValidacionPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="ValidacionPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="ValidacionPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-check-circle"></i> Validación
                </div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div style="color: var(--text-muted); text-align: center; margin-top: 20px;">
                        No se han realizado validaciones.
                    </div>
                </div>
            </div>
        `;
    },

    validateDoc() { App.showInfo('Validando documento actual...'); },
    validateSite() { App.showInfo('Iniciando validación de todo el sitio...'); },
    help() { App.showInfo('Muestra errores y advertencias de validación de sintaxis HTML/CSS.'); },
    close() { Panels.closeSpecificPanel('validacion'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('validacion'); }
};
