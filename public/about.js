/**
 * HelioCore AI - About Page JavaScript
 * Анімації та інтерактивні ефекти для сторінки "Про проєкт"
 */

// ТУТ ІНІЦІАЛІЗАЦІЯ СТОРІНКИ
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initScrollAnimations();
  initHoverEffects();
  initCounterAnimations();
});

/**
 * Створення частинок для фону
 * ТУТ АНІМАЦІЯ ЧАСТИНОК
 */
function initParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;

  const particleCount = 50;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: ${getRandomColor()};
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.5 + 0.2};
      animation: particle-float ${Math.random() * 10 + 10}s ease-in-out infinite;
      animation-delay: ${Math.random() * -10}s;
      box-shadow: 0 0 10px currentColor;
    `;
    particlesContainer.appendChild(particle);
  }

  // Додавання CSS анімації для частинок
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particle-float {
      0%, 100% {
        transform: translate(0, 0) scale(1);
        opacity: 0.3;
      }
      25% {
        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.2);
        opacity: 0.6;
      }
      50% {
        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0.8);
        opacity: 0.4;
      }
      75% {
        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(1.1);
        opacity: 0.5;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Отримання випадкового неонового кольору
 */
function getRandomColor() {
  const colors = ['#00d4ff', '#00ff88', '#ffee00', '#aa44ff', '#ff8800'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Ініціалізація анімацій при прокрутці
 * ТУТ АНІМАЦІЇ ПОЯВИ ЕЛЕМЕНТІВ
 */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        
        // Анімація дочірніх елементів з затримкою
        const children = entry.target.querySelectorAll('.idea-card, .component-block, .tech-item, .design-item, .mission-feature');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('animate-in');
          }, index * 100);
        });
      }
    });
  }, observerOptions);

  // Спостереження за секціями
  document.querySelectorAll('.section, .hero').forEach(section => {
    section.classList.add('animate-ready');
    observer.observe(section);
  });

  // Додавання CSS для анімацій
  const style = document.createElement('style');
  style.textContent = `
    .animate-ready {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-ready.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .idea-card, .component-block, .tech-item, .design-item, .mission-feature {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .idea-card.animate-in, .component-block.animate-in, 
    .tech-item.animate-in, .design-item.animate-in, 
    .mission-feature.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Ініціалізація ефектів при наведенні
 * ТУТ ІНТЕРАКТИВНІ ЕФЕКТИ
 */
function initHoverEffects() {
  // Ефект паралаксу для hero секції
  const hero = document.querySelector('.hero');
  const energySphere = document.querySelector('.energy-sphere');
  
  if (hero && energySphere) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 20;
      const y = (e.clientY - rect.top - rect.height / 2) / 20;
      
      energySphere.style.transform = `translate(${x}px, ${y}px)`;
    });
    
    hero.addEventListener('mouseleave', () => {
      energySphere.style.transform = 'translate(0, 0)';
    });
  }

  // Ефект світіння для карток
  document.querySelectorAll('.idea-card, .tech-item, .design-item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // Додавання CSS для ефекту світіння
  const style = document.createElement('style');
  style.textContent = `
    .idea-card::after, .tech-item::after, .design-item::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: inherit;
      background: radial-gradient(
        circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(0, 212, 255, 0.15) 0%,
        transparent 50%
      );
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
    
    .idea-card:hover::after, .tech-item:hover::after, .design-item:hover::after {
      opacity: 1;
    }
    
    .idea-card, .tech-item, .design-item {
      position: relative;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Анімація лічильників у статистиці
 * ТУТ АНІМАЦІЯ ЧИСЕЛ
 */
function initCounterAnimations() {
  const statValues = document.querySelectorAll('.stat-value');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const finalText = element.textContent;
        
        // Анімація появи тексту
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100);
        
        observer.unobserve(element);
      }
    });
  }, { threshold: 0.5 });
  
  statValues.forEach(stat => observer.observe(stat));
}

/**
 * Плавна прокрутка до секцій
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/**
 * Ефект друкування для заголовка
 */
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Консольне повідомлення для розробників
console.log('%c⚡ HelioCore AI - About Page Loaded', 'color: #00d4ff; font-size: 16px; font-weight: bold;');
console.log('%c🌞 Автономна енергетика майбутнього', 'color: #00ff88; font-size: 12px;');
