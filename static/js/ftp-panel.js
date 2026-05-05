/**
 * PANEL DE REGISTRO FTP - Log de transferencia de archivos
 */
const FtpPanel = {
    init() { console.log('📁 Panel de Registro FTP inicializado'); },

    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="FtpPanel.viewLog()">
                    <div class="item-main"><i class="fas fa-list-alt"></i>Ver registro completo</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="FtpPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="FtpPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="FtpPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-upload"></i> Registro FTP
                </div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto; font-family: monospace; font-size: 11px;">
                    <div style="color: var(--text-muted);">Esperando conexiones...</div>
                </div>
            </div>
        `;
    },

    viewLog() { App.showInfo('Mostrando registro FTP detallado...'); },
    help() { App.showInfo('Muestra el historial de transferencias, conexiones y errores del cliente FTP/SFTP.'); },
    close() { Panels.closeSpecificPanel('ftp'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('ftp'); }
};
