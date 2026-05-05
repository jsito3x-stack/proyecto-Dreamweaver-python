/**
 * PANEL DE INSPECTOR DE CÓDIGO - Análisis de etiquetas y atributos
 */
const CodeInspectorPanel = {
    init() { console.log('🔍 Inspector de código inicializado'); },
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="CodeInspectorPanel.quickEdit()">
                    <div class="item-main"><i class="fas fa-bolt"></i>Edición rápida</div>
                    <span class="shortcut">Ctrl+E</span>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.cut()">
                    <div class="item-main"><i class="fas fa-cut"></i>Cortar</div>
                    <span class="shortcut">Ctrl+X</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.copy()">
                    <div class="item-main"><i class="fas fa-copy"></i>Copiar</div>
                    <span class="shortcut">Ctrl+C</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.paste()">
                    <div class="item-main"><i class="fas fa-paste"></i>Pegar</div>
                    <span class="shortcut">Ctrl+V</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.pasteSpecial()">
                    <div class="item-main"><i class="fas fa-paste"></i>Pegado especial...</div>
                    <span class="shortcut">Ctrl+Mayús+V</span>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.find()">
                    <div class="item-main"><i class="fas fa-search"></i>Buscar en el documento actual...</div>
                    <span class="shortcut">Ctrl+F</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.findReplaceFiles()">
                    <div class="item-main"><i class="fas fa-search-plus"></i>Buscar y reemplazar en archivos...</div>
                    <span class="shortcut">Ctrl+Mayús+F</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.replace()">
                    <div class="item-main"><i class="fas fa-exchange-alt"></i>Reemplazar en el documento actual...</div>
                    <span class="shortcut">Ctrl+H</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.findNext()">
                    <div class="item-main"><i class="fas fa-chevron-down"></i>Buscar siguiente</div>
                    <span class="shortcut">F3</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.findPrev()">
                    <div class="item-main"><i class="fas fa-chevron-up"></i>Buscar anterior</div>
                    <span class="shortcut">Mayús+F3</span>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.findAll()">
                    <div class="item-main"><i class="fas fa-list-ul"></i>Buscar todos y seleccionar</div>
                    <span class="shortcut">Ctrl+Alt+F3</span>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.newSnippet()">
                    <div class="item-main"><i class="fas fa-plus-circle"></i>Crear nuevo fragmento</div>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.quickDocs()">
                    <div class="item-main"><i class="fas fa-book"></i>Documentos rápidos</div>
                    <span class="shortcut">Ctrl+K</span>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.openRelated()">
                    <div class="item-main"><i class="fas fa-external-link-alt"></i>Abrir archivo relacionado</div>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.attachCSS()">
                    <div class="item-main"><i class="fas fa-paperclip"></i>Adjuntar hoja de estilos...</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item has-submenu" style="cursor:pointer;">
                    <div class="item-main"><i class="fas fa-mouse-pointer"></i>Selección</div>
                    <i class="fas fa-chevron-right arrow-sub"></i>
                    <div class="submenu">
                        <div class="dropdown-item" onclick="App.showInfo('Alternando comentario de línea...')">
                            <div class="item-main">Alternar comentario de línea</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Alternando comentario de bloque...')">
                            <div class="item-main">Alternar comentario de bloque</div>
                        </div>
                        <div class="divider"></div>
                        <div class="dropdown-item" onclick="App.showInfo('Contrayendo selección...')">
                            <div class="item-main">Contraer selección</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Contrayendo fuera de la selección...')">
                            <div class="item-main">Contraer fuera de la selección</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Expandiendo selección...')">
                            <div class="item-main">Expandir selección</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Contrayendo etiqueta completa...')">
                            <div class="item-main">Contraer etiqueta completa</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Contrayendo fuera de la etiqueta completa...')">
                            <div class="item-main">contraer fuera de la etiqueta completa</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Expandiendo todo...')">
                            <div class="item-main">Expandir todo</div>
                        </div>
                        <div class="divider"></div>
                        <div class="dropdown-item" onclick="App.showInfo('Convirtiendo CSS en línea en regla...')">
                            <div class="item-main">convertir CSS en línea en regla...</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Moviendo reglas CSS...')">
                            <div class="item-main">Mover reglas CSS...</div>
                        </div>
                        <div class="divider"></div>
                        <div class="dropdown-item" onclick="App.showInfo('Preparando para imprimir código...')">
                            <div class="item-main">Imprimir código</div>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item has-submenu" style="cursor:pointer;">
                    <div class="item-main"><i class="fas fa-magic"></i>Refactorizar</div>
                    <i class="fas fa-chevron-right arrow-sub"></i>
                    <div class="submenu">
                        <div class="dropdown-item" onclick="App.showInfo('Renombrando elemento...')">
                            <div class="item-main">Renombrar</div>
                            <span class="shortcut">Ctrl+Alt+R</span>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Extrayendo a variable...')">
                            <div class="item-main">Extraer a variable</div>
                            <span class="shortcut">Ctrl+Alt+V</span>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Extrayendo a función...')">
                            <div class="item-main">Extraer a función</div>
                            <span class="shortcut">Ctrl+Alt+M</span>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Envolviendo en Try Catch...')">
                            <div class="item-main">Envolver en Try Catch</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Envolviendo en condición...')">
                            <div class="item-main">Envolver en condición</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Convirtiendo a función flecha...')">
                            <div class="item-main">Convertir a funcion flecha</div>
                        </div>
                        <div class="dropdown-item" onclick="App.showInfo('Creando Getters/Setters...')">
                            <div class="item-main">Crear Getters/Setters</div>
                        </div>
                    </div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.codeNavigator()">
                    <div class="item-main"><i class="fas fa-compass"></i>Navegador de código...</div>
                    <span class="shortcut">Ctrl+Alt+N</span>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="CodeInspectorPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },
    getContentHTML() {
        return `
            <div class="files-window-shell">
                <div class="panel-widget-title" style="padding: 10px; border-bottom: 1px solid var(--border);"><i class="fas fa-code"></i> Inspector de código</div>
                <div class="files-panel-content-area" style="flex:1; padding: 10px; font-family: 'Courier New', monospace; font-size: 11px; background: rgba(0,0,0,0.2);">
                    <div style="color:var(--accent);">&lt;html&gt;</div>
                    <div style="padding-left:12px; color:var(--accent);">&lt;head&gt;...&lt;/head&gt;</div>
                    <div style="padding-left:12px; color:var(--accent); font-weight:bold;">&lt;body&gt;</div>
                    <div style="padding-left:24px; color:var(--text-primary); background: rgba(255,255,255,0.05); border-left: 2px solid var(--accent);">&lt;div id="main"&gt;</div>
                    <div style="padding-left:36px; color:var(--text-secondary);">&lt;h1&gt;Bienvenido&lt;/h1&gt;</div>
                    <div style="padding-left:24px; color:var(--text-primary);">&lt;/div&gt;</div>
                    <div style="padding-left:12px; color:var(--accent); font-weight:bold;">&lt;/body&gt;</div>
                    <div style="color:var(--accent);">&lt;/html&gt;</div>
                </div>
                <div class="files-panel-footer" style="padding:4px 10px; font-size:10px; border-top:1px solid var(--border); color:var(--accent);">body > div#main</div>
            </div>
        `;
    },
    quickEdit() { App.showInfo('Iniciando Edición rápida...'); },
    cut() { App.showInfo('Texto cortado al portapapeles.'); },
    copy() { App.showInfo('Texto copiado al portapapeles.'); },
    paste() { App.showInfo('Texto pegado desde el portapapeles.'); },
    pasteSpecial() { App.showInfo('Abriendo diálogo de Pegado especial...'); },
    find() { App.showInfo('Abriendo Buscar en el documento...'); },
    findReplaceFiles() { App.showInfo('Abriendo Buscar y reemplazar en archivos...'); },
    replace() { App.showInfo('Abriendo Reemplazar en el documento...'); },
    findNext() { App.showInfo('Buscando siguiente coincidencia...'); },
    findPrev() { App.showInfo('Buscando coincidencia anterior...'); },
    findAll() { App.showInfo('Seleccionando todas las coincidencias...'); },
    newSnippet() { App.showInfo('Creando fragmento desde la selección...'); },
    quickDocs() { App.showInfo('Mostrando Documentación rápida...'); },
    openRelated() { App.showInfo('Abriendo archivo relacionado...'); },
    attachCSS() { App.showInfo('Adjuntando hoja de estilos externa...'); },
    codeNavigator() { App.showInfo('Abriendo Navegador de código...'); },
    help() { App.showInfo('Muestra la jerarquía exacta de etiquetas HTML del documento actual.'); },
    close() { Panels.closeSpecificPanel('inspector-codigo'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('inspector-codigo'); }
};
