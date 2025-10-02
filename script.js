document.addEventListener('DOMContentLoaded', () => {
    // --- Card Expand/Collapse Logic ---
    const acercaCardsCol = document.querySelector('.acerca-cards-col');
    const acercaCards = document.querySelectorAll('.acerca-card');

    let expandedCard = null;

    acercaCards.forEach(card => {
        card.addEventListener('click', function () {
            if (card.classList.contains('expand')) {
                // Collapse the expanded card
                acercaCardsCol.classList.remove('expanded');
                acercaCards.forEach(c => c.classList.remove('expand', 'hide', 'moved'));
                return;
            }

            // Expand the clicked card
            acercaCardsCol.classList.add('expanded');
            acercaCards.forEach(c => {
                c.classList.remove('expand', 'hide', 'moved');
                if (c !== card) c.classList.add('hide');
            });
            card.classList.add('expand');

            // Adjust other cards below
            setTimeout(() => {
                acercaCards.forEach(c => {
                    if (c !== card) c.classList.remove('hide');
                    if (c !== card) c.classList.add('moved');
                });
            }, 400);
        });
    });

    // --- Fade-in Animation on Scroll ---
    function handleFadeInOnScroll() {
        const fadeEls = document.querySelectorAll('.fadein-on-scroll');
        const trigger = window.innerHeight * 0.92;

        fadeEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < trigger) {
                el.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', handleFadeInOnScroll);
    setTimeout(handleFadeInOnScroll, 300);

    // --- Navigation Logic ---
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinksContainer = document.getElementById('nav-links-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const homeLogoLink = document.getElementById('home-link-logo');

    const switchSection = (targetId) => {
        contentSections.forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

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
            if (window.innerWidth < 768) {
                navLinksContainer.classList.remove('show');
            }
        });
    });

    hamburgerMenu.addEventListener('click', () => {
        navLinksContainer.classList.toggle('show');
    });

    homeLogoLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchSection('home');
    });

    switchSection('home');

    // --- Mission, Vision, and Values Cards Logic ---
    const mvCards = document.querySelectorAll('.mv-card');

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.mv-card')) {
            mvCards.forEach(card => card.classList.remove('open'));
        }
    });

    mvCards.forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.mv-card-content')) return;

            if (card.classList.contains('open')) {
                card.classList.remove('open');
            } else {
                mvCards.forEach(c => { if (c !== card) c.classList.remove('open'); });
                card.classList.add('open');
            }
        });
    });

    // --- Publications Section Logic ---
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

    // --- Carousel Logic ---
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
        showSlide(currentSlide);
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
    }
});
