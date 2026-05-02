/**
 * Panels Manager v6 (Docking Left/Bottom/Right/Floating + Memory + Resize)
 */

const Panels = {
    registry: {},
    groups: [],
    floatingPanels: [],  // { id, x, y, width, height }
    hiddenPanels: [],
    leftDock: null,      // { groups: [ { id, panels: [...], activePanel, height } ], width }
    bottomDock: null,    // { groups: [ { id, panels: [...], activePanel, height } ], height }
    rightDockDirection: 'column', // 'column' | 'row'
    panelLastLocation: {}, // { [panelId]: 'right' | 'left' | 'bottom' | 'floating' }
    currentWorkspace: 'default', // Para guardar por workspace/proyecto
    zIndexCounter: 10000,
    isDragging: false,

    init() {
        console.log("Initializing Panel System v6 (Full Docking)...");
        this.container = document.querySelector('.right-panel-container');
        this.currentWorkspace = this._detectWorkspace();

        // Migración: limpiar estado antiguo si es de una versión anterior (v5 no tenía leftDock/bottomDock)
        const savedExtra = localStorage.getItem('dw-panels-floating');
        if (savedExtra) {
            try {
                const data = JSON.parse(savedExtra);
                if (!('leftDock' in data)) {
                    // Estado antiguo → reset para evitar inconsistencias
                    localStorage.removeItem('dw-panels-floating');
                    localStorage.removeItem('dw-panels-layout');
                }
            } catch (_) {
                localStorage.removeItem('dw-panels-floating');
                localStorage.removeItem('dw-panels-layout');
            }
        }

        // Crear Zonas de Anclaje (indicadores visuales al arrastrar)
        if (!document.getElementById('dock-left')) {
            ['left', 'bottom', 'right'].forEach(z => {
                const el = document.createElement('div');
                el.id = `dock-${z}`;
                el.className = `dock-zone ${z}`;
                document.body.appendChild(el);
            });
        }
        // Crear contenedor de iconos minimizados
        if (!document.getElementById('minimized-panels')) {
            const minCont = document.createElement('div');
            minCont.id = 'minimized-panels';
            minCont.className = 'minimized-panels-container';
            document.body.appendChild(minCont);
        }

        // Recuperar ancho guardado del panel derecho (por workspace)
        const savedWidth = localStorage.getItem(this._getRightWidthKey()) || localStorage.getItem('dw-right-panel-width');
        if (savedWidth) {
            document.documentElement.style.setProperty('--right-panel-width', savedWidth);
        }

        // Migracion de esquema: evita estados corruptos de versiones anteriores
        const schemaKey = 'dw-panels-layout-schema';
        const schemaVersion = 'v6';
        if (localStorage.getItem(schemaKey) !== schemaVersion) {
            localStorage.removeItem('dw-panels-layout');
            localStorage.removeItem('dw-panels-floating');
            localStorage.setItem(schemaKey, schemaVersion);
        }

        this.registerPanels();
        this.loadLayout();
        this.render();
        this.renderDockedPanels();
        this.renderFloatingPanels();
        window.Panels = this;

        this.setupRightPanelResizer();
        this.setupLeftDockResizer();

        // Restaurar estado de la toolbar (por workspace)
        const toolbarExpanded = localStorage.getItem(this._getToolbarKey()) || localStorage.getItem('dw-toolbar-expanded');
        if (toolbarExpanded === '1') {
            this.toggleToolbar();
        }
    },

    _detectWorkspace() {
        const wsEl = document.querySelector('[data-workspace]');
        const ws = wsEl ? wsEl.getAttribute('data-workspace') : 'default';
        return ws || 'default';
    },

    _getLayoutKey() {
        return `dw-panels-layout-${this.currentWorkspace}`;
    },

    _getStateKey() {
        return `dw-panels-state-${this.currentWorkspace}`;
    },

    _getRightWidthKey() {
        return `dw-right-panel-width-${this.currentWorkspace}`;
    },

    _getToolbarKey() {
        return `dw-toolbar-expanded-${this.currentWorkspace}`;
    },

    // ═══════════════════════════════════════════════════════════
    // REDIMENSIONADOR DEL PANEL DERECHO
    // ═══════════════════════════════════════════════════════════
    setupRightPanelResizer() {
        const resizer = document.getElementById('resizer-right');
        const container = document.querySelector('.app-container');
        if (!resizer || !container) return;

        let startX, startWidth;
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startX = e.clientX;
            const computedStyle = getComputedStyle(document.documentElement);
            startWidth = parseInt(computedStyle.getPropertyValue('--right-panel-width')) || 320;
            document.body.style.cursor = 'col-resize';

            const onMouseMove = (ev) => {
                const dx = ev.clientX - startX;
                const newWidth = Math.max(200, Math.min(800, startWidth - dx));
                container.style.setProperty('--right-panel-width', `${newWidth}px`);
            };
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = 'default';
                const finalWidth = getComputedStyle(document.documentElement).getPropertyValue('--right-panel-width');
                localStorage.setItem(this._getRightWidthKey(), finalWidth);
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },

    // ═══════════════════════════════════════════════════════════
    // REDIMENSIONADOR DEL DOCK IZQUIERDO
    // ═══════════════════════════════════════════════════════════
    setupLeftDockResizer() {
        const resizer = document.getElementById('resizer-left-dock');
        if (!resizer) return;

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = this.leftDock ? this.leftDock.width : 280;
            document.body.style.cursor = 'col-resize';

            const onMouseMove = (ev) => {
                const dx = ev.clientX - startX;
                const newWidth = Math.max(150, Math.min(600, startWidth + dx));
                if (this.leftDock) {
                    this.leftDock.width = newWidth;
                    document.documentElement.style.setProperty('--left-dock-width', newWidth + 'px');
                }
            };
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = 'default';
                this.saveLayout();
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },

    registerPanels() {
        const list = [
            { id: 'activos', title: 'Activos', icon: 'fas fa-gem' },
            { id: 'comportamientos', title: 'Comportamientos', icon: 'fas fa-bolt' },
            { id: 'bibliotecas', title: 'Bibliotecas CC', icon: 'fas fa-cloud' },
            { id: 'inspector-codigo', title: 'Insp. Código', icon: 'fas fa-code' },
            { id: 'disenador-css', title: 'CSS Designer', icon: 'fas fa-palette' },
            { id: 'transiciones-css', title: 'Transiciones CSS', icon: 'fas fa-magic' },
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
            this.registry[p.id] = { ...p, visible: true };
        });
    },

    loadLayout() {
        this.currentWorkspace = this._detectWorkspace();
        const layoutKey = this._getLayoutKey();
        const stateKey = this._getStateKey();

        let saved = localStorage.getItem(layoutKey);
        let savedState = localStorage.getItem(stateKey);

        // Fallback de claves antiguas globales
        if (!saved) {
            const oldLayout = localStorage.getItem('dw-panels-layout');
            if (oldLayout) {
                saved = oldLayout;
                localStorage.setItem(layoutKey, oldLayout);
            }
        }
        if (!savedState) {
            const oldStatePerWorkspace = localStorage.getItem(`dw-panels-floating-${this.currentWorkspace}`);
            if (oldStatePerWorkspace) {
                savedState = oldStatePerWorkspace;
                localStorage.setItem(stateKey, oldStatePerWorkspace);
            }
        }
        if (!savedState) {
            const oldState = localStorage.getItem('dw-panels-floating');
            if (oldState) {
                savedState = oldState;
                localStorage.setItem(stateKey, oldState);
            }
        }

        if (saved) {
            try { this.groups = JSON.parse(saved); } catch (e) { this.loadDefaultLayout(); }
        } else {
            this.loadDefaultLayout();
        }

        if (savedState) {
            try {
                const data = JSON.parse(savedState);
                this.floatingPanels = data.floating || [];
                this.hiddenPanels   = data.hidden   || [];
                this.leftDock       = data.leftDock  || null;
                this.bottomDock     = data.bottomDock || null;
                this.rightDockDirection = data.rightDockDirection || 'column';
                this.panelLastLocation = data.panelLastLocation || {};
                if (this.leftDock && !this.leftDock.direction) this.leftDock.direction = 'column';
                if (this.bottomDock && !this.bottomDock.direction) this.bottomDock.direction = 'row';
            } catch (e) { console.warn("Error cargando estado de paneles"); }
        }
    },

    loadDefaultLayout() {
        this.groups = [
            { id: 'g1', panels: ['activos', 'comportamientos', 'bibliotecas', 'inspector-codigo'], activePanel: 'inspector-codigo', height: '25%' },
            { id: 'g2', panels: ['disenador-css', 'transiciones-css', 'dom', 'archivos'], activePanel: 'archivos', height: '25%' },
            { id: 'g3', panels: ['insertar', 'jquery-mobile', 'git', 'propiedades'], activePanel: 'propiedades', height: '25%' },
            { id: 'g4', panels: ['resultados', 'fragmentos', 'extensiones'], activePanel: 'resultados', height: '25%' }
        ];
    },

    saveLayout() {
        localStorage.setItem(this._getLayoutKey(), JSON.stringify(this.groups));
        localStorage.setItem(this._getStateKey(), JSON.stringify({
            floating:   this.floatingPanels,
            hidden:     this.hiddenPanels,
            leftDock:   this.leftDock,
            bottomDock: this.bottomDock,
            rightDockDirection: this.rightDockDirection,
            panelLastLocation: this.panelLastLocation
        }));
    },

    render() {
        if (this.isDragging) return;
        this.renderMinimizedIcons();
        this.renderFloatingPanels();
        this.renderDockedPanels();
        if (this.container) {
            this.container.innerHTML = '';
        }
        // Limpiar grupos vacíos
        this.groups = this.groups.filter(g => g.panels.length > 0);

        const hasGroups = this.groups.length > 0;
        // Mostrar/ocultar panel derecho y su resizer según si tiene contenido
        const rightPanel = document.querySelector('.right-panel');
        const rightResizer = document.getElementById('resizer-right');
        if (this.container) {
            this.container.style.flexDirection = this.rightDockDirection === 'row' ? 'row' : 'column';
        }
        if (rightPanel) {
            if (!hasGroups) {
                document.documentElement.style.setProperty('--right-panel-width', '0px');
                document.documentElement.style.setProperty('--right-resizer-width', '0px');
                rightPanel.style.display = 'none';
                if (rightResizer) rightResizer.style.display = 'none';
            } else {
                const savedW = localStorage.getItem(this._getRightWidthKey()) || localStorage.getItem('dw-right-panel-width') || '320px';
                document.documentElement.style.setProperty('--right-panel-width', savedW);
                document.documentElement.style.setProperty('--right-resizer-width', '4px');
                rightPanel.style.display = '';
                if (rightResizer) rightResizer.style.display = '';
            }
        }

        this.groups.forEach((group, index) => {
            // SEGURIDAD: Si el panel activo no está en la lista, cambiarlo
            if (group.activePanel && !group.panels.includes(group.activePanel)) {
                group.activePanel = group.panels.length > 0 ? group.panels[0] : null;
            }

            // Si el grupo está vacío, no renderizar (evita crash de 'icon')
            if (group.panels.length === 0) return;

            const groupEl = document.createElement('div');
            groupEl.className = 'panel-group';
            groupEl.id = group.id;
            groupEl.style.borderBottom = this.rightDockDirection === 'row' ? 'none' : '1px solid var(--border)';
            groupEl.style.borderRight = this.rightDockDirection === 'row' ? '1px solid var(--border)' : 'none';
            groupEl.style.flex = this.rightDockDirection === 'row'
                ? '1 1 0'
                : (group.height === 'auto' ? '0 0 auto' : `1 1 ${group.height}`);

            // Tabs
            const tabBar = document.createElement('div');
            tabBar.className = 'panel-tab-bar';

            group.panels.forEach(panelId => {
                const p = this.registry[panelId];
                if (!p) return; // Si el panel no existe (error), saltar

                const tab = document.createElement('div');
                tab.className = `panel-tab ${group.activePanel === panelId ? 'active' : ''}`;
                const shortTitle = p.title.length > 10 ? p.title.substring(0, 8) + '..' : p.title;
                tab.innerHTML = `<i class="${p.icon}"></i> <span>${shortTitle}</span>`;
                tab.title = p.title;

                // Eventos Drag
                tab.setAttribute('draggable', 'true');
                tab.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ panelId, fromGroupId: group.id }));
                    tab.style.opacity = '0.5';
                };
                tab.ondragend = () => { tab.style.opacity = '1'; };
                tab.ondragover = (e) => { e.preventDefault(); };
                tab.ondrop = (e) => {
                    e.preventDefault();
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if (data.fromGroupId !== group.id) this.movePanelToGroup(data.panelId, data.fromGroupId, group.id);
                };
                tab.onmousedown = (e) => {
                    if (e.button !== 0) return;
                    e.preventDefault();
                    // Drag para mover/desacoplar. Si fue solo click, switchTab se llama desde _startTabDrag
                    this._startTabDrag(e, panelId, 'right', () => this.switchTab(group.id, panelId));
                };

                tabBar.appendChild(tab);
            });

            // Controles
            const controls = document.createElement('div');
            controls.className = 'panel-group-controls';
            controls.innerHTML = `<div class="panel-control-btn" onclick="Panels.toggleCollapse('${group.id}')"><i class="fas fa-minus"></i></div>`;
            tabBar.appendChild(controls);
            groupEl.appendChild(tabBar);

            // Content
            if (group.activePanel) {
                const content = document.createElement('div');
                content.className = 'panel-content-area';
                content.id = `${group.id}-content`;
                this.renderPanelContent(content, group.activePanel);
                groupEl.appendChild(content);
            }

            // Resizer
            if (index < this.groups.length - 1 && this.rightDockDirection !== 'row') {
                const resizer = document.createElement('div');
                resizer.className = 'panel-group-resizer';
                this.setupResizer(resizer, groupEl);
                groupEl.appendChild(resizer);
            }

            this.container.appendChild(groupEl);
        });
    },

    _getPanelMenuHTML(panelId) {
        if (panelId === 'archivos' && typeof FilePanel !== 'undefined' && FilePanel.getMenuHTML) {
            return FilePanel.getMenuHTML();
        }
        if (panelId === 'propiedades' && typeof PropertiesPanel !== 'undefined' && PropertiesPanel.getMenuHTML) {
            return PropertiesPanel.getMenuHTML();
        }
        if (panelId === 'git' && typeof GitPanel !== 'undefined' && GitPanel.getMenuHTML) {
            return GitPanel.getMenuHTML();
        }
        if (panelId === 'resultados' && typeof ResultsPanel !== 'undefined' && ResultsPanel.getMenuHTML) {
            return ResultsPanel.getMenuHTML();
        }
        if (panelId === 'jquery-mobile' && typeof jQueryMobilePanel !== 'undefined' && jQueryMobilePanel.getMenuHTML) {
            return jQueryMobilePanel.getMenuHTML();
        }
        if (panelId === 'insertar' && typeof InsertPanel !== 'undefined' && InsertPanel.getMenuHTML) {
            return InsertPanel.getMenuHTML();
        }
        if (panelId === 'activos' && typeof AssetsPanel !== 'undefined' && AssetsPanel.getMenuHTML) {
            return AssetsPanel.getMenuHTML();
        }
        if (panelId === 'comportamientos' && typeof BehaviorsPanel !== 'undefined' && BehaviorsPanel.getMenuHTML) {
            return BehaviorsPanel.getMenuHTML();
        }
        if (panelId === 'bibliotecas' && typeof LibrariesPanel !== 'undefined' && LibrariesPanel.getMenuHTML) {
            return LibrariesPanel.getMenuHTML();
        }
        if (panelId === 'inspector-codigo' && typeof CodeInspectorPanel !== 'undefined' && CodeInspectorPanel.getMenuHTML) {
            return CodeInspectorPanel.getMenuHTML();
        }
        if (panelId === 'disenador-css' && typeof CSSDesignerPanel !== 'undefined' && CSSDesignerPanel.getMenuHTML) {
            return CSSDesignerPanel.getMenuHTML();
        }
        if (panelId === 'transiciones-css' && typeof CSSTransitionsPanel !== 'undefined' && CSSTransitionsPanel.getMenuHTML) {
            return CSSTransitionsPanel.getMenuHTML();
        }
        if (panelId === 'dom' && typeof DOMPanel !== 'undefined' && DOMPanel.getMenuHTML) {
            return DOMPanel.getMenuHTML();
        }
        if (panelId === 'fragmentos' && typeof SnippetsPanel !== 'undefined' && SnippetsPanel.getMenuHTML) {
            return SnippetsPanel.getMenuHTML();
        }
        if (panelId === 'extensiones' && typeof ExtensionsPanel !== 'undefined' && ExtensionsPanel.getMenuHTML) {
            return ExtensionsPanel.getMenuHTML();
        }
        return '<i class="fas fa-bars"></i>';
    },

    renderMinimizedIcons() {
        const container = document.getElementById('minimized-panels');
        if (!container) {
            console.warn("No se encontró el contenedor #minimized-panels");
            return;
        }

        container.innerHTML = '';
        const minimized = this.floatingPanels.filter(fp => fp.minimized);
        console.log(`Renderizando ${minimized.length} iconos minimizados`);

        this.floatingPanels.forEach(fp => {
            if (fp.minimized) {
                const p = this.registry[fp.id];
                if (!p) return;

                const icon = document.createElement('div');
                icon.id = `icon-${fp.id}`;
                icon.className = 'minimized-panel-icon';
                icon.style.left = fp.x + 'px';
                icon.style.top = fp.y + 'px';
                icon.style.zIndex = this.zIndexCounter;
                icon.setAttribute('data-title', p.title);
                icon.innerHTML = `<i class="${p.icon}"></i>`;
                
                // Arrastrar el icono
                icon.onmousedown = (e) => {
                    this.bringToFront(icon.id);
                    this.startDrag(e, icon.id);
                };

                // Restaurar con doble click
                icon.ondblclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.restorePanel(fp.id);
                };

                // Opcional: restaurar con click simple si no se arrastra
                // (Pero startDrag ya maneja el mouseup, así que mejor doble click o un botón interno)
                // Usaremos un botón pequeño o simplemente doble click como en los IDEs reales.
                
                container.appendChild(icon);
            }
        });
    },

    minimizePanel(panelId) {
        const fp = this.floatingPanels.find(p => p.id === panelId);
        if (fp) {
            fp.minimized = true;
            this.saveLayout();
            this.render(); // Redibujar todo para mostrar el icono
        }
    },

    restorePanel(panelId) {
        const fp = this.floatingPanels.find(p => p.id === panelId);
        if (fp) {
            fp.minimized = false;
            this.saveLayout();
            this.render(); // Redibujar todo para ocultar el icono y mostrar la ventana
        }
    },

    renderFloatingPanels() {
        // Eliminar ventanas que ya no deberían estar flotando
        const validIds = this.floatingPanels.map(fp => fp.id);
        document.querySelectorAll('.floating-window').forEach(win => {
            const id = win.id.replace('float-', '');
            if (!validIds.includes(id)) win.remove();
        });

        this.floatingPanels.forEach(fp => {
            // Si está minimizado, nos aseguramos que el elemento DOM no exista
            if (fp.minimized) {
                const win = document.getElementById(`float-${fp.id}`);
                if (win) win.remove();
                return;
            }

            let win = document.getElementById(`float-${fp.id}`);
            if (!win) {
                const p = this.registry[fp.id];
                if (!p) return;
                win = document.createElement('div');
                win.id = `float-${fp.id}`;
                win.className = 'floating-window';
                win.style.zIndex = ++this.zIndexCounter;
                win.style.top    = fp.y + 'px';
                win.style.left   = fp.x + 'px';
                win.style.width  = fp.width + 'px';
                win.style.height = fp.height + 'px';
                win.onmousedown = () => this.bringToFront(win.id);

                win.innerHTML = `
                 <div class="floating-header" onmousedown="Panels.startDrag(event, '${win.id}')">
                        <div class="floating-actions">
                            <div onclick="Panels.dockToZone('${fp.id}', 'left')"></div>
                            <div onclick="Panels.dockToZone('${fp.id}', 'right')"></div>
                            <div onclick="Panels.dockToZone('${fp.id}', 'bottom')"></div>
                        
                            <button class="floating-btn" onclick="Panels.minimizePanel('${fp.id}')" title="Minimizar"><i class="fas fa-minus"></i></button>
                            <button class="floating-btn" title="Cerrar" onclick="Panels.hidePanel('${fp.id}')"><i class="fas fa-times"></i></button>
                        </div>
                        <div class="floating-title">
                            <span>${p.title}</span>
                            <div class="files-menu-trigger" title="Menu y submenus de la ventana">
                                ${this._getPanelMenuHTML(fp.id)}
                            </div>
                        </div>
                </div>
                <div class="floating-content" id="${win.id}-content"></div>
                <div class="floating-resize-handle" onmousedown="Panels.startResize(event, '${win.id}')"></div>
                `;
                document.body.appendChild(win);
                this.renderPanelContent(document.getElementById(`${win.id}-content`), fp.id);
            }
        });
    },

    // ═════════════════════════════════════════════════════════
    // ACCIONES DE PANELES (CORE)
    // ═════════════════════════════════════════════════════════

    /**
     * Elimina el panel de TODAS las ubicaciones actuales (grid, flotante, docks)
     */
    _removePanelFromAllLocations(panelId) {
        // Del grid derecho
        this.groups.forEach(g => {
            g.panels = g.panels.filter(id => id !== panelId);
            if (g.activePanel === panelId) {
                g.activePanel = g.panels.length > 0 ? g.panels[0] : null;
            }
        });
        // De flotantes
        this.floatingPanels = this.floatingPanels.filter(p => p.id !== panelId);
        const win = document.getElementById(`float-${panelId}`);
        if (win) win.remove();
        
        // También limpiar de iconos minimizados
        this.renderMinimizedIcons();

        // Del dock izquierdo e inferior
        this._removeDockedPanel(panelId);
    },
    
    _removeDockedPanel(panelId) {
        if (this.leftDock && this.leftDock.groups) {
            this.leftDock.groups.forEach(g => {
                g.panels = g.panels.filter(id => id !== panelId);
                if (g.activePanel === panelId) {
                    g.activePanel = g.panels.length > 0 ? g.panels[0] : null;
                }
            });
            this.leftDock.groups = this.leftDock.groups.filter(g => g.panels.length > 0);
            if (this.leftDock.groups.length === 0) {
                this.leftDock = null;
                document.documentElement.style.setProperty('--left-dock-width', '0px');
                document.documentElement.style.setProperty('--left-dock-resizer-width', '0px');
            }
        }
        // Del dock inferior
        if (this.bottomDock && this.bottomDock.groups) {
            this.bottomDock.groups.forEach(g => {
                g.panels = g.panels.filter(id => id !== panelId);
                if (g.activePanel === panelId) {
                    g.activePanel = g.panels.length > 0 ? g.panels[0] : null;
                }
            });
            this.bottomDock.groups = this.bottomDock.groups.filter(g => g.panels.length > 0);
            if (this.bottomDock.groups.length === 0) {
                this.bottomDock = null;
                document.documentElement.style.setProperty('--bottom-dock-height', '0px');
            }
        }
    },

    /**
     * Renderiza los paneles acoplados a izquierda y abajo con soporte para múltiples paneles
     */
    renderDockedPanels() {
        const leftContainer   = document.getElementById('left-dock-container');
        const bottomContainer = document.getElementById('bottom-dock-container');

        // ── DOCK IZQUIERDO ──
        if (leftContainer) {
            if (this.leftDock && this.leftDock.groups && this.leftDock.groups.length > 0) {
                document.documentElement.style.setProperty('--left-dock-width', this.leftDock.width + 'px');
                document.documentElement.style.setProperty('--left-dock-resizer-width', '4px');
                leftContainer.innerHTML = '';
                leftContainer.style.flexDirection = this.leftDock.direction === 'row' ? 'row' : 'column';
                
                this.leftDock.groups.forEach((group, idx) => {
                    const groupEl = this._renderDockedGroup(group, 'left', idx);
                    if (groupEl) leftContainer.appendChild(groupEl);
                });
            } else {
                document.documentElement.style.setProperty('--left-dock-width', '0px');
                document.documentElement.style.setProperty('--left-dock-resizer-width', '0px');
                leftContainer.innerHTML = '';
            }
        }

        // ── DOCK INFERIOR ──
        if (bottomContainer) {
            if (this.bottomDock && this.bottomDock.groups && this.bottomDock.groups.length > 0) {
                const totalHeight = this.bottomDock.height || 200;
                document.documentElement.style.setProperty('--bottom-dock-height', totalHeight + 'px');
                bottomContainer.innerHTML = '';
                bottomContainer.appendChild(this._buildBottomResizeHandle());
                
                const contentArea = document.createElement('div');
                contentArea.style.flex = '1';
                contentArea.style.display = 'flex';
                contentArea.style.flexDirection = this.bottomDock.direction === 'column' ? 'column' : 'row';
                contentArea.style.overflow = 'hidden';
                
                this.bottomDock.groups.forEach((group, idx) => {
                    const groupEl = this._renderDockedGroup(group, 'bottom', idx);
                    if (groupEl) {
                        groupEl.style.flex = '1';
                        groupEl.style.minWidth = '0';
                        contentArea.appendChild(groupEl);
                    }
                });
                bottomContainer.appendChild(contentArea);
            } else {
                document.documentElement.style.setProperty('--bottom-dock-height', '0px');
                bottomContainer.innerHTML = '';
            }
        }
    },

    /**
     * Renderiza un grupo de paneles acoplado (puede tener múltiples pestañas)
     */
    _renderDockedGroup(group, zone, groupIdx) {
        const groupEl = document.createElement('div');
        groupEl.className = 'docked-group';
        groupEl.style.display = 'flex';
        groupEl.style.flexDirection = 'column';
        groupEl.style.height = '100%';
        const leftDirection = this.leftDock && this.leftDock.direction ? this.leftDock.direction : 'column';
        const bottomDirection = this.bottomDock && this.bottomDock.direction ? this.bottomDock.direction : 'row';
        groupEl.style.borderRight = (zone === 'bottom' && bottomDirection === 'row') || (zone === 'left' && leftDirection === 'row')
            ? '1px solid var(--border)'
            : 'none';
        groupEl.style.borderBottom = (zone === 'bottom' && bottomDirection === 'column') || (zone === 'left' && leftDirection === 'column')
            ? '1px solid var(--border)'
            : 'none';

        // Barra de pestañas
        const tabBar = document.createElement('div');
        tabBar.className = 'docked-tab-bar';
        tabBar.style.display = 'flex';
        tabBar.style.background = 'var(--bg-tertiary)';
        tabBar.style.borderBottom = '1px solid var(--border)';
        tabBar.style.height = '30px';
        tabBar.style.flexShrink = 0;

        group.panels.forEach(panelId => {
            const p = this.registry[panelId];
            if (!p) return;
            const tab = document.createElement('div');
            tab.className = `docked-tab ${group.activePanel === panelId ? 'active' : ''}`;
            tab.style.padding = '0 10px';
            tab.style.display = 'flex';
            tab.style.alignItems = 'center';
            tab.style.gap = '6px';
            tab.style.cursor = 'pointer';
            tab.style.borderRight = '1px solid var(--border)';
            tab.style.fontSize = '11px';
            tab.style.color = group.activePanel === panelId ? 'var(--accent)' : 'var(--text-muted)';
            tab.innerHTML = `<i class="${p.icon}" style="font-size:12px;"></i><span>${p.title.substring(0, 12)}</span>`;
            tab.title = p.title;
            tab.onmousedown = (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                // Drag para mover/desacoplar. Si fue solo click, switch tab
                this._startTabDrag(e, panelId, zone, () => this._switchDockedTab(group, panelId, zone, groupIdx));
            };
            tabBar.appendChild(tab);
        });

        // Content área
        const contentEl = document.createElement('div');
        contentEl.className = 'docked-panel-content';
        contentEl.style.flex = '1';
        contentEl.style.overflow = 'auto';
        contentEl.style.padding = '10px';
        this.renderPanelContent(contentEl, group.activePanel);

        groupEl.appendChild(tabBar);
        groupEl.appendChild(contentEl);
        return groupEl;
    },

    /**
     * Build resize handle para dock inferior
     */
    _buildBottomResizeHandle() {
        const handle = document.createElement('div');
        handle.className = 'bottom-dock-resize-handle';
        handle.style.height = '5px';
        handle.style.background = 'transparent';
        handle.style.cursor = 'row-resize';
        handle.style.flexShrink = 0;
        handle.style.transition = 'background 0.15s';
        handle.onmouseenter = () => handle.style.background = 'var(--accent)';
        handle.onmouseleave = () => handle.style.background = 'transparent';
        handle.onmousedown = (e) => {
            e.preventDefault();
            const startY = e.clientY;
            const startH = this.bottomDock.height;
            document.body.style.cursor = 'row-resize';
            const onMove = (ev) => {
                const dy = startY - ev.clientY;
                const newH = Math.max(80, Math.min(600, startH + dy));
                this.bottomDock.height = newH;
                document.documentElement.style.setProperty('--bottom-dock-height', newH + 'px');
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.cursor = 'default';
                this.saveLayout();
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        };
        return handle;
    },

    /**
     * Switch tab en un dock
     */
    _switchDockedTab(group, panelId, zone, groupIdx) {
        group.activePanel = panelId;
        this.saveLayout();
        this.renderDockedPanels();
    },

    _startTabDrag(e, panelId, fromZone, onClickCallback) {
        if (e.button !== 0) return;
        const startX = e.clientX;
        const startY = e.clientY;
        let dragging = false;
        let ghost = null;
        let snapPreview = null;

        const clearSnapPreview = () => {
            if (snapPreview) {
                snapPreview.remove();
                snapPreview = null;
            }
        };

        const renderSnapPreview = (ev) => {
            let activeZone = null;
            ['left', 'bottom', 'right'].forEach(z => {
                const zEl = document.getElementById(`dock-${z}`);
                if (!zEl) return;
                const r = zEl.getBoundingClientRect();
                const over = ev.clientX > r.left && ev.clientX < r.right &&
                             ev.clientY > r.top  && ev.clientY < r.bottom;
                zEl.classList.toggle('active', over);
                if (over) activeZone = z;
            });

            if (!activeZone) {
                clearSnapPreview();
                return;
            }

            const info = this._resolveDockDropTarget(ev.clientX, ev.clientY, activeZone);
            if (!info || !info.previewRect) {
                clearSnapPreview();
                return;
            }

            if (!snapPreview) {
                snapPreview = document.createElement('div');
                snapPreview.className = 'dock-snap-preview';
                document.body.appendChild(snapPreview);
            }

            snapPreview.style.left = info.previewRect.left + 'px';
            snapPreview.style.top = info.previewRect.top + 'px';
            snapPreview.style.width = info.previewRect.width + 'px';
            snapPreview.style.height = info.previewRect.height + 'px';
            snapPreview.setAttribute('data-mode', info.mode);
        };

        const onMove = (ev) => {
            if (!dragging) {
                if (Math.abs(ev.clientX - startX) > 5 || Math.abs(ev.clientY - startY) > 5) {
                    dragging = true;
                    // Crear ghost visual
                    const p = this.registry[panelId];
                    ghost = document.createElement('div');
                    ghost.style.cssText = `
                        position:fixed; pointer-events:none; z-index:${++this.zIndexCounter};
                        width:200px; padding:8px 14px;
                        background:var(--bg-secondary); border:2px solid var(--accent);
                        border-radius:var(--radius-md); box-shadow:var(--shadow-lg);
                        opacity:0.9; display:flex; align-items:center; gap:8px;
                        font-size:12px; color:var(--text-primary); white-space:nowrap;
                    `;
                    ghost.innerHTML = `<i class="${p ? p.icon : 'fas fa-window-maximize'}"></i><span>${p ? p.title : panelId}</span>`;
                    document.body.appendChild(ghost);
                }
            }
            if (dragging && ghost) {
                ghost.style.left = (ev.clientX - 100) + 'px';
                ghost.style.top  = (ev.clientY - 16) + 'px';
                renderSnapPreview(ev);
            }
        };

        const onUp = (ev) => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            if (!dragging) {
                // Solo fue un click: ejecutar callback de switch de pestaña
                if (onClickCallback) onClickCallback();
                return;
            }

            if (ghost) ghost.remove();
            clearSnapPreview();

            // Detectar en qué zona se soltó
            let droppedZone = null;
            ['left', 'bottom', 'right'].forEach(z => {
                const zEl = document.getElementById(`dock-${z}`);
                if (!zEl) return;
                zEl.classList.remove('active');
                const r = zEl.getBoundingClientRect();
                if (ev.clientX > r.left && ev.clientX < r.right &&
                    ev.clientY > r.top  && ev.clientY < r.bottom) {
                    droppedZone = z;
                }
            });

            if (droppedZone) {
                // Soltar en zona → si ya hay grupos, mostrar selector visual de modo (pestaña/split)
                const zoneGroups = droppedZone === 'right'
                    ? this.groups
                    : (droppedZone === 'left' ? this.leftDock : this.bottomDock)?.groups || [];

                if (zoneGroups.length > 0) {
                    const info = this._resolveDockDropTarget(ev.clientX, ev.clientY, droppedZone);
                    const suggested = info ? info.mode : 'split-bottom';
                    this._showDockPlacementChooser(ev.clientX, ev.clientY, suggested, (pickedMode) => {
                        this.dockToZone(panelId, droppedZone, ev.clientX, ev.clientY, { forceMode: pickedMode });
                    });
                } else {
                    this.dockToZone(panelId, droppedZone, ev.clientX, ev.clientY);
                }
            } else {
                // Soltar fuera de zonas → convertir a flotante donde se soltó
                this._removePanelFromAllLocations(panelId);
                this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);
                if (!this.floatingPanels.find(fp => fp.id === panelId)) {
                    this.floatingPanels.push({
                        id: panelId,
                        x: Math.max(0, ev.clientX - 150),
                        y: Math.max(0, ev.clientY - 20),
                        width: 320,
                        height: 400
                    });
                }
                this.panelLastLocation[panelId] = 'floating';
                this.saveLayout();
                this.render();
                this.renderFloatingPanels();
                this.renderDockedPanels();
            }
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    },

    // _buildDockedHTML removido - ahora se usa _renderDockedGroup

    /**
     * Desacoplar panel acoplado → ventana flotante
     */
    undockFrom(panelId, zone) {
        const savedSize = zone === 'left'
            ? { width: this.leftDock ? this.leftDock.width : 300, height: 400 }
            : { width: 300, height: this.bottomDock ? this.bottomDock.height : 200 };

        this._removePanelFromAllLocations(panelId);
        this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);

        if (!this.floatingPanels.find(fp => fp.id === panelId)) {
            this.floatingPanels.push({
                id: panelId,
                x: 200 + (this.floatingPanels.length * 20),
                y: 150 + (this.floatingPanels.length * 20),
                width: savedSize.width,
                height: savedSize.height
            });
        }
        this.panelLastLocation[panelId] = 'floating';

        this.saveLayout();
        this.renderFloatingPanels();
    },

    /**
     * Desacoplar (doble clic en pestaña del grid derecho) → ventana flotante
     */
    undockPanel(panelId, fromGroupId) {
        this._removePanelFromAllLocations(panelId);
        this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);

        if (!this.floatingPanels.find(fp => fp.id === panelId)) {
            this.floatingPanels.push({
                id: panelId,
                x: 100 + (this.floatingPanels.length * 20),
                y: 100 + (this.floatingPanels.length * 20),
                width: 300,
                height: 400
            });
        }
        this.panelLastLocation[panelId] = 'floating';

        this.saveLayout();
        this.render();
        this.renderFloatingPanels();
    },

    /**
     * Ocultar ventana flotante → hiddenPanels
     */
    hidePanel(panelId) {
        const win = document.getElementById(`float-${panelId}`);
        if (win) win.remove();
        this.floatingPanels = this.floatingPanels.filter(fp => fp.id !== panelId);
        if (!this.hiddenPanels.includes(panelId)) {
            this.hiddenPanels.push(panelId);
        }
        this.saveLayout();
    },

    /**
     * Cerrar panel del grid derecho → hiddenPanels
     */
    closePanel(panelId) {
        this.groups.forEach(g => {
            g.panels = g.panels.filter(id => id !== panelId);
            if (g.activePanel === panelId) {
                g.activePanel = g.panels.length > 0 ? g.panels[0] : null;
            }
        });
        if (!this.hiddenPanels.includes(panelId)) {
            this.hiddenPanels.push(panelId);
        }
        this.saveLayout();
        this.render();
    },

    /**
     * Cerrar un panel específico desde cualquier ubicación
     */
    closeSpecificPanel(panelId) {
        this._removePanelFromAllLocations(panelId);
        if (!this.hiddenPanels.includes(panelId)) {
            this.hiddenPanels.push(panelId);
        }
        this.saveLayout();
        this.render();
    },

    /**
     * Cerrar todo el grupo al que pertenece un panel
     */
    closeTabGroupOfPanel(panelId) {
        let foundGroup = null;
        
        // 1. Buscar en grid derecho
        let group = this.groups.find(g => g.panels.includes(panelId));
        if (group) foundGroup = group;
        
        // 2. Buscar en dock izquierdo
        if (!foundGroup && this.leftDock && this.leftDock.groups) {
            group = this.leftDock.groups.find(g => g.panels.includes(panelId));
            if (group) foundGroup = group;
        }
        
        // 3. Buscar en dock inferior
        if (!foundGroup && this.bottomDock && this.bottomDock.groups) {
            group = this.bottomDock.groups.find(g => g.panels.includes(panelId));
            if (group) foundGroup = group;
        }

        if (foundGroup) {
            const panelsToClose = [...foundGroup.panels];
            panelsToClose.forEach(pId => {
                this._removePanelFromAllLocations(pId);
                if (!this.hiddenPanels.includes(pId)) {
                    this.hiddenPanels.push(pId);
                }
            });
        } else {
            // Si no está en un grupo (ej. flotante individual), cerrar solo el panel
            this.closeSpecificPanel(panelId);
        }
        
        this.saveLayout();
        this.render();
    },

    /**
     * Acoplar a una zona con modos: tab | split-left | split-right | split-top | split-bottom
     */
    dockToZone(panelId, zone, dropX, dropY, options = {}) {
        this._removePanelFromAllLocations(panelId);
        this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);
        document.querySelectorAll('.dock-zone').forEach(el => el.classList.remove('active'));

        const hasDropPoint = dropX !== undefined && dropY !== undefined;
        const dropInfo = hasDropPoint ? this._resolveDockDropTarget(dropX, dropY, zone) : null;
        const fallbackMode = zone === 'bottom' ? 'split-right' : 'split-bottom';
        const mode = options.forceMode || (dropInfo ? dropInfo.mode : fallbackMode);
        let selectedTargetGroup = dropInfo ? dropInfo.targetGroup : null;
        const targetIndex = dropInfo ? dropInfo.targetIndex : null;

        if (mode === 'tab' && !selectedTargetGroup) {
            const fallbackGroups = zone === 'right'
                ? this.groups
                : (zone === 'left' ? this.leftDock : this.bottomDock)?.groups || [];
            selectedTargetGroup = fallbackGroups[0] || null;
        }

        const direction = mode.startsWith('split-') ? mode.replace('split-', '') : 'bottom';

        if (zone === 'right') {
            if (selectedTargetGroup && mode === 'tab') {
                if (!selectedTargetGroup.panels.includes(panelId)) selectedTargetGroup.panels.push(panelId);
                selectedTargetGroup.activePanel = panelId;
                this.panelLastLocation[panelId] = 'right';
                this.saveLayout();
                this.render();
                return;
            }

            this.rightDockDirection = (direction === 'left' || direction === 'right') ? 'row' : 'column';
            const newGroup = { id: `g-${Date.now()}`, panels: [panelId], activePanel: panelId, height: '25%' };
            this._insertSplitGroup(this.groups, newGroup, targetIndex, direction);
            this.panelLastLocation[panelId] = 'right';
            this.saveLayout();
            this.render();
            return;
        }

        if (zone === 'left') {
            if (!this.leftDock) this.leftDock = { groups: [], width: 280, direction: 'column' };
            this.leftDock.groups = this.leftDock.groups || [];

            if (selectedTargetGroup && mode === 'tab') {
                if (!selectedTargetGroup.panels.includes(panelId)) selectedTargetGroup.panels.push(panelId);
                selectedTargetGroup.activePanel = panelId;
                this.panelLastLocation[panelId] = 'left';
                this.renderDockedPanels();
                this.saveLayout();
                return;
            }

            this.leftDock.direction = (direction === 'left' || direction === 'right') ? 'row' : 'column';
            const newGroup = { id: `lg-${Date.now()}`, panels: [panelId], activePanel: panelId };
            this._insertSplitGroup(this.leftDock.groups, newGroup, targetIndex, direction);
            this.panelLastLocation[panelId] = 'left';
            this.renderDockedPanels();
            this.saveLayout();
            return;
        }

        if (zone === 'bottom') {
            if (!this.bottomDock) this.bottomDock = { groups: [], height: 200, direction: 'row' };
            this.bottomDock.groups = this.bottomDock.groups || [];

            if (selectedTargetGroup && mode === 'tab') {
                if (!selectedTargetGroup.panels.includes(panelId)) selectedTargetGroup.panels.push(panelId);
                selectedTargetGroup.activePanel = panelId;
                this.panelLastLocation[panelId] = 'bottom';
                this.renderDockedPanels();
                this.saveLayout();
                return;
            }

            this.bottomDock.direction = (direction === 'left' || direction === 'right') ? 'row' : 'column';
            const newGroup = { id: `bg-${Date.now()}`, panels: [panelId], activePanel: panelId };
            this._insertSplitGroup(this.bottomDock.groups, newGroup, targetIndex, direction);
            this.panelLastLocation[panelId] = 'bottom';
            this.renderDockedPanels();
            this.saveLayout();
        }
    },

    _insertSplitGroup(groups, newGroup, targetIndex, direction) {
        if (!Array.isArray(groups) || !newGroup) return;
        if (targetIndex === null || targetIndex === undefined || targetIndex < 0 || targetIndex >= groups.length) {
            groups.push(newGroup);
            return;
        }
        const before = direction === 'left' || direction === 'top';
        const insertAt = before ? targetIndex : targetIndex + 1;
        groups.splice(insertAt, 0, newGroup);
    },

    /**
     * Resuelve intención de drop: tab o split dirigido + preview.
     */
    _resolveDockDropTarget(x, y, zone) {
        const container = zone === 'left'
            ? document.getElementById('left-dock-container')
            : zone === 'bottom'
                ? document.getElementById('bottom-dock-container')
                : document.querySelector('.right-panel-container');
        if (!container) return null;

        const containerRect = container.getBoundingClientRect();
        const inContainer = x >= containerRect.left && x <= containerRect.right && y >= containerRect.top && y <= containerRect.bottom;
        if (!inContainer) {
            return {
                mode: 'split-bottom',
                targetGroup: null,
                targetIndex: null,
                previewRect: { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height }
            };
        }

        const groups = Array.from(container.querySelectorAll('.panel-group, .docked-group'));
        for (let idx = 0; idx < groups.length; idx++) {
            const el = groups[idx];
            const r = el.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                const tabBandHeight = 34;
                const isTabBand = y <= (r.top + tabBandHeight);
                let splitDirection = 'bottom';
                if (!isTabBand) {
                    const cx = r.left + r.width / 2;
                    const cy = r.top + r.height / 2;
                    const dx = x - cx;
                    const dy = y - cy;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        splitDirection = dx < 0 ? 'left' : 'right';
                    } else {
                        splitDirection = dy < 0 ? 'top' : 'bottom';
                    }
                }
                const mode = isTabBand ? 'tab' : `split-${splitDirection}`;
                const targetGroup = zone === 'right'
                    ? this.groups.find(g => g.id === el.id) || null
                    : (zone === 'left' ? this.leftDock : this.bottomDock)?.groups?.[idx] || null;

                const previewRect = isTabBand
                    ? { left: r.left, top: r.top, width: r.width, height: Math.min(tabBandHeight, r.height) }
                    : (splitDirection === 'left'
                        ? { left: r.left, top: r.top, width: Math.max(50, r.width / 2), height: r.height }
                        : splitDirection === 'right'
                            ? { left: r.left + Math.max(50, r.width / 2), top: r.top, width: Math.max(50, r.width / 2), height: r.height }
                            : splitDirection === 'top'
                                ? { left: r.left, top: r.top, width: r.width, height: Math.max(30, r.height / 2) }
                                : { left: r.left, top: r.top + Math.max(30, r.height / 2), width: r.width, height: Math.max(30, r.height / 2) });

                return { mode, targetGroup, targetIndex: idx, previewRect };
            }
        }

        return {
            mode: 'split-bottom',
            targetGroup: null,
            targetIndex: null,
            previewRect: { left: containerRect.left, top: containerRect.top, width: containerRect.width, height: containerRect.height }
        };
    },

    /**
     * Selector visual de modo de acople (pestaña/split), compatible con navegadores sin prompt().
     */
    _showDockPlacementChooser(x, y, suggestedMode, onPick) {
        if (this._dockChooserEl) this._dockChooserEl.remove();

        const chooser = document.createElement('div');
        chooser.className = 'dock-placement-chooser';
        chooser.style.left = Math.max(8, x - 110) + 'px';
        chooser.style.top = Math.max(40, y - 20) + 'px';
        chooser.innerHTML = `
            <div class="dock-placement-title">Modo de acople</div>
            <button class="dock-placement-btn ${suggestedMode === 'tab' ? 'active' : ''}" data-mode="tab">Pestaña</button>
            <button class="dock-placement-btn ${suggestedMode === 'split-left' ? 'active' : ''}" data-mode="split-left">Split izquierda</button>
            <button class="dock-placement-btn ${suggestedMode === 'split-right' ? 'active' : ''}" data-mode="split-right">Split derecha</button>
            <button class="dock-placement-btn ${suggestedMode === 'split-top' ? 'active' : ''}" data-mode="split-top">Split arriba</button>
            <button class="dock-placement-btn ${suggestedMode === 'split-bottom' ? 'active' : ''}" data-mode="split-bottom">Split abajo</button>
        `;

        const closeChooser = () => {
            if (this._dockChooserEl) {
                this._dockChooserEl.remove();
                this._dockChooserEl = null;
            }
            document.removeEventListener('mousedown', onOutsideClick);
        };

        const onOutsideClick = (ev) => {
            if (!chooser.contains(ev.target)) {
                closeChooser();
            }
        };

        chooser.querySelectorAll('.dock-placement-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                closeChooser();
                if (onPick) onPick(mode);
            });
        });

        document.body.appendChild(chooser);
        const cr = chooser.getBoundingClientRect();
        const clampedLeft = Math.max(8, Math.min(window.innerWidth - cr.width - 8, cr.left));
        const clampedTop = Math.max(40, Math.min(window.innerHeight - cr.height - 8, cr.top));
        chooser.style.left = clampedLeft + 'px';
        chooser.style.top = clampedTop + 'px';
        this._dockChooserEl = chooser;
        setTimeout(() => document.addEventListener('mousedown', onOutsideClick), 0);
    },

    /**
     * Busca el grupo renderizado que está bajo el punto (x,y) del ratón
     */
    _findGroupAtPoint(x, y, zone) {
        let containerEl = null;
        if (zone === 'left') containerEl = document.getElementById('left-dock-container');
        else if (zone === 'bottom') containerEl = document.getElementById('bottom-dock-container');
        else if (zone === 'right') containerEl = document.querySelector('.right-panel-container');
        if (!containerEl) return null;

        const groups = containerEl.querySelectorAll('.panel-group, .docked-group');
        for (const el of groups) {
            const r = el.getBoundingClientRect();
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
                // Encontrar el grupo de datos correspondiente
                const id = el.id;
                if (zone === 'right') return this.groups.find(g => g.id === id) || null;
                const dock = zone === 'left' ? this.leftDock : this.bottomDock;
                if (dock && dock.groups) {
                    // Los grupos de dock no tienen id en el DOM directamente, usar índice
                    const els = Array.from(groups);
                    const idx = els.indexOf(el);
                    return dock.groups[idx] || null;
                }
            }
        }
        return null;
    },

    /**
     * Alternar barra de herramientas lateral (icono solo ↔ expandida con etiquetas)
     */
    toggleToolbar() {
        const toolbar = document.getElementById('main-toolbar');
        const container = document.querySelector('.app-container');
        if (!toolbar) return;
        const isExpanded = toolbar.classList.toggle('expanded');
        // Ajustar la columna de la toolbar en el grid
        if (isExpanded) {
            toolbar.style.width = '180px';
            document.documentElement.style.setProperty('--toolbar-width', '180px');
            container && container.style.setProperty('grid-template-columns',
                `180px 4px var(--left-dock-width, 0px) var(--left-dock-resizer-width, 0px) 1fr var(--right-resizer-width, 4px) var(--right-panel-width, 320px)`);
        } else {
            toolbar.style.width = '48px';
            document.documentElement.style.setProperty('--toolbar-width', '48px');
            container && container.style.setProperty('grid-template-columns',
                `48px 4px var(--left-dock-width, 0px) var(--left-dock-resizer-width, 0px) 1fr var(--right-resizer-width, 4px) var(--right-panel-width, 320px)`);
        }
        localStorage.setItem('dw-toolbar-expanded', isExpanded ? '1' : '0');
        localStorage.setItem(this._getToolbarKey(), isExpanded ? '1' : '0');
    },

    /**
     * Alternar Visibilidad desde el Menú Ventana
     */
    togglePanel(panelId) {
        // 0. Si está minimizado en modo flotante → restaurar
        const fp = this.floatingPanels.find(p => p.id === panelId);
        if (fp && fp.minimized) {
            fp.minimized = false;
            this.saveLayout();
            this.render();
            return;
        }

        // 1. Ya está en flotante → traer al frente
        if (document.getElementById(`float-${panelId}`)) {
            this.hidePanel(panelId);
            return;
        }
        // 2. En dock izquierdo → ocultar
        if (this.leftDock && this.leftDock.groups && this.leftDock.groups.some(g => g.panels.includes(panelId))) {
            this._removePanelFromAllLocations(panelId);
            if (!this.hiddenPanels.includes(panelId)) this.hiddenPanels.push(panelId);
            this.saveLayout();
            this.renderDockedPanels();
            return;
        }
        // 3. En dock inferior → ocultar
        if (this.bottomDock && this.bottomDock.groups && this.bottomDock.groups.some(g => g.panels.includes(panelId))) {
            this._removePanelFromAllLocations(panelId);
            if (!this.hiddenPanels.includes(panelId)) this.hiddenPanels.push(panelId);
            this.saveLayout();
            this.renderDockedPanels();
            return;
        }
        // 4. En grid derecho → ocultar
        const inGrid = this.groups.find(g => g.panels.includes(panelId));
        if (inGrid) {
            this.closePanel(panelId);
            return;
        }
        // 5. Oculto → restaurar a última ubicación conocida
        if (this.hiddenPanels.includes(panelId)) {
            this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);

            const lastLocation = this.panelLastLocation[panelId] || 'right';
            if (lastLocation === 'left') {
                this.dockToZone(panelId, 'left');
                return;
            }
            if (lastLocation === 'bottom') {
                this.dockToZone(panelId, 'bottom');
                return;
            }

            // ¿Tenía posición flotante guardada?
            const fp = this.floatingPanels.find(f => f.id === panelId);
            if (fp || lastLocation === 'floating') {
                if (!fp) {
                    this.floatingPanels.push({
                        id: panelId,
                        x: 220,
                        y: 160,
                        width: 320,
                        height: 420
                    });
                }
                this.panelLastLocation[panelId] = 'floating';
                this.renderFloatingPanels();
                this.saveLayout();
                return;
            }
            // ¿Hay datos guardados de flotante en localStorage?
            try {
                const savedExtra = localStorage.getItem('dw-panels-floating');
                if (savedExtra) {
                    const data = JSON.parse(savedExtra);
                    const savedFp = (data.floating || []).find(f => f.id === panelId);
                    if (savedFp) {
                        this.floatingPanels.push(savedFp);
                        this.renderFloatingPanels();
                        this.saveLayout();
                        return;
                    }
                }
            } catch (_) {}

            // Por defecto: añadir al grid derecho
            this.addPanelToRight(panelId);
        }
    },
    // ═════════════════════════════════════════════════════════
    // UTILIDADES Y DRAGGING
    // ═════════════════════════════════════════════════════════

    startDrag(e, winId) {
        const win = document.getElementById(winId);
        if (!win) return;

        this.isDragging = true;
        const isIcon = winId.startsWith('icon-');
        const panelId = winId.replace('float-', '').replace('icon-', '');
        
        // Elevar el elemento por encima de TODO durante el arrastre
        const oldZ = win.style.zIndex;
        win.style.zIndex = 100000;

        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const initialX = parseInt(win.style.left) || win.offsetLeft || 0;
        const initialY = parseInt(win.style.top) || win.offsetTop || 0;

        const otherIcons = isIcon ? Array.from(document.querySelectorAll('.minimized-panel-icon'))
            .filter(el => el.id !== winId)
            .map(el => ({
                rect: el.getBoundingClientRect(),
                id: el.id
            })) : [];

        let rafId = null;
        let currentX = initialX;
        let currentY = initialY;
        let activeZone = null;

        const moveAt = (clientX, clientY) => {
            const dx = clientX - startMouseX;
            const dy = clientY - startMouseY;
            
            let targetX = initialX + dx;
            let targetY = initialY + dy;
            
            if (isIcon) {
                const SNAP_DIST = 10; // Reducido para mayor precisión
                const ICON_SIZE = 44; 
                const GAP = 2; 

                otherIcons.forEach(other => {
                    const r = other.rect;
                    // Snap Vertical
                    if (Math.abs(targetX - r.left) < SNAP_DIST) targetX = r.left;
                    else if (Math.abs(targetX - (r.right + GAP)) < SNAP_DIST) targetX = r.right + GAP;
                    else if (Math.abs((targetX + ICON_SIZE) - (r.left - GAP)) < SNAP_DIST) targetX = r.left - ICON_SIZE - GAP;

                    // Snap Horizontal
                    if (Math.abs(targetY - r.top) < SNAP_DIST) targetY = r.top;
                    else if (Math.abs(targetY - (r.bottom + GAP)) < SNAP_DIST) targetY = r.bottom + GAP;
                    else if (Math.abs((targetY + ICON_SIZE) - (r.top - GAP)) < SNAP_DIST) targetY = r.top - ICON_SIZE - GAP;
                });
            }
            
            currentX = targetX;
            currentY = targetY;
            
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                win.style.left = currentX + 'px';
                win.style.top = currentY + 'px';
            });

            // Detectar Zonas de Anclaje
            const zones = ['left', 'bottom', 'right'];
            let foundZone = null;
            zones.forEach(z => {
                const zoneEl = document.getElementById(`dock-${z}`);
                if (!zoneEl) return;
                const rect = zoneEl.getBoundingClientRect();
                if (clientX > rect.left && clientX < rect.right && clientY > rect.top && clientY < rect.bottom) {
                    zoneEl.classList.add('active');
                    foundZone = z;
                } else {
                    zoneEl.classList.remove('active');
                }
            });
            activeZone = foundZone;
        };

        const onMouseMove = (event) => {
            moveAt(event.clientX, event.clientY);
        };

        document.addEventListener('mousemove', onMouseMove);

        const onMouseUp = () => {
            this.isDragging = false;
            win.style.zIndex = oldZ; // Restaurar z-index
            if (rafId) cancelAnimationFrame(rafId);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.querySelectorAll('.dock-zone').forEach(z => z.classList.remove('active'));

            if (activeZone) {
                this.dockToZone(panelId, activeZone);
            } else {
                const fp = this.floatingPanels.find(p => p.id === panelId);
                if (fp) {
                    fp.x = currentX;
                    fp.y = currentY;
                    this.saveLayout();
                    // Solo renderizamos si es estrictamente necesario
                    this.render(); 
                }
            }
        };

        document.addEventListener('mouseup', onMouseUp);
    },

    bringToFront(winId) {
        const win = document.getElementById(winId);
        if (win) win.style.zIndex = ++this.zIndexCounter;
    },

    /**
     * Redimensionar ventana flotante (handle esquina inferior-derecha)
     */
    startResize(e, winId) {
        e.preventDefault();
        e.stopPropagation();
        const win = document.getElementById(winId);
        if (!win) return;
        const panelId = winId.replace('float-', '');
        const startX  = e.clientX;
        const startY  = e.clientY;
        const startW  = win.offsetWidth;
        const startH  = win.offsetHeight;

        document.body.style.cursor = 'se-resize';
        const onMove = (ev) => {
            const newW = Math.max(200, startW + (ev.clientX - startX));
            const newH = Math.max(100, startH + (ev.clientY - startY));
            win.style.width  = newW + 'px';
            win.style.height = newH + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.body.style.cursor = 'default';
            const fp = this.floatingPanels.find(p => p.id === panelId);
            if (fp) {
                fp.width  = win.offsetWidth;
                fp.height = win.offsetHeight;
                this.saveLayout();
            }
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    },

    addPanelToRight(panelId) {
        if (this.groups.length === 0) {
            this.groups.push({ id: 'g-restored', panels: [panelId], activePanel: panelId, height: '100%' });
        } else {
            if (!this.groups[0].panels.includes(panelId)) {
                this.groups[0].panels.push(panelId);
            }
            this.groups[0].activePanel = panelId;
        }
        this.panelLastLocation[panelId] = 'right';
        this.saveLayout();
        this.render();
    },

    movePanelToGroup(panelId, fromGroupId, toGroupId) {
        const fromGroup = this.groups.find(g => g.id === fromGroupId);
        const toGroup = this.groups.find(g => g.id === toGroupId);
        if (!fromGroup || !toGroup) return;

        fromGroup.panels = fromGroup.panels.filter(id => id !== panelId);
        toGroup.panels.push(panelId);
        toGroup.activePanel = panelId;

        if (fromGroup.activePanel === panelId && fromGroup.panels.length > 0) fromGroup.activePanel = fromGroup.panels[0];

        this.render();
        this.saveLayout();
    },

    switchTab(groupId, panelId) {
        const group = this.groups.find(g => g.id === groupId);
        if (group) { group.activePanel = panelId; this.render(); this.saveLayout(); }
    },

    toggleCollapse(groupId) {
        const groupEl = document.getElementById(groupId);
        if (groupEl) {
            const content = groupEl.querySelector('.panel-content-area');
            if (content) {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'flex' : 'none';
                groupEl.classList.toggle('collapsed', !isHidden);
            }
        }
    },

    setupResizer(resizer, topGroup) {
        let startY, startHeight;
        const onMouseMove = (e) => {
            const dy = e.clientY - startY;
            const newHeight = startHeight + dy;
            if (newHeight > 50 && newHeight < window.innerHeight - 50) {
                topGroup.style.flex = `0 0 ${newHeight}px`;
            }
        };
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
            this.groups.forEach(g => {
                const el = document.getElementById(g.id);
                if (el) g.height = el.offsetHeight + 'px';
            });
            this.saveLayout();
        };
        resizer.addEventListener('mousedown', (e) => {
            startY = e.clientY;
            startHeight = topGroup.offsetHeight;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'row-resize';
            e.preventDefault();
        });
    },

    // getFilesPanelHTML ha sido movido a files-panel.js,


    // ═══════════════════════════════════════════════════════════
    // RENDERIZAR CONTENIDO DE PANELES
    // ═════════════════════════════════════════════════════════════
    renderPanelContent(container, panelId) {
        let html = '';
        if (!panelId) { container.innerHTML = ''; return; }

        const p = this.registry[panelId];
        if (!p) { container.innerHTML = ''; return; }

        // Lógica específica para paneles complejos
        if (panelId === 'resultados') {
            html = (typeof ResultsPanel !== 'undefined' && ResultsPanel.getContentHTML) ? ResultsPanel.getContentHTML() : '';
        } else if (panelId === 'archivos') {
            html = (typeof FilePanel !== 'undefined' && FilePanel.getContentHTML) ? FilePanel.getContentHTML() : '';
        } else if (panelId === 'propiedades') {
            html = (typeof PropertiesPanel !== 'undefined' && PropertiesPanel.getContentHTML) ? PropertiesPanel.getContentHTML() : '';
        } else if (panelId === 'jquery-mobile') {
            html = (typeof jQueryMobilePanel !== 'undefined' && jQueryMobilePanel.getContentHTML) ? jQueryMobilePanel.getContentHTML() : '';
        } else if (panelId === 'git') {
            html = (typeof GitPanel !== 'undefined' && GitPanel.getContentHTML) ? GitPanel.getContentHTML() : '';
        } else if (panelId === 'insertar') {
            html = (typeof InsertPanel !== 'undefined' && InsertPanel.getContentHTML) ? InsertPanel.getContentHTML() : '';
        } else if (panelId === 'activos') {
            html = (typeof AssetsPanel !== 'undefined' && AssetsPanel.getContentHTML) ? AssetsPanel.getContentHTML() : '';
        } else if (panelId === 'comportamientos') {
            html = (typeof BehaviorsPanel !== 'undefined' && BehaviorsPanel.getContentHTML) ? BehaviorsPanel.getContentHTML() : '';
        } else if (panelId === 'bibliotecas') {
            html = (typeof LibrariesPanel !== 'undefined' && LibrariesPanel.getContentHTML) ? LibrariesPanel.getContentHTML() : '';
        } else if (panelId === 'inspector-codigo') {
            html = (typeof CodeInspectorPanel !== 'undefined' && CodeInspectorPanel.getContentHTML) ? CodeInspectorPanel.getContentHTML() : '';
        } else if (panelId === 'disenador-css') {
            html = (typeof CSSDesignerPanel !== 'undefined' && CSSDesignerPanel.getContentHTML) ? CSSDesignerPanel.getContentHTML() : '';
        } else if (panelId === 'transiciones-css') {
            html = (typeof CSSTransitionsPanel !== 'undefined' && CSSTransitionsPanel.getContentHTML) ? CSSTransitionsPanel.getContentHTML() : '';
        } else if (panelId === 'dom') {
            html = (typeof DOMPanel !== 'undefined' && DOMPanel.getContentHTML) ? DOMPanel.getContentHTML() : '';
        } else if (panelId === 'fragmentos') {
            html = (typeof SnippetsPanel !== 'undefined' && SnippetsPanel.getContentHTML) ? SnippetsPanel.getContentHTML() : '';
        } else if (panelId === 'extensiones') {
            html = (typeof ExtensionsPanel !== 'undefined' && ExtensionsPanel.getContentHTML) ? ExtensionsPanel.getContentHTML() : '';
        } else {
            // Marco visual base para todos los paneles
            html = `
                <div class="files-window-shell">
                    
                    
                    <!-- Contenido genérico -->
                    <div class="files-panel-content-area" style="flex:1;min-height:120px;"></div>
                    
                    <!-- Footer genérico -->
                    <div class="files-panel-footer"></div>
                </div>
            `;
        }
        container.innerHTML = html;

        // --- POST-RENDER LOGIC ---
        if (panelId === 'resultados' && typeof ResultsPanel !== 'undefined' && ResultsPanel.init) {
            ResultsPanel.init(container);
        }
        // Inicializar eventos del panel de archivos si corresponde
        if (panelId === 'archivos' && typeof FilePanel !== 'undefined' && FilePanel.init) {
            FilePanel.init();
        }
        if (panelId === 'propiedades' && typeof PropertiesPanel !== 'undefined' && PropertiesPanel.init) {
            PropertiesPanel.init();
        }
        if (panelId === 'git' && typeof GitPanel !== 'undefined' && GitPanel.init) {
            GitPanel.init();
        }
        if (panelId === 'jquery-mobile' && typeof jQueryMobilePanel !== 'undefined' && jQueryMobilePanel.init) {
            jQueryMobilePanel.init();
        }
        if (panelId === 'insertar' && typeof InsertPanel !== 'undefined' && InsertPanel.init) {
            InsertPanel.init();
        }
        if (panelId === 'activos' && typeof AssetsPanel !== 'undefined' && AssetsPanel.init) {
            AssetsPanel.init();
        }
        if (panelId === 'comportamientos' && typeof BehaviorsPanel !== 'undefined' && BehaviorsPanel.init) {
            BehaviorsPanel.init();
        }
        if (panelId === 'bibliotecas' && typeof LibrariesPanel !== 'undefined' && LibrariesPanel.init) {
            LibrariesPanel.init();
        }
        if (panelId === 'inspector-codigo' && typeof CodeInspectorPanel !== 'undefined' && CodeInspectorPanel.init) {
            CodeInspectorPanel.init();
        }
        if (panelId === 'disenador-css' && typeof CSSDesignerPanel !== 'undefined' && CSSDesignerPanel.init) {
            CSSDesignerPanel.init();
        }
        if (panelId === 'transiciones-css' && typeof CSSTransitionsPanel !== 'undefined' && CSSTransitionsPanel.init) {
            CSSTransitionsPanel.init();
        }
        if (panelId === 'dom' && typeof DOMPanel !== 'undefined' && DOMPanel.init) {
            DOMPanel.init();
        }
        if (panelId === 'fragmentos' && typeof SnippetsPanel !== 'undefined' && SnippetsPanel.init) {
            SnippetsPanel.init();
        }
        if (panelId === 'extensiones' && typeof ExtensionsPanel !== 'undefined' && ExtensionsPanel.init) {
            ExtensionsPanel.init();
        }
    }
};

    // ════════════════════════════════════════════════════════════════
    // GESTIÓN DEL REDIMENSIONADOR DERECHO (Reemplaza a Layout.js)
    // ════════════════════════════════════════════════════════════════


// Autoconfiguración Menú Ventana (Igual que antes)
const menuMap = {
        'activos': 'activos', 'comportamientos': 'comportamientos', 'bibliotecas cc': 'bibliotecas',
        'inspector de código': 'inspector-codigo', 'diseñador de css': 'disenador-css',
        'transiciones css': 'transiciones-css', 'dom': 'dom', 'archivos': 'archivos',
        'insertar': 'insertar', 'muestras de jquery mobile': 'jquery-mobile', 'git': 'git',
        'propiedades': 'propiedades', 'resultados': 'resultados', 'fragmentos': 'fragmentos', 'extensiones': 'extensiones'
    };
document.addEventListener('DOMContentLoaded', () => {
    const ventanaMenu = Array.from(document.querySelectorAll('.menu-item')).find(item => item.querySelector('span').innerText.trim() === 'Ventana');
    if (ventanaMenu) {
        const items = ventanaMenu.querySelectorAll('.dropdown-item');
        items.forEach(item => {
            const text = item.querySelector('.item-main').innerText.trim().toLowerCase();
            const panelId = menuMap[text];
            if (panelId) {
                item.setAttribute('onclick', '');
                item.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); Panels.togglePanel(panelId); });
            }
        });
    }
});
