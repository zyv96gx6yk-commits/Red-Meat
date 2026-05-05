/* Red Meat Bograshov — runtime
   - Bilingual switching (HE/EN with RTL/LTR)
   - Menu tab control (a11y-correct ARIA tabs)
   - Mobile nav toggle
   - Accessibility panel (modes persist via localStorage)
   - Hours-now indicator
   - Lightweight contact form validation (no backend)
*/
(function () {
  'use strict';

  /* =========================================================
     ⬇⬇⬇ EDIT THESE URLS WHEN YOU GET YOUR REAL RESTAURANT PAGES ⬇⬇⬇
     Every <a data-link="..."> on the site reads from this map,
     so you only update them in ONE place.
     ========================================================= */
  const LINKS = {
    wolt:     'https://wolt.com/en/isr/tel-aviv',           // <-- replace with your Wolt page
    tenbis:   'https://www.10bis.co.il/',                   // <-- replace with your 10bis page
    mishloha: 'https://www.mishloha.co.il/',                // <-- replace with your Mishloha page
    waze:     'https://waze.com/ul?q=Bograshov%209%20Tel%20Aviv',
    gmaps:    'https://maps.app.goo.gl/ZKso4oRaaqG4Py2k8?g_st=ic'
  };
  document.querySelectorAll('a[data-link]').forEach(a => {
    const k = a.getAttribute('data-link');
    if (LINKS[k]) a.setAttribute('href', LINKS[k]);
  });

  /* Hide menu-item images that haven't been provided yet
     (image is optional per item; if no <img> child exists, nothing happens). */
  document.querySelectorAll('.menu-item__img').forEach(img => {
    if (!img.getAttribute('src')) img.parentElement && img.parentElement.classList.remove('menu-item--with-image');
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });

  const I18N = window.RM_I18N || { he: {}, en: {} };

  /* -------- HOURS (declared early; used by applyLang) -------- */
  // Sun=0 .. Sat=6
  const HOURS = [
    { open: '11:00', close: '02:00' }, // Sun
    { open: '11:00', close: '02:00' }, // Mon
    { open: '11:00', close: '02:00' }, // Tue
    { open: '11:00', close: '02:00' }, // Wed
    { open: '11:00', close: '03:00' }, // Thu
    { open: '11:00', close: '16:00' }, // Fri
    { open: '19:00', close: '03:00' }  // Sat
  ];
  function toMin(s) { const [h,m] = s.split(':').map(Number); return h*60 + m; }
  function isOpenNow(now) {
    const day = now.getDay();
    const minutes = now.getHours()*60 + now.getMinutes();
    const today = HOURS[day];
    const o = toMin(today.open), c = toMin(today.close);
    const todayClose = c <= o ? c + 24*60 : c;
    if (minutes >= o && minutes < todayClose) return { open: true, closesAt: today.close };
    const yest = HOURS[(day + 6) % 7];
    const yo = toMin(yest.open), yc = toMin(yest.close);
    if (yc <= yo && minutes < yc) return { open: true, closesAt: yest.close };
    return { open: false, opensAt: today.open };
  }
  function updateHoursIndicator() {
    const el = document.getElementById('topbar-hours');
    if (!el) return;
    const lang = document.documentElement.lang;
    const dict = I18N[lang] || I18N.he;
    const r = isOpenNow(new Date());
    if (r.open) {
      el.innerHTML = '<strong style="color:#3ddc84">●</strong> ' + dict['hours.openNow'] + ' · ' + dict['hours.closesAt'] + r.closesAt;
    } else {
      el.innerHTML = '<strong style="color:#ff5e5e">●</strong> ' + dict['hours.closedNow'] + ' · ' + dict['hours.opensAt'] + r.opensAt;
    }
    const rows = document.querySelectorAll('.hours tr');
    rows.forEach((tr, i) => tr.classList.toggle('is-today', i === new Date().getDay()));
  }

  /* -------- LANGUAGE -------- */
  const LANG_KEY = 'rm_lang';
  const params = new URLSearchParams(location.search);
  const initialLang = params.get('lang') ||
                      localStorage.getItem(LANG_KEY) ||
                      (document.documentElement.lang || 'he');

  function applyLang(lang) {
    const dict = I18N[lang] || I18N.he;
    document.documentElement.lang = lang;
    document.documentElement.dir = (lang === 'he') ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) {
        if (el.hasAttribute('content')) el.setAttribute('content', dict[key]);
        else el.textContent = dict[key];
      }
    });

    if (dict['meta.title']) document.title = dict['meta.title'];

    const switchBtn = document.querySelector('#lang-switch [data-lang-label]');
    if (switchBtn) switchBtn.textContent = (lang === 'he') ? 'EN' : 'עב';

    localStorage.setItem(LANG_KEY, lang);
    updateHoursIndicator();
  }

  document.getElementById('lang-switch').addEventListener('click', () => {
    const next = (document.documentElement.lang === 'he') ? 'en' : 'he';
    applyLang(next);
  });

  applyLang(initialLang);

  /* -------- NAV TOGGLE -------- */
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  navToggle.addEventListener('click', () => {
    const open = nav.getAttribute('data-open') === 'true';
    nav.setAttribute('data-open', String(!open));
    navToggle.setAttribute('aria-expanded', String(!open));
  });
  // Close on nav link click (mobile)
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      nav.setAttribute('data-open', 'false');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* -------- MENU TABS -------- */
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');
  function activate(tabId) {
    tabs.forEach(t => {
      const active = t.dataset.target === tabId;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.setAttribute('tabindex', active ? '0' : '-1');
    });
    panels.forEach(p => {
      const active = p.id === tabId;
      p.classList.toggle('is-active', active);
      if (active) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activate(t.dataset.target));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = (document.documentElement.dir === 'rtl' ? -1 : 1) *
                    (e.key === 'ArrowRight' ? 1 : -1);
        const next = (i + dir + tabs.length) % tabs.length;
        tabs[next].focus();
        activate(tabs[next].dataset.target);
      } else if (e.key === 'Home') {
        e.preventDefault(); tabs[0].focus(); activate(tabs[0].dataset.target);
      } else if (e.key === 'End') {
        e.preventDefault(); tabs[tabs.length-1].focus(); activate(tabs[tabs.length-1].dataset.target);
      }
    });
  });

  /* -------- ACCESSIBILITY PANEL -------- */
  const A11Y_KEY = 'rm_a11y';
  const a11yToggle = document.getElementById('a11y-toggle');
  const a11yPanel = document.getElementById('a11y-panel');
  const a11yClose = document.getElementById('a11y-close');
  const a11yReset = document.getElementById('a11y-reset');
  const a11yButtons = a11yPanel.querySelectorAll('[data-a11y]');

  function loadA11y() {
    let modes = [];
    try { modes = JSON.parse(localStorage.getItem(A11Y_KEY) || '[]'); } catch (e) {}
    modes.forEach(m => document.documentElement.classList.add('a11y-' + m));
    syncA11yButtons();
  }
  function saveA11y() {
    const classes = Array.from(document.documentElement.classList)
      .filter(c => c.startsWith('a11y-'))
      .map(c => c.replace(/^a11y-/, ''));
    localStorage.setItem(A11Y_KEY, JSON.stringify(classes));
  }
  function syncA11yButtons() {
    a11yButtons.forEach(b => {
      const cls = 'a11y-' + b.dataset.a11y;
      b.classList.toggle('is-active', document.documentElement.classList.contains(cls));
    });
  }
  function toggleA11y(open) {
    if (open) {
      a11yPanel.removeAttribute('hidden');
      a11yToggle.setAttribute('aria-expanded', 'true');
      a11yClose.focus();
    } else {
      a11yPanel.setAttribute('hidden', '');
      a11yToggle.setAttribute('aria-expanded', 'false');
      a11yToggle.focus();
    }
  }
  a11yToggle.addEventListener('click', () => toggleA11y(a11yPanel.hasAttribute('hidden')));
  a11yClose.addEventListener('click', () => toggleA11y(false));
  a11yPanel.addEventListener('click', (e) => { if (e.target === a11yPanel) toggleA11y(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !a11yPanel.hasAttribute('hidden')) toggleA11y(false);
  });

  // Modes that conflict with each other
  const contrastModes = ['contrast-high', 'contrast-invert', 'contrast-mono'];

  a11yButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.a11y;
      const html = document.documentElement;
      const cls = 'a11y-' + mode;

      if (contrastModes.includes(mode)) {
        contrastModes.forEach(m => { if (m !== mode) html.classList.remove('a11y-' + m); });
      }
      if (mode === 'text-larger') {
        if (html.classList.contains('a11y-text-larger')) {
          html.classList.replace('a11y-text-larger', 'a11y-text-larger-2');
        } else if (html.classList.contains('a11y-text-larger-2')) {
          html.classList.remove('a11y-text-larger-2');
        } else {
          html.classList.remove('a11y-text-smaller');
          html.classList.add('a11y-text-larger');
        }
      } else if (mode === 'text-smaller') {
        html.classList.remove('a11y-text-larger', 'a11y-text-larger-2');
        html.classList.toggle('a11y-text-smaller');
      } else {
        html.classList.toggle(cls);
      }

      syncA11yButtons();
      saveA11y();
    });
  });

  a11yReset.addEventListener('click', () => {
    const html = document.documentElement;
    Array.from(html.classList).filter(c => c.startsWith('a11y-')).forEach(c => html.classList.remove(c));
    localStorage.removeItem(A11Y_KEY);
    syncA11yButtons();
  });

  loadA11y();

  /* Hours indicator runs once a minute to keep "Open / Closed" fresh. */
  updateHoursIndicator();
  setInterval(updateHoursIndicator, 60 * 1000);

  /* -------- CONTACT FORM (client-side only) -------- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('form-status');
      const dict = I18N[document.documentElement.lang] || I18N.he;
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const message = form.message.value.trim();
      if (!name || !phone || !message) {
        status.textContent = dict['contact.err'];
        status.dataset.state = 'err';
        return;
      }
      // No backend wired yet — the static site sends as a tel:/mailto fallback.
      const subject = encodeURIComponent('פנייה מהאתר — ' + name);
      const body = encodeURIComponent(`שם: ${name}\nטלפון: ${phone}\n\n${message}`);
      window.location.href = `mailto:hello@redmeat-bograshov.co.il?subject=${subject}&body=${body}`;
      status.textContent = dict['contact.ok'];
      status.dataset.state = 'ok';
      form.reset();
    });
  }

  /* -------- YEAR -------- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
