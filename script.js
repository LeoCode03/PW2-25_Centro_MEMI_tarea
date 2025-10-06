document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("nav-toggle");
    const menu = document.getElementById("nav-menu");
    const links = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".section");

    // Menú hamburguesa
    toggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });

    // Navegación
    links.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            const sectionId = link.getAttribute("data-section");
            sections.forEach(sec => {
                sec.style.display = (sec.id === sectionId) ? "block" : "none";
            });

            menu.classList.remove("active");
        });
    });

    // Toggle cards con comportamiento especial para sección "acerca"
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const section = card.closest("section");
            const sectionId = section ? section.id : null;
            
            if (sectionId === "acerca") {
                // Comportamiento especial para sección "acerca"
                const allCardsInSection = section.querySelectorAll(".card");
                const cardsContainer = section.querySelector(".cards-container");
                
                // Si el card ya está activo, lo desactivamos
                if (card.classList.contains("active")) {
                    card.classList.remove("active");
                    cardsContainer.classList.remove("has-active-card");
                } else {
                    // Desactivar todos los otros cards en la sección
                    allCardsInSection.forEach(c => c.classList.remove("active"));
                    // Activar el card clickeado
                    card.classList.add("active");
                    cardsContainer.classList.add("has-active-card");
                }
            } else {
                // Comportamiento normal para otras secciones
                cards.forEach(c => { if(c !== card) c.classList.remove("active"); });
                card.classList.toggle("active");
            }
        });
    });
});
