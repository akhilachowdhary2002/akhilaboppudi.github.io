/**
 * Portfolio JavaScript Interactive Systems
 * Akhila Boppudi - AI Engineer Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize systems
  initTheme();
  initTypewriter();
  initParticleCanvas();
  initScrollReveal();
  initSpotlight();
});

// ==========================================
// 1. Color Palette / Theme Switcher System
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('portfolio-theme') || 'purple';
  setTheme(savedTheme);
}

window.setTheme = function(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('portfolio-theme', themeName);
  
  // Update active state in navigation theme controls
  const dots = document.querySelectorAll('.theme-dot');
  dots.forEach(dot => {
    dot.classList.remove('active', 'border-white', 'scale-125');
    dot.classList.add('border-transparent');
  });

  const activeDot = document.getElementById(`theme-btn-${themeName}`);
  if (activeDot) {
    activeDot.classList.add('active', 'border-white', 'scale-125');
    activeDot.classList.remove('border-transparent');
  }
};

// ==========================================
// 2. Typing Effect (Hero Subtitle)
// ==========================================
class TxtType {
  constructor(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
  }

  tick() {
    let i = this.loopNum % this.toRotate.length;
    let fullTxt = this.toRotate[i];

    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }

    this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

    let that = this;
    let delta = 150 - Math.random() * 100;

    if (this.isDeleting) { delta /= 2; }

    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }

    setTimeout(() => {
      that.tick();
    }, delta);
  }
}

function initTypewriter() {
  const elements = document.getElementsByClassName('typewrite');
  for (let i = 0; i < elements.length; i++) {
    const toRotate = elements[i].getAttribute('data-type');
    const period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }
}

// ==========================================
// 3. Interactive Canvas Particle Background
// ==========================================
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Handle high DPI screens
  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse coordinate state
  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('mousemove', (event) => {
    // Get mouse offset relative to the canvas
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Particle representation
  class Particle {
    constructor(width, height) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 1.5 + 1;
      this.baseRadius = this.radius;
    }

    update(width, height) {
      // Boundaries
      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      // Update positions
      this.x += this.vx;
      this.y += this.vy;

      // Interaction with mouse cursor
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < mouse.radius) {
          // Attract particles slightly towards mouse
          const force = (mouse.radius - distance) / mouse.radius;
          this.x += (dx / distance) * force * 1.2;
          this.y += (dy / distance) * force * 1.2;
          this.radius = this.baseRadius * 1.5;
        } else {
          this.radius = this.baseRadius;
        }
      } else {
        this.radius = this.baseRadius;
      }
    }

    draw() {
      // Get theme primary color dynamically from CSS custom variables
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      ctx.fillStyle = primaryColor || '#9d7cff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Generate particles based on viewport size
  const particles = [];
  const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 14000));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(canvas.width, canvas.height));
  }

  function drawConnections() {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim() || '157, 124, 255';
    const maxDistance = 90;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          // Fade connection based on distance
          const alpha = (1 - (dist / maxDistance)) * 0.12;
          ctx.strokeStyle = `rgba(${primaryColor}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update(canvas.width, canvas.height);
      p.draw();
    });

    drawConnections();
    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup on unload or page change
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
  });
}

// ==========================================
// 4. Scroll Reveal Animations (Intersection Observer)
// ==========================================
function initScrollReveal() {
  const revealItems = document.querySelectorAll('.reveal-item');
  if (revealItems.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Unobserve once shown
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealItems.forEach(item => {
    observer.observe(item);
  });
}

// ==========================================
// 5. Mouse Spotlight Effect & Card Spotlights
// ==========================================
function initSpotlight() {
  const spotlight = document.querySelector('.spotlight');
  if (!spotlight) return;

  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  });

  // Highlight specific interactive hover card borders
  const cards = document.querySelectorAll('.interactive-hover');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--local-x', `${x}px`);
      card.style.setProperty('--local-y', `${y}px`);
    });
  });
}

// ==========================================
// 6. Timeline Tab Switching System
// ==========================================
window.switchTimelineTab = function(tabId) {
  const expBtn = document.getElementById('tab-btn-exp');
  const eduBtn = document.getElementById('tab-btn-edu');
  const expTab = document.getElementById('timeline-exp');
  const eduTab = document.getElementById('timeline-edu');

  if (tabId === 'experience') {
    // Buttons styling
    expBtn.className = "w-1/2 px-6 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all bg-[#1c1c28] text-[var(--primary)] shadow";
    eduBtn.className = "w-1/2 px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all text-gray-400 hover:text-white";
    
    // Tab toggles
    eduTab.classList.remove('active');
    setTimeout(() => {
      eduTab.style.display = 'none';
      expTab.style.display = 'block';
      setTimeout(() => {
        expTab.classList.add('active');
      }, 20);
    }, 400);

  } else if (tabId === 'education') {
    // Buttons styling
    eduBtn.className = "w-1/2 px-6 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all bg-[#1c1c28] text-[var(--primary)] shadow";
    expBtn.className = "w-1/2 px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all text-gray-400 hover:text-white";
    
    // Tab toggles
    expTab.classList.remove('active');
    setTimeout(() => {
      expTab.style.display = 'none';
      eduTab.style.display = 'block';
      setTimeout(() => {
        eduTab.classList.add('active');
      }, 20);
    }, 400);
  }
};

// ==========================================
// 7. Clipboard copy assistant
// ==========================================
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    const copyText = document.getElementById('copy-text');
    const originalText = copyText.innerText;
    copyText.innerText = 'Copied to Clipboard!';
    
    setTimeout(() => {
      copyText.innerText = originalText;
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
};

// ==========================================
// 8. Mobile Menu Interaction
// ==========================================
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const mobileLinks = document.querySelectorAll('.mobile-link');

if (mobileBtn && mobileMenu) {
  let isMenuOpen = false;

  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      mobileMenu.classList.remove('-translate-y-full');
      menuIcon.setAttribute('d', 'M6 18L18 6M6 6l12 12');
    } else {
      mobileMenu.classList.add('-translate-y-full');
      menuIcon.setAttribute('d', 'M4 6h16M4 12h16m-7 6h7');
    }
  };

  mobileBtn.addEventListener('click', toggleMenu);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) toggleMenu();
    });
  });
}

// Navbar shrink scroll behavior
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('py-3', 'border-white/5', 'bg-[#060608]/80');
    navbar.classList.remove('py-5', 'border-transparent');
  } else {
    navbar.classList.add('py-5', 'border-transparent');
    navbar.classList.remove('py-3', 'border-white/5', 'bg-[#060608]/80');
  }
});
