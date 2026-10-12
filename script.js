'use strict';
(() => {
  const CONFIG_URL = 'verknuepfungen.json';
  const KEYS = {
    lang: 'hp.lang',
    theme: 'hp.theme',
    sort: 'hp.sort',
    category: 'hp.category',
    sublang: 'hp.sublang'
  };
  const LANGS = ['de', 'en'];
  const SORTS = ['default', 'az', 'za', 'category'];
  /* ---------- Texte der Oberfläche ---------- */
  const I18N = {
    de: {
      title: 'Meine Projekte',
      description: 'Eine Sammlung privater Webprojekte, Spiele und nützlicher Experimente.',
      skip: 'Zum Inhalt springen',
      brand: 'Projekte',
      greeting: 'Hallo und willkommen.',
      lead: 'Hier sammle ich meine privaten Projekte, Spiele und nützlichen Experimente. Such dir etwas aus und probier es aus.',
      searchLabel: 'Projekte durchsuchen',
      searchPlaceholder: 'Titel oder Beschreibung suchen',
      categoryGroup: 'Kategorie',
      all: 'Alle',
      langFilter: 'Sprache des Projekts',
      allLanguages: 'Alle Sprachen',
      sort: 'Sortierung',
      sortDefault: 'Standard',
      sortAz: 'Titel A bis Z',
      sortZa: 'Titel Z bis A',
      sortCategory: 'Nach Kategorie',
      one: '1 Projekt',
      many: '{n} Projekte',
      emptyTitle: 'Keine Projekte gefunden',
      emptyText: 'Passe die Suche oder die Filter an, um andere Projekte zu sehen.',
      reset: 'Filter zurücksetzen',
      loading: 'Projekte werden geladen',
      errorTitle: 'Projekte konnten nicht geladen werden',
      errorText: 'Prüfe, ob verknuepfungen.json vorhanden und gültig ist. Beim lokalen Testen wird ein HTTP-Server benötigt, file:// funktioniert nicht.',
      configEmpty: 'Es sind noch keine Projekte eingetragen.',
      skipped: '{n} fehlerhafte Einträge in verknuepfungen.json wurden übersprungen. Details stehen in der Browser-Konsole.',
      supported: 'Unterstützte Sprachen',
      uiLang: 'Sprache der Seite',
      toDark: 'Zum dunklen Design wechseln',
      toLight: 'Zum hellen Design wechseln',
      footer: 'Einstellungen werden nur in deinem Browser gespeichert.'
    },
    en: {
      title: 'My projects',
      description: 'A collection of private web projects, games and useful experiments.',
      skip: 'Skip to content',
      brand: 'Projects',
      greeting: 'Hello and welcome.',
      lead: 'This is where I collect my private projects, games and useful experiments. Pick something and try it out.',
      searchLabel: 'Search projects',
      searchPlaceholder: 'Search title or description',
      categoryGroup: 'Category',
      all: 'All',
      langFilter: 'Project language',
      allLanguages: 'All languages',
      sort: 'Sort by',
      sortDefault: 'Default',
      sortAz: 'Title A to Z',
      sortZa: 'Title Z to A',
      sortCategory: 'By category',
      one: '1 project',
      many: '{n} projects',
      emptyTitle: 'No projects found',
      emptyText: 'Adjust the search or the filters to see other projects.',
      reset: 'Reset filters',
      loading: 'Loading projects',
      errorTitle: 'Projects could not be loaded',
      errorText: 'Check that verknuepfungen.json exists and is valid. Local testing needs an HTTP server, file:// does not work.',
      configEmpty: 'No projects have been added yet.',
      skipped: '{n} invalid entries in verknuepfungen.json were skipped. See the browser console for details.',
      supported: 'Supported languages',
      uiLang: 'Page language',
      toDark: 'Switch to dark theme',
      toLight: 'Switch to light theme',
      footer: 'Settings are stored in your browser only.'
    }
  };
  /* ---------- Hilfsfunktionen ---------- */
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const isStr = (v) => typeof v === 'string' && v.trim() !== '';
  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        /* Speicher nicht verfügbar */
}
    }
  };
  /* Rückfallregel: gewählte Sprache, dann die jeweils andere (de/en), dann beliebiger Text. */
  function pick(value, lang) {
    if (typeof value === 'string') return value.trim();
    if (!isObj(value)) return '';
    for (const k of (lang === 'en' ? ['en', 'de'] : ['de', 'en'])) {
      if (isStr(value[k])) return value[k].trim();
    }
    const any = Object.values(value).find(isStr);
    return any ? any.trim() : '';
  }

  function safeLink(raw) {
    if (!isStr(raw)) return null;
    try {
      const u = new URL(raw.trim(), document.baseURI);
      return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
    } catch (e) {
      return null;
    }
  }
  /* Icons: nur lokale PNG- oder SVG-Dateien, immer über <img> (Skripte in SVG werden dort nicht ausgeführt). */
  function safeIcon(raw) {
    if (!isStr(raw)) return null;
    const r = raw.trim();
    if (!/\.(png|svg)$/i.test(r)) return null;
    try {
      const u = new URL(r, document.baseURI);
      return u.origin === location.origin ? u.href : null;
    } catch (e) {
      return null;
    }
  }
  /* ---------- Zustand ---------- */
  const storedLang = store.get(KEYS.lang);
  const storedTheme = store.get(KEYS.theme);
  const state = {
    lang: LANGS.includes(storedLang) ? storedLang : ((navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en'),
    manualTheme: storedTheme === 'light' || storedTheme === 'dark',
    theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
    sort: SORTS.includes(store.get(KEYS.sort)) ? store.get(KEYS.sort) : 'default',
    category: store.get(KEYS.category) || 'all',
    sublang: store.get(KEYS.sublang) || 'all',
    query: '',
    categories: [],
    projects: [],
    languages: [],
    skipped: 0,
    status: 'loading',
    collator: null
  };
  const t = (key, n) => {
    const s = (I18N[state.lang] && I18N[state.lang][key]) || I18N.de[key] || key;
    return n == null ? s : s.replace('{n}', n);
  };
  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    $('#theme-toggle').setAttribute('aria-label', theme === 'dark' ? t('toLight') : t('toDark'));
  }
  /* ---------- Statische Texte ---------- */
  function applyStaticTexts() {
    document.documentElement.lang = state.lang;
    document.title = t('title');
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('description'));
    document.querySelectorAll('[data-i18n]').forEach((n) => {
      n.textContent = t(n.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((n) => n.setAttribute('placeholder', t(n.dataset.i18nPlaceholder)));
    document.querySelectorAll('[data-i18n-aria]').forEach((n) => n.setAttribute('aria-label', t(n.dataset.i18nAria)));
    document.querySelectorAll('#lang-switch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
    $('#theme-toggle').setAttribute('aria-label', state.theme === 'dark' ? t('toLight') : t('toDark'));
  }
  /* ---------- Konfiguration prüfen ---------- */
  function parseConfig(data) {
    let skipped = 0;
    const warn = (msg) => {
      skipped += 1;
      console.warn('[verknuepfungen.json] ' + msg);
    };
    if (!isObj(data) || !Array.isArray(data.Projekte)) throw new Error('Ungültige Struktur: "Projekte" muss eine Liste sein.');
    const categories = [];
    const catIds = new Set();
    (Array.isArray(data.Kategorien) ? data.Kategorien : []).forEach((c, i) => {
      if (!isObj(c) || !isStr(c.ID) || !pick(c.Name, 'de')) return warn('Kategorie #' + (i + 1) + ': ID oder Name fehlt.');
      if (catIds.has(c.ID)) return warn('Kategorie "' + c.ID + '": doppelte ID.');
      catIds.add(c.ID);
      categories.push({
        id: c.ID,
        name: c.Name
      });
    });
    const projects = [];
    const ids = new Set();
    data.Projekte.forEach((p, i) => {
      const label = 'Projekt #' + (i + 1) + (isObj(p) && isStr(p.ID) ? ' ("' + p.ID + '")' : '');
      if (!isObj(p)) return warn(label + ': kein Objekt.');
      if (!isStr(p.ID)) return warn(label + ': ID fehlt.');
      if (ids.has(p.ID)) return warn(label + ': doppelte ID.');
      if (!pick(p.Titel, 'de')) return warn(label + ': Titel fehlt.');
      if (!pick(p.Beschreibung, 'de')) return warn(label + ': Beschreibung fehlt.');
      const href = safeLink(p.Weiterleitung);
      if (!href) return warn(label + ': Weiterleitung fehlt oder ist ungültig.');
      if (!catIds.has(p.Kategorie)) return warn(label + ': Kategorie "' + p.Kategorie + '" ist nicht definiert.');
      if (!Array.isArray(p.Sprachen)) return warn(label + ': Sprachen muss eine Liste sein.');
      const icon = safeIcon(p.Icon);
      if (p.Icon != null && !icon) console.warn('[verknuepfungen.json] ' + label + ': Icon wird ignoriert (nur lokale PNG/SVG-Pfade).');
      ids.add(p.ID);
      projects.push({
        id: p.ID,
        order: projects.length,
        titleSrc: p.Titel,
        descSrc: p.Beschreibung,
        href,
        icon,
        category: p.Kategorie,
        languages: [...new Set(p.Sprachen.filter(isStr).map((l) => l.trim().toLowerCase()))],
        title: '',
        desc: '',
        catName: '',
        node: null
      });
    });
    const used = new Set(projects.map((p) => p.category));
    return {
      categories: categories.filter((c) => used.has(c.id)),
      projects,
      skipped
    };
  }
  /* ---------- Sprachabhängige Daten ---------- */
  function refreshLocalized() {
    state.collator = new Intl.Collator(state.lang, {
      sensitivity: 'base',
      numeric: true
    });
    const catName = new Map(state.categories.map((c) => [c.id, pick(c.name, state.lang)]));
    state.projects.forEach((p) => {
      p.title = pick(p.titleSrc, state.lang);
      p.desc = pick(p.descSrc, state.lang);
      p.catName = catName.get(p.category) || '';
      p.node = null;
    });
  }

  function langName(code) {
    try {
      const n = new Intl.DisplayNames([state.lang], {
        type: 'language'
      }).of(code);
      if (n && n !== code) return n;
    } catch (e) {
      /* Rückfall unten */
}
    return code.toUpperCase();
  }
  /* ---------- Rendering ---------- */
  function monogram(title) {
    const m = el('span', 'monogram', (title.trim().charAt(0) || '?').toUpperCase());
    m.setAttribute('aria-hidden', 'true');
    return m;
  }

  function buildCard(p) {
    const li = el('li');
    const a = el('a', 'card');
    a.href = p.href;
    if (new URL(p.href).origin !== location.origin) a.rel = 'noopener';
    if (p.icon) {
      const img = new Image(48, 48);
      img.className = 'card-icon';
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', () => img.replaceWith(monogram(p.title)), {
        once: true
      });
      img.src = p.icon;
      a.append(img);
    } else {
      a.append(monogram(p.title));
    }
    a.append(el('h3', 'card-title', p.title), el('p', 'card-desc', p.desc));
    const meta = el('ul', 'card-meta');
    if (p.catName) meta.append(el('li', 'badge', p.catName));
    p.languages.forEach((code) => {
      const b = el('li', 'badge', code.toUpperCase());
      b.title = t('supported') + ': ' + langName(code);
      meta.append(b);
    });
    if (meta.children.length) a.append(meta);
    li.append(a);
    return li;
  }

  function renderCategories() {
    const box = $('#categories');
    const make = (id, label) => {
      const b = el('button', 'chip', label);
      b.type = 'button';
      b.dataset.id = id;
      b.setAttribute('aria-pressed', String(state.category === id));
      return b;
    };
    box.replaceChildren(make('all', t('all')), ...state.categories.map((c) => make(c.id, pick(c.name, state.lang))));
    box.hidden = state.categories.length === 0;
  }

  function renderSelects() {
    const sub = $('#sublang');
    sub.replaceChildren(new Option(t('allLanguages'), 'all'), ...state.languages.map((c) => new Option(langName(c), c)));
    sub.value = state.sublang;
    sub.disabled = state.languages.length === 0;
    const sort = $('#sort');
    const labels = {
      default: t('sortDefault'),
      az: t('sortAz'),
      za: t('sortZa'),
      category: t('sortCategory')
    };
    sort.replaceChildren(...SORTS.map((s) => new Option(labels[s], s)));
    sort.value = state.sort;
  }

  function visibleProjects() {
    const q = state.query.trim().toLocaleLowerCase(state.lang);
    const terms = q ? q.split(/\s+/) : [];
    const cmp = state.collator.compare;
    const list = state.projects.filter((p) => {
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (state.sublang !== 'all' && !p.languages.includes(state.sublang)) return false;
      if (!terms.length) return true;
      const hay = (p.title + ' ' + p.desc).toLocaleLowerCase(state.lang);
      return terms.every((term) => hay.includes(term));
    });
    const byOrder = (a, b) => a.order - b.order;
    if (state.sort === 'az') list.sort((a, b) => cmp(a.title, b.title) || byOrder(a, b));
    else if (state.sort === 'za') list.sort((a, b) => cmp(b.title, a.title) || byOrder(a, b));
    else if (state.sort === 'category') list.sort((a, b) => cmp(a.catName, b.catName) || cmp(a.title, b.title) || byOrder(a, b));
    else list.sort(byOrder);
    return list;
  }

  function update() {
    const grid = $('#grid');
    const status = $('#status');
    const empty = $('#empty');
    if (state.status === 'loading') {
      status.textContent = t('loading');
      return;
    }
    if (state.status === 'error') {
      grid.replaceChildren();
      empty.hidden = true;
      status.textContent = '';
      return;
    }
    const list = visibleProjects();
    grid.replaceChildren(...list.map((p) => p.node || (p.node = buildCard(p))));
    status.textContent = list.length === 1 ? t('one') : t('many', list.length);
    empty.hidden = list.length !== 0;
    if (!state.projects.length) {
      empty.querySelector('h2').textContent = t('configEmpty');
      empty.querySelector('p').hidden = true;
      empty.querySelector('button').hidden = true;
    } else {
      empty.querySelector('h2').textContent = t('emptyTitle');
      empty.querySelector('p').hidden = false;
      empty.querySelector('button').hidden = false;
    }
  }

  function renderNotice() {
    const n = $('#notice');
    n.replaceChildren();
    if (state.status === 'error') {
      n.append(el('h2', null, t('errorTitle')), el('p', null, t('errorText')));
      n.hidden = false;
    } else if (state.skipped > 0) {
      n.append(el('p', null, t('skipped', state.skipped)));
      n.hidden = false;
    } else {
      n.hidden = true;
    }
  }

  function renderAll() {
    applyStaticTexts();
    renderCategories();
    renderSelects();
    renderNotice();
    update();
  }
  /* ---------- Änderungen ---------- */
  function setLang(lang) {
    if (!LANGS.includes(lang) || lang === state.lang) return;
    state.lang = lang;
    store.set(KEYS.lang, lang);
    refreshLocalized();
    renderAll();
  }

  function setCategory(id) {
    state.category = id;
    store.set(KEYS.category, id);
    renderCategories();
    update();
  }

  function resetFilters() {
    state.query = '';
    $('#search').value = '';
    state.category = 'all';
    state.sublang = 'all';
    store.set(KEYS.category, 'all');
    store.set(KEYS.sublang, 'all');
    renderCategories();
    renderSelects();
    update();
  }

  function bindEvents() {
    $('#lang-switch').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-lang]');
      if (b) setLang(b.dataset.lang);
    });
    $('#theme-toggle').addEventListener('click', () => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      state.manualTheme = true;
      store.set(KEYS.theme, next);
      applyTheme(next);
    });
    if (window.matchMedia) {
      const mq = matchMedia('(prefers-color-scheme: dark)');
      const onChange = (e) => {
        if (!state.manualTheme) applyTheme(e.matches ? 'dark' : 'light');
      };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
    }
    const search = $('#search');
    search.addEventListener('input', () => {
      state.query = search.value;
      update();
    });
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && search.value) {
        search.value = '';
        state.query = '';
        update();
      }
    });
    $('#categories').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-id]');
      if (b) setCategory(b.dataset.id);
    });
    $('#sublang').addEventListener('change', (e) => {
      state.sublang = e.target.value;
      store.set(KEYS.sublang, state.sublang);
      update();
    });
    $('#sort').addEventListener('change', (e) => {
      state.sort = e.target.value;
      store.set(KEYS.sort, state.sort);
      update();
    });
    $('#reset').addEventListener('click', resetFilters);
  }
  /* ---------- Start ---------- */
  async function init() {
    bindEvents();
    state.collator = new Intl.Collator(state.lang, {
      sensitivity: 'base',
      numeric: true
    });
    applyStaticTexts();
    renderSelects();
    update();
    try {
      const res = await fetch(CONFIG_URL, {
        cache: 'no-cache'
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const parsed = parseConfig(await res.json());
      state.categories = parsed.categories;
      state.projects = parsed.projects;
      state.skipped = parsed.skipped;
      state.languages = [...new Set(parsed.projects.flatMap((p) => p.languages))].sort();
      if (state.category !== 'all' && !state.categories.some((c) => c.id === state.category)) state.category = 'all';
      if (state.sublang !== 'all' && !state.languages.includes(state.sublang)) state.sublang = 'all';
      state.status = 'ok';
      refreshLocalized();
    } catch (err) {
      console.error('[Homepage] Konfiguration konnte nicht geladen werden:', err);
      state.status = 'error';
    }
    renderAll();
  }
  init();
})();
