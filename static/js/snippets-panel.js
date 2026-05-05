/**
 * PANEL DE FRAGMENTOS (SNIPPETS) - Fragmentos de código reutilizables
 */
const SnippetsPanel = {
    init() { console.log('🧩 Panel de Fragmentos inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="SnippetsPanel.create()">
                    <div class="item-main"><i class="fas fa-plus"></i>Nuevo fragmento</div>
                </div>
                <div class="dropdown-item" onclick="SnippetsPanel.newFolder()">
                    <div class="item-main"><i class="fas fa-folder-plus"></i>Nueva carpeta</div>
                </div>
                <div class="dropdown-item" onclick="SnippetsPanel.edit()">
                    <div class="item-main"><i class="fas fa-pencil-alt"></i>Edicion</div>
                </div>
                <div class="dropdown-item" onclick="SnippetsPanel.insert()">
                    <div class="item-main"><i class="fas fa-share-square"></i>Insertar</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="SnippetsPanel.rename()">
                    <div class="item-main"><i class="fas fa-font"></i>Cambiar nombre</div>
                </div>
                <div class="dropdown-item" onclick="SnippetsPanel.delete()">
                    <div class="item-main"><i class="fas fa-trash-alt"></i>Eliminar</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="SnippetsPanel.addTriggerKey()">
                    <div class="item-main"><i class="fas fa-keyboard"></i>Añadir tecla de activación</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="SnippetsPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="SnippetsPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="SnippetsPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-puzzle-piece"></i> Fragmentos</div>
                <div class="files-panel-content-area" style="flex:1; padding: 5px; overflow-y: auto; font-size: 11px;">
                    <div class="snippet-folder" style="padding:6px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <i class="fas fa-folder-open" style="color:var(--accent);"></i> <span>Bootstrap 5</span>
                    </div>
                    <div style="padding:5px 5px 5px 25px; opacity:0.8; cursor:pointer;" onclick="App.showInfo('Insertando Grid Row...')"><i class="fas fa-file-code"></i> Grid Row</div>
                    <div style="padding:5px 5px 5px 25px; opacity:0.8; cursor:pointer;" onclick="App.showInfo('Insertando Navbar...')"><i class="fas fa-file-code"></i> Navbar</div>
                    
                    <div class="snippet-folder" style="padding:6px; border-top:1px solid var(--border); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; cursor:pointer; margin-top:5px;">
                        <i class="fas fa-folder" style="color:var(--accent);"></i> <span>JavaScript</span>
                    </div>
                    
                    <div class="snippet-folder" style="padding:6px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; cursor:pointer;">
                        <i class="fas fa-folder" style="color:var(--accent);"></i> <span>Media Queries</span>
                    </div>
                </div>
            </div>
        `;
    },
    create() { App.showInfo('Abriendo editor para crear un nuevo fragmento de código...'); },
    newFolder() { App.showInfo('Creando una nueva carpeta para organizar fragmentos...'); },
    edit() { App.showInfo('Editando el fragmento seleccionado actualmente...'); },
    insert() { App.showInfo('Insertando el fragmento de código en el editor...'); },
    rename() { App.showInfo('Cambiando el nombre del fragmento o carpeta...'); },
    delete() { App.showInfo('Eliminando el fragmento seleccionado de la biblioteca...'); },
    addTriggerKey() { App.showInfo('Configurando una tecla de acceso rápido para este fragmento...'); },
    help() { App.showInfo('Guarda bloques de código comunes para reutilizarlos en cualquier proyecto.'); },
    close() { Panels.closeSpecificPanel('fragmentos'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('fragmentos'); }
};
