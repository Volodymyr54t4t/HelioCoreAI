/**
 * ============================================
 * HelioCore AI - Developers Page JavaScript
 * Інтерактивні ефекти та модальні вікна
 * ============================================
 */

// Ініціалізація при завантаженні DOM
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initModals();
    initScrollAnimations();
    initCardEffects();
    initCounterAnimations();
});

/**
 * Створення частинок на фоні
 */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Випадкові параметри
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * -20;
        const opacity = Math.random() * 0.5 + 0.2;

        particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${Math.random() > 0.5 ? 'var(--neon-cyan)' : 'var(--neon-purple)'};
      border-radius: 50%;
      left: ${x}%;
      top: ${y}%;
      opacity: ${opacity};
      animation: particleDrift ${duration}s ${delay}s infinite ease-in-out;
    `;

        container.appendChild(particle);
    }

    // Додаємо стилі анімації
    if (!document.getElementById('particle-styles')) {
        const style = document.createElement('style');
        style.id = 'particle-styles';
        style.textContent = `
      @keyframes particleDrift {
        0%, 100% {
          transform: translate(0, 0) scale(1);
          opacity: 0.2;
        }
        25% {
          transform: translate(20px, -30px) scale(1.2);
          opacity: 0.5;
        }
        50% {
          transform: translate(-10px, 20px) scale(0.8);
          opacity: 0.3;
        }
        75% {
          transform: translate(15px, 10px) scale(1.1);
          opacity: 0.4;
        }
      }
    `;
        document.head.appendChild(style);
    }
}

/**
 * Ініціалізація модальних вікон
 */
function initModals() {
    const modalButtons = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal-overlay');
    const closeButtons = document.querySelectorAll('.modal-close');

    // Відкриття модального вікна
    modalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            const modal = document.getElementById(modalId);

            if (modal) {
                openModal(modal);
            }
        });
    });

    // Закриття по кнопці
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    // Закриття по кліку на overlay
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Закриття по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });
}

/**
 * Відкриття модального вікна
 */
function openModal(modal) {
    // Блокуємо прокрутку body
    document.body.style.overflow = 'hidden';

    // Показуємо модальне вікно
    modal.classList.add('active');

    // Анімація появи елементів
    const items = modal.querySelectorAll('.achievement-item');
    items.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';

        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, 100 + index * 50);
    });
}

/**
 * Закриття модального вікна
 */
function closeModal(modal) {
    // Розблоковуємо прокрутку
    document.body.style.overflow = '';

    // Ховаємо модальне вікно
    modal.classList.remove('active');
}

/**
 * Анімації при прокрутці
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');

                // Для карток розробників
                if (entry.target.classList.contains('developer-card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }

                // Для статистики
                if (entry.target.classList.contains('stat-card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            }
        });
    }, observerOptions);

    // Спостерігаємо за елементами
    document.querySelectorAll('.developer-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

/**
 * Ефекти для карток
 */
function initCardEffects() {
    const cards = document.querySelectorAll('.developer-card');

    cards.forEach(card => {
        // Ефект при наведенні миші
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

/**
 * Анімація лічильників у статистиці
 */
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-value');

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

/**
 * Анімація числового лічильника
 */
function animateCounter(element) {
    const text = element.textContent;
    const hasPlus = text.includes('+');
    const numericValue = parseInt(text.replace(/[^0-9]/g, ''));

    if (isNaN(numericValue)) return;

    let current = 0;
    const duration = 1500;
    const increment = numericValue / (duration / 16);

    const timer = setInterval(() => {
        current += increment;

        if (current >= numericValue) {
            element.textContent = hasPlus ? `${numericValue}+` : numericValue.toString();
            clearInterval(timer);
        } else {
            element.textContent = hasPlus ? `${Math.floor(current)}+` : Math.floor(current).toString();
        }
    }, 16);
}

/**
 * Обробка помилок зображень (якщо будуть додані)
 */
function handleImageError(img) {
    img.style.display = 'none';
    console.warn('Image failed to load:', img.src);
}

/**
 * Утиліта для форматування дати
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Експортуємо функції для глобального доступу
window.HelioCoreDevs = {
    openModal,
    closeModal,
    handleImageError,
    formatDate
};
