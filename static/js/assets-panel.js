/**
 * PANEL DE ACTIVOS (ASSETS) - Gestión de imágenes y recursos
 */
const AssetsPanel = {
    init() { console.log('💎 Panel de Activos inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="AssetsPanel.refreshList()">
                    <div class="item-main"><i class="fas fa-sync-alt"></i>Actualizar lista del sitio</div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.rebuildList()">
                    <div class="item-main"><i class="fas fa-redo"></i>Volver a crear lista del sitio</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="AssetsPanel.newLibraryItem()">
                    <div class="item-main"><i class="fas fa-plus"></i>Nuevo elemento de biblioteca</div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.edit()">
                    <div class="item-main"><i class="fas fa-pencil-alt"></i>Edición</div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.insert()">
                    <div class="item-main"><i class="fas fa-share-square"></i>Insertar</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="AssetsPanel.rename()">
                    <div class="item-main"><i class="fas fa-font"></i>Cambiar nombre</div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.remove()">
                    <div class="item-main"><i class="fas fa-trash-alt"></i>Eliminar</div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.refreshPage()">
                    <div class="item-main"><i class="fas fa-file-export"></i>Actualizar página actual</div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.refreshSite()">
                    <div class="item-main"><i class="fas fa-globe"></i>Actualizar sitio...</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item has-submenu" style="cursor:pointer;">
                    <div class="item-main"><i class="fas fa-copy"></i>Copiar en el sitio</div>
                    <i class="fas fa-chevron-right arrow-sub"></i>
                    <div class="submenu">
                        <div class="dropdown-item disabled" style="opacity:0.5; pointer-events:none;">
                            <div class="item-main">No hay sitios</div>
                        </div>
                    </div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.locateInSite()">
                    <div class="item-main"><i class="fas fa-search-location"></i>Localizar en sitio</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="AssetsPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="AssetsPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="AssetsPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-gem"></i> Activos del sitio</div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;">
                        <div style="aspect-ratio:1; background:var(--bg-secondary); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; opacity:0.3;"><i class="fas fa-image"></i></div>
                        <div style="aspect-ratio:1; background:var(--bg-secondary); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; opacity:0.3;"><i class="fas fa-image"></i></div>
                        <div style="aspect-ratio:1; background:var(--bg-secondary); border:1px solid var(--border); display:flex; align-items:center; justify-content:center; opacity:0.3;"><i class="fas fa-image"></i></div>
                    </div>
                </div>
            </div>
        `;
    },
    refreshList() { App.showInfo('Actualizando la lista de activos del sitio...'); },
    rebuildList() { App.showInfo('Re-escaneando todo el sitio para reconstruir la lista de activos...'); },
    newLibraryItem() { App.showInfo('Añadiendo el activo seleccionado como un nuevo elemento de biblioteca.'); },
    edit() { App.showInfo('Abriendo el editor externo para el activo seleccionado.'); },
    insert() { App.showInfo('Insertando el activo seleccionado en la posición del cursor.'); },
    rename() { App.showInfo('Preparando para cambiar el nombre del activo...'); },
    remove() { App.showInfo('Eliminando el activo seleccionado del sitio.'); },
    refreshPage() { App.showInfo('Actualizando los activos vinculados en la página abierta...'); },
    refreshSite() { App.showInfo('Sincronizando todos los activos con los archivos del servidor...'); },
    copyToSite() { App.showInfo('Copiando el recurso seleccionado al directorio del sitio...'); },
    locateInSite() { App.showInfo('Mostrando la ubicación del archivo en el panel Archivos...'); },
    help() { App.showInfo('El panel Activos centraliza todas las imágenes, colores y URLs de tu proyecto.'); },
    close() { Panels.closeSpecificPanel('activos'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('activos'); }
};
