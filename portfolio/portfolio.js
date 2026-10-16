// Copyright dynamique sécurisé
const copyrightEl = document.getElementById('copyright');
if (copyrightEl) {
  copyrightEl.textContent = '© ' + new Date().getFullYear() + ' Perrin Linasy. Tous droits réservés.';
}


// Header au scroll
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
});

// Menu mobile
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
 
menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('mobile-open');
  menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});
mainNav.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mainNav.classList.remove('mobile-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Diaporama de logos =====
const DELAY = 5000; // 5 secondes entre chaque logo

const carousel = document.getElementById('carousel');
const viewport = carousel.querySelector('.carousel-viewport');
const track = document.getElementById('carousel-track');
const slides = Array.from(track.querySelectorAll('.slide'));
const counter = document.getElementById('counter');
const bar = document.getElementById('progress-bar');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');
const btnToggle = document.getElementById('toggle');

let index = 0;
let timer = null;
let userPaused = false;   // pause demandée via le bouton
let hoverPaused = false;  // pause temporaire (survol / focus)

const pad = n => String(n).padStart(2, '0');

function centerOn(i, animate = true) {
  const slide = slides[i];
  const center = slide.offsetLeft + slide.offsetWidth / 2;
  const offset = viewport.clientWidth / 2 - center;
  if (!animate) track.style.transition = 'none';
  track.style.transform = 'translateX(' + offset + 'px)';
  if (!animate) {
    void track.offsetWidth; // force le recalcul avant de rétablir la transition
    track.style.transition = '';
  }
}

function restartBar() {
  bar.classList.remove('run');
  void bar.offsetWidth;
  if (!userPaused) bar.classList.add('run');
}

function goTo(i, animate = true) {
  index = (i + slides.length) % slides.length;
  slides.forEach((s, n) => {
    s.classList.toggle('is-active', n === index);
    s.setAttribute('aria-hidden', n === index ? 'false' : 'true');
  });
  centerOn(index, animate);
  counter.textContent = pad(index + 1) + ' / ' + pad(slides.length);
  restartBar();
}

function stop() {
  clearInterval(timer);
  timer = null;
}

function start() {
  stop();
  if (userPaused || hoverPaused) return;
  timer = setInterval(() => goTo(index + 1), DELAY);
}

function manual(i) {
  goTo(i);
  start(); // remet le délai de 5 s à zéro après une action manuelle
}

btnPrev.addEventListener('click', () => manual(index - 1));
btnNext.addEventListener('click', () => manual(index + 1));

btnToggle.addEventListener('click', () => {
  userPaused = !userPaused;
  carousel.classList.toggle('is-paused', userPaused);
  btnToggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
  btnToggle.setAttribute('aria-label', userPaused ? 'Relancer le diaporama' : 'Mettre le diaporama en pause');
  btnToggle.textContent = userPaused ? '▶' : 'II';
  if (userPaused) { stop(); bar.classList.remove('run'); }
  else { goTo(index); start(); }
});

// Pause au survol / focus clavier (souris uniquement, pas au toucher)
carousel.addEventListener('mouseenter', () => { hoverPaused = true; carousel.classList.add('is-paused'); stop(); });
carousel.addEventListener('mouseleave', () => { hoverPaused = false; carousel.classList.remove('is-paused'); goTo(index); start(); });

// Clavier : flèches gauche / droite sur le carrousel
carousel.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') manual(index - 1);
  if (e.key === 'ArrowRight') manual(index + 1);
});

// Balayage au doigt (mobile)
let startX = null;
viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
viewport.addEventListener('touchend', (e) => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  startX = null;
  if (Math.abs(dx) > 40) manual(index + (dx < 0 ? 1 : -1));
}, { passive: true });

// Onglet masqué : on arrête le diaporama, on le relance au retour
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else { goTo(index, false); start(); }
});

// Recentrage si la taille de l'écran change
window.addEventListener('resize', () => centerOn(index, false));

// Démarrage (attend le chargement complet pour mesurer correctement)
window.addEventListener('load', () => { goTo(0, false); start(); });
goTo(0, false);
