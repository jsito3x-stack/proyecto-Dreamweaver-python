/**
 * PANEL DE INSERTAR - Elementos HTML y componentes
 * Estructura tipo Dreamweaver para inserción rápida
 */

const InsertPanel = {
    /**
     * Inicializar el panel después de renderizar
     */
    init() {
        console.log('➕ Panel de Insertar inicializado');
    },

    /**
     * Devuelve el HTML del menú contextual de la cabecera
     */
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="InsertPanel.toggleLabels()">
                    <div class="item-main"><i class="fas fa-eye-slash"></i>Ocultar etiquetas</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="InsertPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="InsertPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="InsertPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    /**
     * Devuelve el HTML del contenido principal del panel
     */
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);">
                    <i class="fas fa-plus-square"></i> Insertar elementos
                </div>
                
                <div class="files-panel-content-area" style="flex:1; padding: 10px; overflow-y: auto;">
                    <div style="margin-bottom: 15px;">
                        <select class="prop-input" style="width:100%; padding:6px; font-size:11px; background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border);">
                            <option>HTML Estándar</option>
                            <option>Componentes Bootstrap 5</option>
                            <option>Estructura de diseño</option>
                            <option>Formularios</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        ${this._renderInsertItem('Div', 'square', 'App.insertDiv()')}
                        ${this._renderInsertItem('Imagen', 'image', 'App.insertImage()')}
                        ${this._renderInsertItem('Párrafo', 'paragraph', 'App.insertParagraph()')}
                        ${this._renderInsertItem('Título', 'heading', 'App.insertHeading()')}
                        ${this._renderInsertItem('Tabla', 'table', 'App.insertTable()')}
                        ${this._renderInsertItem('Vínculo', 'link', 'App.insertLink()')}
                        ${this._renderInsertItem('Lista', 'list', 'App.insertList()')}
                        ${this._renderInsertItem('Vídeo', 'video', 'App.insertVideo()')}
                    </div>
                    
                    <div class="divider" style="margin: 20px 0 10px 0;"></div>
                    <div style="font-size: 10px; color: var(--text-muted); padding: 0 5px;">
                        <i class="fas fa-info-circle"></i> Haz clic en un elemento para insertarlo en la posición del cursor.
                    </div>
                </div>
                
                <div class="files-panel-footer" style="padding: 5px 10px; border-top: 1px solid var(--border); font-size: 10px; color: var(--text-muted); text-align: center;">
                    Favoritos | Recientes
                </div>
            </div>
        `;
    },

    /**
     * Helper para renderizar ítems de inserción
     */
    _renderInsertItem(name, icon, action) {
        return `
            <div class="insert-item" style="padding: 10px 8px; border: 1px solid var(--border); border-radius: 4px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.02);"
                 onmouseover="this.style.background='var(--bg-tertiary)'; this.style.borderColor='var(--accent)';"
                 onmouseout="this.style.background='rgba(255,255,255,0.02)'; this.style.borderColor='var(--border)';"
                 onclick="${action}">
                <i class="fas fa-${icon}" style="width: 16px; text-align: center; color: var(--accent); font-size: 14px;"></i>
                <span style="font-size: 11px; font-weight: 500;">${name}</span>
            </div>
        `;
    },

    refresh() {
        App.showInfo('Actualizando catálogo de elementos...');
    },

    toggleLabels() {
        App.showInfo('Modo de visualización cambiado: las etiquetas de los elementos se han ocultado.');
    },

    help() {
        App.showInfo('Panel de Inserción: Haz clic en cualquier elemento para añadirlo rápidamente a tu código HTML.');
    },

    close() {
        Panels.closeSpecificPanel('insertar');
    },

    closeTabGroup() {
        Panels.closeTabGroupOfPanel('insertar');
    }
};
