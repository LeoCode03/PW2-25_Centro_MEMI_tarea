document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");
    const links = document.querySelectorAll(".nav-link");
    const mainContent = document.getElementById("main-content");

    // Menú hamburguesa
    toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });

    // Contenidos de ejemplo (puedes modificarlos libremente)
    const contenidos = {
        inicio: `
            <h1>Inicio</h1>
            <p>Bienvenido al Centro MEMI. Aquí encontrarás información general.</p>
        `,
        mvv: `
            <h1>Misión, Visión y Valores</h1>
            <p>Nuestra misión es impulsar la innovación tecnológica y el aprendizaje.</p>
        `,
        acerca: `
            <h1>Acerca de</h1>
            <p>El Centro MEMI es una unidad académica de la FCyT - UMSS.</p>
        `,
        cursos: `
            <h1>Cursos y Seminarios</h1>
            <p>Explora nuestra oferta de formación en tecnología e informática.</p>
        `,
        servicios: `
            <h1>Servicios</h1>
            <p>Ofrecemos consultorías, capacitaciones y desarrollo de software.</p>
        `,
        icpc: `
            <h1>ICPC UMSS</h1>
            <p>Apoyamos a los estudiantes que participan en la competencia ICPC.</p>
        `,
        contacto: `
            <h1>Contacto</h1>
            <p>Escríbenos a <a href="mailto:memi@fcyt.umss.edu.bo">memi@fcyt.umss.edu.bo</a></p>
        `,
        publicaciones: `
            <h1>Publicaciones</h1>
            <p>Consulta nuestras investigaciones y documentos técnicos.</p>
        `
    };

    // Acción al hacer clic en un enlace
    links.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();

            // Quitar color rojo previo
            links.forEach(l => l.classList.remove("active"));

            // Activar el botón actual
            link.classList.add("active");

            // Mostrar contenido correspondiente
            const section = link.getAttribute("data-section");
            mainContent.innerHTML = contenidos[section] || "<h1>Sección no encontrada</h1>";
            
            // Cerrar el menú (solo en móvil)
            menu.classList.remove("active");
        });
    });
});
