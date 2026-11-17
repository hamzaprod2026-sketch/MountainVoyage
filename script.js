/* ==========================================================
   MOUNTAIN VOYAGE – script.js
   ========================================================== */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Header transparent -> solide ---------- */
  var header = $('#header');
  var heroBg = $('#heroBg');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('solid', y > 60);
    if (heroBg && y < window.innerHeight) heroBg.style.transform = 'translateY(' + y * 0.25 + 'px)'; // parallaxe légère
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  var burger = $('#burger'), nav = $('#nav');
  function closeMenu() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- Apparition au défilement ---------- */
  var targets = $$('.head, .about-grid, .trip, .exp-grid, .why-grid, .contact-grid, .dest-grid');
  targets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else { targets.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Circuits : afficher / masquer le détail ---------- */
  $$('.toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var detail = btn.nextElementSibling;
      var open = detail.hidden;
      detail.hidden = !open;
      btn.setAttribute('aria-expanded', open);
      btn.textContent = open ? 'Masquer le circuit' : 'Voir le circuit';
    });
  });

  /* ---------- Préremplir le formulaire depuis les cartes et la recherche ---------- */
  var destSel = $('#destination');
  function setDest(v) {
    if (!v) return;
    $$('option', destSel).forEach(function (o) { if (o.value === v || o.text === v) destSel.value = o.value || o.text; });
  }
  $$('[data-dest]').forEach(function (el) {
    el.addEventListener('click', function () { setDest(el.getAttribute('data-dest')); });
  });
  $('#quick').addEventListener('submit', function (e) {
    e.preventDefault();
    setDest($('#qDest').value);
    if ($('#qDate').value) $('#date').value = $('#qDate').value;
    $('#pax').value = $('#qPax').value || 2;
    $('#contact').scrollIntoView({ behavior: 'smooth' });
  });
  $('#date').min = $('#qDate').min = new Date().toISOString().split('T')[0];

  /* ---------- Galerie + lightbox ---------- */
  var base = 'https://www.mountain-voyage.com/assets/img/gallery/gallery-';
  var imgs = [];
  for (var i = 1; i <= 8; i++) imgs.push(base + i + '.jpg');
  var gal = $('#gal'), lb = $('#lb'), lbImg = $('img', lb), cur = 0;
  imgs.forEach(function (src, idx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Agrandir la photo ' + (idx + 1));
    b.innerHTML = '<img loading="lazy" alt="Photo ' + (idx + 1) + ' de la galerie Mountain Voyage" src="' + src + '">';
    b.addEventListener('click', function () { show(idx); });
    gal.appendChild(b);
  });
  function show(n) {
    cur = (n + imgs.length) % imgs.length;
    lbImg.src = imgs[cur];
    lbImg.alt = 'Photo ' + (cur + 1) + ' sur ' + imgs.length;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function hide() { lb.hidden = true; document.body.style.overflow = ''; }
  $('.lb-close', lb).addEventListener('click', hide);
  $('.prev', lb).addEventListener('click', function () { show(cur - 1); });
  $('.next', lb).addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) hide(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') hide();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

  /* ---------- Citations : onglets ---------- */
  var tabs = $$('.qtabs button'), quotes = $$('.q');
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t); });
      quotes.forEach(function (q, j) { q.classList.toggle('show', i === j); });
    });
  });

  /* ---------- Formulaire : validation + envoi par e-mail ---------- */
  var form = $('#form'), status = $('#status');
  var RECIPIENT = 'info@mountain-voyage.com'; // remplacer par un service d'envoi (Formspree, backend...) si besoin
  var rules = {
    prenom: function (v) { return v.trim().length > 1 || 'Indiquez votre prénom.'; },
    nom: function (v) { return v.trim().length > 1 || 'Indiquez votre nom.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Saisissez une adresse e-mail valide.'; },
    tel: function (v) { return /^[+\d][\d\s().-]{6,}$/.test(v.trim()) || 'Saisissez un numéro de téléphone valide.'; },
    destination: function (v) { return !!v || 'Choisissez une destination.'; },
    date: function (v) { return !!v || 'Choisissez une date de voyage.'; },
    pax: function (v) { return (+v >= 1) || 'Indiquez au moins 1 participant.'; }
  };
  function check(id) {
    var el = $('#' + id), res = rules[id](el.value), msg = $('small', el.parentNode);
    el.classList.toggle('err', res !== true);
    msg.textContent = res === true ? '' : res;
    return res === true;
  }
  Object.keys(rules).forEach(function (id) { $('#' + id).addEventListener('blur', function () { check(id); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) { status.textContent = 'Merci de corriger les champs signalés.'; return; }
    var v = function (id) { return $('#' + id).value.trim(); };
    var body = 'Nom : ' + v('prenom') + ' ' + v('nom') + '\nE-mail : ' + v('email') + '\nTéléphone : ' + v('tel') +
      '\nDestination : ' + v('destination') + '\nDate du voyage : ' + v('date') + '\nParticipants : ' + v('pax') +
      '\n\nMessage :\n' + v('message');
    window.location.href = 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent('Demande de voyage – ' + v('destination')) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Votre messagerie s’ouvre avec votre demande. Envoyez-la pour finaliser.';
  });

  $('#year').textContent = new Date().getFullYear();
})();
