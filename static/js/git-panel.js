/**
 * PANEL DE GIT - Estructura tipo Dreamweaver
 */

const GitPanel = {
    init() {
        console.log('🌿 Panel de Git inicializado');
    },

    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="GitPanel.refresh()">
                    <div class="item-main"><i class="fas fa-sync-alt"></i>Actualizar estado</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="GitPanel.commit()">
                    <div class="item-main"><i class="fas fa-check"></i>Commit...</div>
                </div>
                <div class="dropdown-item" onclick="GitPanel.push()">
                    <div class="item-main"><i class="fas fa-arrow-up"></i>Push</div>
                </div>
                <div class="dropdown-item" onclick="GitPanel.pull()">
                    <div class="item-main"><i class="fas fa-arrow-down"></i>Pull</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="GitPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
            </div>
        `;
    },

    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-code-branch"></i> Repositorio Git
                </div>
                
                <div class="files-panel-content-area" style="flex:1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); padding: 20px;">
                    <i class="fas fa-code-branch" style="font-size: 48px; margin-bottom: 15px; opacity: 0.2;"></i>
                    <p style="font-size: 13px; margin: 0;">No se detectó un repositorio</p>
                    <button class="prop-input" style="margin-top: 15px; padding: 5px 15px; cursor: pointer;" onclick="GitPanel.initRepo()">
                        Inicializar repositorio
                    </button>
                </div>
                
                <div class="files-panel-footer" style="padding: 5px 10px; border-top: 1px solid var(--border); font-size: 10px; color: var(--text-muted);">
                    Rama: <span style="color: var(--accent);">ninguna</span>
                </div>
            </div>
        `;
    },

    refresh() {
        App.showInfo('Actualizando estado de Git...');
    },

    commit() {
        App.showInfo('Abriendo diálogo de Commit...');
    },

    push() {
        App.showInfo('Sincronizando con remoto (Push)...');
    },

    pull() {
        App.showInfo('Sincronizando con remoto (Pull)...');
    },

    initRepo() {
        App.showSuccess('Repositorio Git inicializado correctamente');
    },

    help() {
        App.showInfo('Ayuda de Git: Conecta tu proyecto con un repositorio remoto para gestionar versiones.');
    }
};
