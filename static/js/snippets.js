/**
 * ═══════════════════════════════════════════════════════════════
 * SNIPPETS - Componentes y plantillas predefinidas
 * ═══════════════════════════════════════════════════════════════
 */

const Snippets = {
    categories: {},
    isOpen: false,
    
    /**
     * Inicializar snippets
     */
    async init() {
        await this.load();
        this.createPanel();
        console.log('✅ Snippets inicializados');
    },
    
    /**
     * Cargar snippets del servidor
     */
    async load() {
        try {
            const response = await fetch('/api/snippets');
            this.categories = await response.json();
        } catch (error) {
            console.error('Error cargando snippets:', error);
            // Cargar snippets por defecto
            this.categories = this.getDefaultSnippets();
        }
    },
    
    /**
     * Obtener snippets por defecto
     */
    getDefaultSnippets() {
        return {
            buttons: [
                {
                    name: 'Botón Primary',
                    icon: '🔘',
                    description: 'Botón principal',
                    html: '<button class="btn btn-primary">Botón Principal</button>'
                },
                {
                    name: 'Botón Secondary',
                    icon: '🔘',
                    description: 'Botón secundario',
                    html: '<button class="btn btn-secondary">Botón Secundario</button>'
                },
                {
                    name: 'Botón Outline',
                    icon: '🔘',
                    description: 'Botón con borde',
                    html: '<button class="btn btn-outline">Botón Outline</button>'
                },
                {
                    name: 'Botón Grande',
                    icon: '🔘',
                    description: 'Botón tamaño grande',
                    html: '<button class="btn btn-primary btn-lg">Botón Grande</button>'
                },
                {
                    name: 'Botón Pequeño',
                    icon: '🔘',
                    description: 'Botón tamaño pequeño',
                    html: '<button class="btn btn-primary btn-sm">Botón Pequeño</button>'
                }
            ],
            cards: [
                {
                    name: 'Card Básica',
                    icon: '🃏',
                    description: 'Tarjeta simple',
                    html: `<div class="card">
    <div class="card-header">
        <h3>Título de la Tarjeta</h3>
    </div>
    <div class="card-body">
        <p>Contenido de la tarjeta con texto descriptivo.</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary">Acción</button>
    </div>
</div>`
                },
                {
                    name: 'Card con Imagen',
                    icon: '🃏',
                    description: 'Tarjeta con imagen',
                    html: `<div class="card">
    <img src="imagen.jpg" alt="Descripción" class="card-img-top">
    <div class="card-body">
        <h5 class="card-title">Título</h5>
        <p class="card-text">Descripción de la tarjeta.</p>
        <a href="#" class="btn btn-primary">Ver más</a>
    </div>
</div>`
                }
            ],
            forms: [
                {
                    name: 'Input Text',
                    icon: '📝',
                    description: 'Campo de texto',
                    html: `<div class="form-group">
    <label for="input-text">Etiqueta</label>
    <input type="text" id="input-text" class="form-control" placeholder="Placeholder">
</div>`
                },
                {
                    name: 'Input Email',
                    icon: '📧',
                    description: 'Campo de email',
                    html: `<div class="form-group">
    <label for="input-email">Email</label>
    <input type="email" id="input-email" class="form-control" placeholder="tu@email.com">
</div>`
                },
                {
                    name: 'Textarea',
                    icon: '📝',
                    description: 'Área de texto',
                    html: `<div class="form-group">
    <label for="textarea">Mensaje</label>
    <textarea id="textarea" class="form-control" rows="4" placeholder="Escribe tu mensaje"></textarea>
</div>`
                },
                {
                    name: 'Select',
                    icon: '📋',
                    description: 'Lista desplegable',
                    html: `<div class="form-group">
    <label for="select">Selecciona</label>
    <select id="select" class="form-control">
        <option value="">-- Selecciona --</option>
        <option value="1">Opción 1</option>
        <option value="2">Opción 2</option>
        <option value="3">Opción 3</option>
    </select>
</div>`
                },
                {
                    name: 'Checkbox',
                    icon: '☑️',
                    description: 'Casilla de verificación',
                    html: `<div class="form-check">
    <input type="checkbox" id="checkbox" class="form-check-input">
    <label for="checkbox" class="form-check-label">Acepto los términos</label>
</div>`
                },
                {
                    name: 'Radio Buttons',
                    icon: '🔘',
                    description: 'Botones de radio',
                    html: `<div class="form-group">
    <label>Opciones:</label>
    <div class="form-check">
        <input type="radio" name="opcion" id="radio1" class="form-check-input">
        <label for="radio1" class="form-check-label">Opción 1</label>
    </div>
    <div class="form-check">
        <input type="radio" name="opcion" id="radio2" class="form-check-input">
        <label for="radio2" class="form-check-label">Opción 2</label>
    </div>
</div>`
                }
            ],
            navigation: [
                {
                    name: 'Navbar Básica',
                    icon: '🧭',
                    description: 'Barra de navegación',
                    html: `<nav class="navbar">
    <div class="navbar-brand">
        <a href="#">Logo</a>
    </div>
    <ul class="navbar-menu">
        <li><a href="#">Inicio</a></li>
        <li><a href="#">Servicios</a></li>
        <li><a href="#">Nosotros</a></li>
        <li><a href="#">Contacto</a></li>
    </ul>
</nav>`
                },
                {
                    name: 'Breadcrumbs',
                    icon: '📍',
                    description: 'Migas de pan',
                    html: `<nav class="breadcrumbs">
    <a href="#">Inicio</a>
    <span>/</span>
    <a href="#">Categoría</a>
    <span>/</span>
    <span>Página actual</span>
</nav>`
                }
            ],
            sections: [
                {
                    name: 'Hero Section',
                    icon: '🌟',
                    description: 'Sección hero principal',
                    html: `<section class="hero">
    <div class="hero-content">
        <h1 class="hero-title">Título Principal</h1>
        <p class="hero-subtitle">Subtítulo descriptivo de la página</p>
        <div class="hero-cta">
            <a href="#" class="btn btn-primary btn-lg">Comenzar</a>
            <a href="#" class="btn btn-outline btn-lg">Más info</a>
        </div>
    </div>
    <div class="hero-image">
        <img src="hero-image.jpg" alt="Hero">
    </div>
</section>`
                },
                {
                    name: 'Feature Cards',
                    icon: '✨',
                    description: 'Tarjetas de características',
                    html: `<section class="features">
    <div class="container">
        <h2>Nuestras Características</h2>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🚀</div>
                <h3>Rápido</h3>
                <p>Descripción de la característica.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <h3>Seguro</h3>
                <p>Descripción de la característica.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">💡</div>
                <h3>Intuitivo</h3>
                <p>Descripción de la característica.</p>
            </div>
        </div>
    </div>
</section>`
                },
                {
                    name: 'Testimonials',
                    icon: '💬',
                    description: 'Sección de testimonios',
                    html: `<section class="testimonials">
    <div class="container">
        <h2>Lo que dicen nuestros clientes</h2>
        <div class="testimonials-grid">
            <div class="testimonial-card">
                <div class="testimonial-content">
                    <p>"Excelente servicio, muy recomendado."</p>
                </div>
                <div class="testimonial-author">
                    <img src="avatar1.jpg" alt="Avatar">
                    <div>
                        <strong>Nombre Cliente</strong>
                        <span>Cargo, Empresa</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`
                }
            ],
            layout: [
                {
                    name: 'Container',
                    icon: '📦',
                    description: 'Contenedor centrado',
                    html: `<div class="container">
    <!-- Contenido aquí -->
</div>`
                },
                {
                    name: 'Grid 2 Columnas',
                    icon: '📊',
                    description: 'Grid de 2 columnas',
                    html: `<div class="row">
    <div class="col-6">
        <!-- Columna 1 -->
    </div>
    <div class="col-6">
        <!-- Columna 2 -->
    </div>
</div>`
                },
                {
                    name: 'Grid 3 Columnas',
                    icon: '📊',
                    description: 'Grid de 3 columnas',
                    html: `<div class="row">
    <div class="col-4">
        <!-- Columna 1 -->
    </div>
    <div class="col-4">
        <!-- Columna 2 -->
    </div>
    <div class="col-4">
        <!-- Columna 3 -->
    </div>
</div>`
                },
                {
                    name: 'Flexbox Center',
                    icon: '↔️',
                    description: 'Contenedor centrado',
                    html: `<div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
    <!-- Contenido centrado -->
</div>`
                }
            ]
        };
    },
    
    /**
     * Crear panel de snippets
     */
    createPanel() {
        // El panel se crea dinámicamente cuando se necesita
    },
    
    /**
     * Toggle panel de snippets
     */
    toggle() {
        const panel = document.getElementById('snippets-panel');
        if (!panel) {
            this.showPanel();
        } else {
            panel.classList.toggle('open');
            this.isOpen = panel.classList.contains('open');
        }
    },
    
    /**
     * Mostrar panel
     */
    showPanel() {
        // Crear panel si no existe
        let panel = document.getElementById('snippets-panel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'snippets-panel';
            panel.className = 'snippets-panel';
            panel.innerHTML = this.getPanelHTML();
            document.body.appendChild(panel);
        }
        
        panel.classList.add('open');
        this.isOpen = true;
    },
    
    /**
     * Ocultar panel
     */
    hidePanel() {
        const panel = document.getElementById('snippets-panel');
        if (panel) {
            panel.classList.remove('open');
            this.isOpen = false;
        }
    },
    
    /**
     * Obtener HTML del panel
     */
    getPanelHTML() {
        const categoriesHTML = Object.keys(this.categories).map(cat => {
            return `<button class="snippet-category-btn" data-category="${cat}">${this.getCategoryLabel(cat)}</button>`;
        }).join('');
        
        return `
            <div class="snippets-header">
                <span class="snippets-title"><i class="fas fa-puzzle-piece"></i> Componentes</span>
                <button class="btn-icon" onclick="Snippets.hidePanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="snippets-categories">
                ${categoriesHTML}
            </div>
            <div class="snippets-grid" id="snippets-grid">
                ${this.getCategorySnippets('buttons')}
            </div>
        `;
    },
    
    /**
     * Obtener etiqueta de categoría
     */
    getCategoryLabel(cat) {
        const labels = {
            buttons: '🔘 Botones',
            cards: '🃏 Tarjetas',
            forms: '📝 Formularios',
            navigation: '🧭 Navegación',
            sections: '📄 Secciones',
            layout: '📊 Layout'
        };
        return labels[cat] || cat;
    },
    
    /**
     * Obtener snippets de una categoría
     */
    getCategorySnippets(category) {
        const snippets = this.categories[category] || [];
        
        return snippets.map(snippet => `
            <div class="snippet-card" onclick="Snippets.insert('${category}', '${snippet.name}')">
                <div class="snippet-card-icon">${snippet.icon}</div>
                <div class="snippet-card-name">${snippet.name}</div>
                <div class="snippet-card-desc">${snippet.description}</div>
            </div>
        `).join('');
    },
    
    /**
     * Insertar snippet
     */
    async insert(category, name) {
        const snippets = this.categories[category] || [];
        const snippet = snippets.find(s => s.name === name);
        
        if (!snippet) return;
        
        if (!Properties.currentXPath) {
            App.showWarning('Selecciona dónde insertar el componente');
            return;
        }
        
        try {
            const response = await fetch('/api/insert-snippet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    xpath_padre: Properties.currentXPath,
                    snippet_html: snippet.html
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                App.showSuccess('✅ Componente insertado');
                await App.refresh();
                this.hidePanel();
            } else {
                App.showError('Error al insertar el componente');
            }
            
        } catch (error) {
            console.error('Error insertando snippet:', error);
            App.showError('Error al insertar el componente');
        }
    }
};
