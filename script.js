/**
 * =============================================================================
 * MÓDULO 1: INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
 * =============================================================================
 */
document.addEventListener("DOMContentLoaded", () => {
    // Constantes de configuración de bases de datos
    const DB_CONFIG = {
        publicaciones: {
            name: 'PublicacionesMEMI',
            version: 1,
            store: 'publicaciones'
        },
        cursos: {
            name: 'CursosSeminarios',
            version: 1,
            store: 'cursos'
        },
        icpc: {
            name: 'ICPCMEMI',
            version: 1,
            store: 'icpc'
        }
    };

    // Estado global de la aplicación
    const state = {
        db: null,               // BD de publicaciones
        dbCursos: null,         // BD de cursos
        dbICPC: null,           // BD de ICPC
        allCarouselItems: []    // Items del carrusel
    };

    // Inicialización de la aplicación
    initApp();

    /**
     * =============================================================================
     * MÓDULO 2: NAVEGACIÓN Y UI
     * =============================================================================
     */
    
    /**
     * 2.1 Gestión de navegación
     */
    function setupNavigation() {
        const toggle = document.getElementById("nav-toggle");
        const menu = document.getElementById("nav-menu");
        const links = document.querySelectorAll(".nav-link");
        const sections = document.querySelectorAll(".section");
        
        // Toggle del menú móvil
        toggle?.addEventListener("click", () => {
            menu.classList.toggle("active");
        });
        
        // Event listeners para enlaces de navegación
        links.forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                
                // Actualizar enlace activo
                links.forEach(l => l.classList.remove("active"));
                link.classList.add("active");
                
                // Mostrar sección correspondiente
                const sectionId = link.getAttribute("data-section");
                sections.forEach(sec => {
                    sec.style.display = (sec.id === sectionId) ? "block" : "none";
                });
                
                // Cerrar cards en otras secciones
                closeCardsInOtherSections(sectionId);
                
                // Ajustar altura de cards en sección actual
                adjustCardHeightsInCurrentSection(sectionId);
                
                // Cerrar el menú móvil
                menu.classList.remove("active");
            });
        });
    }
    
    /**
     * 2.2 Gestión de cards interactivas
     */
    function setupCards() {
        const cards = document.querySelectorAll(".card");
        
        cards.forEach(card => {
            card.addEventListener("click", () => {
                // Alternar estado activo
                card.classList.toggle("active");
                
                const section = card.closest("section");
                
                // Ajustar altura según la sección
                if (section) {
                    if (section.id === "mvv" || section.id === "contacto") {
                        setTimeout(() => adjustCardHeights(section.id), 0);
                    } else if (section.id === "servicios") {
                        setTimeout(() => adjustServiceCardHeights(), 100);
                    }
                }
            });
        });
    }
    
    /**
     * 2.3 Ajustes de interfaz
     */
    function closeCardsInOtherSections(currentSectionId) {
        const sections = document.querySelectorAll(".section");
        sections.forEach(sec => {
            if (sec.id !== currentSectionId) {
                const activeCards = sec.querySelectorAll(".card.active");
                activeCards.forEach(card => {
                    card.classList.remove("active");
                    card.style.height = "auto";
                });
                
                const cardsContainer = sec.querySelector(".cards-container");
                if (cardsContainer) cardsContainer.classList.remove("has-active-card");
            }
        });
    }
    
    function adjustCardHeightsInCurrentSection(sectionId) {
        const currentSection = document.getElementById(sectionId);
        if (!currentSection) return;
        
        if (sectionId === "servicios") {
            setTimeout(() => adjustServiceCardHeights(), 100);
        } else {
            adjustCardHeights(sectionId);
        }
    }
    
    function adjustCardHeights(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const cards = section.querySelectorAll(".card");
        let maxHeight = 0;
        
        // Medir altura de los cards activos
        cards.forEach(card => {
            if (card.classList.contains("active")) {
                card.style.height = "auto"; // reiniciar para medir correctamente
                const height = card.offsetHeight;
                if (height > maxHeight) maxHeight = height;
            }
        });
        
        // Aplicar altura máxima a todos los cards activos
        cards.forEach(card => {
            if (card.classList.contains("active")) {
                card.style.height = maxHeight + "px";
            } else {
                card.style.height = "auto";
            }
        });
    }
    
    function adjustServiceCardHeights() {
        const section = document.getElementById("servicios");
        if (!section) return;
        
        const cards = section.querySelectorAll(".card");
        let maxActiveHeight = 0;
        let maxClosedHeight = 0;
        
        // Reiniciar alturas para medir correctamente
        cards.forEach(card => {
            card.style.height = "auto";
            card.style.minHeight = "auto";
        });
        
        // Medir altura de cards cerradas
        cards.forEach(card => {
            if (!card.classList.contains("active")) {
                const height = card.offsetHeight;
                if (height > maxClosedHeight) maxClosedHeight = height;
            }
        });
        
        // Medir altura de cards activas
        cards.forEach(card => {
            if (card.classList.contains("active")) {
                const height = card.offsetHeight;
                if (height > maxActiveHeight) maxActiveHeight = height;
            }
        });
        
        // Aplicar alturas uniformes
        cards.forEach(card => {
            if (card.classList.contains("active")) {
                card.style.minHeight = maxActiveHeight + "px";
                card.style.height = maxActiveHeight + "px";
            } else {
                card.style.minHeight = maxClosedHeight + "px";
                card.style.height = maxClosedHeight + "px";
            }
        });
    }

    /**
     * =============================================================================
     * MÓDULO 3: GESTIÓN DE BASES DE DATOS
     * =============================================================================
     */
    
    /**
     * 3.1 Inicialización de bases de datos
     */
    function initDatabase() {
        // Inicializar BD de publicaciones
        const pubRequest = indexedDB.open(DB_CONFIG.publicaciones.name, DB_CONFIG.publicaciones.version);
        
        pubRequest.onerror = event => {
            console.error('Error al abrir la base de datos de publicaciones:', event.target.error);
        };
        
        pubRequest.onsuccess = event => {
            state.db = event.target.result;
            console.log('Base de datos de publicaciones abierta correctamente');
            loadPublicaciones();
        };
        
        pubRequest.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(DB_CONFIG.publicaciones.store)) {
                const objectStore = db.createObjectStore(DB_CONFIG.publicaciones.store, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('titulo', 'titulo', { unique: false });
                objectStore.createIndex('area', 'area', { unique: false });
                objectStore.createIndex('fecha', 'fecha', { unique: false });
            }
        };
        
        // Inicializar BD de cursos
        const cursosRequest = indexedDB.open(DB_CONFIG.cursos.name, DB_CONFIG.cursos.version);
        
        cursosRequest.onerror = event => {
            console.error('Error al abrir la base de datos de Cursos:', event.target.error);
        };
        
        cursosRequest.onsuccess = event => {
            state.dbCursos = event.target.result;
            loadCursos();
        };
        
        cursosRequest.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(DB_CONFIG.cursos.store)) {
                const objectStore = db.createObjectStore(DB_CONFIG.cursos.store, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('titulo', 'titulo', { unique: false });
                objectStore.createIndex('fecha', 'fecha', { unique: false });
                objectStore.createIndex('tipo', 'tipo', { unique: false });
            }
        };
        
        // Inicializar BD de ICPC
        const icpcRequest = indexedDB.open(DB_CONFIG.icpc.name, DB_CONFIG.icpc.version);
        
        icpcRequest.onerror = event => {
            console.error('Error al abrir la base de datos ICPC:', event.target.error);
        };
        
        icpcRequest.onsuccess = event => {
            state.dbICPC = event.target.result;
            loadICPC();
        };
        
        icpcRequest.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(DB_CONFIG.icpc.store)) {
                const objectStore = db.createObjectStore(DB_CONFIG.icpc.store, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('titulo', 'titulo', { unique: false });
                objectStore.createIndex('fecha', 'fecha', { unique: false });
            }
        };
    }

    /**
     * =============================================================================
     * MÓDULO 4: SISTEMA DE PUBLICACIONES
     * =============================================================================
     */
    
    /**
     * 4.1 Configuración del sistema de publicaciones
     */
    function setupPublicaciones() {
        const btnNuevaPublicacion = document.getElementById('btn-nueva-publicacion');
        const formularioModal = document.getElementById('formulario-publicacion');
        const btnCerrarFormulario = document.getElementById('btn-cerrar-formulario');
        const btnCancelar = document.getElementById('btn-cancelar');
        const formPublicacion = document.getElementById('form-publicacion');
        
        btnNuevaPublicacion?.addEventListener('click', () => showFormularioPublicacion());
        btnCerrarFormulario?.addEventListener('click', () => hideFormularioPublicacion());
        btnCancelar?.addEventListener('click', () => hideFormularioPublicacion());
        
        formularioModal?.addEventListener('click', function(e) {
            if (e.target === formularioModal) hideFormularioPublicacion();
        });
        
        formPublicacion?.addEventListener('submit', savePublicacion);
    }
    
    /**
     * 4.2 Funciones para manejo de formulario
     */
    function showFormularioPublicacion() {
        const formularioModal = document.getElementById('formulario-publicacion');
        formularioModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    function hideFormularioPublicacion() {
        const formularioModal = document.getElementById('formulario-publicacion');
        const formPublicacion = document.getElementById('form-publicacion');
        formularioModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        formPublicacion.reset();
    }
    
    /**
     * 4.3 Guardar publicación
     */
    function savePublicacion(e) {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const area = document.getElementById('area').value;
        const archivoInput = document.getElementById('archivo');
        
        if (!titulo || !descripcion || !area || !archivoInput.files[0]) {
            alert('Por favor, complete todos los campos');
            return;
        }
        
        const archivo = archivoInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const publicacion = {
                titulo: titulo,
                descripcion: descripcion,
                area: area,
                archivo: {
                    name: archivo.name,
                    type: archivo.type,
                    size: archivo.size,
                    data: e.target.result
                },
                fecha: new Date().toISOString()
            };
            
            const transaction = state.db.transaction([DB_CONFIG.publicaciones.store], 'readwrite');
            const objectStore = transaction.objectStore(DB_CONFIG.publicaciones.store);
            const request = objectStore.add(publicacion);
            
            request.onsuccess = function() {
                hideFormularioPublicacion();
                loadPublicaciones();
                loadCarousel();
                updatePublicacionesInicio();
                alert('¡Publicación guardada exitosamente!');
            };
            
            request.onerror = function() {
                console.error('Error al guardar la publicación');
                alert('Error al guardar la publicación. Inténtelo de nuevo.');
            };
        };
        
        reader.readAsDataURL(archivo);
    }
    
    /**
     * 4.4 Cargar y mostrar publicaciones
     */
    function loadPublicaciones() {
        if (!state.db) return;
        
        const transaction = state.db.transaction([DB_CONFIG.publicaciones.store], 'readonly');
        const objectStore = transaction.objectStore(DB_CONFIG.publicaciones.store);
        const request = objectStore.getAll();
        
        request.onsuccess = function(event) {
            const publicaciones = event.target.result;
            displayPublicaciones(publicaciones);
            displayPublicacionesInicio(publicaciones);
        };
    }
    
    function displayPublicaciones(publicaciones) {
        const contenedor = document.getElementById('contenedor-publicaciones');
        const mensajeSin = document.getElementById('mensaje-sin-publicaciones');
        
        if (!contenedor) return;
        
        contenedor.innerHTML = '';
        
        if (publicaciones.length === 0) {
            mensajeSin.style.display = 'block';
            return;
        }
        
        mensajeSin.style.display = 'none';
        
        // Ordenar por fecha descendente
        publicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        publicaciones.forEach(pub => {
            const item = createPublicacionElement(pub);
            contenedor.appendChild(item);
        });
    }
    
    /**
     * 4.5 Descargar archivo
     */
    function downloadArchivo(id) {
        const transaction = state.db.transaction([DB_CONFIG.publicaciones.store], 'readonly');
        const objectStore = transaction.objectStore(DB_CONFIG.publicaciones.store);
        const request = objectStore.get(id);
        
        request.onsuccess = function(event) {
            const publicacion = event.target.result;
            if (publicacion) {
                const link = document.createElement('a');
                link.href = publicacion.archivo.data;
                link.download = publicacion.archivo.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
    }

    /**
     * =============================================================================
     * MÓDULO 5: SISTEMA DE CURSOS Y SEMINARIOS
     * =============================================================================
     */
    
    /**
     * 5.1 Configuración del sistema de cursos
     */
    function setupCursos() {
        const btnNuevoCurso = document.getElementById('btn-nuevo-curso');
        const formularioCurso = document.getElementById('formulario-curso');
        const btnCerrarCurso = document.getElementById('btn-cerrar-formulario-curso');
        const btnCancelarCurso = document.getElementById('btn-cancelar-curso');
        const formCurso = document.getElementById('form-curso');
        
        btnNuevoCurso?.addEventListener('click', () => {
            formularioCurso.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
        
        btnCerrarCurso?.addEventListener('click', () => closeFormularioCurso());
        btnCancelarCurso?.addEventListener('click', () => closeFormularioCurso());
        
        formularioCurso?.addEventListener('click', function(e) {
            if (e.target === formularioCurso) closeFormularioCurso();
        });
        
        formCurso?.addEventListener('submit', handleCursoSubmit);
    }
    
    /**
     * 5.2 Funciones para manejo del formulario
     */
    function closeFormularioCurso() {
        const formularioCurso = document.getElementById('formulario-curso');
        const formCurso = document.getElementById('form-curso');
        formularioCurso.style.display = 'none';
        document.body.style.overflow = 'auto';
        formCurso.reset();
    }
    
    function handleCursoSubmit(e) {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo-curso').value.trim();
        const descripcion = document.getElementById('descripcion-curso').value.trim();
        const tipo = document.getElementById('tipo-curso').value;
        const imagen = document.getElementById('imagen-curso').files[0];
        
        if (!titulo || !descripcion || !tipo || !imagen) {
            alert('Completa todos los campos');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(ev) {
            const cursoData = {
                titulo: titulo,
                descripcion: descripcion,
                tipo: tipo,
                imagen: ev.target.result,
                fecha: new Date().toISOString()
            };
            
            saveCurso(cursoData);
        };
        reader.onerror = function() {
            alert('Error al leer la imagen');
        };
        reader.readAsDataURL(imagen);
    }
    
    /**
     * 5.3 Guardar curso
     */
    function saveCurso(curso) {
        const transaction = state.dbCursos.transaction([DB_CONFIG.cursos.store], 'readwrite');
        const objectStore = transaction.objectStore(DB_CONFIG.cursos.store);
        const request = objectStore.add(curso);
        
        request.onsuccess = function() {
            loadCursos();
            loadCarousel();
            updatePublicacionesInicio();
            closeFormularioCurso();
            alert('¡Curso/Seminario guardado exitosamente!');
        };
        
        request.onerror = function() {
            alert('Error al guardar el Curso/Seminario');
        };
    }
    
    /**
     * 5.4 Cargar y mostrar cursos
     */
    function loadCursos() {
        if (!state.dbCursos) return;
        
        const transaction = state.dbCursos.transaction([DB_CONFIG.cursos.store], 'readonly');
        const objectStore = transaction.objectStore(DB_CONFIG.cursos.store);
        const request = objectStore.getAll();
        
        request.onsuccess = function(event) {
            const cursos = event.target.result;
            displayCursos(cursos);
        };
    }
    
    function displayCursos(cursos) {
        const contenedor = document.getElementById('contenedor-cursos');
        const mensajeSin = document.getElementById('mensaje-sin-cursos');
        
        if (!contenedor) return;
        contenedor.innerHTML = '';
        
        if (!cursos.length) {
            if (mensajeSin) mensajeSin.style.display = 'block';
            return;
        }
        if (mensajeSin) mensajeSin.style.display = 'none';
        
        cursos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        cursos.forEach(curso => {
            const elementoCurso = createCursoElement(curso);
            contenedor.appendChild(elementoCurso);
        });
    }
    
    /**
     * 5.5 Crear elemento de curso
     */
    function createCursoElement(curso) {
        const fecha = new Date(curso.fecha).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        
        return createElement('div', { class: 'publicacion-item' }, [
            createElement('div', { class: 'publicacion-header' }, [
                createElement('h3', { class: 'publicacion-titulo' }, [
                    createElement('span', {}, [curso.titulo])
                ]),
                createElement('span', { class: 'publicacion-area' }, [
                    curso.tipo === 'curso' ? 'Curso' : 'Seminario'
                ])
            ]),
            createElement('p', { class: 'publicacion-descripcion' }, [curso.descripcion]),
            createElement('div', { class: 'icpc-imagen-contenedor' }, [
                createElement('img', { 
                    src: curso.imagen, 
                    class: 'icpc-imagen', 
                    alt: curso.titulo 
                })
            ]),
            createElement('div', { class: 'publicacion-footer' }, [
                createElement('span', { class: 'publicacion-fecha' }, [`📅 ${fecha}`]),
                createElement('div', { class: 'publicacion-acciones' }, [
                    createElement('a', { 
                        href: '#', 
                        class: 'btn-descargar',
                        onClick: e => {
                            e.preventDefault();
                            downloadImagenCurso(curso.id);
                        }
                    }, ['📄 Descargar imagen']),
                    createElement('button', {
                        class: 'btn-eliminar',
                        onClick: () => {
                            if (confirm('¿Estás seguro que deseas eliminar este curso?')) {
                                eliminarCurso(curso.id);
                            }
                        }
                    }, ['🗑️ Eliminar'])
                ])
            ])
        ]);
    }
    
    /**
     * 5.6 Eliminar curso
     */
    function eliminarCurso(id) {
        // Verificar que la base de datos esté disponible
        if (!state.dbCursos) {
            console.error('Base de datos de cursos no inicializada');
            return;
        }
        
        // Usar la referencia a la base de datos que ya tenemos en el estado
        const transaction = state.dbCursos.transaction([DB_CONFIG.cursos.store], 'readwrite');
        const cursosStore = transaction.objectStore(DB_CONFIG.cursos.store);
        
        // Eliminar el curso
        const deleteRequest = cursosStore.delete(id);
        
        deleteRequest.onsuccess = function() {
            // Actualizar la lista de cursos
            loadCursos();
            
            // También actualizar la sección de inicio si está visible
            if (document.getElementById('inicio').style.display !== 'none') {
                loadPublicacionesInicio();
            }
        };
        
        deleteRequest.onerror = function() {
            console.error('Error al eliminar el curso');
        };
    }

    /**
     * 5.7 Descargar imagen de curso
     */
    function downloadImagenCurso(id) {
        const transaction = state.dbCursos.transaction([DB_CONFIG.cursos.store], 'readonly');
        const objectStore = transaction.objectStore(DB_CONFIG.cursos.store);
        const request = objectStore.get(id);
        
        request.onsuccess = function(event) {
            const curso = event.target.result;
            if (curso && curso.imagen) {
                const link = document.createElement('a');
                link.href = curso.imagen;
                link.download = `${curso.tipo}_${curso.titulo.replace(/\s+/g, '_')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
    }

    /**
     * =============================================================================
     * MÓDULO 6: SISTEMA ICPC
     * =============================================================================
     */
    
    /**
     * 6.1 Configuración del sistema ICPC
     */
    function setupICPC() {
        const btnNuevaICPC = document.getElementById('btn-nueva-icpc');
        const formularioICPC = document.getElementById('formulario-icpc');
        const btnCerrarICPC = document.getElementById('btn-cerrar-formulario-icpc');
        const btnCancelarICPC = document.getElementById('btn-cancelar-icpc');
        const formICPC = document.getElementById('form-icpc');
        const tipoICPC = document.getElementById('tipo-icpc');
        const grupoArchivoICPC = document.getElementById('grupo-archivo-icpc');
        const grupoUrlICPC = document.getElementById('grupo-url-icpc');
        
        btnNuevaICPC?.addEventListener('click', () => {
            formularioICPC.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
        
        btnCerrarICPC?.addEventListener('click', closeFormularioICPC);
        btnCancelarICPC?.addEventListener('click', closeFormularioICPC);
        
        formularioICPC?.addEventListener('click', function(e) {
            if (e.target === formularioICPC) closeFormularioICPC();
        });
        
        // Cambiar campos según tipo
        tipoICPC?.addEventListener('change', function() {
            if (tipoICPC.value === 'imagen') {
                grupoArchivoICPC.style.display = 'block';
                grupoUrlICPC.style.display = 'none';
            } else if (tipoICPC.value === 'url') {
                grupoArchivoICPC.style.display = 'none';
                grupoUrlICPC.style.display = 'block';
            } else {
                grupoArchivoICPC.style.display = 'none';
                grupoUrlICPC.style.display = 'none';
            }
        });
        
        formICPC?.addEventListener('submit', handleICPCSubmit);
    }
    
    /**
     * 6.2 Funciones para manejo del formulario
     */
    function closeFormularioICPC() {
        const formularioICPC = document.getElementById('formulario-icpc');
        const formICPC = document.getElementById('form-icpc');
        const grupoArchivoICPC = document.getElementById('grupo-archivo-icpc');
        const grupoUrlICPC = document.getElementById('grupo-url-icpc');
        
        formularioICPC.style.display = 'none';
        document.body.style.overflow = 'auto';
        formICPC.reset();
        grupoArchivoICPC.style.display = 'none';
        grupoUrlICPC.style.display = 'none';
    }
    
    function handleICPCSubmit(e) {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo-icpc').value.trim();
        const descripcion = document.getElementById('descripcion-icpc').value.trim();
        const tipo = document.getElementById('tipo-icpc').value;
        
        if (!titulo || !descripcion || !tipo) {
            alert('Completa todos los campos');
            return;
        }
        
        if (tipo === 'imagen') {
            const archivo = document.getElementById('archivo-icpc').files[0];
            if (!archivo) { 
                alert('Selecciona una imagen'); 
                return; 
            }
            
            const reader = new FileReader();
            reader.onload = function(ev) {
                saveICPC({
                    titulo,
                    descripcion,
                    tipo,
                    imagen: ev.target.result,
                    url: null,
                    fecha: new Date().toISOString()
                });
            };
            reader.onerror = function() {
                alert('Error al leer la imagen');
            };
            reader.readAsDataURL(archivo);
            
        } else if (tipo === 'url') {
            const url = document.getElementById('url-icpc').value.trim();
            if (!url) { 
                alert('Ingresa la URL'); 
                return; 
            }
            
            saveICPC({
                titulo,
                descripcion,
                tipo,
                imagen: null,
                url,
                fecha: new Date().toISOString()
            });
        }
    }
    
    /**
     * 6.3 Guardar ICPC
     */
    function saveICPC(icpc) {
        const transaction = state.dbICPC.transaction([DB_CONFIG.icpc.store], 'readwrite');
        const objectStore = transaction.objectStore(DB_CONFIG.icpc.store);
        const request = objectStore.add(icpc);
        
        request.onsuccess = function() {
            loadICPC();
            loadCarousel();
            updatePublicacionesInicio();
            closeFormularioICPC();
            alert('¡ICPC guardado exitosamente!');
        };
        
        request.onerror = function() {
            alert('Error al guardar ICPC');
        };
    }
    
    /**
     * 6.4 Cargar y mostrar ICPC
     */
    function loadICPC() {
        if (!state.dbICPC) return;
        
        const transaction = state.dbICPC.transaction([DB_CONFIG.icpc.store], 'readonly');
        const objectStore = transaction.objectStore(DB_CONFIG.icpc.store);
        const request = objectStore.getAll();
        
        request.onsuccess = function(event) {
            const icpcs = event.target.result;
            displayICPC(icpcs);
        };
    }
    
    function displayICPC(icpcs) {
        const contenedor = document.getElementById('contenedor-icpc');
        const mensajeSin = document.getElementById('mensaje-sin-icpc-inicio');
        
        if (!contenedor) return;
        contenedor.innerHTML = '';
        
        if (!icpcs.length) {
            if (mensajeSin) mensajeSin.style.display = 'block';
            contenedor.appendChild(createElement('p', {}, ['No hay publicaciones ICPC aún.']));
            return;
        }
        
        if (mensajeSin) mensajeSin.style.display = 'none';
        
        icpcs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        icpcs.forEach(icpc => {
            const elementoICPC = createICPCElement(icpc);
            contenedor.appendChild(elementoICPC);
        });
    }
    
    /**
     * 6.5 Crear elemento ICPC
     */
    function createICPCElement(icpc, esInicio = false) {
        const div = createElement('div', { class: 'publicacion-item' }, [
            createElement('div', { class: 'publicacion-header' }, [
                createElement('h3', { class: 'publicacion-titulo' }, [
                    createElement('span', {}, [icpc.titulo])
                ])
            ]),
            createElement('p', { class: 'publicacion-descripcion' }, [icpc.descripcion])
        ]);
        
        // Añadir imagen si es tipo imagen
        if (icpc.tipo === 'imagen') {
            div.appendChild(
                createElement('div', { class: 'icpc-imagen-contenedor' }, [
                    createElement('img', { 
                        src: icpc.imagen, 
                        class: 'icpc-imagen', 
                        alt: icpc.titulo 
                    })
                ])
            );
        }
        
        // Añadir preview de URL si es tipo url
        if (icpc.tipo === 'url') {
            div.appendChild(
                createElement('div', { class: 'url-preview' }, [
                    createElement('div', { class: 'url-preview-header' }, [
                        createElement('span', { class: 'url-icon' }, ['🔗']),
                        createElement('span', { class: 'url-domain' }, [
                            new URL(icpc.url).hostname
                        ])
                    ]),
                    createElement('a', { 
                        href: icpc.url, 
                        target: '_blank', 
                        class: 'url-link' 
                    }, [icpc.url]),
                    createElement('div', { class: 'url-preview-footer' }, [
                        createElement('button', { 
                            class: 'url-preview-button',
                            onClick: () => window.open(icpc.url, '_blank')
                        }, ['Visitar enlace'])
                    ])
                ])
            );
        }
        
        // Añadir footer con fecha y botón de descarga para imágenes
        const footer = createElement('div', { class: 'publicacion-footer' }, [
            createElement('span', { class: 'publicacion-fecha' }, [
                new Date(icpc.fecha).toLocaleDateString('es-ES')
            ])
        ]);
        
        // Crear contenedor de acciones
        const accionesDiv = createElement('div', { class: 'publicacion-acciones' });
        
        // Añadir botón de descarga si es imagen
        if (icpc.tipo === 'imagen') {
            accionesDiv.appendChild(
                createElement('a', { 
                    href: '#', 
                    class: 'btn-descargar',
                    onClick: e => {
                        e.preventDefault();
                        downloadImagenICPC(icpc.id);
                    }
                }, ['📄 Descargar imagen'])
            );
        }
        
        // Añadir botón de eliminar para todos los tipos, excepto en inicio
        if (!esInicio) {
            accionesDiv.appendChild(
                createElement('button', {
                    class: 'btn-eliminar',
                    onClick: () => {
                        if (confirm('¿Estás seguro que deseas eliminar esta publicación ICPC?')) {
                            eliminarICPC(icpc.id);
                        }
                    }
                }, ['🗑️ Eliminar'])
            );
        }
        
        footer.appendChild(accionesDiv);
        
        div.appendChild(footer);
        return div;
    }
    
    /**
     * 6.6 Eliminar ICPC
     */
    function eliminarICPC(id) {
        if (!state.dbICPC) return;
        
        const transaction = state.dbICPC.transaction([DB_CONFIG.icpc.store], 'readwrite');
        const objectStore = transaction.objectStore(DB_CONFIG.icpc.store);
        
        const request = objectStore.delete(id);
        
        request.onsuccess = function() {
            // Recargar la lista de ICPC
            loadICPC();
            
            // También actualizar la sección de inicio si está visible
            if (document.getElementById('inicio').style.display !== 'none') {
                loadPublicacionesInicio();
            }
        };
        
        request.onerror = function() {
            console.error("Error al eliminar la publicación ICPC");
        };
    }
    
    /**
     * 6.7 Descargar imagen ICPC
     */
    function downloadImagenICPC(id) {
        const transaction = state.dbICPC.transaction([DB_CONFIG.icpc.store], 'readonly');
        const objectStore = transaction.objectStore(DB_CONFIG.icpc.store);
        const request = objectStore.get(id);
        
        request.onsuccess = function(event) {
            const icpc = event.target.result;
            if (icpc && icpc.tipo === 'imagen' && icpc.imagen) {
                const link = document.createElement('a');
                link.href = icpc.imagen;
                link.download = `icpc_${icpc.titulo.replace(/\s+/g, '_')}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };
    }

    /**
     * =============================================================================
     * MÓDULO 7: SISTEMA DE CARRUSEL
     * =============================================================================
     */
    
    /**
     * 7.1 Módulo Carrusel
     */
    const Carousel = (() => {
        let currentIndex = 0;
        let intervalId;
        let itemsData = [];
        
        function initCarousel(containerId, items) {
            const container = document.getElementById(containerId);
            if (!container || !items.length) {
                if (container) container.innerHTML = '<p>No hay imágenes para mostrar.</p>';
                return;
            }
            
            itemsData = items;
            
            const carouselWrapper = createElement('div', { class: 'carousel-wrapper' });
            const carouselInner = createElement('div', { class: 'carousel-inner' });
            const indicators = createElement('div', { class: 'carousel-indicators' });
            
            // Crear slides
            items.forEach((item, index) => {
                const slide = createElement('div', {
                    class: `carousel-item ${index === 0 ? 'active' : ''}`
                }, [
                    createElement('img', { 
                        src: item.src, 
                        alt: item.alt, 
                        class: 'carousel-img' 
                    }),
                    createElement('div', { class: 'carousel-title' }, [
                        createElement('a', { href: item.link }, [
                            createElement('div', { class: 'title-content' }, [
                                createElement('span', {}, [item.titulo]),
                                createElement('span', { class: `tag ${item.tagClass}` }, [item.tag])
                            ])
                        ])
                    ])
                ]);
                
                carouselInner.appendChild(slide);
                
                // Crear indicador
                const indicator = createElement('button', {
                    class: `carousel-indicator ${index === 0 ? 'active' : ''}`,
                    onClick: () => goToSlide(index)
                });
                indicators.appendChild(indicator);
            });
            
            // Crear controles
            const prevButton = createElement('button', {
                class: 'carousel-control-prev',
                onClick: prevSlide
            }, ['❮']);
            
            const nextButton = createElement('button', {
                class: 'carousel-control-next',
                onClick: nextSlide
            }, ['❯']);
            
            // Ensamblar carrusel
            carouselWrapper.appendChild(carouselInner);
            carouselWrapper.appendChild(indicators);
            carouselWrapper.appendChild(prevButton);
            carouselWrapper.appendChild(nextButton);
            
            container.innerHTML = '';
            container.appendChild(carouselWrapper);
            
            startAutoSlide();
        }
        
        function startAutoSlide() {
            stopAutoSlide();
            intervalId = setInterval(nextSlide, 5000);
        }
        
        function stopAutoSlide() {
            if (intervalId) clearInterval(intervalId);
        }
        
        function goToSlide(index) {
            if (!itemsData.length) return;
            
            const slides = document.querySelectorAll('.carousel-item');
            const indicators = document.querySelectorAll('.carousel-indicator');
            
            if (slides[currentIndex]) slides[currentIndex].classList.remove('active');
            if (indicators[currentIndex]) indicators[currentIndex].classList.remove('active');
            
            currentIndex = index;
            
            if (slides[currentIndex]) slides[currentIndex].classList.add('active');
            if (indicators[currentIndex]) indicators[currentIndex].classList.add('active');
        }
        
        function nextSlide() {
            if (!itemsData.length) return;
            goToSlide((currentIndex + 1) % itemsData.length);
        }
        
        function prevSlide() {
            if (!itemsData.length) return;
            goToSlide((currentIndex - 1 + itemsData.length) % itemsData.length);
        }
        
        return { initCarousel };
    })();
    
    /**
     * 7.2 Carga de carrusel
     */
    function loadCarousel() {
        const carrusel = document.getElementById('carrusel-imagenes');
        if (!carrusel) return;
        
        Promise.all([
            // Obtener publicaciones con imágenes
            new Promise(resolve => {
                if (!state.db) return resolve([]);
                
                const tx = state.db.transaction([DB_CONFIG.publicaciones.store], 'readonly');
                tx.objectStore(DB_CONFIG.publicaciones.store).getAll().onsuccess = e => {
                    const publicaciones = e.target.result.filter(p => 
                        p.archivo && p.archivo.type.startsWith('image/')
                    );
                    
                    resolve(publicaciones.map(p => ({
                        tipo: 'publicacion',
                        data: p,
                        fecha: new Date(p.fecha),
                        src: p.archivo.data,
                        titulo: p.titulo,
                        tag: '#PUBLICACION',
                        link: '#publicaciones',
                        id: p.id
                    })));
                };
            }),
            
            // Obtener ICPC con imágenes
            new Promise(resolve => {
                if (!state.dbICPC) return resolve([]);
                
                const tx = state.dbICPC.transaction([DB_CONFIG.icpc.store], 'readonly');
                tx.objectStore(DB_CONFIG.icpc.store).getAll().onsuccess = e => {
                    const icpcs = e.target.result.filter(i => 
                        i.tipo === 'imagen' && i.imagen
                    );
                    
                    resolve(icpcs.map(i => ({
                        tipo: 'icpc',
                        data: i,
                        fecha: new Date(i.fecha),
                        src: i.imagen,
                        titulo: i.titulo,
                        tag: '#ICPC',
                        link: '#icpc',
                        id: i.id
                    })));
                };
            }),
            
            // Obtener cursos
            new Promise(resolve => {
                if (!state.dbCursos) return resolve([]);
                
                const tx = state.dbCursos.transaction([DB_CONFIG.cursos.store], 'readonly');
                tx.objectStore(DB_CONFIG.cursos.store).getAll().onsuccess = e => {
                    const cursos = e.target.result;
                    
                    resolve(cursos.map(c => ({
                        tipo: 'curso',
                        data: c,
                        fecha: new Date(c.fecha),
                        src: c.imagen,
                        titulo: c.titulo,
                        tag: `#${c.tipo.toUpperCase()}`,
                        link: '#cursos',
                        id: c.id
                    })));
                };
            })
        ]).then(([pubItems, icpcItems, cursoItems]) => {
            // Guardar todos los items para uso posterior
            state.allCarouselItems = [...pubItems, ...icpcItems, ...cursoItems];
            
            // Ordenar por fecha descendente
            state.allCarouselItems.sort((a, b) => b.fecha - a.fecha);
            
            // Obtener los 5 más recientes para mostrar en el carrusel
            const carouselItems = state.allCarouselItems.slice(0, 5);
            
            renderCarousel(carouselItems);
        });
    }
    
    /**
     * 7.3 Renderizar carrusel
     */
    function renderCarousel(items) {
        const carrusel = document.getElementById('carrusel-imagenes');
        if (!carrusel) return;
        
        if (!items.length) {
            carrusel.innerHTML = '<p>No hay imágenes para mostrar.</p>';
            return;
        }
        
        const carouselData = items.map(item => {
            let tagClass = 'tag-publicacion';
            
            if (item.tipo === 'icpc') {
                tagClass = 'tag-icpc';
            } else if (item.tipo === 'curso') {
                tagClass = item.tag === '#CURSO' ? 'tag-curso' : 'tag-seminario';
            }
            
            return {
                src: item.src,
                alt: item.titulo,
                titulo: item.titulo,
                tag: item.tag,
                tagClass: tagClass,
                link: item.link
            };
        });
        
        Carousel.initCarousel('carrusel-imagenes', carouselData);
    }

    /**
     * =============================================================================
     * MÓDULO 8: FUNCIONES DE UTILIDAD
     * =============================================================================
     */
    
    /**
     * 8.1 Actualizar publicaciones en inicio
     */
    function updatePublicacionesInicio() {
        Promise.all([
            // Obtener publicaciones
            new Promise(resolve => {
                if (!state.db) return resolve([]);
                
                const txPub = state.db.transaction([DB_CONFIG.publicaciones.store], 'readonly');
                txPub.objectStore(DB_CONFIG.publicaciones.store).getAll().onsuccess = function(event) {
                    resolve(event.target.result);
                };
            }),
            
            // Obtener ICPC
            new Promise(resolve => {
                if (!state.dbICPC) return resolve([]);
                
                const txICPC = state.dbICPC.transaction([DB_CONFIG.icpc.store], 'readonly');
                txICPC.objectStore(DB_CONFIG.icpc.store).getAll().onsuccess = function(event) {
                    resolve(event.target.result);
                };
            }),
            
            // Obtener cursos
            new Promise(resolve => {
                if (!state.dbCursos) return resolve([]);
                
                const txCursos = state.dbCursos.transaction([DB_CONFIG.cursos.store], 'readonly');
                txCursos.objectStore(DB_CONFIG.cursos.store).getAll().onsuccess = function(event) {
                    resolve(event.target.result);
                };
            })
        ]).then(([publicaciones, icpcs, cursos]) => {
            // Combinar todas las publicaciones
            let todasPublicaciones = [...publicaciones];
            
            // Agregar ICPC como publicaciones
            icpcs.forEach(icpc => {
                todasPublicaciones.push({
                    id: icpc.id,
                    titulo: icpc.titulo,
                    descripcion: icpc.descripcion,
                    area: 'icpc',
                    fecha: icpc.fecha,
                    archivo: icpc.tipo === 'imagen' ? { data: icpc.imagen, type: 'image/png', name: icpc.titulo } : null,
                    url: icpc.tipo === 'url' ? icpc.url : null,
                    tipo: icpc.tipo,
                    imagen: icpc.tipo === 'imagen' ? icpc.imagen : null
                });
            });
            
            // Agregar cursos como publicaciones
            cursos.forEach(curso => {
                todasPublicaciones.push({
                    id: curso.id,
                    titulo: curso.titulo,
                    descripcion: curso.descripcion,
                    area: curso.tipo,
                    fecha: curso.fecha,
                    archivo: null,
                    url: null,
                    tipo: 'imagen',
                    imagen: curso.imagen
                });
            });
            
            displayPublicacionesInicio(todasPublicaciones);
            displayICPCInicio(icpcs);
        });
    }
    
    /**
     * 8.2 Mostrar publicaciones en inicio
     */
    function displayPublicacionesInicio(publicaciones) {
        const contenedor = document.getElementById('publicaciones-recientes');
        const mensajeSin = document.getElementById('mensaje-sin-publicaciones-inicio');
        
        if (!contenedor) return;
        contenedor.innerHTML = '';
        
        // Crear un set con los IDs de elementos ya en el carrusel
        const idsEnCarrusel = new Set();
        if (state.allCarouselItems && state.allCarouselItems.length > 0) {
            state.allCarouselItems.slice(0, 5).forEach(item => {
                idsEnCarrusel.add(`${item.tipo}-${item.id}`);
            });
        }
        
        // Usar directamente las publicaciones que ya incluyen ICPC y cursos
        // Esto evita la duplicación de elementos
        const todas = [...publicaciones];
        
        if (todas.length === 0) {
            mensajeSin.style.display = 'block';
            return;
        }
        
        mensajeSin.style.display = 'none';
        
        // Filtrar y ordenar
        const filtradas = todas
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .filter(pub => {
                const tipoOrigen = pub.tipoOrigen || 'publicacion';
                return !idsEnCarrusel.has(`${tipoOrigen}-${pub.id}`);
            });
        
        if (filtradas.length === 0) {
            contenedor.appendChild(createElement('p', {}, [
                'Todas las publicaciones recientes están en el carrusel.'
            ]));
            return;
        }
        
        // Mostrar las 10 más recientes
        filtradas.slice(0, 10).forEach(pub => {
            const item = createPublicacionElement(pub, true);
            contenedor.appendChild(item);
        });
    }
    
    /**
     * 8.3 Mostrar ICPC en inicio
     */
    function displayICPCInicio(icpcs) {
        console.log("ICPC para inicio: " + icpcs.length);
    }
    
    /**
     * 8.4 Crear elemento de publicación
     */
    function createPublicacionElement(publicacion, esResumen = false) {
        // Formatear fecha
        const fecha = new Date(publicacion.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Determinar área y texto
        let areaTexto = '';
        if (publicacion.area === 'icpc') {
            areaTexto = 'ICPC';
        } else if (publicacion.area === 'curso') {
            areaTexto = 'Curso';
        } else if (publicacion.area === 'seminario') {
            areaTexto = 'Seminario';
        } else {
            areaTexto = publicacion.area === 'informatica' ? 'Informática' : 'Matemáticas';
        }
        
        // Acortar descripción para resúmenes
        const descripcionMostrar = esResumen && publicacion.descripcion.length > 100 
            ? publicacion.descripcion.substring(0, 100) + '...' 
            : publicacion.descripcion;
        
        // Determinar tipo de tag
        let tag = '#PUBLICACION';
        let tagClass = 'tag-publicacion';
        
        if (publicacion.area === 'curso') {
            tag = '#CURSO';
            tagClass = 'tag-curso';
        } else if (publicacion.area === 'seminario') {
            tag = '#SEMINARIO';
            tagClass = 'tag-seminario';
        } else if (publicacion.area === 'icpc') {
            tag = '#ICPC';
            tagClass = 'tag-icpc';
        }
        
        // Crear elemento de publicación
        const div = createElement('div', { class: 'publicacion-item' });
        
        // Crear encabezado
        const header = createElement('div', { class: 'publicacion-header' });
        const titulo = createElement('h3', { class: 'publicacion-titulo' });
        
        // Formato diferente para resúmenes
        if (esResumen) {
            titulo.style.display = 'flex';
            titulo.style.justifyContent = 'space-between';
            titulo.style.alignItems = 'center';
            
            const tituloSpan = createElement('span', {}, [publicacion.titulo]);
            const tagSpan = createElement('span', { class: `tag ${tagClass}` }, [tag]);
            
            titulo.appendChild(tituloSpan);
            titulo.appendChild(tagSpan);
        } else {
            const tituloSpan = createElement('span', {}, [publicacion.titulo]);
            titulo.appendChild(tituloSpan);
            
            const area = createElement('span', { class: 'publicacion-area' }, [areaTexto]);
            header.appendChild(area);
        }
        
        header.appendChild(titulo);
        
        // Crear descripción
        const descripcion = createElement('p', { class: 'publicacion-descripcion' }, [descripcionMostrar]);
        
        div.appendChild(header);
        div.appendChild(descripcion);
        
        // Añadir contenido específico según tipo
        if (publicacion.area === 'icpc') {
            if (publicacion.tipo === 'imagen' && publicacion.imagen) {
                div.appendChild(
                    createElement('div', { class: 'icpc-imagen-contenedor' }, [
                        createElement('img', { 
                            src: publicacion.imagen, 
                            class: 'icpc-imagen-mini', 
                            alt: publicacion.titulo 
                        })
                    ])
                );
            } else if (publicacion.tipo === 'url' && publicacion.url) {
                div.appendChild(
                    createElement('div', { class: 'url-preview-mini' }, [
                        createElement('a', { 
                            href: publicacion.url, 
                            target: '_blank' 
                        }, [new URL(publicacion.url).hostname])
                    ])
                );
            }
        }
        
        if ((publicacion.area === 'curso' || publicacion.area === 'seminario') && publicacion.imagen) {
            div.appendChild(
                createElement('div', { class: 'icpc-imagen-contenedor' }, [
                    createElement('img', { 
                        src: publicacion.imagen, 
                        class: 'icpc-imagen-mini', 
                        alt: publicacion.titulo 
                    })
                ])
            );
        }
        
        // Crear footer
        const footer = createElement('div', { class: 'publicacion-footer' });
        
        const fechaSpan = createElement('span', { class: 'publicacion-fecha' }, [`📅 ${fecha}`]);
        footer.appendChild(fechaSpan);
        
        // Contenedor de acciones
        const accionesDiv = createElement('div', { class: 'publicacion-acciones' });
        
        // Botón de descarga según tipo
        if (publicacion.area === 'icpc' && publicacion.tipo === 'imagen') {
            accionesDiv.appendChild(
                createElement('a', { 
                    href: '#', 
                    class: 'btn-descargar',
                    onClick: e => {
                        e.preventDefault();
                        downloadImagenICPC(publicacion.id);
                    }
                }, ['📄 Descargar imagen'])
            );
        } else if ((publicacion.area === 'curso' || publicacion.area === 'seminario') && publicacion.imagen) {
            accionesDiv.appendChild(
                createElement('a', { 
                    href: '#', 
                    class: 'btn-descargar',
                    onClick: e => {
                        e.preventDefault();
                        downloadImagenCurso(publicacion.id);
                    }
                }, ['📄 Descargar imagen'])
            );
        } else if (publicacion.archivo) {
            accionesDiv.appendChild(
                createElement('a', { 
                    href: '#', 
                    class: 'btn-descargar',
                    onClick: e => {
                        e.preventDefault();
                        downloadArchivo(publicacion.id);
                    }
                }, ['📄 Descargar'])
            );
        }
        
        // Botón de eliminar para todas las publicaciones, excepto en la sección de inicio (esResumen)
        if (!esResumen) {
            accionesDiv.appendChild(
                createElement('button', {
                    class: 'btn-eliminar',
                    onClick: () => {
                        if (confirm('¿Estás seguro que deseas eliminar esta publicación?')) {
                            eliminarPublicacion(publicacion.id);
                        }
                    }
                }, ['🗑️ Eliminar'])
            );
        }
        
        footer.appendChild(accionesDiv);
        
        div.appendChild(footer);
        return div;
    }
    
    /**
     * 8.5 Eliminar publicación
     */
    function eliminarPublicacion(id) {
        // Verificar que la base de datos esté disponible
        if (!state.db) {
            console.error('Base de datos de publicaciones no inicializada');
            return;
        }
        
        // Usar la referencia a la base de datos que ya tenemos en el estado
        const transaction = state.db.transaction([DB_CONFIG.publicaciones.store], 'readwrite');
        const objectStore = transaction.objectStore(DB_CONFIG.publicaciones.store);
        
        const deleteRequest = objectStore.delete(id);
        
        deleteRequest.onsuccess = function() {
            // Actualizar la lista de publicaciones
            loadPublicaciones();
            
            // También actualizar la sección de inicio si está visible
            if (document.getElementById('inicio').style.display !== 'none') {
                loadPublicacionesInicio();
            }
        };
        
        deleteRequest.onerror = function() {
            console.error("Error al eliminar la publicación");
        };
    }

    /**
     * 8.6 Función auxiliar para crear elementos HTML
     */
    function createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Aplicar atributos
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('on')) {
                // Manejar eventos (onClick, etc)
                element.addEventListener(key.substring(2).toLowerCase(), value);
            } else if (key === 'style' && typeof value === 'object') {
                // Manejar objeto de estilos
                Object.entries(value).forEach(([prop, val]) => {
                    element.style[prop] = val;
                });
            } else {
                // Atributos regulares
                element.setAttribute(key, value);
            }
        });
        
        // Añadir hijos
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    /**
     * =============================================================================
     * MÓDULO 9: INICIALIZACIÓN DE LA APLICACIÓN
     * =============================================================================
     */
    
    function initApp() {
        // Inicializar bases de datos
        initDatabase();
        
        // Configurar interfaces de usuario
        setupNavigation();
        setupCards();
        setupPublicaciones();
        setupCursos();
        setupICPC();
        
        // Cargar datos con un pequeño retraso para asegurar que las BD estén listas
        setTimeout(() => {
            loadCarousel();
            if (state.dbCursos) loadCursos();
            if (state.dbICPC) loadICPC();
            updatePublicacionesInicio();
        }, 300);
    }
});
