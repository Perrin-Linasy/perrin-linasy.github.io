document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. COPYRIGHT DYNAMIQUE SÉCURISÉ
  // ============================================================
  const copyrightEl = document.getElementById('copyright');
  if (copyrightEl) {
    copyrightEl.textContent = '© ' + new Date().getFullYear() + ' Perrin Linasy. Tous droits réservés.';
  }

  // ============================================================
  // 2. HEADER AU SCROLL
  // ============================================================
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  // ============================================================
  // 3. MENU MOBILE BURGER (RÉPARÉ)
  // ============================================================
  const menuToggle = document.getElementById('menu-toggle');
  // On cible directement la balise <nav> pour éviter le problème d'ID manquant
  const mainNav = document.querySelector('header nav'); 

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      // Alterne la classe d'ouverture sur le nav comme prévu par votre CSS d'origine
      const isOpen = mainNav.classList.toggle('mobile-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Fermeture automatique lors du clic sur un lien d'ancre
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('mobile-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================================
  // 4. DIAPORAMA DE LOGOS (CARROUSEL)
  // ============================================================
  const DELAY = 5000; 
  const carousel = document.getElementById('carousel');
  const track = document.getElementById('carousel-track');
  
  if (carousel && track) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const slides = Array.from(track.querySelectorAll('.slide'));
    const counter = document.getElementById('counter');
    const bar = document.getElementById('progress-bar');
    const btnPrev = document.getElementById('prev');
    const btnNext = document.getElementById('next');
    const btnToggle = document.getElementById('toggle');

    if (viewport && slides.length > 0) {
      let index = 0;
      let timer = null;
      let userPaused = false;   
      let hoverPaused = false;  

      const pad = n => String(n).padStart(2, '0');

      const centerOn = (i, animate = true) => {
        const slide = slides[i];
        if (!slide) return;
        const center = slide.offsetLeft + slide.offsetWidth / 2;
        const offset = viewport.clientWidth / 2 - center;
        if (!animate) track.style.transition = 'none';
        track.style.transform = 'translateX(' + offset + 'px)';
        if (!animate) {
          void track.offsetWidth; 
          track.style.transition = '';
        }
      };

      const restartBar = () => {
        if (!bar) return;
        bar.classList.remove('run');
        void bar.offsetWidth;
        if (!userPaused) bar.classList.add('run');
      };

      const goTo = (i, animate = true) => {
        index = (i + slides.length) % slides.length;
        slides.forEach((s, n) => {
          s.classList.toggle('is-active', n === index);
          s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
        });
        centerOn(index, animate);
        if (counter) {
          counter.textContent = pad(index + 1) + ' / ' + pad(slides.length);
        }
        restartBar();
      };

      const stop = () => {
        clearInterval(timer);
        timer = null;
      };

      const start = () => {
        stop();
        if (userPaused || hoverPaused) return;
        timer = setInterval(() => goTo(index + 1), DELAY);
      };

      const manual = (i) => {
        goTo(i);
        start(); 
      };

      if (btnPrev) btnPrev.addEventListener('click', () => manual(index - 1));
      if (btnNext) btnNext.addEventListener('click', () => manual(index + 1));

      if (btnToggle) {
        btnToggle.addEventListener('click', () => {
          userPaused = !userPaused;
          carousel.classList.toggle('is-paused', userPaused);
          btnToggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
          btnToggle.setAttribute('aria-label', userPaused ? 'Relancer le diaporama' : 'Mettre le diaporama en pause');
          btnToggle.textContent = userPaused ? '▶' : 'II';
          if (userPaused) { stop(); if (bar) bar.classList.remove('run'); }
          else { goTo(index); start(); }
        });
      }

      carousel.addEventListener('mouseenter', () => { hoverPaused = true; carousel.classList.add('is-paused'); stop(); });
      carousel.addEventListener('mouseleave', () => { hoverPaused = false; carousel.classList.remove('is-paused'); goTo(index); start(); });

      carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') manual(index - 1);
        if (e.key === 'ArrowRight') manual(index + 1);
      });

      let startX = null;
      viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
      viewport.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        startX = null;
        if (Math.abs(dx) > 40) manual(index + (dx < 0 ? 1 : -1));
      }, { passive: true });

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else { goTo(index, false); start(); }
      });

      window.addEventListener('resize', () => centerOn(index, false));

      // Lancement initial sécurisé
      goTo(0, false);
      start();
    }
  }
});
