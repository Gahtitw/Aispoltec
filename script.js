/* ==========================================================================
   AISPOLTEC — Controlador de Comportamiento Dinámico
   Autor: Juan Diego Zapata Pacheco
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. PRECARGADOR CON BARRA DE PROGRESO
    //    Precarga las imágenes del carrusel en la caché del navegador antes de
    //    revelar la página, evitando parpadeos al inicio del carrusel CSS.
    // ==========================================================================

    /* Imágenes críticas que deben estar en caché antes de que aparezca el sitio */
    const rutasCriticas = [
        'assets/images/Trabajo1.png',
        'assets/images/Trabajo2.png',
        'assets/images/Trabajo3.png',
        'assets/images/Trabajo4.png',
        'assets/images/Trabajo6.png',
        'assets/images/Trabajo7.png'
    ];

    const preloader    = document.getElementById('preloader');
    let imagenesCargadas = 0;

    /* Se ejecuta cuando cada imagen termina de cargar (onload) o falla (onerror) */
    const verificarFinDeCarga = () => {
        imagenesCargadas++;
        if (imagenesCargadas >= rutasCriticas.length) {
            /* Pequeño delay para que la barra de progreso del CSS complete su animación visualmente */
            setTimeout(() => {
                if (preloader) {
                    preloader.classList.add('preloader-hidden'); /* El CSS aplica fade-out */
                }
            }, 400);
        }
    };

    /* Descarga silenciosa de cada imagen en la memoria del navegador */
    rutasCriticas.forEach(ruta => {
        const imgTemp = new Image();
        imgTemp.src    = ruta;
        imgTemp.onload = verificarFinDeCarga; /* Imagen disponible */
        imgTemp.onerror= verificarFinDeCarga; /* Imagen no encontrada — igual continúa */
    });

    /* Failsafe: si el precargador no desaparece en 4 segundos, lo ocultamos igual */
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('preloader-hidden')) {
            preloader.classList.add('preloader-hidden');
        }
    }, 4000);


    // ==========================================================================
    // 2. ESTADO DEL NAVBAR AL SCROLLEAR (COMPACTACIÓN)
    //    Agrega la clase CSS .navbar-scrolled cuando el usuario baja más de 50px,
    //    lo que activa el padding reducido y la sombra más intensa via CSS.
    // ==========================================================================

    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        /* Si el desplazamiento vertical supera 50px, el header se compacta */
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        /* También controlamos la visibilidad del botón "Scroll al Inicio" */
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (scrollTopBtn) {
            if (window.scrollY > 600) {
                scrollTopBtn.classList.add('scroll-top-visible');
            } else {
                scrollTopBtn.classList.remove('scroll-top-visible');
            }
        }
    }, { passive: true }); /* passive:true optimiza el rendimiento del scroll en móviles */


    // ==========================================================================
    // 3. BOTÓN DE SCROLL AL INICIO
    //    Al hacer clic lleva al usuario suavemente al principio de la página.
    // ==========================================================================

    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ==========================================================================
    // 4. CIERRE DEL MENÚ MÓVIL + OVERLAY DE FONDO
    //    El menú hamburguesa usa el "Checkbox Hack" (CSS puro).
    //    El overlay (#menuOverlayBg) es un div independiente con z-index:999,
    //    por debajo del nav-menu (1000) y del botón X (1100). Así solo oscurece
    //    el contenido de la página y no el propio panel del menú.
    // ==========================================================================

    const menuCheckbox   = document.getElementById('menu-toggle');
    const navLinks       = document.querySelectorAll('.nav-link, .nav-btn-contacto');
    const menuOverlayBg  = document.getElementById('menuOverlayBg');

    /* Abre/cierra el overlay cuando el checkbox cambia de estado */
    if (menuCheckbox && menuOverlayBg) {
        menuCheckbox.addEventListener('change', () => {
            menuOverlayBg.classList.toggle('overlay-active', menuCheckbox.checked);
        });
        /* Clic en el overlay oscuro → cierra el menú */
        menuOverlayBg.addEventListener('click', () => {
            menuCheckbox.checked = false;
            menuOverlayBg.classList.remove('overlay-active');
        });
    }

    /* Al hacer clic en un nav-link: cierra el menú Y oculta el overlay */
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuCheckbox) menuCheckbox.checked = false;
            if (menuOverlayBg) menuOverlayBg.classList.remove('overlay-active');
        });
    });


    // ==========================================================================
    // 5. SCROLL SPY — ILUMINA EL ENLACE DEL MENÚ DE LA SECCIÓN VISIBLE
    //    Usa IntersectionObserver para detectar qué sección está en pantalla
    //    y añadir la clase .active al enlace correspondiente del menú.
    // ==========================================================================

    const sections = document.querySelectorAll('section[id]');

    /* rootMargin recorta el área de detección: entra al 25% desde arriba y sale al 30% desde abajo */
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                /* Quita .active de todos los enlaces y se lo pone al que coincide con la sección */
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        root: null,
        rootMargin: '-25% 0px -70% 0px',
        threshold: 0
    });

    /* Activa la vigilancia del observador en cada sección que tenga id */
    sections.forEach(section => scrollSpyObserver.observe(section));


    // ==========================================================================
    // 6. DESPLAZAMIENTO SUAVE CON OFFSET POR LA NAVBAR FIJA
    //    Al hacer clic en un enlace del menú, compensa la altura del header
    //    para que el título de la sección no quede tapado por la barra fija.
    // ==========================================================================

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    /* Pequeño delay (100ms) para que el panel del menú móvil empiece
                       a cerrarse (transición CSS de 0.4s) antes de hacer el scroll.
                       Sin este delay, el scroll ocurre mientras el menú aún está abierto
                       y el usuario no percibe el desplazamiento. */
                    setTimeout(() => {
                        const navbarHeight   = navbar.offsetHeight;
                        /* getBoundingClientRect + pageYOffset: más fiable que offsetTop
                           en todos los navegadores móviles */
                        const targetPosition = targetSection.getBoundingClientRect().top
                                             + window.pageYOffset
                                             - navbarHeight - 8;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }, 100);
                }
            }
        });
    });


    // ==========================================================================
    // 7. ANIMACIONES DE REVELADO AL HACER SCROLL (SCROLL REVEAL)
    //    Usa IntersectionObserver para animar los elementos al entrar en pantalla.
    //    Respeta prefers-reduced-motion: si el usuario prefiere sin movimiento,
    //    los elementos son visibles desde el inicio sin ninguna animación.
    // ==========================================================================

    /* Curva ease-out-quint: desaceleración natural sin bounce ni elastic */
    const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

    /* Respetar prefers-reduced-motion: si el usuario lo solicitó, no animar nada */
    const prefieresMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- Observer principal: secciones de texto, servicios, resultados, proceso ---- */
    /* .gallery-item y .faq-item se manejan con su propio observer (ver abajo) para        */
    /* evitar que hereden el delay acumulado de todos los elementos anteriores              */
    const elementosAnimados = document.querySelectorAll(
        '.service-card, .stat-card, .about-content-side, .about-image-card, ' +
        '.result-card, .commitment-card, .contact-info-side, .contact-form-side, ' +
        '.cert-item, .process-step-card, .testimonial-card'
    );

    if (!prefieresMovimientoReducido) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity   = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -20px 0px'
        });

        elementosAnimados.forEach((elemento, index) => {
            elemento.style.opacity    = '0';
            elemento.style.transform  = 'translateY(20px)';
            elemento.style.transition = `opacity 0.5s ${EASE_OUT} ${index * 0.012}s, transform 0.5s ${EASE_OUT} ${index * 0.012}s`;
            revealObserver.observe(elemento);
        });
    }

    /* ---- Observer rápido: galería y FAQ con índice reseteado ---- */
    /* El problema anterior: estos elementos heredaban índices 17-37 del querySelectorAll    */
    /* global, acumulando hasta 0.4s de delay solo por el stagger, antes de la transición.  */
    /* Solución: observer propio con índice que arranca desde 0 y rootMargin positivo        */
    /* (dispara incluso antes de que el elemento entre al viewport completamente).           */
    const elementosPesados = document.querySelectorAll('.gallery-item, .faq-item');

    if (!prefieresMovimientoReducido) {
        const revealObserverRapido = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity   = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,                           /* Dispara al primer píxel visible */
            rootMargin: '60px 0px 60px 0px'        /* Preanima incluso antes de entrar al viewport */
        });

        elementosPesados.forEach((elemento, index) => {
            elemento.style.opacity    = '0';
            elemento.style.transform  = 'translateY(16px)';
            /* Stagger máximo: 17 × 0.018s ≈ 0.3s — significativamente más rápido que antes */
            elemento.style.transition = `opacity 0.4s ${EASE_OUT} ${index * 0.018}s, transform 0.4s ${EASE_OUT} ${index * 0.018}s`;
            revealObserverRapido.observe(elemento);
        });
    }


    // ==========================================================================
    // 8. CONTADOR ANIMADO DE ESTADÍSTICAS
    //    Al entrar en pantalla, los números suben desde 0 hasta su valor final
    //    en 2 segundos, preservando los símbolos + y % del texto original.
    // ==========================================================================

    const contadores = document.querySelectorAll('.stat-number');

    const animarContador = (entry, observer) => {
        if (!entry.isIntersecting) return;

        const elemento      = entry.target;
        const textoOriginal = elemento.textContent; /* Ej: "1000+", "98%", "100%" */

        /* Si el usuario prefiere movimiento reducido, mostrar el valor final directamente */
        if (prefieresMovimientoReducido) {
            elemento.textContent = textoOriginal;
            observer.unobserve(elemento);
            return;
        }

        const valorMeta = parseInt(textoOriginal.replace(/[^0-9]/g, ''), 10);

        /* Si el texto no contiene un número (ej: "Cientos", "Todo"), mostrar directo sin animar */
        if (isNaN(valorMeta) || valorMeta === 0) {
            observer.unobserve(elemento);
            return;
        }

        const duracion      = 2200;  /* Duración total de la animación en ms */
        const fps           = 60;
        const incremento    = valorMeta / (duracion / (1000 / fps)); /* Incremento por frame */
        let valorActual     = 0;

        /* Detecta el sufijo del número (+, %, o nada) para reinyectarlo en cada frame */
        const sufijo = textoOriginal.includes('+') ? '+' : textoOriginal.includes('%') ? '%' : '';

        const actualizarFrame = () => {
            valorActual += incremento;
            if (valorActual >= valorMeta) {
                elemento.textContent = textoOriginal; /* Restaura el texto exacto original */
            } else {
                elemento.textContent = Math.floor(valorActual) + sufijo;
                requestAnimationFrame(actualizarFrame); /* Programa el siguiente frame */
            }
        };

        requestAnimationFrame(actualizarFrame);
        observer.unobserve(elemento); /* El contador solo se anima una vez */
    };

    const statsObserver = new IntersectionObserver(
        (entries, observer) => entries.forEach(e => animarContador(e, observer)),
        { threshold: 0.5 } /* Inicia cuando el 50% del número es visible */
    );

    contadores.forEach(c => statsObserver.observe(c));


    // ==========================================================================
    // 9. MOTOR DE LA VENTANA MODAL (FOTOS AMPLIADAS)
    //    Al hacer clic en cualquier .comparison-side o .gallery-item,
    //    lee sus atributos data- e inyecta la imagen y el texto en la modal.
    // ==========================================================================

    const modal           = document.getElementById('resultModal');
    const modalImg        = document.getElementById('modalImg');
    const modalTitle      = document.getElementById('modalTitle');
    const modalDesc       = document.getElementById('modalDescription');
    const modalTagRow     = document.getElementById('modalTagRow');
    const btnCerrarModal  = document.querySelector('.modal-close-btn');

    /* Referencia al timeout de limpieza de imagen para poder cancelarlo si el
       usuario abre otra foto antes de que el timer dispare (bug: imagen negra) */
    let clearImgTimer = null;

    /* Selecciona todos los elementos que pueden abrir la modal */
    const detonadores = document.querySelectorAll('.gallery-item');

    /* Función reutilizable de apertura de la modal */
    const abrirModal = (ruta, titulo, descripcion, tag) => {
        /* Cancela cualquier limpieza de imagen pendiente de un cierre anterior.
           Sin esto, abrir rápido dos veces deja la imagen en blanco porque el
           setTimeout del cierre anterior borraba el src recién asignado. */
        clearTimeout(clearImgTimer);

        modalImg.src          = ruta;
        modalImg.alt          = titulo;
        modalTitle.textContent= titulo;
        modalDesc.textContent = descripcion;

        /* Inyecta el chip de categoría si el ítem tiene data-tag */
        if (modalTagRow) {
            modalTagRow.innerHTML = tag
                ? `<span class="modal-type-chip">${tag}</span>`
                : '';
        }

        modal.classList.add('modal-active');
        document.body.style.overflow = 'hidden';
    };

    /* Función de cierre — expuesta en window para onclick="cerrarModal()" en HTML */
    const cerrarModal = window.cerrarModal = () => {
        modal.classList.remove('modal-active');
        document.body.style.overflow = 'auto';
        /* Limpia la imagen solo después de que la transición de cierre termina.
           Guardamos el ID para poder cancelarlo si el usuario abre otra foto. */
        clearImgTimer = setTimeout(() => { modalImg.src = ''; }, 500);
    };

    /* Añade el listener de apertura a cada detonador */
    detonadores.forEach(detonador => {
        detonador.addEventListener('click', () => {
            const ruta        = detonador.getAttribute('data-img');
            const titulo      = detonador.getAttribute('data-title');
            const descripcion = detonador.getAttribute('data-desc');
            const tag         = detonador.getAttribute('data-tag') || '';
            if (ruta) abrirModal(ruta, titulo, descripcion, tag); /* Solo abre si tiene imagen */
        });

        /* Accesibilidad: también responde a la tecla Enter cuando el elemento tiene foco */
        detonador.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                detonador.click();
            }
        });
    });

    /* Cierra la modal al hacer clic en el botón X */
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);

    /* Cierra la modal al hacer clic en el fondo oscuro (fuera de la caja blanca) */
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    /* Cierra la modal con la tecla Escape */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal-active')) {
            cerrarModal();
        }
    });


    // ==========================================================================
    // 10. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
    //     Al hacer clic en una pregunta, expande su respuesta suavemente usando
    //     max-height. Si hay otra abierta, la cierra primero (comportamiento exclusivo).
    // ==========================================================================

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-question-trigger');
        const answer  = item.querySelector('.faq-answer-content');

        trigger.addEventListener('click', () => {
            const estaAbierto = item.classList.contains('faq-active');

            /* CIERRE EN CASCADA: cierra todos los demás ítems antes de abrir el actual */
            faqItems.forEach(otroItem => {
                if (otroItem !== item) {
                    otroItem.classList.remove('faq-active');
                    otroItem.querySelector('.faq-arrow-icon').style.transform = 'rotate(0deg)';
                    otroItem.querySelector('.faq-answer-content').style.maxHeight = '0';
                    otroItem.querySelector('.faq-question-trigger').setAttribute('aria-expanded', 'false');
                }
            });

            /* CONMUTACIÓN del ítem actual */
            if (!estaAbierto) {
                item.classList.add('faq-active');
                /* scrollHeight da la altura real del contenido para animar de 0 a ese valor */
                answer.style.maxHeight = answer.scrollHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');
            } else {
                item.classList.remove('faq-active');
                answer.style.maxHeight = '0';
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });


    // ==========================================================================
    // 11. VALIDACIÓN DE FORMULARIO Y ENVÍO ASÍNCRONO (FETCH API)
    //     Valida los 4 campos antes de enviar. Si todo es válido, usa fetch()
    //     para enviar los datos a Formspree en segundo plano sin recargar la página.
    //     Al éxito muestra la ventana flotante de confirmación.
    // ==========================================================================

    const formulario = document.getElementById('aispoltecForm');

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault(); /* Detiene el envío nativo del formulario */

            /* Captura los 4 campos */
            const campoNombre  = document.getElementById('form-name');
            const campoEmail   = document.getElementById('form-email');
            const campoTelefono= document.getElementById('form-phone');
            const campoMensaje = document.getElementById('form-message');

            let formularioValido = true;

            /* ---- Función auxiliar: muestra un mensaje de error en el campo ---- */
            const mostrarError = (campo, spanId, mensaje) => {
                campo.classList.add('input-invalid');    /* Pinta el borde del campo de rojo */
                const span = document.getElementById(spanId);
                if (span) { span.textContent = mensaje; span.classList.add('visible-error'); }
                formularioValido = false;
            };

            /* ---- Función auxiliar: limpia el error de un campo ---- */
            const limpiarError = (campo, spanId) => {
                campo.classList.remove('input-invalid');
                const span = document.getElementById(spanId);
                if (span) { span.classList.remove('visible-error'); span.textContent = ''; }
            };

            /* ---- VALIDACIÓN 1: Nombre (solo letras, mínimo 3 caracteres) ---- */
            const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,80}$/;
            if (!campoNombre.value.trim()) {
                mostrarError(campoNombre, 'nameError', 'El nombre es obligatorio.');
            } else if (!regexNombre.test(campoNombre.value.trim())) {
                mostrarError(campoNombre, 'nameError', 'Ingresa un nombre válido (solo letras, mínimo 3).');
            } else {
                limpiarError(campoNombre, 'nameError');
            }

            /* ---- VALIDACIÓN 2: Email (formato estricto internacional) ---- */
            const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!campoEmail.value.trim()) {
                mostrarError(campoEmail, 'emailError', 'El correo electrónico es obligatorio.');
            } else if (!regexEmail.test(campoEmail.value.trim())) {
                mostrarError(campoEmail, 'emailError', 'Ingresa un email válido (ej: nombre@empresa.com).');
            } else {
                limpiarError(campoEmail, 'emailError');
            }

            /* ---- VALIDACIÓN 3: Teléfono chileno (exactamente 9 dígitos) ---- */
            /* Elimina prefijos +56, espacios y guiones antes de contar los dígitos */
            const telefonoLimpio = campoTelefono.value.replace(/[\s+\-()]/g, '').replace(/^56/, '');
            const regexTelefono  = /^[0-9]{9}$/;
            if (!campoTelefono.value.trim()) {
                mostrarError(campoTelefono, 'phoneError', 'El teléfono de contacto es obligatorio.');
            } else if (!regexTelefono.test(telefonoLimpio)) {
                mostrarError(campoTelefono, 'phoneError', 'Ingresa un número válido de 9 dígitos (ej: 9 1234 5678).');
            } else {
                limpiarError(campoTelefono, 'phoneError');
            }

            /* ---- VALIDACIÓN 4: Mensaje (mínimo 10 caracteres para detallar el proyecto) ---- */
            if (!campoMensaje.value.trim()) {
                mostrarError(campoMensaje, 'messageError', 'Cuéntanos un breve detalle de tu requerimiento.');
            } else if (campoMensaje.value.trim().length < 10) {
                mostrarError(campoMensaje, 'messageError', 'El mensaje debe ser más descriptivo (mínimo 10 caracteres).');
            } else {
                limpiarError(campoMensaje, 'messageError');
            }

            /* ---- ENVÍO ASÍNCRONO si todo es válido ---- */
            if (formularioValido) {
                const botonEnvio    = formulario.querySelector('.btn-submit-form');
                const textoOriginal = botonEnvio.textContent;

                /* Estado de carga en el botón: deshabilita y cambia el texto */
                botonEnvio.textContent    = 'Enviando...';
                botonEnvio.disabled       = true;
                botonEnvio.style.opacity  = '0.75';

                const urlFormspree   = formulario.getAttribute('action');
                const datosFormulario= new FormData(formulario);

                /* fetch: envía los datos a Formspree sin recargar la página */
                fetch(urlFormspree, {
                    method : 'POST',
                    body   : datosFormulario,
                    headers: { 'Accept': 'application/json' }
                })
                .then(response => {
                    if (response.ok) {
                        formulario.reset(); /* Limpia todos los campos del formulario */

                        /* Muestra la ventana de éxito cinematográfica */
                        const successModal = document.getElementById('successModal');
                        if (successModal) {
                            successModal.classList.add('success-active');
                            document.body.style.overflow = 'hidden'; /* Bloquea scroll de fondo */
                        }
                    } else {
                        /* Error del servidor de Formspree */
                        alert('Ocurrió un problema al enviar tu solicitud. Por favor, inténtalo de nuevo.');
                    }
                })
                .catch(() => {
                    /* Error de red (sin conexión a internet) */
                    alert('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
                })
                .finally(() => {
                    /* Restaura el botón siempre, sin importar si hubo éxito o error */
                    botonEnvio.textContent   = textoOriginal;
                    botonEnvio.disabled      = false;
                    botonEnvio.style.opacity = '1';
                });
            }
        });
    }


    // ==========================================================================
    // 12. EFECTO DE ESCRITURA MECANOGRAFIADA AL HACER CLIC EN TARJETAS DE SERVICIOS
    //     Al hacer clic en una tarjeta de servicio, el JS:
    //     1. Genera un mensaje personalizado según el servicio.
    //     2. Desplaza la página suavemente hasta el formulario.
    //     3. Escribe el mensaje en el textarea letra por letra (efecto typewriter).
    // ==========================================================================

    const tarjetasServicio = document.querySelectorAll('.service-card');
    const cajaMensaje      = document.getElementById('form-message');
    const seccionContacto  = document.getElementById('contacto');

    /* Variable global para controlar y limpiar animaciones previas de escritura */
    let intervaloEscritura = null;

    /* Mapa de mensajes predefinidos por nombre de servicio */
    const mensajesPorServicio = {
        'Aislamiento Térmico':
            'Hola Aispoltec, me interesa solicitar una cotización para el servicio de Aislamiento Térmico. El proyecto está ubicado en... y la superficie aproximada es de... m².',
        'Aislamiento Expansivo':
            'Estimados, quisiera consultar detalles y valores sobre el Aislamiento Expansivo con inyección de poliuretano para espacios ocultos en... ',
        'Aislamiento Acústico':
            'Hola, necesito cotizar una solución de Aislamiento Acústico para mitigar ruidos en... La superficie aproximada es de... m².',
        'Impermeabilización y Filtro UV':
            'Hola Aispoltec, solicito una evaluación técnica para la Impermeabilización con Poliurea pura en caliente para una techumbre/losa ubicada en... ',
        'Arriendo de Maquinaria':
            'Quiero cotizar el arriendo de maquinaria proyectadora por jornada con supervisión técnica en terreno para el periodo de... en... '
    };

    tarjetasServicio.forEach(tarjeta => {
        tarjeta.addEventListener('click', () => {
            const tituloServicio = tarjeta.querySelector('h3').textContent.trim();
            /* Busca el mensaje predefinido o genera uno genérico */
            const textoMeta = mensajesPorServicio[tituloServicio]
                || `Hola Aispoltec, me interesa cotizar el servicio de ${tituloServicio} para mi proyecto en...`;

            /* Detiene cualquier escritura anterior pendiente */
            if (intervaloEscritura) clearInterval(intervaloEscritura);

            /* Limpia el campo y sus errores previos */
            if (cajaMensaje) {
                cajaMensaje.value = '';
                cajaMensaje.classList.remove('input-invalid');
                const errorSpan = document.getElementById('messageError');
                if (errorSpan) { errorSpan.classList.remove('visible-error'); errorSpan.textContent = ''; }
            }

            /* Desplazamiento suave hasta la sección de contacto */
            if (seccionContacto && navbar) {
                const navbarHeight   = navbar.offsetHeight;
                const posicionDestino= seccionContacto.offsetTop - navbarHeight - 8;
                window.scrollTo({ top: posicionDestino, behavior: 'smooth' });

                /* Inicia el typewriter 850ms después para esperar que termine el scroll */
                setTimeout(() => {
                    if (cajaMensaje) {
                        cajaMensaje.focus(); /* Mueve el foco al textarea */
                        let indice = 0;

                        /* Escribe un carácter cada 14ms (≈71 caracteres por segundo) */
                        intervaloEscritura = setInterval(() => {
                            if (indice < textoMeta.length) {
                                cajaMensaje.value += textoMeta.charAt(indice);
                                indice++;
                                /* Mueve el cursor al final del texto mientras se escribe */
                                cajaMensaje.setSelectionRange(cajaMensaje.value.length, cajaMensaje.value.length);
                            } else {
                                clearInterval(intervaloEscritura); /* Detiene el bucle al terminar */
                            }
                        }, 14);
                    }
                }, 850);
            }
        });

        /* Accesibilidad: la tarjeta también responde a Enter y Espacio (role="button") */
        tarjeta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tarjeta.click();
            }
        });
    });


    // ==========================================================================
    // 13. FUNCIÓN GLOBAL: CERRAR LA VENTANA DE ÉXITO
    //     Se llama desde el onclick del botón "Entendido" en el HTML.
    //     Debe estar en window para ser accesible desde el HTML.
    // ==========================================================================

    window.cerrarSuccessModal = () => {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.classList.remove('success-active');
            document.body.style.overflow = 'auto'; /* Devuelve el scroll de fondo al usuario */
        }
    };

    /* También permite cerrar la ventana de éxito con la tecla Escape */
    document.addEventListener('keydown', (e) => {
        const successModal = document.getElementById('successModal');
        if (e.key === 'Escape' && successModal && successModal.classList.contains('success-active')) {
            window.cerrarSuccessModal();
        }
    });


    // ==========================================================================
    // 14. VALIDACIÓN EN TIEMPO REAL (FEEDBACK INSTANTÁNEO MIENTRAS SE ESCRIBE)
    //     Limpia el mensaje de error de un campo en el momento en que el usuario
    //     empieza a corregirlo, sin esperar al submit.
    // ==========================================================================

    const camposValidados = [
        { id: 'form-name',    errorId: 'nameError'    },
        { id: 'form-email',   errorId: 'emailError'   },
        { id: 'form-phone',   errorId: 'phoneError'   },
        { id: 'form-message', errorId: 'messageError' }
    ];

    camposValidados.forEach(({ id, errorId }) => {
        const campo = document.getElementById(id);
        const span  = document.getElementById(errorId);
        if (!campo || !span) return;

        /* En cuanto el usuario escribe algo, limpiamos el error de ese campo */
        campo.addEventListener('input', () => {
            if (campo.value.trim().length > 0) {
                campo.classList.remove('input-invalid');
                span.classList.remove('visible-error');
                span.textContent = '';
            }
        });
    });


    // ==========================================================================
    // 15. SLIDER INTERACTIVO ANTES/DESPUÉS
    //     El usuario arrastra un handle central para revelar la imagen "después"
    //     sobre la imagen "antes". Funciona con mouse y touch en móvil.
    // ==========================================================================

    const compSliders = document.querySelectorAll('.img-comp-slider');

    compSliders.forEach(slider => {
        const beforePanel = slider.querySelector('.comp-before'); /* panel izquierdo */
        const afterPanel  = slider.querySelector('.comp-after');  /* panel derecho  */
        const handle      = slider.querySelector('.comp-handle');
        let isDragging    = false;

        /* Calcula el porcentaje horizontal respecto al ancho del slider */
        const calcPct = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            return Math.max(2, Math.min(98, pct)); /* Limita entre 2% y 98% */
        };

        /* Aplica la posición: recorta AMBOS paneles para que la imagen "antes"
           también desaparezca al arrastrar hacia el lado "después", y viceversa.
           — beforePanel: inset(0 (100-pct)% 0 0) → muestra la porción IZQUIERDA
           — afterPanel:  inset(0 0 0 pct%)       → muestra la porción DERECHA
           Arrastrar a la DERECHA = handle sube pct% → ANTES crece, DESPUÉS encoge
           Arrastrar a la IZQUIERDA = handle baja pct% → DESPUÉS crece, ANTES encoge */
        const setPosition = (clientX) => {
            const pct = calcPct(clientX);
            beforePanel.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
            afterPanel.style.clipPath  = `inset(0 0 0 ${pct}%)`;
            handle.style.left          = `${pct}%`;
            /* Marca como usado para ocultar el hint de arrastre */
            slider.classList.add('slider-used');
        };

        /* ---- Eventos de ratón ---- */
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            slider.classList.add('dragging');
            setPosition(e.clientX);
            e.preventDefault(); /* Evita selección de texto al arrastrar */
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) setPosition(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                slider.classList.remove('dragging');
            }
        });

        /* ---- Eventos táctiles (móvil / tablet) ---- */
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            setPosition(e.touches[0].clientX);
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            if (isDragging) setPosition(e.touches[0].clientX);
        }, { passive: true });

        slider.addEventListener('touchend', () => { isDragging = false; });
    });


    // ==========================================================================
    // 16. CALCULADORA DE AHORRO ENERGÉTICO
    //     Calcula el ahorro estimado en Pesos Chilenos (CLP) / UF y CO₂
    //     según superficie, tipo de espacio y zona climática.
    //     Parámetros basados en tarifas reales CNE/SEC Chile 2025-2026 y
    //     estudios de eficiencia energética MINENERGIA / CORFO.
    //     TODOS LOS VALORES SON ESTIMACIONES REFERENCIALES.
    // ==========================================================================

    const calcForm        = document.getElementById('calcForm');
    const calcPlaceholder = document.getElementById('calcPlaceholder');
    const calcResults     = document.getElementById('calcResults');

    /* Formatea número como pesos chilenos: $1.234.567 CLP */
    const formatCLP = (num) => '$ ' + Math.round(num).toLocaleString('es-CL') + ' CLP';

    if (calcForm) {
        calcForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const superficie = parseFloat(document.getElementById('calc-superficie').value) || 0;
            const tipo       = document.getElementById('calc-tipo').value;
            const zona       = document.getElementById('calc-zona').value;

            if (superficie <= 0 || superficie > 99999) return;

            /* ------------------------------------------------------------------
               PARÁMETROS — fuentes: CNE, SEC, MINENERGIA 2025-2026

               consumoBase: kWh/m²/mes consumidos en climatización SIN aislamiento.
               Basado en auditorías energéticas de recintos industriales chilenos sin
               aislamiento (Informe de Eficiencia Energética Industrial CORFO 2024).
               Los contenedores metálicos tienen transmitancia muy alta, por eso mayor.
            ------------------------------------------------------------------ */
            const consumoBase = {
                galpon:      { norte: 13, centro:  8, sur: 10 },
                bodega:      { norte:  9, centro:  6, sur:  8 },
                residencial: { norte:  7, centro:  5, sur:  6 },
                contenedor:  { norte: 18, centro: 12, sur: 14 }
            };

            /* Reducción de consumo lograda con poliuretano proyectado de celda cerrada.
               Basado en mediciones pre/post en proyectos ejecutados en Chile. */
            const pctAhorro = { galpon: 0.35, bodega: 0.30, residencial: 0.27, contenedor: 0.42 };

            /* Tarifa eléctrica referencial:
               BT-2 industrial/comercial Chile incluyendo cargos de distribución
               Fuente: CNE / Enel Chile / CGE — tarifa promedio 2025           */
            const preciokWh = 118;   /* CLP/kWh */

            /* Factor de emisión Sistema Eléctrico Nacional (SEN) 2024
               Fuente: Informe Huella de Carbono Generación Eléctrica — MINENERGIA */
            const factorCO2 = 0.41;  /* kg CO₂/kWh */

            /* Valor UF referencial — junio 2026 */
            const valorUF   = 39800; /* CLP por 1 UF */

            /* Costo de aplicación estimado por m² (mano de obra + material + maquinaria).
               Varía según espesor y preparación de superficie. Valor conservador de mercado. */
            const costoPorM2 = { galpon: 22000, bodega: 25000, residencial: 28000, contenedor: 19000 };

            /* ---- Cálculo ---- */
            const consumoMes   = superficie * consumoBase[tipo][zona];   /* kWh totales/mes */
            const ahorroKWhMes = consumoMes * pctAhorro[tipo];           /* kWh ahorrados/mes */
            const ahorroMesCLP = ahorroKWhMes * preciokWh;               /* CLP/mes */
            const ahorroAnioCLP= ahorroMesCLP * 12;                      /* CLP/año */
            const co2Anio      = Math.round(ahorroKWhMes * 12 * factorCO2); /* kg CO₂/año */
            const inversion    = superficie * costoPorM2[tipo];          /* CLP inversión aprox */
            const payback      = (inversion / ahorroAnioCLP).toFixed(1); /* años de recuperación */
            const ahorroMesUF  = (ahorroMesCLP  / valorUF).toFixed(2);
            const ahorroAnioUF = (ahorroAnioCLP / valorUF).toFixed(1);

            /* ---- Inyección en el DOM ---- */
            document.getElementById('res-mensual').textContent    = formatCLP(ahorroMesCLP);
            document.getElementById('res-mensual-uf').textContent = `≈ ${ahorroMesUF} UF / mes`;

            document.getElementById('res-anual').textContent      = formatCLP(ahorroAnioCLP);
            document.getElementById('res-anual-uf').textContent   = `≈ ${ahorroAnioUF} UF / año`;

            document.getElementById('res-co2').textContent        = co2Anio.toLocaleString('es-CL') + ' kg';
            document.getElementById('res-co2-sub').textContent    = 'de CO₂ evitado al año';

            document.getElementById('res-payback').textContent    = payback + ' años';
            document.getElementById('res-payback-sub').textContent= 'recuperación de inversión aprox.';

            /* Oculta el placeholder y muestra los resultados con animación */
            if (calcPlaceholder) calcPlaceholder.style.display = 'none';
            if (calcResults) {
                calcResults.style.display = 'flex';
                /* Pequeña animación de entrada */
                calcResults.style.opacity = '0';
                calcResults.style.transform = 'translateY(10px)';
                calcResults.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        calcResults.style.opacity = '1';
                        calcResults.style.transform = 'translateY(0)';
                    });
                });
            }
        });
    }

}); /* fin DOMContentLoaded */
