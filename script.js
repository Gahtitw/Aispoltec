

document.addEventListener('DOMContentLoaded', () => {

    
    
    
    
    

    
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        
        const scrollTopBtn = document.getElementById('scrollTopBtn');
        if (scrollTopBtn) {
            if (window.scrollY > 600) {
                scrollTopBtn.classList.add('scroll-top-visible');
            } else {
                scrollTopBtn.classList.remove('scroll-top-visible');
            }
        }
    }, { passive: true }); 

    
    
    
    

    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    
    
    
    
    
    
    

    const menuCheckbox   = document.getElementById('menu-toggle');
    const navLinks       = document.querySelectorAll('.nav-link, .nav-btn-contacto');
    const menuOverlayBg  = document.getElementById('menuOverlayBg');

    
    if (menuCheckbox && menuOverlayBg) {
        menuCheckbox.addEventListener('change', () => {
            menuOverlayBg.classList.toggle('overlay-active', menuCheckbox.checked);
        });
        
        menuOverlayBg.addEventListener('click', () => {
            menuCheckbox.checked = false;
            menuOverlayBg.classList.remove('overlay-active');
        });
    }

    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuCheckbox) menuCheckbox.checked = false;
            if (menuOverlayBg) menuOverlayBg.classList.remove('overlay-active');
        });
    });

    
    
    
    
    

    const sections = document.querySelectorAll('section[id]');

    
    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
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

    
    sections.forEach(section => scrollSpyObserver.observe(section));

    
    
    
    
    

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    
                    setTimeout(() => {
                        const navbarHeight   = navbar.offsetHeight;
                        
                        const targetPosition = targetSection.getBoundingClientRect().top
                                             + window.pageYOffset
                                             - navbarHeight - 8;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }, 100);
                }
            }
        });
    });

    
    
    
    
    
    

    
    const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';

    
    const prefieresMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    
    
    
    const elementosAnimados = document.querySelectorAll(
        '.service-card, .stat-card, .about-content-side, .about-image-card, ' +
        '.result-card, .commitment-card, .contact-info-side, .contact-form-side, ' +
        '.cert-item, .process-step-card'
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
            threshold: 0,                           
            rootMargin: '60px 0px 60px 0px'        
        });

        elementosPesados.forEach((elemento, index) => {
            elemento.style.opacity    = '0';
            elemento.style.transform  = 'translateY(16px)';
            
            elemento.style.transition = `opacity 0.4s ${EASE_OUT} ${index * 0.018}s, transform 0.4s ${EASE_OUT} ${index * 0.018}s`;
            revealObserverRapido.observe(elemento);
        });
    }

    
    
    
    
    

    const contadores = document.querySelectorAll('.stat-number');

    const animarContador = (entry, observer) => {
        if (!entry.isIntersecting) return;

        const elemento      = entry.target;
        const textoOriginal = elemento.textContent; 

        
        if (prefieresMovimientoReducido) {
            elemento.textContent = textoOriginal;
            observer.unobserve(elemento);
            return;
        }

        const valorMeta = parseInt(textoOriginal.replace(/[^0-9]/g, ''), 10);

        
        if (isNaN(valorMeta) || valorMeta === 0) {
            observer.unobserve(elemento);
            return;
        }

        const duracion      = 2200;  
        const fps           = 60;
        const incremento    = valorMeta / (duracion / (1000 / fps)); 
        let valorActual     = 0;

        
        const sufijo = textoOriginal.includes('+') ? '+' : textoOriginal.includes('%') ? '%' : '';

        const actualizarFrame = () => {
            valorActual += incremento;
            if (valorActual >= valorMeta) {
                elemento.textContent = textoOriginal; 
            } else {
                elemento.textContent = Math.floor(valorActual) + sufijo;
                requestAnimationFrame(actualizarFrame); 
            }
        };

        requestAnimationFrame(actualizarFrame);
        observer.unobserve(elemento); 
    };

    const statsObserver = new IntersectionObserver(
        (entries, observer) => entries.forEach(e => animarContador(e, observer)),
        { threshold: 0.5 } 
    );

    contadores.forEach(c => statsObserver.observe(c));

    
    
    
    
    

    const modal           = document.getElementById('resultModal');
    const modalImg        = document.getElementById('modalImg');
    const modalTitle      = document.getElementById('modalTitle');
    const modalDesc       = document.getElementById('modalDescription');
    const modalTagRow     = document.getElementById('modalTagRow');
    const btnCerrarModal  = document.querySelector('.modal-close-btn');

    
    let clearImgTimer = null;

    
    const detonadores = document.querySelectorAll('.gallery-item');

    
    const abrirModal = (ruta, titulo, descripcion, tag) => {
        
        clearTimeout(clearImgTimer);

        modalImg.src          = ruta;
        modalImg.alt          = titulo;
        modalTitle.textContent= titulo;
        modalDesc.textContent = descripcion;

        
        if (modalTagRow) {
            modalTagRow.innerHTML = tag
                ? `<span class="modal-type-chip">${tag}</span>`
                : '';
        }

        modal.classList.add('modal-active');
        document.body.style.overflow = 'hidden';
    };

    
    const cerrarModal = window.cerrarModal = () => {
        modal.classList.remove('modal-active');
        document.body.style.overflow = 'auto';
        
        clearImgTimer = setTimeout(() => { modalImg.src = ''; }, 500);
    };

    
    detonadores.forEach(detonador => {
        detonador.addEventListener('click', () => {
            const ruta        = detonador.getAttribute('data-img');
            const titulo      = detonador.getAttribute('data-title');
            const descripcion = detonador.getAttribute('data-desc');
            const tag         = detonador.getAttribute('data-tag') || '';
            if (ruta) abrirModal(ruta, titulo, descripcion, tag); 
        });

        
        detonador.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                detonador.click();
            }
        });
    });

    
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);

    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('modal-active')) {
            cerrarModal();
        }
    });

    
    
    
    
    

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-question-trigger');
        const answer  = item.querySelector('.faq-answer-content');

        trigger.addEventListener('click', () => {
            const estaAbierto = item.classList.contains('faq-active');

            
            faqItems.forEach(otroItem => {
                if (otroItem !== item) {
                    otroItem.classList.remove('faq-active');
                    otroItem.querySelector('.faq-arrow-icon').style.transform = 'rotate(0deg)';
                    otroItem.querySelector('.faq-answer-content').style.maxHeight = '0';
                    otroItem.querySelector('.faq-question-trigger').setAttribute('aria-expanded', 'false');
                }
            });

            
            if (!estaAbierto) {
                item.classList.add('faq-active');
                
                answer.style.maxHeight = answer.scrollHeight + 'px';
                trigger.setAttribute('aria-expanded', 'true');
            } else {
                item.classList.remove('faq-active');
                answer.style.maxHeight = '0';
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    
    
    
    
    
    

    const formulario = document.getElementById('aispoltecForm');

    if (formulario) {
        formulario.addEventListener('submit', (e) => {
            e.preventDefault(); 

            
            const campoNombre  = document.getElementById('form-name');
            const campoEmail   = document.getElementById('form-email');
            const campoTelefono= document.getElementById('form-phone');
            const campoMensaje = document.getElementById('form-message');

            let formularioValido = true;

            
            const mostrarError = (campo, spanId, mensaje) => {
                campo.classList.add('input-invalid');    
                const span = document.getElementById(spanId);
                if (span) { span.textContent = mensaje; span.classList.add('visible-error'); }
                formularioValido = false;
            };

            
            const limpiarError = (campo, spanId) => {
                campo.classList.remove('input-invalid');
                const span = document.getElementById(spanId);
                if (span) { span.classList.remove('visible-error'); span.textContent = ''; }
            };

            
            const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,80}$/;
            if (!campoNombre.value.trim()) {
                mostrarError(campoNombre, 'nameError', 'El nombre es obligatorio.');
            } else if (!regexNombre.test(campoNombre.value.trim())) {
                mostrarError(campoNombre, 'nameError', 'Ingresa un nombre válido (solo letras, mínimo 3).');
            } else {
                limpiarError(campoNombre, 'nameError');
            }

            
            const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!campoEmail.value.trim()) {
                mostrarError(campoEmail, 'emailError', 'El correo electrónico es obligatorio.');
            } else if (!regexEmail.test(campoEmail.value.trim())) {
                mostrarError(campoEmail, 'emailError', 'Ingresa un email válido (ej: nombre@empresa.com).');
            } else {
                limpiarError(campoEmail, 'emailError');
            }

            
            
            const telefonoLimpio = campoTelefono.value.replace(/[\s+\-()]/g, '').replace(/^56/, '');
            const regexTelefono  = /^[0-9]{9}$/;
            if (!campoTelefono.value.trim()) {
                mostrarError(campoTelefono, 'phoneError', 'El teléfono de contacto es obligatorio.');
            } else if (!regexTelefono.test(telefonoLimpio)) {
                mostrarError(campoTelefono, 'phoneError', 'Ingresa un número válido de 9 dígitos (ej: 9 1234 5678).');
            } else {
                limpiarError(campoTelefono, 'phoneError');
            }

            
            if (!campoMensaje.value.trim()) {
                mostrarError(campoMensaje, 'messageError', 'Cuéntanos un breve detalle de tu requerimiento.');
            } else if (campoMensaje.value.trim().length < 10) {
                mostrarError(campoMensaje, 'messageError', 'El mensaje debe ser más descriptivo (mínimo 10 caracteres).');
            } else {
                limpiarError(campoMensaje, 'messageError');
            }

            
            if (formularioValido) {
                const botonEnvio    = formulario.querySelector('.btn-submit-form');
                const textoOriginal = botonEnvio.textContent;

                
                botonEnvio.textContent    = 'Enviando...';
                botonEnvio.disabled       = true;
                botonEnvio.style.opacity  = '0.75';

                const urlFormspree   = formulario.getAttribute('action');
                const datosFormulario= new FormData(formulario);

                
                fetch(urlFormspree, {
                    method : 'POST',
                    body   : datosFormulario,
                    headers: { 'Accept': 'application/json' }
                })
                .then(response => {
                    if (response.ok) {
                        formulario.reset(); 

                        
                        const successModal = document.getElementById('successModal');
                        if (successModal) {
                            successModal.classList.add('success-active');
                            document.body.style.overflow = 'hidden'; 
                        }
                    } else {
                        
                        alert('Ocurrió un problema al enviar tu solicitud. Por favor, inténtalo de nuevo.');
                    }
                })
                .catch(() => {
                    
                    alert('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
                })
                .finally(() => {
                    
                    botonEnvio.textContent   = textoOriginal;
                    botonEnvio.disabled      = false;
                    botonEnvio.style.opacity = '1';
                });
            }
        });
    }

    
    
    
    
    
    
    

    const tarjetasServicio = document.querySelectorAll('.service-card');
    const cajaMensaje      = document.getElementById('form-message');
    const seccionContacto  = document.getElementById('contacto');

    
    let intervaloEscritura = null;

    
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
            
            const textoMeta = mensajesPorServicio[tituloServicio]
                || `Hola Aispoltec, me interesa cotizar el servicio de ${tituloServicio} para mi proyecto en...`;

            
            if (intervaloEscritura) clearInterval(intervaloEscritura);

            
            if (cajaMensaje) {
                cajaMensaje.value = '';
                cajaMensaje.classList.remove('input-invalid');
                const errorSpan = document.getElementById('messageError');
                if (errorSpan) { errorSpan.classList.remove('visible-error'); errorSpan.textContent = ''; }
            }

            
            if (seccionContacto && navbar) {
                const navbarHeight   = navbar.offsetHeight;
                const posicionDestino= seccionContacto.offsetTop - navbarHeight - 8;
                window.scrollTo({ top: posicionDestino, behavior: 'smooth' });

                
                setTimeout(() => {
                    if (cajaMensaje) {
                        cajaMensaje.focus(); 
                        let indice = 0;

                        
                        intervaloEscritura = setInterval(() => {
                            if (indice < textoMeta.length) {
                                cajaMensaje.value += textoMeta.charAt(indice);
                                indice++;
                                
                                cajaMensaje.setSelectionRange(cajaMensaje.value.length, cajaMensaje.value.length);
                            } else {
                                clearInterval(intervaloEscritura); 
                            }
                        }, 14);
                    }
                }, 850);
            }
        });

        
        tarjeta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                tarjeta.click();
            }
        });
    });

    
    
    
    
    

    window.cerrarSuccessModal = () => {
        const successModal = document.getElementById('successModal');
        if (successModal) {
            successModal.classList.remove('success-active');
            document.body.style.overflow = 'auto'; 
        }
    };

    
    document.addEventListener('keydown', (e) => {
        const successModal = document.getElementById('successModal');
        if (e.key === 'Escape' && successModal && successModal.classList.contains('success-active')) {
            window.cerrarSuccessModal();
        }
    });

    
    
    
    
    

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

        
        campo.addEventListener('input', () => {
            if (campo.value.trim().length > 0) {
                campo.classList.remove('input-invalid');
                span.classList.remove('visible-error');
                span.textContent = '';
            }
        });
    });

    
    
    
    
    

    const compSliders = document.querySelectorAll('.img-comp-slider');

    compSliders.forEach(slider => {
        const beforePanel = slider.querySelector('.comp-before'); 
        const afterPanel  = slider.querySelector('.comp-after');  
        const handle      = slider.querySelector('.comp-handle');
        let isDragging    = false;

        
        const calcPct = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let pct = ((clientX - rect.left) / rect.width) * 100;
            return Math.max(2, Math.min(98, pct)); 
        };

        
        const setPosition = (clientX) => {
            const pct = calcPct(clientX);
            beforePanel.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
            afterPanel.style.clipPath  = `inset(0 0 0 ${pct}%)`;
            handle.style.left          = `${pct}%`;
            
            slider.classList.add('slider-used');
        };

        
        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            slider.classList.add('dragging');
            setPosition(e.clientX);
            e.preventDefault(); 
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

        
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
            setPosition(e.touches[0].clientX);
        }, { passive: true });

        slider.addEventListener('touchmove', (e) => {
            if (isDragging) setPosition(e.touches[0].clientX);
        }, { passive: true });

        slider.addEventListener('touchend', () => { isDragging = false; });
    });

});
