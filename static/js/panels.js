/**
 * Panels Manager v5 (Docking Left/Bottom & Memory)
 */

const Panels = {
    registry: {},
    groups: [],
    // Nuevos estados
    floatingPanels: [], // Paneles que están flotando { id, x, y, width, height }
    hiddenPanels: [], // Paneles que están cerrados/ocultos
    zIndexCounter: 10000,

    // Sub-tabs resultados
    resultsState: { activeTab: 'salida' },

    init() {
        console.log("Initializing Panel System v5 (Docking)...");
        this.container = document.querySelector('.right-panel-container');

        // 1. Crear Zonas de Anclaje
        if (!document.getElementById('dock-left')) {
            const zones = ['left', 'bottom', 'right'];
            zones.forEach(z => {
                const el = document.createElement('div');
                el.id = `dock-${z}`;
                el.className = `dock-zone ${z}`;
                document.body.appendChild(el);
            });
        }

        // 2. Recuperar el ancho guardado del Resizer
        const savedWidth = localStorage.getItem('dw-right-panel-width');
        if (savedWidth) {
            // Aplicar la variable CSS
            document.documentElement.style.setProperty('--right-panel-width', savedWidth);
        }

        this.registerPanels();
        this.loadLayout();
        this.render();
        window.Panels = this;
        this.floatingPanels = [];
        this.hiddenPanels = [];
        this.zIndexCounter = 10000;
        this.resultsState = { activeTab: 'salida' };

        this.setupRightPanelResizer();


    },

    // ═══════════════════════════════════════════════════════════
    // REDIMENSIONADOR DEL PANEL DERECHO (Reemplaza a Layout.js)
    // ═══════════════════════════════════════════════════════════
    setupRightPanelResizer() {
        const resizer = document.getElementById('resizer-right');
        const container = document.querySelector('.app-container');

        if (!resizer || !container) return;

        let startX, startWidth;

        resizer.addEventListener('mousedown', (e) => {
            startX = e.clientX;

            // Leer el ancho actual de la variable CSS
            const computedStyle = getComputedStyle(document.documentElement);
            const currentWidth = parseInt(computedStyle.getPropertyValue('--right-panel-width'));
            startWidth = currentWidth;

            document.body.style.cursor = 'col-resize';

            const onMouseMove = (ev) => {
                const dx = ev.clientX - startX;
                const newWidth = startWidth - dx; // Mover a la derecha expande el centro (reduce el panel)

                // Límites: mínimo 200px, máximo 800px
                if (newWidth >= 200 && newWidth <= 800) {
                    container.style.setProperty('--right-panel-width', `${newWidth}px`);
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = 'default';

                // Guardar la preferencia de ancho
                const finalWidth = getComputedStyle(document.documentElement).getPropertyValue('--right-panel-width');
                localStorage.setItem('dw-right-panel-width', finalWidth);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
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
        // 1. Cargar Grid
        const saved = localStorage.getItem('dw-panels-layout');
        if (saved) {
            try { this.groups = JSON.parse(saved); } catch (e) { this.loadDefaultLayout(); }
        } else {
            this.loadDefaultLayout();
        }

        // 2. Cargar Flotantes y Ocultos
        const savedFloats = localStorage.getItem('dw-panels-floating');
        if (savedFloats) {
            try {
                const data = JSON.parse(savedFloats);
                this.floatingPanels = data.floating || [];
                this.hiddenPanels = data.hidden || [];
            } catch (e) { console.warn("Error cargando flotantes"); }
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
        localStorage.setItem('dw-panels-layout', JSON.stringify(this.groups));
        localStorage.setItem('dw-panels-floating', JSON.stringify({
            floating: this.floatingPanels,
            hidden: this.hiddenPanels
        }));
    },

    render() {
        this.container.innerHTML = '';
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
            groupEl.style.flex = group.height === 'auto' ? '0 0 auto' : `1 1 ${group.height}`;

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
                tab.ondblclick = () => { this.undockPanel(panelId, group.id); };
                tab.onclick = (e) => { if (!tab.getAttribute('data-dragging')) this.switchTab(group.id, panelId); };

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
            if (index < this.groups.length - 1) {
                const resizer = document.createElement('div');
                resizer.className = 'panel-group-resizer';
                this.setupResizer(resizer, groupEl);
                groupEl.appendChild(resizer);
            }

            this.container.appendChild(groupEl);
        });
    },

    renderFloatingPanels() {
        // Eliminar ventanas que no deberían estar flotando
        const validIds = this.floatingPanels.map(fp => fp.id);
        document.querySelectorAll('.floating-window').forEach(win => {
            const id = win.id.replace('float-', '');
            if (!validIds.includes(id)) win.remove();
        });

        // Crear/Actualizar ventanas flotantes
        this.floatingPanels.forEach(fp => {
            let win = document.getElementById(`float-${fp.id}`);
            if (!win) {
                const p = this.registry[fp.id];
                win = document.createElement('div');
                win.id = `float-${fp.id}`;
                win.className = 'floating-window';
                win.style.zIndex = ++this.zIndexCounter;

                // Posición guardada
                win.style.top = fp.y + 'px';
                win.style.left = fp.x + 'px';
                win.style.width = fp.width + 'px';
                win.style.height = fp.height + 'px';

                win.onmousedown = () => this.bringToFront(win.id);

                win.innerHTML = `
                    <div class="floating-header" onmousedown="Panels.startDrag(event, '${win.id}')">
                        <span class="floating-title"><i class="${p.icon}"></i> ${p.title}</span>
                        <div class="floating-actions">
                            <button class="floating-btn" title="Acoplar Izq" onclick="Panels.dockToZone('${fp.id}', 'left')"><i class="fas fa-arrow-left"></i></button>
                            <button class="floating-btn" title="Acoplar Der" onclick="Panels.dockToZone('${fp.id}', 'right')"><i class="fas fa-arrow-right"></i></button>
                            <button class="floating-btn" title="Acoplar Abajo" onclick="Panels.dockToZone('${fp.id}', 'bottom')"><i class="fas fa-arrow-down"></i></button>
                            <button class="floating-btn" title="Cerrar" onclick="Panels.hidePanel('${fp.id}')"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                    <div class="floating-content" id="${win.id}-content"></div>
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
     * Desacoplar (Sacar a ventana flotante)
     * Guarda posición y elimina del grid
     */
    undockPanel(panelId, fromGroupId) {
        // 1. Eliminar de grupos
        this.groups.forEach(g => {
            g.panels = g.panels.filter(id => id !== panelId);
            if (g.activePanel === panelId) {
                g.activePanel = g.panels.length > 0 ? g.panels[0] : null;
            }
        });

        // 2. Añadir a lista de flotantes (con posición por defecto si es nueva)
        const existing = this.floatingPanels.find(fp => fp.id === panelId);
        if (!existing) {
            this.floatingPanels.push({
                id: panelId,
                x: 100 + (this.floatingPanels.length * 20), // Offset visual
                y: 100 + (this.floatingPanels.length * 20),
                width: 300,
                height: 400
            });
        }

        // 3. Quitar de ocultos (si estaba cerrado)
        this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);

        this.saveLayout();
        this.render();
        this.renderFloatingPanels();
    },

    /**
     * Ocultar panel (Cerrar ventana flotante pero guardar estado)
     * Mueve de flotantes a ocultos.
     */
    hidePanel(panelId) {
        const win = document.getElementById(`float-${panelId}`);
        if (win) win.remove();

        // Quitar de flotantes
        this.floatingPanels = this.floatingPanels.filter(fp => fp.id !== panelId);

        // Añadir a ocultos
        if (!this.hiddenPanels.includes(panelId)) {
            this.hiddenPanels.push(panelId);
        }

        this.saveLayout();
    },

    /**
     * Acoplar a una zona (Izquierda, Derecha, Abajo)
     */
    dockToZone(panelId, zone) {
        const winId = `float-${panelId}`;
        const win = document.getElementById(winId);
        if (win) win.remove();

        // Limpiar clases de zona
        document.querySelectorAll('.dock-zone').forEach(el => el.classList.remove('active'));

        // Quitar de ocultos (si lo restauramos)
        this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);

        // Lógica por zona
        if (zone === 'right') {
            this.addPanelToRight(panelId);
            console.log(`Panel '${panelId}' acoplado a la DERECHA.`);
        }
        else if (zone === 'left') {
            // --- ACOPLAR A LA IZQUIERDA (REAL) ---
            const leftPanel = document.querySelector('.left-panel');
            const toolbar = document.querySelector('.side-toolbar');
            const resizer = document.getElementById('resizer-left'); // Asegúrate que este elemento existe en tu HTML

            // Mostrar barra lateral izquierda si estaba oculta
            if (leftPanel) leftPanel.style.display = 'flex';
            if (resizer) resizer.style.display = 'block'; // Mostrar resizer izquierdo si existe

            // Limpiar contenido viejo de la izquierda
            if (leftPanel) {
                // NOTA: En este sistema, el panel izquierdo no usa "Grupos" ni "Pestañas" como el derecho. 
                // Si quieres que tenga una pestaña propia, tendrías que añadir lógica similar a la derecha.
                // Para que sea idéntico, le vamos a poner el título
                if (leftPanel.innerHTML.trim() === '') {
                    leftPanel.innerHTML = `<div class="panel-group" style="height:100%; display:flex; flex-direction:column; border-bottom:1px solid var(--border);">
                        <div class="panel-tab-bar">
                            <div class="panel-tab active" title="${this.registry[panelId].title}">
                                <i class="${this.registry[panelId].icon}"></i> ${this.registry[panelId].title}
                            </div>
                        </div>
                        <div class="panel-content-area" style="flex:1; overflow:auto; padding:10px;">
                            <div style="text-align:center; color:var(--text-muted); padding-top:20px;">
                                <i class="fas fa-sitemap" style="font-size: 32px; margin-bottom: 10px; opacity:0.3;"></i><br>
                                Árbol de archivos (Panel ${this.registry[panelId].title})
                            </div>
                        </div>
                    </div>`;
                }
            }

            console.log(`Panel '${panelId}' acoplado a la IZQUIERDA.`);
        }
        else if (zone === 'bottom') {
            this.dockToBottom(panelId);
        }

        this.saveLayout();
        console.log(`Panel '${panelId}' guardado.`);
    },

    /**
     * Acoplar a la IZQUIERDA (Barra lateral real)
     */
    dockToLeft(panelId) {
        const leftPanel = document.querySelector('.left-panel');
        if (!leftPanel) { this.addPanelToRight(panelId); return; }

        // Mostrar barra izquierda
        leftPanel.style.display = 'flex';

        // Limpiar contenido viejo de la izquierda
        leftPanel.innerHTML = '';

        // Crear estructura de grupo simple para la izquierda
        const group = document.createElement('div');
        group.className = 'panel-group';
        group.style.height = '100%';
        group.style.borderBottom = 'none';

        const header = document.createElement('div');
        header.className = 'panel-tab-bar';
        header.innerHTML = `<div class="panel-tab active">${this.registry[panelId].title}</div>`;

        const content = document.createElement('div');
        content.className = 'panel-content-area';
        content.style.height = '100%';
        this.renderPanelContent(content, panelId);

        group.appendChild(header);
        group.appendChild(content);
        leftPanel.appendChild(group);
    },

    /**
     * Acoplar ABAJO (Footer)
     * Crea un panel temporal en la parte inferior
     */
    dockToBottom(panelId) {
        const footer = document.querySelector('.status-bar');
        if (!footer) { this.addPanelToRight(panelId); return; }

        // Buscar si ya existe un bottom-dock-container
        let bottomContainer = document.getElementById('bottom-dock-container');
        if (!bottomContainer) {
            // Crear el contenedor si no existe
            bottomContainer = document.createElement('div');
            bottomContainer.id = 'bottom-dock-container';
            bottomContainer.style.height = '200px';
            bottomContainer.style.display = 'flex';
            bottomContainer.style.background = 'var(--bg-secondary)';
            bottomContainer.style.borderTop = '1px solid var(--border)';

            // Insertar justo encima de la barra de estado
            footer.parentNode.insertBefore(bottomContainer, footer);
        }

        // Limpiar contenido viejo del fondo
        bottomContainer.innerHTML = '';

        // Crear estructura de grupo simple para el fondo
        const group = document.createElement('div');
        group.className = 'panel-group';
        group.style.height = '100%';
        group.style.borderBottom = 'none';

        const header = document.createElement('div');
        header.className = 'panel-tab-bar';
        header.innerHTML = `<div class="panel-tab active">${this.registry[panelId].title}</div>`;

        const content = document.createElement('div');
        content.className = 'panel-content-area';
        content.style.height = '100%';
        content.id = `bottom-content-${panelId}`; // ID único para el contenido

        // Rellenar contenido (Si no existe función específica, usamos el genérico)
        this.renderPanelContent(content, panelId);

        group.appendChild(header);
        group.appendChild(content);
        bottomContainer.appendChild(group);
    },

    /**
     * Alternar Visibilidad desde el Menú Ventana
     * Lógica: Si está oculto -> Mostrar (donde estaba). Si está flotando -> Ocultar. Si está en Grid -> Ocultar.
     */
    togglePanel(panelId) {
        // 1. Si está flotando -> Ocultar (Guardar posición)
        const winId = `float-${panelId}`;
        if (document.getElementById(winId)) {
            this.hidePanel(panelId);
            // Notificación de estado
            console.log(`Panel '${panelId}' ocultado.`);
            return;
        }

        // 2. Si está en Grid -> Ocultar (Moverse a ocultos)
        const inGrid = this.groups.find(g => g.panels.includes(panelId));
        if (inGrid) {
            this.closePanel(panelId);
            console.log(`Panel '${panelId}' ocultado (Grid).`);
            return;
        }

        // 3. Si está Oculto -> Mostrar (Si estaba flotante -> Flota. Si estaba en Grid -> Grid)
        if (this.hiddenPanels.includes(panelId)) {
            this.hiddenPanels = this.hiddenPanels.filter(id => id !== panelId);

            // Buscamos si estaba guardado como flotante
            const savedFloats = localStorage.getItem('dw-panels-floating');
            const floatingData = savedFloats ? JSON.parse(savedFloats) : { floating: [], hidden: [] };

            const fp = floatingData.floating.find(f => f.id === panelId);

            if (fp) {
                // Si estaba guardado como flotante, restauramos ese panel flotante
                this.floatingPanels.push(fp);
                this.renderFloatingPanels(); // Esto hace que vuelva a aparecer donde lo dejaste
                console.log(`Panel '${panelId}' restaurado (Flotante).`);
            } else {
                // Si solo estaba oculto del grid, devolverlo al Grid
                this.addPanelToRight(panelId);
                console.log(`Panel '${panelId}' restaurado (Grid).`);
            }
        }
    },

    // ═════════════════════════════════════════════════════════
    // UTILIDADES Y DRAGGING
    // ═════════════════════════════════════════════════════════

    startDrag(e, winId) {
        const win = document.getElementById(winId);
        if (!win) return;

        let shiftX = e.clientX - win.getBoundingClientRect().left;
        let shiftY = e.clientY - win.getBoundingClientRect().top;
        const panelId = winId.replace('float-', '');

        function moveAt(pageX, pageY) {
            win.style.left = pageX - shiftX + 'px';
            win.style.top = pageY - shiftY + 'px';

            // Detectar Zonas
            const zones = ['left', 'bottom', 'right'];
            let activeZone = null;
            zones.forEach(z => {
                const zoneEl = document.getElementById(`dock-${z}`);
                const rect = zoneEl.getBoundingClientRect();
                if (pageX > rect.left && pageX < rect.right && pageY > rect.top && pageY < rect.bottom) {
                    zoneEl.classList.add('active');
                    activeZone = z;
                } else {
                    zoneEl.classList.remove('active');
                }
            });
            return activeZone;
        }

        let currentZone = null;
        function onMouseMove(event) { currentZone = moveAt(event.pageX, event.pageY); }
        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;

            if (currentZone) {
                Panels.dockToZone(panelId, currentZone);
            } else {
                // Actualizar posición guardada en floatingPanels
                const fp = Panels.floatingPanels.find(p => p.id === panelId);
                if (fp) {
                    fp.x = parseInt(win.style.left);
                    fp.y = parseInt(win.style.top);
                    Panels.saveLayout();
                }
            }
        };
    },

    bringToFront(winId) {
        const win = document.getElementById(winId);
        if (win) win.style.zIndex = ++this.zIndexCounter;
    },

    addPanelToRight(panelId) {
        if (this.groups.length === 0) {
            this.groups.push({ id: 'g-restored', panels: [panelId], activePanel: panelId, height: '100%' });
        } else {
            this.groups[0].panels.push(panelId);
            this.groups[0].activePanel = panelId;
        }
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

    /**
     * Actualiza el contenido del panel Resultados (Salida, Buscar, etc.)
     * Se llama cada vez que se renderiza el panel "Resultados"
     */
    updateResultsContent(container) {
        const body = container.querySelector('#res-content-body');
        if (!body) return;

        const tab = this.resultsState.activeTab;
        let contentHtml = '';

        // Lógica según la pestaña activa
        if (tab === 'salida') {
            contentHtml = `
                <div class="log-entry">> Servidor iniciado...</div>
                <div class="log-entry success">> Conectado al localhost:5000</div>
                <div class="log-entry">> Esperando comandos...</div>
            `;
        } else if (tab === 'buscar') {
            contentHtml = `
                <div style="padding:5px;">
                    <input type="text" placeholder="Buscar en archivos..." style="width:100%; border:1px solid var(--border); background: var(--bg-input); color: var(--text-primary); padding:4px;">
                    <div style="margin-top:10px; font-size: 12px; color: var(--text-secondary);">0 resultados encontrados.</div>
                </div>
            `;
        } else if (tab === 'validacion') {
            contentHtml = `
                <div style="padding:5px;">
                    <button style="font-size:10px;">Validar documento actual</button>
                    <div style="margin-top:10px; color: var(--success);">Sin errores de marcado HTML5.</div>
                </div>
            `;
        } else if (tab === 'vinculos') {
            contentHtml = `
                <div style="padding:5px;">
                    <div style="margin-bottom:5px;"><strong>Enlace roto:</strong> index.html</div>
                    <div style="margin-bottom:5px;"><strong>Enlace roto:</strong> contacto.html</div>
                    <div style="margin-bottom:5px;"><strong>Enlace roto:</strong> sobre-nosotros.html</div>
                </div>
            `;
        } else {
            contentHtml = `<div style="padding:10px; text-align: center; opacity:0.5;">Vista ${tab} no implementada aún.</div>`;
        }

        body.innerHTML = contentHtml;
    },

    // ════════════════════════════════════════════════════════════════
    // GENERADORES DE HTML (Helper Methods)
    // ════════════════════════════════════════════════════════════════
    getResultsPanelHTML() {
        // Estructura de pestañas para Resultados (Salida, Buscar, etc.)
        const subTabs = [
            { id: 'salida', label: 'Salida' },
            { id: 'buscar', label: 'Buscar' },
            { id: 'validacion', label: 'Validación' },
            { id: 'informes', label: 'Informes' },
            { id: 'ftp', label: 'Registro FTP' }
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
                    <!-- El contenido dinámico se carga aquí -->
                </div>
            </div>
        `;
    },

    getFilesPanelHTML() {
        return `
            <div class="panel-widget-title">
                <i class="fas fa-folder"></i> Archivos
                <div style="float:right; font-size:10px; cursor:pointer;" title="Actualizar"><i class="fas fa-sync-alt"></i></div>
            </div>
            <div id="panel-file-tree-container" style="overflow:auto; flex:1;">
                <div style="padding:10px; text-align:center; color:var(--text-muted);">
                    <i class="fas fa-folder-open" style="font-size: 24px; display:block; margin-bottom:8px; opacity:0.3;"></i>
                    <p>Sitio Local</p>
                </div>
            </div>
        `;
    },

    getPropertiesPanelHTML() {
        return `
            <div class="panel-widget-title">
                <i class="fas fa-sliders-h"></i> Propiedades
            </div>
            <div style="padding: 5px;">
                <div class="prop-row">
                    <div class="prop-label">ID</div>
                    <input type="text" class="prop-input" placeholder="mi_element">
                </div>
                <div class="prop-row">
                    <div class="prop-label">Clase</div>
                    <input type="text" class="prop-input" placeholder="clase1 clase2">
                </div>
            </div>
        `;
    },

    getjQueryMobilePanelHTML() {
        return `
            <div class="panel-widget-title">
                <i class="fas fa-mobile-alt"></i> jQuery Mobile
            </div>
            <div style="padding: 10px; color: var(--text-muted); text-align: center;">
                <i class="fas fa-mobile-alt" style="font-size: 32px; display:block; margin-bottom:8px; opacity:0.3;"></i>
                <p>Componentes jQuery Mobile</p>
            </div>
        `;
    },

    getGitPanelHTML() {
        return `
            <div class="panel-widget-title">
                <i class="fas fa-code-branch"></i> Git
            </div>
            <div style="padding:10px; color: var(--text-muted); text-align: center;">
                <i class="fas fa-code-branch" style="font-size: 24px; display:block; margin-bottom:8px; opacity:0.3;"></i>
                <p>Control de versiones</p>
            </div>
        `;
    },

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
            html = this.getResultsPanelHTML();
        } else if (panelId === 'archivos') {
            html = this.getFilesPanelHTML();
        } else if (panelId === 'propiedades') {
            html = this.getPropertiesPanelHTML();
        } else if (panelId === 'jquery-mobile') {
            html = this.getjQueryMobilePanelHTML();
        } else if (panelId === 'git') {
            html = this.getGitPanelHTML();
        } else {
            // Placeholder genérico para el resto
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

        // --- POST-RENDER LOGIC (Vincular eventos a sub-pestañas) ---
        if (panelId === 'resultados') {
            const tabs = container.querySelectorAll('.res-sub-tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    tabs.forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    const tabName = e.target.dataset.tab;
                    // Actualizar estado lógico y re-renderizar solo el contenido interno
                    this.resultsState.activeTab = tabName;
                    this.updateResultsContent(container);
                });
            });
            // Cargar contenido inicial de la sub-pestaña activa
            this.updateResultsContent(container);
        }
    },

    // ════════════════════════════════════════════════════════════════
    // GESTIÓN DEL REDIMENSIONADOR DERECHO (Reemplaza a Layout.js)
    // ════════════════════════════════════════════════════════════════ */
    setupRightPanelResizer() {
        const resizer = document.getElementById('resizer-right');
        const container = document.querySelector('.app-container');

        // Referencias a las áreas centrales
        const leftElement = document.querySelector('.center-panel');    // Editor
        const rightElement = document.querySelector('.right-panel-container'); // Paneles

        if (!resizer || !container || !leftElement || !rightElement) {
            console.warn("No se encontraron elementos para redimensionar.");
            return;
        }

        let startX, startWidthRight, startWidthLeft;

        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            startX = e.clientX;

            // Leer el ancho ACTUAL usando la variable CSS
            const computedStyle = getComputedStyle(document.documentElement);
            const currentWidth = parseInt(computedStyle.getPropertyValue('--right-panel-width'));
            startWidthRight = currentWidth;
            startWidthLeft = leftElement.offsetWidth;

            document.body.style.cursor = 'col-resize';

            const onMouseMove = (ev) => {
                const dx = ev.clientX - startX;

                const newWidthRight = startWidthRight - dx;
                const newWidthLeft = startWidthLeft + dx;

                // Límites: mínimo 200px, máximo 800px
                if (newWidthRight >= 200 && newWidthLeft >= 200) {
                    // Actualizamos el CSS Grid y la variable
                    container.style.setProperty('--right-panel-width', `${newWidth}px`);
                    // Esto hace que el centro se ajuste automáticamente en el Grid
                }
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = 'default';

                // Guardar preferencia de ancho
                const finalWidth = getComputedStyle(document.documentElement).getPropertyValue('--right-panel-width');
                if (finalWidth) localStorage.setItem('dw-right-panel-width', finalWidth);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },
};

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
