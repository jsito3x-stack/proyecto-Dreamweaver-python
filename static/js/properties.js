/**
 * ═══════════════════════════════════════════════════════════════
 * PROPERTIES - Panel de propiedades (REALMENTE FUNCIONAL)
 * ═══════════════════════════════════════════════════════════════
 */

const Properties = {
    currentXPath: null,

    init() {
        console.log('✅ Propiedades inicializadas');
    },

    /**
     * Cargar propiedades cuando seleccionamos desde el Árbol (tenemos el XPath exacto)
     */
    async load(xpath) {
        if (!xpath) return;
        this.currentXPath = xpath;

        try {
            const response = await fetch(`/api/element?xpath=${encodeURIComponent(xpath)}`);
            const data = await response.json();

            if (data && data.tag) {
                this.showProperties(data);
            }
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        }
    },

    /**
     * Cargar propiedades cuando seleccionamos desde la Vista Previa (Adivinamos el XPath)
     */
    async loadByGuess(xpath, extraData) {
        try {
            const response = await fetch(`/api/element?xpath=${encodeURIComponent(xpath)}`);
            const data = await response.json();

            if (data && data.tag) {
                this.currentXPath = xpath;
                this.showProperties(data);
            } else {
                // Si no lo encuentra por ID, mostramos lo que sepamos del clic
                this.showBasicInfo(extraData);
            }
        } catch (error) {
            this.showBasicInfo(extraData);
        }
    },

    /**
     * Mostrar datos en el panel de la derecha
     */
    showProperties(data) {
        document.getElementById('no-selection').style.display = 'none';
        document.getElementById('element-props').style.display = 'block';

        document.getElementById('prop-tag').value = data.tag || '';
        document.getElementById('prop-id').value = data.id || '';
        document.getElementById('prop-classes').value = data.clases || '';
        document.getElementById('prop-content').value = data.contenido || data.texto || '';

        // Estilos
        const estilos = data.estilos || {};
        document.getElementById('prop-color').value = estilos['color'] || '';
        document.getElementById('prop-bgcolor').value = estilos['background-color'] || estilos['background'] || '';
        document.getElementById('prop-fontsize').value = estilos['font-size'] || '';
        document.getElementById('prop-padding').value = estilos['padding'] || '';
        document.getElementById('prop-margin').value = estilos['margin'] || '';
        document.getElementById('prop-border').value = estilos['border'] || '';

        // Sincronizar con el Inspector Pro si existe
        if (typeof Pro !== 'undefined') Pro.updateInspector(data);
    },

    /**
     * Mostrar info básica si no encontramos el XPath exacto
     */
    showBasicInfo(extraData) {
        document.getElementById('no-selection').style.display = 'none';
        document.getElementById('element-props').style.display = 'block';

        document.getElementById('prop-tag').value = extraData.tag || '';
        document.getElementById('prop-id').value = extraData.id || '';
        document.getElementById('prop-classes').value = extraData.classes || '';
        document.getElementById('prop-content').value = '';

        // Limpiar estilos
        ['prop-color', 'prop-bgcolor', 'prop-fontsize', 'prop-padding', 'prop-margin', 'prop-border'].forEach(id => {
            document.getElementById(id).value = '';
        });
    },

    /**
     * EL BOTÓN MÁGICO: Aplicar cambios al HTML
     */
    async applyChanges() {
        if (!this.currentXPath) {
            App.showWarning('Selecciona un elemento primero');
            return;
        }

        const datos = {
            id: document.getElementById('prop-id').value,
            clases: document.getElementById('prop-classes').value,
            contenido: document.getElementById('prop-content').value,
            estilos: {
                'color': document.getElementById('prop-color').value,
                'background-color': document.getElementById('prop-bgcolor').value,
                'font-size': document.getElementById('prop-fontsize').value,
                'padding': document.getElementById('prop-padding').value,
                'margin': document.getElementById('prop-margin').value,
                'border': document.getElementById('prop-border').value
            }
        };

        try {
            const response = await fetch('/api/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xpath: this.currentXPath, datos: datos })
            });

            const result = await response.json();

            if (result.success) {
                App.showSuccess('✅ Elemento actualizado');
                App.refresh(); // Refresca vista previa, código y árbol
            } else {
                App.showError('Error al actualizar el elemento');
            }
        } catch (error) {
            App.showError('Error de conexión al guardar cambios');
        }
    },

    /**
     * Duplicar elemento
     */
    async duplicateElement() {
        if (!this.currentXPath) return;
        await fetch('/api/duplicate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xpath: this.currentXPath }) })
            .then(r => r.json()).then(d => { if (d.success) App.refresh(); });
    },

    /**
     * Eliminar elemento
     */
    async deleteElement() {
        if (!this.currentXPath) return;
        App.showConfirm('Eliminar elemento', '¿Seguro que quieres borrar este elemento?', async () => {
            await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xpath: this.currentXPath }) })
                .then(r => r.json()).then(d => { if (d.success) App.refresh(); });
        });
    },

    /**
     * Insertar nuevo elemento dentro del seleccionado
     */
    async insertElement(tag) {
        if (!this.currentXPath) {
            App.showWarning('Selecciona un elemento padre primero');
            return;
        }
        await fetch('/api/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ padre_xpath: this.currentXPath, tag: tag, atributos: {}, contenido: '' })
        })
            .then(r => r.json()).then(d => { if (d.success) App.refresh(); });
    },

    addAttribute() {
        const name = prompt('Nombre del atributo (ej: href, src, target):');
        if (!name) return;
        const value = prompt(`Valor para "${name}":`);

        const list = document.getElementById('attributes-list');
        const row = document.createElement('div');
        row.className = 'prop-row';
        row.innerHTML = `
            <input type="text" class="prop-input attr-name" value="${name}" style="width:40%;display:inline-block;" placeholder="Nombre">
            <input type="text" class="prop-input attr-value" value="${value || ''}" style="width:50%;display:inline-block;" placeholder="Valor">
            <button class="btn-icon" onclick="this.parentElement.remove()" style="color:var(--error);"><i class="fas fa-times"></i></button>
        `;
        list.appendChild(row);
    }
};