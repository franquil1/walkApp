// ========== ANIMACIONES DE SCROLL BIDIRECCIONALES ==========

// Configuración global
const ANIMATION_CONFIG = {
    threshold: 0.15, // Porcentaje del elemento que debe ser visible (15%)
    rootMargin: '0px', // Margen adicional alrededor del viewport
    reverseOnScrollUp: true // Activar animaciones en ambas direcciones
};

// Función mejorada para detectar si un elemento está visible en el viewport
function isElementInViewport(el, threshold = 0.15) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // Calcular cuánto del elemento es visible
    const elementHeight = rect.height;
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    const visiblePercentage = visibleHeight / elementHeight;
    
    // El elemento está visible si cumple el threshold
    const vertInView = visiblePercentage >= threshold;
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    
    return (vertInView && horInView);
}

// Función para animar elementos cuando entran/salen del viewport
function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    animatedElements.forEach((element) => {
        const isVisible = isElementInViewport(element, ANIMATION_CONFIG.threshold);
        const isAnimated = element.classList.contains('animated');
        
        if (isVisible && !isAnimated) {
            // Elemento visible - agregar animación
            element.classList.add('animated');
        } else if (!isVisible && isAnimated && ANIMATION_CONFIG.reverseOnScrollUp) {
            // Elemento fuera de vista - quitar animación para reanimarla
            element.classList.remove('animated');
        }
    });
}

// Función alternativa usando Intersection Observer (mejor rendimiento)
function initIntersectionObserver() {
    // Verificar si el navegador soporta IntersectionObserver
    if (!('IntersectionObserver' in window)) {
        console.log('⚠️ IntersectionObserver no soportado, usando método alternativo');
        return false;
    }
    
    const observerOptions = {
        root: null, // usa el viewport
        rootMargin: '0px',
        threshold: [0, 0.15, 0.5, 1] // Múltiples puntos de observación
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const element = entry.target;
            
            // Si el elemento es visible con el threshold mínimo
            if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
                element.classList.add('animated');
            } else if (ANIMATION_CONFIG.reverseOnScrollUp) {
                // Remover animación si sale del viewport
                element.classList.remove('animated');
            }
        });
    }, observerOptions);
    
    // Observar todos los elementos animables
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => observer.observe(element));
    
    return true;
}

// Función de inicialización principal
function initScrollAnimations() {
    // Intentar usar IntersectionObserver primero (mejor rendimiento)
    const observerInitialized = initIntersectionObserver();
    
    // Si IntersectionObserver no está disponible, usar scroll event
    if (!observerInitialized) {
        // Ejecutar al cargar la página
        animateOnScroll();
        
        // Ejecutar al hacer scroll con throttle para mejor rendimiento
        let isScrolling = false;
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
                    
                    animateOnScroll();
                    lastScrollY = currentScrollY;
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }, { passive: true });
    }
    
    // También ejecutar al redimensionar la ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            animateOnScroll();
        }, 250);
    }, { passive: true });
}

// ========== DETECCIÓN DE DIRECCIÓN DE SCROLL ==========

let lastScrollPosition = 0;
let scrollDirection = 'down';

function detectScrollDirection() {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    if (currentScrollPosition > lastScrollPosition) {
        scrollDirection = 'down';
    } else if (currentScrollPosition < lastScrollPosition) {
        scrollDirection = 'up';
    }
    
    lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
    
    // Añadir clase al body para CSS condicional si es necesario
    document.body.setAttribute('data-scroll-direction', scrollDirection);
}

window.addEventListener('scroll', detectScrollDirection, { passive: true });

// ========== ANIMACIÓN DE CONTADOR (OPCIONAL) ==========

function animateCounter(element, target, duration = 2000) {
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16); // 60 FPS
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            element.textContent = Math.round(target);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Inicializar contadores cuando sean visibles
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    if (counters.length === 0) return;
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const target = parseInt(entry.target.getAttribute('data-counter'));
                animateCounter(entry.target, target);
                entry.target.classList.add('counted');
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// ========== SMOOTH SCROLL PARA ENLACES INTERNOS ==========

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Ignorar si es solo "#" o "#!"
            if (href === '#' || href === '#!') {
                return;
            }
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 90; // Ajustar por el navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========== LAZY LOADING PARA IMÁGENES ==========

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if (images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });
    
    images.forEach(img => imageObserver.observe(img));
}

// ========== ANIMACIÓN DE FADE IN AL CARGAR ==========

function initPageLoad() {
    window.addEventListener('load', () => {
        document.body.classList.remove('fade-out');
        document.body.classList.add('loaded');
        
        // Animar elementos que ya están en el viewport al cargar
        setTimeout(() => {
            if ('IntersectionObserver' in window) {
                // Si usa IntersectionObserver, este se encarga
            } else {
                animateOnScroll();
            }
        }, 100);
    });
}

// ========== PREVENIR ANIMACIONES DURANTE EL PRELOAD ==========

function preventPreloadAnimations() {
    // Añadir clase cuando JavaScript está habilitado
    document.documentElement.classList.add('js-enabled');
    
    // Esperar un frame antes de habilitar transiciones
    requestAnimationFrame(() => {
        document.body.classList.add('animations-ready');
    });
}

// ========== UTILIDADES ADICIONALES ==========

// Debounce function para eventos frecuentes
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function para scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========== INICIALIZACIÓN COMPLETA ==========

function init() {
    console.log('🚀 Inicializando animaciones...');
    
    // Prevenir animaciones durante la carga
    preventPreloadAnimations();
    
    // Inicializar animaciones de scroll
    initScrollAnimations();
    
    // Inicializar smooth scroll
    initSmoothScroll();
    
    // Inicializar lazy loading
    initLazyLoading();
    
    // Inicializar contadores
    initCounters();
    
    // Inicializar eventos de carga
    initPageLoad();
    
    console.log('✅ Animaciones inicializadas correctamente');
    console.log('📊 Elementos animables:', document.querySelectorAll('.animate-on-scroll').length);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // El DOM ya está listo
    init();
}

// ========== EXPORTAR FUNCIONES PARA USO EXTERNO ==========

window.ScrollAnimations = {
    init: init,
    animate: animateOnScroll,
    config: ANIMATION_CONFIG,
    setReverseAnimation: (value) => {
        ANIMATION_CONFIG.reverseOnScrollUp = value;
    },
    setThreshold: (value) => {
        ANIMATION_CONFIG.threshold = value;
    }
};

// ========== DEBUG MODE (Descomentar para debugging) ==========

// window.DEBUG_ANIMATIONS = true;
// if (window.DEBUG_ANIMATIONS) {
//     window.addEventListener('scroll', throttle(() => {
//         console.log('Scroll Direction:', scrollDirection);
//         console.log('Scroll Position:', lastScrollPosition);
//     }, 500));
// }