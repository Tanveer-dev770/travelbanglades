(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    if (btt) btt.classList.toggle('show', window.scrollY > 520);
  }

  if (reduce) { if (header) header.classList.add('scrolled'); return; }

  var btt = document.createElement('button');
  btt.className = 'back-to-top';
  btt.type = 'button';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '&uarr;';
  btt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(btt);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('fx-in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section, .page-hero, .trust-strip, .split-section, .cta-card, .prose-grid').forEach(function (el) {
    el.classList.add('fx');
    revealIO.observe(el);
  });

  function stagger(grid) {
    Array.prototype.forEach.call(grid.children, function (child, i) {
      child.classList.add('fx-card');
      child.style.setProperty('--i', String(i % 8));
    });
  }
  function processRoot(root) {
    root.querySelectorAll('.destination-grid, .category-grid, .mini-grid, .horizontal-grid').forEach(stagger);
  }
  processRoot(document);
  new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType === 1 && n.querySelector) processRoot(n.parentElement || document);
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (!el.dataset.count) el.dataset.count = el.textContent.replace(/[^\d]/g, '');
    cio.observe(el);
  });
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10) || 0;
    var suffix = el.dataset.suffix || '';
    var dur = 1100, t0 = performance.now();
    el.classList.add('counted');
    (function tick(t) {
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  if (matchMedia('(hover:hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest('.destination-card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((y - 0.5) * -7) + 'deg');
      card.style.setProperty('--ry', ((x - 0.5) * 7) + 'deg');
    });
    document.addEventListener('pointerout', function (e) {
      var card = e.target.closest('.destination-card');
      if (card) { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); }
    });
  }

  var hero = document.querySelector('.hero');
  if (hero) {
    var colors = ['rgba(255,255,255,.25)', 'rgba(255,255,255,.16)', 'rgba(232,168,62,.28)', 'rgba(255,255,255,.2)'];
    for (var i = 0; i < 8; i++) {
      var dot = document.createElement('span');
      dot.className = 'fx-float';
      var s = 8 + Math.random() * 14;
      dot.style.width = s + 'px';
      dot.style.height = s + 'px';
      dot.style.left = (4 + Math.random() * 92) + '%';
      dot.style.top = (6 + Math.random() * 88) + '%';
      dot.style.background = colors[i % colors.length];
      dot.style.animationDelay = (Math.random() * 6) + 's';
      dot.style.animationDuration = (7 + Math.random() * 7) + 's';
      hero.appendChild(dot);
    }
  }
})();