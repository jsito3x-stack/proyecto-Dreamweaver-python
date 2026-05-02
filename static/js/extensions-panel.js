/**
 * PANEL DE EXTENSIONES - Plugins y complementos instalados
 */
const ExtensionsPanel = {
    init() { console.log('🔌 Panel de Extensiones inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="ExtensionsPanel.browse()"><div class="item-main"><i class="fas fa-search"></i> Explorar marketplace...</div></div>
                <div class="dropdown-item" onclick="ExtensionsPanel.install()"><div class="item-main"><i class="fas fa-file-archive"></i> Instalar desde archivo ZXP</div></div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="ExtensionsPanel.help()"><div class="item-main">Ayuda</div></div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-plug"></i> Extensiones</div>
                <div class="files-panel-content-area" style="flex:1; padding: 20px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
                    <i class="fas fa-puzzle-piece" style="font-size:40px; margin-bottom:15px; opacity:0.1;"></i>
                    <p style="font-size:11px; color:var(--text-muted); line-height:1.4;">Mejora las capacidades de Dreamweaver con plugins de la comunidad.</p>
                    <button class="prop-input" style="margin-top:15px; padding: 6px 12px; cursor:pointer; font-size:11px;" onclick="ExtensionsPanel.browse()">Explorar Extensiones</button>
                </div>
                <div class="files-panel-footer" style="padding:4px 10px; font-size:9px; border-top:1px solid var(--border); text-align:right;">
                    Gestor de complementos v1.0
                </div>
            </div>
        `;
    },
    browse() { App.showInfo('Cargando Marketplace de extensiones de Adobe...'); },
    install() { App.showInfo('Selecciona un paquete .zxp para instalar.'); },
    help() { App.showInfo('Las extensiones permiten añadir soporte para nuevos lenguajes y herramientas externas.'); }
};
