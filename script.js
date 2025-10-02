document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const homeLogoLink = document.getElementById('home-link-logo');

    const switchSection = (targetId) => {
        // Ocultar todas las secciones
        contentSections.forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar la sección correcta
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Actualizar el estado activo de los botones
        navLinks.forEach(link => {
            if (link.dataset.target === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.dataset.target;
            switchSection(targetId);
            // Ocultar el menú después de hacer clic en un enlace (en móvil)
            if (window.innerWidth < 768) {
                navLinksContainer.classList.remove('show');
            }
        });
    });

    hamburgerMenu.addEventListener('click', () => {
        navLinksContainer.classList.toggle('show');
    });

    homeLogoLink.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que el enlace recargue la página
        switchSection('home');
    });

    // Mostrar la sección 'home' por defecto al cargar la página
    switchSection('home');

    // Lógica para la sección de Publicaciones
    const togglePublicacionesBtn = document.getElementById('toggle-publicaciones');
    const listaPublicaciones = document.getElementById('lista-publicaciones');
    const openPdfFormBtn = document.getElementById('open-pdf-form');
    const openNewsFormBtn = document.getElementById('open-news-form');
    const pdfUploadForm = document.getElementById('pdf-upload-form');
    const newsUploadForm = document.getElementById('news-upload-form');
    const cancelButtons = document.querySelectorAll('.cancel-btn');

    togglePublicacionesBtn.addEventListener('click', () => {
        const isVisible = listaPublicaciones.style.display === 'block';
        listaPublicaciones.style.display = isVisible ? 'none' : 'block';
    });

    const openForm = (formToShow) => {
        pdfUploadForm.style.display = 'none';
        newsUploadForm.style.display = 'none';
        formToShow.style.display = 'block';
    };

    openPdfFormBtn.addEventListener('click', () => openForm(pdfUploadForm));
    openNewsFormBtn.addEventListener('click', () => openForm(newsUploadForm));

    cancelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            pdfUploadForm.style.display = 'none';
            newsUploadForm.style.display = 'none';
        });
    });

    // Lógica del Carrusel
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const maxSlides = slides.length;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = (i === index) ? 'block' : 'none';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % maxSlides;
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + maxSlides) % maxSlides;
        showSlide(currentSlide);
    }

    if (maxSlides > 0) {
        showSlide(currentSlide); // Mostrar la primera diapositiva
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        // Opcional: Cambio automático de diapositivas
        // setInterval(nextSlide, 5000); // Cambia de slide cada 5 segundos
    }
});
