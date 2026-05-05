/**
 * PANEL DE RESULTADOS - Salida, Búsqueda, Validación, etc.
 * Estructura tipo Dreamweaver con sub-pestañas
 */

const ResultsPanel = {
    /**
     * Estado interno del panel
     */
    state: {
        activeTab: 'salida'
    },

    /**
     * Inicializar el panel después de renderizar
     * @param {HTMLElement} container - Contenedor del panel
     */
    init(container) {
        console.log('📊 Panel de Resultados inicializado');
        
        // Vincular eventos a las sub-pestañas
        const tabs = container.querySelectorAll('.res-sub-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = tab.getAttribute('data-tab');
                this.state.activeTab = tabId;
                
                // Actualizar clases de pestañas
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Actualizar el cuerpo del contenido
                this.updateContent(container);
            });
        });

        // Cargar contenido inicial
        this.updateContent(container);
    },

    /**
     * Devuelve el HTML del menú contextual de la cabecera
     */
    getMenuHTML() {
        return `
            <i class="fas fa-bars"></i>
            <div class="files-context-menu">
                <div class="dropdown-item" onclick="ResultsPanel.openFile()">
                    <div class="item-main"><i class="fas fa-folder-open"></i>Abrir archivo</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="ResultsPanel.saveResults()">
                    <div class="item-main"><i class="fas fa-save"></i>Guardar resultados...</div>
                </div>
                <div class="dropdown-item" onclick="ResultsPanel.clearLog()">
                    <div class="item-main"><i class="fas fa-trash-alt"></i>Borrar resultados</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="ResultsPanel.checkDocLinks()">
                    <div class="item-main"><i class="fas fa-link"></i>Comprobar vínculos del documento actual</div>
                </div>
                <div class="dropdown-item" onclick="ResultsPanel.checkSiteLinks()">
                    <div class="item-main"><i class="fas fa-globe"></i>Buscar sitio local actual completo en vínculos</div>
                </div>
                <div class="dropdown-item" onclick="ResultsPanel.checkSelectedLinks()">
                    <div class="item-main"><i class="fas fa-file-contract"></i>Buscar archivos seleccionados en el sitio en vínculos</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="ResultsPanel.help()">
                    <div class="item-main"><i class="fas fa-question-circle"></i>Ayuda</div>
                </div>
                <div class="divider"></div>
                <div class="dropdown-item" onclick="ResultsPanel.close()">
                    <div class="item-main"><i class="fas fa-times"></i>Cerrar</div>
                </div>
                <div class="dropdown-item" onclick="ResultsPanel.closeTabGroup()">
                    <div class="item-main"><i class="fas fa-times-circle"></i>Cerrar grupo de fichas</div>
                </div>
            </div>
        `;
    },

    /**
     * Devuelve el HTML base del panel
     */
    getContentHTML() {
        const subTabs = [
            { id: 'salida', label: 'Salida' },
            { id: 'buscar', label: 'Buscar' },
            { id: 'validacion', label: 'Validación' },
            { id: 'vinculos', label: 'Verificador de vínculos' },
            { id: 'informes', label: 'Informes' },
            { id: 'ftp', label: 'Registro FTP' }
        ];

        let tabsHtml = subTabs.map(t =>
            `<button class="res-sub-tab ${this.state.activeTab === t.id ? 'active' : ''}" 
                    data-tab="${t.id}">${t.label}</button>`
        ).join('');

        return `
            <div class="files-window-shell">
                <div class="res-tabs-header" style="display:flex; background:var(--bg-tertiary); border-bottom:1px solid var(--border); overflow-x:auto;">
                    ${tabsHtml}
                </div>
                <div id="res-content-body" class="res-content-body" style="flex:1; overflow-y:auto; padding:10px; font-family:monospace; font-size:12px;">
                    <!-- El contenido dinámico se carga aquí -->
                </div>
                <div class="files-panel-footer" style="padding: 2px 10px; border-top: 1px solid var(--border); font-size: 10px; color: var(--text-muted); display: flex; justify-content: space-between;">
                    <span>Estado: Listo</span>
                    <span id="res-timestamp"></span>
                </div>
            </div>
        `;
    },

    /**
     * Actualiza solo el cuerpo del contenido según la pestaña activa
     * @param {HTMLElement} container 
     */
    updateContent(container) {
        const body = container.querySelector('#res-content-body');
        const ts = container.querySelector('#res-timestamp');
        if (!body) return;

        if (ts) ts.innerText = new Date().toLocaleTimeString();

        const tab = this.state.activeTab;
        let contentHtml = '';

        if (tab === 'salida') {
            contentHtml = `
                <div class="log-entry" style="color:var(--text-secondary); margin-bottom:4px;">> Servidor de desarrollo iniciado en http://localhost:5000</div>
                <div class="log-entry success" style="color:var(--success); margin-bottom:4px;">> Compilación de estilos completada con éxito.</div>
                <div class="log-entry" style="color:var(--text-secondary); margin-bottom:4px;">> Observando cambios en el directorio raíz...</div>
                <div class="log-entry" style="color:var(--accent); margin-bottom:4px;">> [${new Date().toLocaleTimeString()}] Renderizando vista previa...</div>
            `;
        } else if (tab === 'buscar') {
            contentHtml = `
                <div style="padding:5px;">
                    <div style="display:flex; gap:5px; margin-bottom:10px;">
                        <input type="text" placeholder="Palabra clave..." style="flex:1; border:1px solid var(--border); background: var(--bg-input); color: var(--text-primary); padding:4px; font-size:11px;">
                        <button class="prop-input" style="padding:2px 8px; font-size:10px; cursor:pointer;">Buscar</button>
                    </div>
                    <div style="font-size: 11px; color: var(--text-muted); text-align:center; padding:20px; border:1px dashed var(--border);">
                        No hay resultados que mostrar. Introduce un término para buscar en todo el sitio.
                    </div>
                </div>
            `;
        } else if (tab === 'vinculos') {
            contentHtml = `
                <div style="padding:5px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--border); padding-bottom:5px;">
                        <span style="font-weight:bold; color:var(--text-primary);">Verificador de vínculos</span>
                        <select class="prop-input" style="font-size:10px; padding:2px;">
                            <option>Vínculos rotos</option>
                            <option>Vínculos externos</option>
                            <option>Archivos huérfanos</option>
                        </select>
                    </div>
                    <div style="text-align:center; padding:30px; opacity:0.6;">
                        <i class="fas fa-link-slash" style="font-size:30px; margin-bottom:10px; display:block;"></i>
                        Usa el menú del panel para comprobar los vínculos del sitio o documento.
                    </div>
                </div>
            `;
        } else if (tab === 'validacion') {
            contentHtml = `
                <div style="padding:5px;">
                    <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid var(--success); color: var(--success); padding:10px; border-radius:4px; display:flex; align-items:center; gap:10px;">
                        <i class="fas fa-check-circle" style="font-size:20px;"></i>
                        <div>
                            <div style="font-weight:bold; font-size:12px;">Documento válido</div>
                            <div style="font-size:10px;">No se encontraron errores ni advertencias de HTML5.</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            contentHtml = `<div style="padding:40px; text-align: center; color: var(--text-muted); opacity:0.5;">
                <i class="fas fa-tools" style="font-size:24px; display:block; margin-bottom:10px;"></i>
                Módulo de ${tab.toUpperCase()} en desarrollo.
            </div>`;
        }

        body.innerHTML = contentHtml;
    },

    openFile() { App.showInfo('Abriendo archivo de resultados guardado...'); },
    saveResults() { App.showInfo('Exportando resultados a un archivo de texto...'); },
    clearLog() { App.showInfo('Consola de resultados limpiada.'); },
    checkDocLinks() { 
        this.state.activeTab = 'vinculos';
        const container = document.querySelector('.right-panel-container'); // Aproximación
        this.init(container); // Re-vincular
        App.showInfo('Comprobando vínculos en el documento actual...'); 
    },
    checkSiteLinks() { 
        this.state.activeTab = 'vinculos';
        App.showInfo('Escaneando todo el sitio local en busca de vínculos rotos...'); 
    },
    checkSelectedLinks() { 
        this.state.activeTab = 'vinculos';
        App.showInfo('Comprobando vínculos en los archivos seleccionados...'); 
    },
    help() { App.showInfo('El panel de resultados muestra información sobre la ejecución, vínculos y validación del código.'); },
    close() { Panels.closeSpecificPanel('resultados'); },
    closeTabGroup() { Panels.closeTabGroupOfPanel('resultados'); }
};
