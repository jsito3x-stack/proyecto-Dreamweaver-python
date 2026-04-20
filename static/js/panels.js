/**
 * Panels Manager for Dreamweaver Python (Improved Version)
 * Handles tabbed groups, sub-tabs (Results), and layout persistence.
 */

const Panels = {
    registry: {}, // Base de datos de paneles disponibles
    groups: [],   // Grupos activos en la UI
    // Estado para las sub-pestañas del panel Resultados
    resultsState: {
        activeTab: 'salida' // Por defecto: Salida
    },

    init() {
        console.log("Initializing Panel System v2...");
        this.container = document.querySelector('.right-panel-container');

        if (!this.container) {
            console.error("Error: No se encontró el contenedor '.right-panel-container'");
            return;
        }

        // 1. Registrar todos los paneles requeridos
        this.registerPanels();

        // 2. Definir layout inicial (o cargar de localStorage)
        this.loadLayout();

        // 3. Renderizar
        this.render();

        window.Panels = this;
    },

    registerPanels() {
        const list = [
            { id: 'activos', title: 'Activos', icon: 'fas fa-gem' },
            { id: 'comportamientos', title: 'Comportamientos', icon: 'fas fa-bolt' },
            { id: 'bibliotecas', title: 'Bibliotecas CC', icon: 'fas fa-cloud' },
            { id: 'inspector-codigo', title: 'Insp. Código', icon: 'fas fa-code' },
            { id: 'disenador-css', title: 'CSS Designer', icon: 'fas fa-palette' },
            { id: 'transiciones-css', title: 'Transiciones CSS', icon: 'fas fa-magic' },
            // NUEVO PANEL DOM
            { id: 'dom', title: 'DOM', icon: 'fas fa-project-diagram' },
            { id: 'archivos', title: 'Archivos', icon: 'fas fa-folder' },
            { id: 'insertar', title: 'Insertar', icon: 'fas fa-plus-square' },
            { id: 'jquery-mobile', title: 'jQuery Mobile', icon: 'fas fa-mobile-alt' },
            { id: 'git', title: 'Git', icon: 'fas fa-code-branch' },
            { id: 'propiedades', title: 'Propiedades', icon: 'fas fa-sliders-h' },
            { id: 'resultados', title: 'Resultados', icon: 'fas fa-terminal' },
            { id: 'fragmentos', title: 'Fragmentos', icon: 'fas fa-puzzle-piece' },
            { id: 'extensiones', title: 'Extensiones', icon: 'fas fa-plug' }
        ];

        list.forEach(p => {
            this.registry[p.id] = {
                ...p,
                visible: true,
                active: false
            };
        });
    },

    loadLayout() {
        const saved = localStorage.getItem('dw-panels-layout');
        if (saved) {
            try {
                this.groups = JSON.parse(saved);
            } catch (e) {
                console.error("Error cargando layout, usando defecto", e);
                this.loadDefaultLayout();
            }
        } else {
            this.loadDefaultLayout();
        }
    },

    loadDefaultLayout() {
        this.groups = [
            {
                // GRUPO 1: Primera parte de tu lista
                id: 'group-part-1',
                panels: [
                    'activos',
                    'comportamientos',
                    'bibliotecas',
                    'inspector-codigo',
                    'disenador-css',
                    'transiciones-css',
                    'dom',
                    'archivos'
                ],
                activePanel: 'archivos', // Empieza mostrando archivos
                height: '50%'
            },
            {
                // GRUPO 2: Segunda parte de tu lista
                id: 'group-part-2',
                panels: [
                    'insertar',
                    'jquery-mobile',
                    'git',
                    'propiedades',
                    'resultados',
                    'fragmentos',
                    'extensiones'
                ],
                activePanel: 'propiedades',
                height: '50%'
            }
        ];
    },

    saveLayout() {
        localStorage.setItem('dw-panels-layout', JSON.stringify(this.groups));
    },

    render() {
        this.container.innerHTML = '';

        this.groups.forEach((group, index) => {
            const groupEl = document.createElement('div');
            groupEl.className = 'panel-group';
            groupEl.id = group.id;
            groupEl.style.flex = group.height === 'auto' ? '0 0 auto' : `1 1 ${group.height}`;

            // --- Tab Bar ---
            const tabBar = document.createElement('div');
            tabBar.className = 'panel-tab-bar';

            group.panels.forEach(panelId => {
                const p = this.registry[panelId];
                if (!p) return;

                const tab = document.createElement('div');
                tab.className = `panel-tab ${group.activePanel === panelId ? 'active' : ''}`;
                // Pequeño hack para que el título sea más corto en la pestaña si es necesario
                const shortTitle = p.title.length > 10 ? p.title.substring(0, 8) + '..' : p.title;

                tab.innerHTML = `<i class="${p.icon}"></i> <span>${shortTitle}</span>`;
                tab.onclick = () => this.switchTab(group.id, panelId);

                // Tooltip con título completo
                tab.title = p.title;

                tabBar.appendChild(tab);
            });

            // --- Controles (Minimizar/Cerrar) ---
            const controls = document.createElement('div');
            controls.className = 'panel-group-controls';
            controls.innerHTML = `
                <div class="panel-control-btn" title="Contraer" onclick="Panels.toggleCollapse('${group.id}')"><i class="fas fa-minus"></i></div>
            `;
            tabBar.appendChild(controls);

            groupEl.appendChild(tabBar);

            // --- Content Area ---
            const content = document.createElement('div');
            content.className = 'panel-content-area';
            content.id = `${group.id}-content`;

            this.renderPanelContent(content, group.activePanel);

            groupEl.appendChild(content);

            // --- Resizer (Separador) ---
            if (index < this.groups.length - 1) {
                const resizer = document.createElement('div');
                resizer.className = 'panel-group-resizer';
                this.setupResizer(resizer, groupEl);
                groupEl.appendChild(resizer);
            }

            this.container.appendChild(groupEl);
        });
    },

    renderPanelContent(container, panelId) {
        let html = '';

        // Lógica específica para paneles complejos
        if (panelId === 'resultados') {
            html = this.getResultsPanelHTML();
        } else if (panelId === 'archivos') {
            html = this.getFilesPanelHTML();
        } else if (panelId === 'propiedades') {
            html = this.getPropertiesPanelHTML();
        } else {
            // Placeholder genérico para el resto
            const p = this.registry[panelId];
            html = `
                <div class="panel-widget-title">
                    <i class="${p.icon}"></i> ${p.title}
                </div>
                <div class="dw-pro-empty">
                    <p>Contenido del panel <strong>${p.title}</strong>.</p>
                    <small style="opacity:0.5">Funcionalidad en desarrollo.</small>
                </div>
            `;
        }

        container.innerHTML = html;

        // --- POST-RENDER LOGIC (Vincular eventos) ---

        // 1. Si es Resultados, vincular clicks a las sub-pestañas
        if (panelId === 'resultados') {
            const tabs = container.querySelectorAll('.res-sub-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    // Actualizar estado visual
                    tabs.forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    // Actualizar estado lógico y re-renderizar solo el contenido interno
                    const tabName = e.target.dataset.tab;
                    this.resultsState.activeTab = tabName;
                    this.updateResultsContent(container);
                });
            });
            // Cargar contenido inicial de la sub-pestaña activa
            this.updateResultsContent(container);
        }

        // 2. Si es Archivos, intentar vincular al árbol global
        if (panelId === 'archivos' && typeof window.Tree !== 'undefined') {
            // Lógica existente del usuario
            setTimeout(() => {
                const treeContainer = document.getElementById('panel-file-tree-container');
                if (treeContainer && window.Tree.container) {
                    // Aquí podrías mover el DOM del árbol principal si es necesario
                    // treeContainer.appendChild(window.Tree.container);
                }
            }, 50);
        }
    },

    // --- Generadores de HTML Específicos ---

    getResultsPanelHTML() {
        // Definición EXACTA de las 6 sub-pestañas que pediste
        const subTabs = [
            { id: 'salida', label: 'Salida' },
            { id: 'buscar', label: 'Buscar' },
            { id: 'validacion', label: 'Validación' },
            { id: 'vinculos', label: 'Vínculos' },      // Verificador de vínculos
            { id: 'informes', label: 'Informes' },      // Informes del sitio
            { id: 'ftp', label: 'Registro FTP' }        // Registro FTP
        ];

        let tabsHtml = subTabs.map(t =>
            `<button class="res-sub-tab ${this.resultsState.activeTab === t.id ? 'active' : ''}" 
                    data-tab="${t.id}">${t.label}</button>`
        ).join('');

        return `
            <div style="display:flex; flex-direction:column; height:100%;">
                <div class="res-tabs-header">
                    ${tabsHtml}
                </div>
                <div id="res-content-body" class="res-content-body">
                    <!-- El contenido dinámico irá aquí -->
                </div>
            </div>
        `;
    },

    updateResultsContent(container) {
        const body = container.querySelector('#res-content-body');
        if (!body) return;

        const tab = this.resultsState.activeTab;
        let contentHtml = '';

        switch (tab) {
            case 'salida':
                contentHtml = `
                    <div class="log-entry">> Iniciando servidor Python...</div>
                    <div class="log-entry success">> Conectado al localhost:5000</div>
                    <div class="log-entry">> Esperando comandos...</div>
                `;
                break;
            case 'buscar':
                contentHtml = `
                    <div style="padding:5px;">
                        <input type="text" placeholder="Buscar en archivos..." style="width:100%; border:1px solid #444; background:#222; color:#fff; padding:4px;">
                        <div style="margin-top:10px; font-size:12px; color:#aaa;">0 resultados encontrados.</div>
                    </div>
                `;
                break;
            case 'validacion':
                contentHtml = `
                    <div style="padding:5px;">
                        <button style="font-size:10px;">Validar documento actual</button>
                        <div style="margin-top:10px; color:#4caf50;">Sin errores de marcado HTML5.</div>
                    </div>
                `;
                break;
            default:
                contentHtml = `<div style="padding:10px; text-align:center; opacity:0.5;">Vista ${tab} no implementada aún.</div>`;
        }
        body.innerHTML = contentHtml;
    },

    getFilesPanelHTML() {
        return `
            <div class="panel-widget-title">
                <i class="fas fa-sitemap"></i> Sitio Local
                <div style="float:right; font-size:10px; cursor:pointer;" title="Actualizar"><i class="fas fa-sync-alt"></i></div>
            </div>
            <div id="panel-file-tree-container" style="overflow:auto; flex:1;">
                <div style="padding:10px; text-align:center;">Cargando árbol...</div>
            </div>
        `;
    },

    getPropertiesPanelHTML() {
        return `
            <div class="panel-widget-title"><i class="fas fa-info-circle"></i> Propiedades</div>
            <div style="padding:5px;">
                <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:4px;">
                    <span>HTML</span> <span>CSS</span> <span>A11Y</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div class="prop-row">
                        <div class="prop-label">ID</div>
                        <input type="text" class="prop-input" placeholder="nombre_id">
                    </div>
                    <div class="prop-row">
                        <div class="prop-label">Clase</div>
                        <input type="text" class="prop-input" placeholder="clase1 clase2">
                    </div>
                    <div class="prop-row">
                        <div class="prop-label">Estilo</div>
                        <input type="text" class="prop-input" placeholder="color: red;">
                    </div>
                </div>
            </div>
        `;
    },

    // --- Manejo de Eventos y Layout ---

    switchTab(groupId, panelId) {
        const group = this.groups.find(g => g.id === groupId);
        if (group) {
            group.activePanel = panelId;
            this.render();
            this.saveLayout();
        }
    },

    toggleCollapse(groupId) {
        const groupEl = document.getElementById(groupId);
        if (groupEl) {
            const content = groupEl.querySelector('.panel-content-area');
            const isCollapsed = content.style.display === 'none';

            content.style.display = isCollapsed ? 'flex' : 'none';
            groupEl.classList.toggle('collapsed', !isCollapsed);
        }
    },

    setupResizer(resizer, topGroup) {
        let startY, startHeight;

        const onMouseMove = (e) => {
            const dy = e.clientY - startY;
            const newHeight = startHeight + dy;

            // Límites mínimos (ej: 100px)
            if (newHeight > 100 && newHeight < (window.innerHeight - 100)) {
                topGroup.style.flex = `0 0 ${newHeight}px`;
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';

            // Guardar las nuevas alturas
            this.groups.forEach(g => {
                const el = document.getElementById(g.id);
                if (el) {
                    // Obtenemos la altura en px y la guardamos
                    g.height = el.offsetHeight + 'px';
                }
            });
            this.saveLayout();
        };

        resizer.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startHeight = topGroup.offsetHeight;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'row-resize';
            e.preventDefault(); // Evitar selección de texto
        });
    }
};