<!DOCTYPE html>
<html lang="es">
 <head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>
   Estructura Semántica Ultra Completa
  </title>
  <link href="css/style.css" rel="stylesheet"/>
 </head>
 <body>
  <!-- CABECERA: Identidad y navegación principal -->
  <header>
   <h1>
    Logotipo de la Empresa
   </h1>
   <nav>
    <!-- Lista en cabecera con sub-niveles (menú desplegable) -->
    <ul>
     <li>
      <a href="#inicio">
       Inicio
      </a>
     </li>
     <li>
      <a href="#servicios">
       Servicios
      </a>
      <ul>
       <li>
        <a href="#web">
         Diseño Web
        </a>
       </li>
       <li>
        <a href="#seo">
         SEO &amp; Marketing
        </a>
       </li>
      </ul>
     </li>
     <li>
      <a href="#contacto">
       Contacto
      </a>
     </li>
    </ul>
   </nav>
  </header>
  <!-- CONTENIDO PRINCIPAL -->
  <main>
   <!-- SECCIÓN DE INTRODUCCIÓN -->
   <section id="inicio">
    <header>
     <h2>
      Bienvenidos a nuestra plataforma
     </h2>
     <p>
      Subtítulo o descripción breve de la sección.
     </p>
    </header>
    <article>
     <h3>
      Artículo Destacado
     </h3>
     <p>
      Contenido informativo con una
      <abbr title="HyperText Markup Language">
       HTML
      </abbr>
      bien estructurado.
     </p>
     <figure>
      <img alt="Ejemplo de imagen semántica" src="https://placeholder.com"/>
      <figcaption>
       Figura 1: Representación de un layout profesional.
      </figcaption>
     </figure>
    </article>
   </section>
   <!-- Sección de Galería de Imágenes -->
   <section id="galeria">
    <h2>
     Galería de Imágenes
    </h2>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
     <!-- Primera Imagen -->
     <figure>
      <img alt="Descripción clara de la primera imagen" src="imagenes/paisaje.jpg" width="400"/>
      <figcaption>
       Imagen 1: Paisaje natural desde la carpeta imagenes.
      </figcaption>
     </figure>
     <!-- Segunda Imagen -->
     <figure>
      <img alt="Descripción clara de la segunda imagen" src="imagenes/arquitectura.jpg" width="400"/>
      <figcaption>
       Imagen 2: Detalle arquitectónico moderno.
      </figcaption>
     </figure>
    </div>
   </section>
   <!-- SECCIÓN DE FORMULARIO -->
   <section id="registro">
    <h2>
     Formulario de Registro
    </h2>
    <form action="/enviar" method="post">
     <fieldset>
      <legend>
       Datos Personales
      </legend>
      <label for="nombre">
       Nombre completo:
      </label>
      <input id="nombre" name="nombre" required="" type="text"/>
      <label for="intereses">
       Intereses principales:
      </label>
      <!-- Listas dentro de formularios (usando select o datalist) -->
      <select id="intereses" name="intereses">
       <optgroup label="Tecnología">
        <option value="dev">
         Desarrollo
        </option>
        <option value="ai">
         IA
        </option>
       </optgroup>
       <optgroup label="Diseño">
        <option value="ux">
         UX/UI
        </option>
        <option value="3d">
         Modelado 3D
        </option>
       </optgroup>
      </select>
     </fieldset>
     <fieldset>
      <legend>
       Preferencias de contacto
      </legend>
      <ul>
       <li>
        <input id="email" name="via" type="checkbox" value="email"/>
        <label for="email">
         Correo electrónico
        </label>
        <!-- Sub-lista dentro de un ítem de formulario -->
        <ul>
         <li>
          <input id="diario" name="frecuencia" type="radio" value="diario"/>
          <label for="diario">
           Boletín diario
          </label>
         </li>
         <li>
          <input id="semanal" name="frecuencia" type="radio" value="semanal"/>
          <label for="semanal">
           Resumen semanal
          </label>
         </li>
        </ul>
       </li>
      </ul>
     </fieldset>
     <button type="submit">
      Enviar información
     </button>
    </form>
   </section>
   <!-- BARRA LATERAL: Contenido relacionado pero independiente -->
   <aside>
    <section>
     <h3>
      Recursos Adicionales
     </h3>
     <details>
      <summary>
       Preguntas Frecuentes
      </summary>
      <p>
       Aquí puedes encontrar respuestas a las dudas más comunes de forma compacta.
      </p>
     </details>
    </section>
    <section>
     <h3>
      Publicidad / Enlaces
     </h3>
     <p>
      Contenido que no es central para la lectura actual.
     </p>
    </section>
   </aside>
  </main>
  <!-- PIE DE PÁGINA -->
  <footer>
   <section>
    <p>
     © 2023 Todos los derechos reservados.
    </p>
    <!-- Información de contacto técnica -->
    <address>
     Escrito por
     <a href="mailto:autor@web.com">
      Juan Pérez
     </a>
     .
     <br/>
     Visítanos en: Calle Falsa 123, Ciudad.
    </address>
   </section>
   <nav>
    <ul>
     <li>
      <a href="/privacidad">
       Privacidad
      </a>
     </li>
     <li>
      <a href="/terminos">
       Términos
      </a>
     </li>
    </ul>
   </nav>
  </footer>
  <script src="javascript/script.js">
  </script>
 </body>
</html>
