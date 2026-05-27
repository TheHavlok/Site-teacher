/* =========================================
   TEACHER OF THE YEAR — PORTFOLIO
   Main JavaScript
   ========================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // 1. INTERSECTION OBSERVER — Scroll Animations
  // ============================================

  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Don't unobserve — allows re-triggering if needed,
        // but we stop observing to save performance
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // ============================================
  // 2. NAVBAR SCROLL BEHAVIOR
  // ============================================

  const navbar = document.getElementById('navbar');
  const scrollThreshold = 50;

  function handleNavbarScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Run on load

  // ============================================
  // 3. ACTIVE LINK HIGHLIGHTING ON SCROLL
  // ============================================

  const navLinks = document.querySelectorAll('.navbar__link[data-section]');
  const sections = [];

  navLinks.forEach(function (link) {
    var sectionId = link.getAttribute('data-section');
    var section = document.getElementById(sectionId);
    if (section) {
      sections.push({ id: sectionId, el: section, link: link });
    }
  });

  function updateActiveLink() {
    var scrollPos = window.scrollY + window.innerHeight / 3;

    var currentSection = null;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].el.offsetTop <= scrollPos) {
        currentSection = sections[i];
        break;
      }
    }

    navLinks.forEach(function (link) {
      link.classList.remove('active');
    });

    if (currentSection) {
      currentSection.link.classList.add('active');
    }
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // ============================================
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        var navHeight = navbar.offsetHeight;
        var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile menu if open
        var navMenu = document.getElementById('navMenu');
        var hamburger = document.getElementById('hamburger');
        if (navMenu.classList.contains('open')) {
          navMenu.classList.remove('open');
          hamburger.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  });

  // ============================================
  // 5. LIGHTBOX FOR GALLERY
  // ============================================

  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightboxImage');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');

  // Open lightbox
  document.querySelectorAll('[data-lightbox="true"]').forEach(function (photo) {
    photo.addEventListener('click', function () {
      var src = this.getAttribute('src');
      var caption = this.getAttribute('data-caption') || '';

      lightboxImage.setAttribute('src', src);
      lightboxImage.setAttribute('alt', caption);
      lightboxCaption.textContent = caption;

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close lightbox — close button
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  // Close lightbox — click overlay
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox__content')) {
        closeLightbox();
      }
    });
  }

  // Close lightbox — ESC key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Clear src after transition to avoid flash on next open
    setTimeout(function () {
      if (!lightbox.classList.contains('active')) {
        lightboxImage.setAttribute('src', '');
      }
    }, 400);
  }

  // ============================================
  // 6. SCROLL-TO-TOP BUTTON
  // ============================================

  var scrollTopBtn = document.getElementById('scrollTopBtn');
  var scrollTopThreshold = 400;

  function handleScrollTopVisibility() {
    if (window.scrollY > scrollTopThreshold) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScrollTopVisibility, { passive: true });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ============================================
  // 7. RIPPLE EFFECT ON BUTTONS & SOCIAL BTNS
  // ============================================

  var rippleTargets = document.querySelectorAll('.social-btn, .scroll-top-btn, .method-card');

  rippleTargets.forEach(function (el) {
    el.style.position = el.style.position || 'relative';
    el.style.overflow = 'hidden';

    el.addEventListener('click', function (e) {
      var rect = this.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var size = Math.max(rect.width, rect.height) * 2;

      var ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      ripple.style.width = size + 'px';
      ripple.style.height = size + 'px';
      ripple.style.left = (x - size / 2) + 'px';
      ripple.style.top = (y - size / 2) + 'px';

      this.appendChild(ripple);

      setTimeout(function () {
        ripple.remove();
      }, 600);
    });
  });

  // ============================================
  // 8. COUNTER ANIMATION FOR STAT NUMBERS
  // ============================================

  var counterElements = document.querySelectorAll('.counter-value');
  var countersAnimated = false;

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !countersAnimated) {
        countersAnimated = true;
        animateCounters();
        counterObserver.disconnect();
      }
    });
  }, {
    threshold: 0.3
  });

  // Observe parent container
  var highlightsSection = document.querySelector('.about__highlights');
  if (highlightsSection) {
    counterObserver.observe(highlightsSection);
  }

  function animateCounters() {
    counterElements.forEach(function (el) {
      var rawTarget = el.getAttribute('data-target');
      if (!rawTarget) return;

      // Extract numeric part and any suffix/prefix
      var match = rawTarget.match(/^([^\d]*)([\d]+)(.*)$/);
      if (!match) {
        // Non-numeric value, just show it
        el.textContent = rawTarget;
        return;
      }

      var prefix = match[1] || '';
      var target = parseInt(match[2], 10);
      var suffix = match[3] || '';
      var current = 0;
      var duration = 2000; // ms
      var stepTime = Math.max(Math.floor(duration / target), 16);

      // Cap steps for large numbers
      var totalSteps = Math.min(target, 120);
      var increment = target / totalSteps;
      var adjustedStepTime = duration / totalSteps;

      el.textContent = prefix + '0' + suffix;

      var interval = setInterval(function () {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = prefix + Math.round(current) + suffix;
      }, adjustedStepTime);
    });
  }

  // ============================================
  // 9. MOBILE MENU TOGGLE (HAMBURGER)
  // ============================================

  var hamburger = document.getElementById('hamburger');
  var navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('open');
      navMenu.classList.toggle('open');

      if (navMenu.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (navMenu.classList.contains('open') &&
          !navMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================
  // 10. HERO PARTICLES (decorative background)
  // ============================================

  var particlesContainer = document.getElementById('heroParticles');
  if (particlesContainer) {
    for (var i = 0; i < 30; i++) {
      var particle = document.createElement('div');
      var size = Math.random() * 6 + 2;
      particle.style.cssText = [
        'position: absolute',
        'border-radius: 50%',
        'background: rgba(255,255,255,' + (Math.random() * 0.15 + 0.05) + ')',
        'width: ' + size + 'px',
        'height: ' + size + 'px',
        'left: ' + (Math.random() * 100) + '%',
        'top: ' + (Math.random() * 100) + '%',
        'animation: particleFloat ' + (Math.random() * 10 + 8) + 's ease-in-out infinite',
        'animation-delay: ' + (Math.random() * 5) + 's'
      ].join(';');
      particlesContainer.appendChild(particle);
    }

    // Add the particle keyframe animation
    var styleSheet = document.createElement('style');
    styleSheet.textContent = '\
      @keyframes particleFloat {\
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }\
        25% { transform: translate(' + (Math.random() * 60 - 30) + 'px, -' + (Math.random() * 40 + 20) + 'px) scale(1.2); opacity: 0.8; }\
        50% { transform: translate(' + (Math.random() * 40 - 20) + 'px, -' + (Math.random() * 60 + 30) + 'px) scale(0.8); opacity: 0.4; }\
        75% { transform: translate(-' + (Math.random() * 30 + 10) + 'px, -' + (Math.random() * 20 + 10) + 'px) scale(1.1); opacity: 0.7; }\
      }\
    ';
    document.head.appendChild(styleSheet);
  }

});
