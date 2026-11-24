/* Uși Teracotă — prototip interfață nouă (fără build, fără dependențe). */
(function () {
  'use strict';

  var D = window.CATALOG, I18N = window.I18N;
  var PHONE = '+36 20 375 1383', PHONE_HREF = 'tel:+36203751383', EMAIL = 'usiteracota@gmail.com';

  /* ------------------------------------------------------------------ state */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('ut_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('ut_' + k, JSON.stringify(v)); } catch (e) { /* storage indisponibil */ } }
  };
  var state = { lang: store.get('lang', 'ro'), cart: store.get('cart', {}), favs: store.get('favs', []) };
  if (!I18N[state.lang]) state.lang = 'ro';
  var onCartChange = null;

  /* ---------------------------------------------------------------- helpers */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function t(key, vars) {
    var v = I18N[state.lang][key];
    if (v == null) v = I18N.ro[key];
    if (v == null) return key;
    if (vars && typeof v === 'string') Object.keys(vars).forEach(function (k) { v = v.replace('{' + k + '}', vars[k]); });
    return v;
  }
  function locale() { return state.lang === 'hu' ? 'hu-HU' : 'ro-RO'; }
  function num(n, dec) { return new Intl.NumberFormat(locale(), { minimumFractionDigits: dec || 0, maximumFractionDigits: dec == null ? 1 : dec }).format(n); }
  function money(n) { return num(n, n % 1 ? 2 : 0) + ' RON'; }
  function priceHtml(n) { return '<span class="price">' + num(n, n % 1 ? 2 : 0) + '<small>RON</small></span>'; }
  function catName(id) { return (I18N[state.lang].cats || I18N.ro.cats)[id] || ''; }
  function dims(a) { return a ? a.slice(0, 2).join(' × ') + ' mm' : ''; }
  function kg(w) { return num(w, w % 1 ? 1 : 0) + ' kg'; }

  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cart: '<path d="M3 4h2.2l2.3 11h10.2l2-7.5H7"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    cartplus: '<path d="M3 4h2.2l2.3 11h10.2l1.1-4"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/><path d="M17 2.5v6M14 5.5h6"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    phone: '<path d="M6.5 3h3L11 7 9 8.5a11 11 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    truck: '<path d="M2.5 6h11v10h-11zM13.5 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.5 3 7.5 7 9.5 4-2 7-5 7-9.5V6z"/><path d="m9 12 2.2 2.2L15 10.5"/>',
    flame: '<path d="M12 21c-3.6 0-6-2.3-6-5.5 0-3.200 2.700-4.500 3.300-8 4 2 8.700 5.200 8.700 9 0 2.700-2.400 4.500-6 4.500z"/>',
    ruler: '<path d="M3 16 16 3l5 5L8 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    chevr: '<path d="m9 6 6 6-6 6"/>',
    chevl: '<path d="m15 6-6 6 6 6"/>',
    trash: '<path d="M5 7h14M10 7V4.5h4V7M7 7l.8 12h8.4L17 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5.5 3.5-5.5 3.5z"/>',
    print: '<path d="M7 8V4h10v4M7 17H4.5v-7h15v7H17"/><rect x="7" y="14" width="10" height="6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.500-7"/>',
    cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    weight: '<path d="M6 8h12l2 12H4z"/><circle cx="12" cy="5.5" r="2.5"/>',
    pin: '<path d="M12 21s-6.5-6-6.500-11a6.500 6.500 0 0 1 13 0c0 5-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.01"/>',
    undo: '<path d="M8 5 4 9l4 4"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'
  };
  function icon(name, cls) { return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>'; }

  /* ------------------------------------------------------------- catalogue */
  var P = D.products, BYID = {}, CAT = {};
  D.categories.forEach(function (c) { CAT[c.id] = c; });
  P.forEach(function (p, i) {
    BYID[p.id] = p; p.order = i;
    var nName = norm(p.name), nAll = norm([p.name, p.short, p.specs.join(' ')].join(' '));
    p.hay = norm([p.name, p.sku, CAT[p.cat].name, CAT[p.cat].title, p.short].join(' '));
    p.f = {
      glass: /sticl|geam|robax|vitro/.test(nAll),
      thermo: /termometru/.test(nAll) && p.cat !== 60,
      ash: /cenusar|sertar/.test(nName) && p.cat !== 26,
      kit: /^kit\b|\bset\b|ansamblu/.test(norm(p.name + ' ' + p.short)),
      single: p.weight != null && p.weight <= 25
    };
    var tok = p.name.split(/\s+/).filter(function (w) { return /^[A-Z]{2,}/.test(w) && w !== 'KIT'; })[0] || '';
    p.family = (tok.match(/^[A-Z]+/) || [''])[0];
  });
  var FEATS = ['glass', 'thermo', 'ash', 'kit', 'single'];

  function shipFor(weight) {
    if (!weight) return 0;
    var w = Math.max(1, Math.ceil(weight));
    for (var i = 0; i < D.shipping.length; i++) if (w >= D.shipping[i].from && w <= D.shipping[i].to) return D.shipping[i].price;
    return null; // peste tabel
  }

  /* ------------------------------------------------------------------ cart */
  function cartLines() {
    return Object.keys(state.cart).map(function (id) { return { p: BYID[id], qty: state.cart[id] }; }).filter(function (l) { return l.p && l.qty > 0; });
  }
  function cartTotals() {
    var lines = cartLines(), sub = 0, weight = 0, count = 0;
    lines.forEach(function (l) { sub += l.p.price * l.qty; weight += (l.p.weight || 1) * l.qty; count += l.qty; });
    var ship = lines.length ? shipFor(weight) : 0;
    return { lines: lines, sub: sub, weight: weight, count: count, ship: ship, total: sub + (ship || 0), parcels: Math.max(1, Math.ceil(weight / 25)) };
  }
  function saveCart() {
    store.set('cart', state.cart);
    renderCart(); updateCounts();
    if (onCartChange) onCartChange();
  }
  function addToCart(id, qty) {
    state.cart[id] = Math.min(99, (state.cart[id] || 0) + (qty || 1));
    saveCart();
    toast(t('added') + ': ' + BYID[id].name, t('cart'), openCart);
  }
  function setQty(id, qty) {
    if (qty <= 0) delete state.cart[id]; else state.cart[id] = Math.min(99, qty);
    saveCart();
  }
  function toggleFav(id) {
    var i = state.favs.indexOf(id);
    if (i >= 0) state.favs.splice(i, 1); else state.favs.push(id);
    store.set('favs', state.favs);
    $$('[data-fav="' + id + '"]').forEach(function (b) { b.setAttribute('aria-pressed', i < 0); b.setAttribute('aria-label', t(i < 0 ? 'fav.remove' : 'fav.add')); });
    updateCounts();
  }
  function updateCounts() {
    var c = $('#cart-count'), f = $('#fav-count'), n = cartTotals().count;
    if (c) { c.textContent = n; c.dataset.n = n; }
    if (f) { f.textContent = state.favs.length; f.dataset.n = state.favs.length; }
  }

  /* ----------------------------------------------------------- UI fragments */
  function img(src, alt, extra) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async" referrerpolicy="no-referrer"' + (extra || '') + '>';
  }
  function badges(p, fit) {
    var h = '';
    if (fit != null) h += '<span class="badge badge--fit">' + icon('check', 'ico--sm') + (fit === 0 ? t('fit.exact') : t('fit.diff', { n: fit })) + '</span>';
    if (p.promo) h += '<span class="badge badge--promo">' + t('badge.promo') + '</span>';
    if (p.isNew) h += '<span class="badge badge--new">' + t('badge.new') + '</span>';
    return h ? '<div class="card__badges">' + h + '</div>' : '';
  }
  function favBtn(p) {
    var on = state.favs.indexOf(p.id) >= 0;
    return '<button class="favbtn" type="button" data-fav="' + p.id + '" aria-pressed="' + on + '" aria-label="' + t(on ? 'fav.remove' : 'fav.add') + '">' + icon('heart') + '</button>';
  }
  function card(p, fit) {
    var meta = '';
    if (p.mount) meta += '<span>' + icon('ruler') + t('card.mount') + ' ' + dims(p.mount) + '</span>';
    else if (p.ext) meta += '<span>' + icon('ruler') + t('card.ext') + ' ' + dims(p.ext) + '</span>';
    if (p.weight) meta += '<span>' + icon('weight') + kg(p.weight) + '</span>';
    return '<article class="card">' +
      '<div class="card__img">' + badges(p, fit) + favBtn(p) + img(p.img, p.name) + '</div>' +
      '<div class="card__body">' +
        '<div class="card__cat">' + esc(catName(p.cat)) + ' · ' + esc(p.sku) + '</div>' +
        '<h3 class="card__name"><a href="#/p/' + p.id + '">' + esc(p.name) + '</a></h3>' +
        '<div class="card__meta">' + meta + '</div>' +
        '<div class="card__foot">' + priceHtml(p.price) +
          '<button class="btn btn--primary addbtn" type="button" data-add="' + p.id + '" aria-label="' + t('add') + ': ' + esc(p.name) + '" title="' + t('add') + '">' + icon('cartplus') + '</button>' +
        '</div>' +
      '</div></article>';
  }
  function crumbs(items) {
    return '<nav class="crumbs wrap" aria-label="breadcrumb"><a href="#/">' + t('nav.home') + '</a>' + items.map(function (it) {
      return '<span class="sep">/</span>' + (it[1] ? '<a href="' + it[1] + '">' + esc(it[0]) + '</a>' : '<span>' + esc(it[0]) + '</span>');
    }).join('') + '</nav>';
  }
  function logo() {
    return '<a class="logo" href="#/" aria-label="Uși Teracotă">' +
      '<svg class="logo__mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="9" fill="#1e1b1a"/>' +
      '<path d="M11 31V18a9 9 0 0 1 18 0v13z" fill="none" stroke="#d9480f" stroke-width="2.6"/>' +
      '<path d="M20 28.5c-2.9 0-4.6-1.9-4.6-4.2 0-2.400 2-3.400 2.600-6 3.100 1.600 6.600 4 6.600 6.800 0 2-1.700 3.400-4.600 3.400z" fill="#f59f00"/></svg>' +
      '<span><span class="logo__name">Uși <em>Teracotă</em></span><span class="logo__tag">' + t('brand.tag') + '</span></span></a>';
  }

  /* ------------------------------------------------------------ site chrome */
  function renderChrome() {
    document.documentElement.lang = state.lang;
    $('.skip').textContent = t('skip');
    $('#protobar').innerHTML = '<div class="wrap"><b>' + t('pb.label') + '</b><span class="protobar__text">' + t('pb.text') + '</span>' +
      '<button class="pb-new" type="button" data-new>' + t('pb.new') + '</button>' +
      '<span class="lang" role="group" aria-label="Limba / Nyelv">' +
      ['ro', 'hu'].map(function (l) { return '<button type="button" data-lang="' + l + '" aria-pressed="' + (state.lang === l) + '">' + l.toUpperCase() + '</button>'; }).join('') +
      '</span></div>';

    var megaItems = D.categories.map(function (c) { return '<a href="#/produse?cat=' + c.id + '">' + esc(catName(c.id)) + '<small>' + c.count + '</small></a>'; }).join('');
    $('#site-header').innerHTML =
      '<div class="topline"><div class="wrap">' +
        '<a href="' + PHONE_HREF + '">' + icon('phone', 'ico--sm') + PHONE + '</a><span class="hide-md">' + t('top.phone') + '</span>' +
        '<span class="sp"></span><span>' + icon('truck', 'ico--sm') + t('top.ship') + '</span><span class="hide-md">' + icon('cash', 'ico--sm') + t('top.cod') + '</span>' +
      '</div></div>' +
      '<div class="wrap headrow">' +
        '<button class="iconbtn burger" type="button" data-nav-open aria-label="' + t('menu') + '">' + icon('menu') + '</button>' +
        logo() +
        '<div class="search" role="search">' + icon('search') +
          '<input id="q" type="search" autocomplete="off" placeholder="' + t('search.ph') + '" aria-label="' + t('search.label') + '">' +
          '<div class="suggest" id="suggest" hidden></div></div>' +
        '<div class="actions">' +
          '<a class="iconbtn" href="#/favorite">' + icon('heart') + '<span class="lbl">' + t('fav') + '</span><span class="count" id="fav-count" data-n="0">0</span></a>' +
          '<button class="iconbtn" type="button" data-cart-open>' + icon('cart') + '<span class="lbl">' + t('cart') + '</span><span class="count" id="cart-count" data-n="0">0</span></button>' +
        '</div>' +
      '</div>' +
      '<nav class="navrow" aria-label="' + t('menu') + '"><div class="wrap">' +
        '<div class="mega"><a class="navlink" href="#/produse" data-nav="produse">' + t('nav.products') + icon('chev', 'ico--sm') + '</a>' +
          '<div class="mega__panel"><a class="mega__all" href="#/produse">' + t('nav.all') + '<small>' + P.length + '</small></a>' + megaItems + '</div></div>' +
        '<a class="navlink navlink--accent" href="#/produse?flag=promo">' + t('nav.promo') + '</a>' +
        '<a class="navlink" href="#/produse?flag=new">' + t('nav.new') + '</a>' +
        '<a class="navlink" href="#/preturi" data-nav="preturi">' + t('nav.prices') + '</a>' +
        '<a class="navlink" href="#/livrare" data-nav="livrare">' + t('nav.shipping') + '</a>' +
        '<a class="navlink" href="#/info" data-nav="info">' + t('nav.info') + '</a>' +
        '<a class="navlink" href="#/contact" data-nav="contact">' + t('nav.contact') + '</a>' +
        '<a class="navlink navlink--pill" href="#/produse?finder=1">' + icon('ruler', 'ico--sm') + t('nav.finder') + '</a>' +
      '</div></nav>';

    $('#nav-drawer').innerHTML =
      '<div class="drawer__head"><h2>' + t('menu') + '</h2><button class="xbtn" type="button" data-close aria-label="' + t('close') + '">' + icon('x') + '</button></div>' +
      '<div class="drawer__body"><div class="navlist">' +
        '<a href="#/produse?finder=1"><b>' + t('nav.finder') + '</b>' + icon('ruler') + '</a>' +
        '<a href="#/produse?flag=promo">' + t('nav.promo') + '</a><a href="#/produse?flag=new">' + t('nav.new') + '</a>' +
        '<h3>' + t('nav.products') + '</h3><a href="#/produse">' + t('nav.all') + '<small>' + P.length + '</small></a>' + megaItems +
        '<h3>' + t('ft.info') + '</h3><a href="#/preturi">' + t('nav.prices') + '</a><a href="#/livrare">' + t('nav.shipping') + '</a>' +
        '<a href="#/info">' + t('nav.info') + '</a><a href="#/contact">' + t('nav.contact') + '</a>' +
      '</div></div>';

    $('#site-footer').innerHTML =
      '<div class="wrap cols">' +
        '<div>' + logo() + '<p class="about">' + t('ft.about') + '</p></div>' +
        '<div><h4>' + t('ft.shop') + '</h4><ul>' +
          '<li><a href="#/produse">' + t('nav.all') + '</a></li><li><a href="#/produse?flag=promo">' + t('nav.promo') + '</a></li>' +
          '<li><a href="#/produse?flag=new">' + t('nav.new') + '</a></li><li><a href="#/preturi">' + t('nav.prices') + '</a></li>' +
          '<li><a href="#/produse?finder=1">' + t('nav.finder') + '</a></li></ul></div>' +
        '<div><h4>' + t('ft.info') + '</h4><ul>' +
          '<li><a href="#/livrare">' + t('nav.shipping') + '</a></li><li><a href="#/info">' + t('nav.info') + '</a></li>' +
          '<li><a href="#/info">' + t('ft.privacy') + '</a></li><li><a href="#/contact">' + t('nav.contact') + '</a></li></ul></div>' +
        '<div><h4>' + t('nav.contact') + '</h4><ul>' +
          '<li class="contactli">' + icon('phone', 'ico--sm') + '<a href="' + PHONE_HREF + '">' + PHONE + '</a></li>' +
          '<li class="contactli">' + icon('mail', 'ico--sm') + '<a href="mailto:' + EMAIL + '">' + EMAIL + '</a></li>' +
          '<li class="contactli">' + icon('pin', 'ico--sm') + '<span>Erdent 2000 Bt.<br>2100 Gödöllő, Alma utca 15, Hungary</span></li></ul></div>' +
      '</div>' +
      '<div class="wrap legal"><span>© ' + new Date().getFullYear() + ' Erdent 2000 Bt. ' + t('ft.rights') + '</span><span>CIF: HU20371478 · Cg. 13-06-034427</span></div>';

    renderCart(); updateCounts(); bindSearch();
  }

  /* ---------------------------------------------------------------- search */
  function bindSearch() {
    var input = $('#q'), box = $('#suggest'), active = -1, hits = [];
    function close() { box.hidden = true; active = -1; }
    function go(q) { close(); input.blur(); location.hash = '#/produse?q=' + encodeURIComponent(q); }
    function render() {
      var words = norm(input.value).split(/\s+/).filter(Boolean);
      if (!words.length) return close();
      var all = P.filter(function (p) { return words.every(function (w) { return p.hay.indexOf(w) >= 0; }); });
      hits = all.slice(0, 6);
      box.innerHTML = hits.length ? hits.map(function (p, i) {
        return '<a href="#/p/' + p.id + '" class="' + (i === active ? 'is-active' : '') + '">' + img(p.img, '') +
          '<span><span class="suggest__name">' + esc(p.name) + '</span><br><span class="suggest__meta">' + esc(p.sku) + ' · ' + esc(catName(p.cat)) + (p.mount ? ' · ' + dims(p.mount) : '') + '</span></span>' +
          '<span class="suggest__price">' + money(p.price) + '</span></a>';
      }).join('') + '<a class="suggest__all" href="#/produse?q=' + encodeURIComponent(input.value.trim()) + '">' + t('search.all', { n: all.length }) + '</a>'
        : '<div class="suggest__none">' + t('search.none') + '</div>';
      box.hidden = false;
    }
    input.addEventListener('input', function () { active = -1; render(); });
    input.addEventListener('focus', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!hits.length) return;
        e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length; render();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (active >= 0 && hits[active]) { close(); input.blur(); location.hash = '#/p/' + hits[active].id; }
        else if (input.value.trim()) go(input.value.trim());
      } else if (e.key === 'Escape') close();
    });
    box.addEventListener('click', function () { close(); input.value = ''; });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) close(); });
  }

  /* ------------------------------------------------------------ cart drawer */
  function totalsHtml(T) {
    var shipTxt = T.ship === null ? '—' : money(T.ship);
    return '<dl class="totals">' +
      '<div><span>' + t('cart.subtotal') + '</span><b>' + money(T.sub) + '</b></div>' +
      '<div><span>' + t('cart.shipping') + '<small>' + kg(T.weight) + ' · ' + t('cart.parcels', { n: T.parcels }) + '</small></span><b>' + shipTxt + '</b></div>' +
      (T.ship === null ? '<div><small>' + t('cart.heavy') + '</small></div>' : '') +
      '<div class="grand"><span>' + t('cart.total') + '</span><b>' + money(T.total) + '</b></div>' +
      '<div><small>' + t('cart.vat') + '</small></div></dl>';
  }
  function lineHtml(l, compact) {
    var p = l.p;
    return '<div class="line"><a class="line__img" href="#/p/' + p.id + '">' + img(p.img, '') + '</a>' +
      '<div><a class="line__name" href="#/p/' + p.id + '">' + esc(p.name) + '</a>' +
        '<div class="line__meta">' + esc(p.sku) + (p.weight ? ' · ' + kg(p.weight) : '') + (compact ? ' · ' + l.qty + ' × ' + money(p.price) : '') + '</div>' +
        (compact ? '' : '<div class="line__ctrl"><span class="stepper stepper--sm"><button type="button" data-dec="' + p.id + '" aria-label="−">' + icon('minus', 'ico--sm') + '</button><output>' + l.qty + '</output><button type="button" data-inc="' + p.id + '" aria-label="+">' + icon('plus', 'ico--sm') + '</button></span>' +
          '<button class="line__rm" type="button" data-rm="' + p.id + '">' + icon('trash', 'ico--sm') + t('cart.remove') + '</button></div>') +
      '</div><div class="line__price">' + money(p.price * l.qty) + '</div></div>';
  }
  function renderCart() {
    var T = cartTotals(), el = $('#cart-drawer');
    var head = '<div class="drawer__head"><h2>' + t('cart.title') + (T.count ? '<small>' + (T.count === 1 ? t('cart.items.one') : t('cart.items', { n: T.count })) + '</small>' : '') + '</h2>' +
      '<button class="xbtn" type="button" data-close aria-label="' + t('close') + '">' + icon('x') + '</button></div>';
    if (!T.lines.length) {
      el.innerHTML = head + '<div class="drawer__body"><div class="cartempty">' + icon('cart') + '<h3>' + t('cart.empty') + '</h3><p>' + t('cart.empty.sub') + '</p>' +
        '<a class="btn btn--dark" style="margin-top:18px" href="#/produse" data-close>' + t('nav.all') + '</a></div></div>';
      return;
    }
    el.innerHTML = head + '<div class="drawer__body">' + T.lines.map(function (l) { return lineHtml(l); }).join('') + '</div>' +
      '<div class="drawer__foot">' + totalsHtml(T) +
      '<a class="btn btn--primary btn--block btn--lg" href="#/comanda" data-close>' + t('cart.checkout') + icon('chevr', 'ico--sm') + '</a>' +
      '<button class="btn btn--ghost btn--block" type="button" data-close>' + t('cart.continue') + '</button></div>';
  }
  function openDrawer(id) {
    closeOverlays();
    var d = $(id); d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false');
    $('#scrim').hidden = false; document.body.style.overflow = 'hidden';
  }
  function openCart() { openDrawer('#cart-drawer'); }
  function closeOverlays() {
    $$('.drawer.is-open').forEach(function (d) { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); });
    $$('.filters.is-open').forEach(function (d) { d.classList.remove('is-open'); });
    $('#scrim').hidden = true; $('#lightbox').hidden = true; $('#modal').hidden = true; document.body.style.overflow = '';
  }
  function toast(msg, actionLabel, action) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon('check') + '<span>' + esc(msg) + '</span>' + (actionLabel ? '<button type="button">' + esc(actionLabel) + '</button>' : '');
    if (action) el.querySelector('button').addEventListener('click', function () { el.remove(); action(); });
    var box = $('#toasts'); box.innerHTML = ''; box.appendChild(el);
    setTimeout(function () { el.remove(); }, 3600);
  }

  /* -------------------------------------------------------------- lightbox */
  var lb = { list: [], i: 0 };
  function showLightbox(list, i) {
    lb.list = list; lb.i = i;
    var el = $('#lightbox');
    function draw() {
      el.innerHTML = '<button class="lb-x" type="button" data-close aria-label="' + t('close') + '">' + icon('x', 'ico--lg') + '</button>' +
        (lb.list.length > 1 ? '<button class="lb-p" type="button" data-lbstep="-1" aria-label="‹">' + icon('chevl', 'ico--lg') + '</button><button class="lb-n" type="button" data-lbstep="1" aria-label="›">' + icon('chevr', 'ico--lg') + '</button>' : '') +
        '<img src="' + esc(lb.list[lb.i]) + '" alt="" referrerpolicy="no-referrer"><div class="lb-c">' + (lb.i + 1) + ' / ' + lb.list.length + '</div>';
    }
    el._draw = draw; draw(); el.hidden = false; document.body.style.overflow = 'hidden';
  }

  /* ------------------------------------------------------------------ views */
  var app = $('#app');

  function heroArt() {
    var rivets = '';
    for (var a = 200; a <= 340; a += 20) {
      var r = a * Math.PI / 180;
      rivets += '<circle cx="' + (210 + 164 * Math.cos(r)).toFixed(1) + '" cy="' + (200 + 164 * Math.sin(r)).toFixed(1) + '" r="3.2" fill="#6b645e"/>';
    }
    [250, 320, 390].forEach(function (y) { rivets += '<circle cx="46" cy="' + y + '" r="3.2" fill="#6b645e"/><circle cx="374" cy="' + y + '" r="3.2" fill="#6b645e"/>'; });
    var slots = '';
    for (var x = 172; x <= 248; x += 15.2) slots += '<line x1="' + x.toFixed(1) + '" y1="359" x2="' + x.toFixed(1) + '" y2="385"/>';
    return '<svg viewBox="0 0 420 470" role="img" aria-label="Ușă de cuptor din fontă">' +
      '<defs>' +
        '<linearGradient id="hIron" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4f4945"/><stop offset=".5" stop-color="#2b2725"/><stop offset="1" stop-color="#141110"/></linearGradient>' +
        '<linearGradient id="hLeaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3532"/><stop offset="1" stop-color="#1a1716"/></linearGradient>' +
        '<radialGradient id="hFire" cx="50%" cy="92%" r="85%"><stop offset="0" stop-color="#ffe59a"/><stop offset=".28" stop-color="#f59f00"/><stop offset=".6" stop-color="#c2410c"/><stop offset="1" stop-color="#260c04"/></radialGradient>' +
        '<linearGradient id="hBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6c983"/><stop offset="1" stop-color="#8a6a2c"/></linearGradient>' +
        '<clipPath id="hGlass"><path d="M112 318V206a98 98 0 0 1 196 0v112z"/></clipPath>' +
      '</defs>' +
      '<path d="M30 452V200a180 180 0 0 1 360 0v252z" fill="url(#hIron)" stroke="#5c5651" stroke-width="2"/>' + rivets +
      '<path d="M62 430V204a148 148 0 0 1 296 0v226z" fill="url(#hLeaf)" stroke="#0d0b0a" stroke-width="3"/>' +
      '<path d="M75 417V206a135 135 0 0 1 270 0v211z" fill="none" stroke="#4f4945" stroke-width="1.5"/>' +
      '<path class="fireglow" d="M112 318V206a98 98 0 0 1 196 0v112z" fill="url(#hFire)"/>' +
      '<g clip-path="url(#hGlass)">' +
        '<path class="flame" d="M152 322c-16-32 6-54 2-88 24 22 36 48 26 88z" fill="#ffd43b" opacity=".85"/>' +
        '<path class="flame" d="M196 322c-28-46 10-80 4-132 36 36 56 84 34 132z" fill="#ffec99" opacity=".9"/>' +
        '<path class="flame" d="M250 322c-12-28 8-50 6-78 20 18 30 46 22 78z" fill="#ffc94d" opacity=".85"/>' +
        '<path class="flame" d="M178 322c-8-18 6-34 4-54 14 12 20 32 14 54z" fill="#fff3bf" opacity=".9"/>' +
        '<circle class="spark" cx="168" cy="292" r="2" fill="#ffe59a"/><circle class="spark" cx="226" cy="280" r="1.6" fill="#ffd43b"/>' +
        '<circle class="spark" cx="256" cy="296" r="2.2" fill="#ffe59a"/><circle class="spark" cx="198" cy="300" r="1.5" fill="#fff3bf"/>' +
        '<rect x="126" y="304" width="168" height="16" rx="7" fill="#2f1408"/><rect x="150" y="296" width="120" height="12" rx="6" fill="#43200d"/>' +
      '</g>' +
      '<path d="M112 318V206a98 98 0 0 1 196 0v112z" fill="none" stroke="#0d0b0a" stroke-width="8"/>' +
      '<path d="M112 318V206a98 98 0 0 1 196 0v112z" fill="none" stroke="#625b56" stroke-width="1.5"/>' +
      '<line x1="210" y1="108" x2="210" y2="318" stroke="#141110" stroke-width="5"/>' +
      '<path d="M130 298V214a80 80 0 0 1 38-68" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="150" y="346" width="120" height="52" rx="9" fill="#1c1918" stroke="#4f4945"/>' +
      '<g stroke="#f59f00" stroke-width="3.2" stroke-linecap="round" opacity=".9">' + slots + '</g>' +
      '<rect x="331" y="258" width="13" height="62" rx="6.5" fill="url(#hBrass)"/><circle cx="337.5" cy="258" r="9.5" fill="url(#hBrass)"/>' +
      '<rect x="51" y="226" width="22" height="36" rx="4" fill="#141110" stroke="#5c5651"/><rect x="51" y="362" width="22" height="36" rx="4" fill="#141110" stroke="#5c5651"/>' +
      '<circle cx="210" cy="82" r="15" fill="#f3eee7" stroke="url(#hBrass)" stroke-width="4"/>' +
      '<path d="M201 86a10 10 0 0 1 18 0" fill="none" stroke="#b9b0a6" stroke-width="1.5"/><line x1="210" y1="84" x2="217" y2="75" stroke="#d9480f" stroke-width="2.4" stroke-linecap="round"/><circle cx="210" cy="84" r="2" fill="#1e1b1a"/>' +
      '</svg>';
  }

  function guideArt(n) {
    var ink = '#1d1b1a', em = '#d9480f', soft = '#e3ddd4';
    if (n === 1) return '<svg class="dia" viewBox="0 0 240 120" aria-hidden="true"><rect x="10" y="6" width="220" height="108" rx="6" fill="' + soft + '"/>' +
      '<g stroke="#fff" stroke-width="2">' + [30, 54, 78, 102].map(function (y) { return '<line x1="10" y1="' + y + '" x2="230" y2="' + y + '"/>'; }).join('') + '</g>' +
      '<rect x="78" y="26" width="84" height="70" fill="#fff" stroke="' + em + '" stroke-width="2.5" stroke-dasharray="6 5"/>' +
      '<g stroke="' + em + '" stroke-width="1.8" fill="none"><path d="M84 61h72M84 61l6-4M84 61l6 4M156 61l-6-4M156 61l-6 4"/><path d="M120 32v58M120 32l-4 6M120 32l4 6M120 90l-4-6M120 90l4-6"/></g></svg>';
    if (n === 2) return '<svg class="dia" viewBox="0 0 240 120" aria-hidden="true"><rect x="10" y="6" width="220" height="108" rx="6" fill="' + soft + '"/>' +
      '<rect x="66" y="16" width="108" height="90" rx="5" fill="#2a2624" stroke="' + ink + '" stroke-width="2.5"/>' +
      '<rect x="78" y="26" width="84" height="70" fill="none" stroke="' + em + '" stroke-width="2" stroke-dasharray="6 5"/>' +
      '<rect x="92" y="38" width="56" height="40" rx="3" fill="#f59f00" opacity=".9"/><circle cx="164" cy="61" r="4" fill="#e6c983"/>' +
      '<g stroke="' + ink + '" stroke-width="1.6"><path d="M66 112h108M66 109v6M174 109v6"/></g></svg>';
    return '<svg class="dia" viewBox="0 0 240 120" aria-hidden="true"><rect x="10" y="6" width="220" height="108" rx="6" fill="' + soft + '"/>' +
      '<g fill="#c9a26b" stroke="#8a6a2c" stroke-width="2"><path d="M52 44h64v54H52z"/><path d="M126 30h64v68h-64z"/></g>' +
      '<g stroke="#8a6a2c" stroke-width="2"><path d="M84 44v54M158 30v68"/></g>' +
      '<g font-family="DM Sans, sans-serif" font-weight="700" font-size="13" fill="' + ink + '" text-anchor="middle"><text x="84" y="34">≤ 25 kg</text><text x="158" y="22">≤ 25 kg</text></g></svg>';
  }

  function finderForm() {
    var opts = D.categories.filter(function (c) { return P.some(function (p) { return p.cat === c.id && p.mount; }); })
      .map(function (c) { return '<option value="' + c.id + '">' + esc(catName(c.id)) + '</option>'; }).join('');
    return '<form class="finder" id="finder">' +
      '<div class="finder__title">' + icon('ruler') + t('finder.title') + '</div>' +
      '<div class="finder__grid">' +
        '<label class="field"><span>' + t('finder.type') + '</span><select class="select" name="cat"><option value="">' + t('finder.any') + '</option>' + opts + '</select></label>' +
        '<label class="field"><span>' + t('finder.w') + '</span><input class="input" name="w" inputmode="numeric" placeholder="415"></label>' +
        '<label class="field"><span>' + t('finder.h') + '</span><input class="input" name="h" inputmode="numeric" placeholder="415"></label>' +
      '</div>' +
      '<div class="finder__foot"><p>' + t('finder.hint') + '</p><button class="btn btn--primary" type="submit">' + t('finder.go') + icon('chevr', 'ico--sm') + '</button></div></form>';
  }

  function viewHome() {
    document.title = 'Uși Teracotă — ' + t('brand.tag');
    var featured = P.filter(function (p) { return p.promo || p.isNew; });
    [29, 27, 55, 28, 34, 69, 52, 26].forEach(function (c) {
      var first = P.filter(function (p) { return p.cat === c && featured.indexOf(p) < 0; })[0];
      if (first && featured.length < 8) featured.push(first);
    });
    var tr = [['shield', 'warranty'], ['flame', 'glass'], ['award', 'iso'], ['truck', 'ship'], ['cash', 'cod']];
    app.innerHTML =
      '<section class="hero"><div class="wrap"><div>' +
        '<div class="kicker">' + t('hero.kicker') + '</div><h1>' + t('hero.title') + '</h1><p class="hero__sub">' + t('hero.sub') + '</p>' + finderForm() +
      '</div><div class="hero__art">' + heroArt() + '</div></div></section>' +
      '<section class="trust"><div class="wrap"><ul>' + tr.map(function (x) {
        return '<li>' + icon(x[0]) + '<span><b>' + t('trust.' + x[1]) + '</b><small>' + t('trust.' + x[1] + '.sub') + '</small></span></li>';
      }).join('') + '</ul></div></section>' +
      '<section class="section"><div class="wrap"><div class="sechead"><div><h2>' + t('home.cats') + '</h2><p>' + t('home.cats.sub') + '</p></div>' +
        '<a class="btn btn--ghost" href="#/produse">' + t('hero.browse') + icon('chevr', 'ico--sm') + '</a></div>' +
        '<div class="cats">' + D.categories.map(function (c) {
          var first = P.filter(function (p) { return p.cat === c.id; })[0];
          return '<a class="cat" href="#/produse?cat=' + c.id + '"><div class="cat__img">' + img(first.img, '') + '</div>' +
            '<div class="cat__body"><b>' + esc(catName(c.id)) + '</b><small>' + t('cat.count', { n: c.count }) + '</small></div></a>';
        }).join('') + '</div></div></section>' +
      '<section class="section section--alt"><div class="wrap"><div class="sechead"><div><h2>' + t('home.featured') + '</h2><p>' + t('home.featured.sub') + '</p></div></div>' +
        '<div class="grid">' + featured.map(function (p) { return card(p); }).join('') + '</div></div></section>' +
      '<section class="section"><div class="wrap"><div class="sechead"><div><h2>' + t('home.guide') + '</h2><p>' + t('home.guide.sub') + '</p></div></div>' +
        '<div class="guide">' + [1, 2, 3].map(function (n) {
          return '<article>' + guideArt(n) + '<h3>' + t('guide.' + n) + '</h3><p>' + t('guide.' + n + '.sub') + '</p></article>';
        }).join('') + '</div>' +
        '<div class="cta" style="margin-top:28px"><div><h2>' + t('home.cta') + '</h2><p>' + t('home.cta.sub') + '</p></div>' +
          '<div class="cta__actions"><a class="btn btn--primary btn--lg" href="' + PHONE_HREF + '">' + icon('phone') + PHONE + '</a>' +
          '<a class="btn btn--onIron btn--lg" href="#/contact">' + t('home.cta.btn') + '</a></div></div>' +
      '</div></section>';
    $('#finder').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, qs = [];
      if (f.cat.value) qs.push('cat=' + f.cat.value);
      var w = f.w.value.replace(/\D/g, ''), h = f.h.value.replace(/\D/g, '');
      if (w) qs.push('w=' + w);
      if (h) qs.push('h=' + h);
      if (!w && !h) qs.push('finder=1');
      location.hash = '#/produse?' + qs.join('&');
    });
  }

  /* --- catalog --- */
  function viewCatalog(q) {
    var F = {
      cat: +q.get('cat') || 0, q: q.get('q') || '', min: q.get('min') || '', max: q.get('max') || '',
      w: q.get('w') || '', h: q.get('h') || '', tol: +q.get('tol') || 20,
      feats: (q.get('f') || '').split(',').filter(function (x) { return FEATS.indexOf(x) >= 0; }),
      flag: q.get('flag') || '', sort: q.get('sort') || 'rel', limit: 24
    };
    if (!CAT[F.cat]) F.cat = 0;

    function matches(p, ignoreCat) {
      if (!ignoreCat && F.cat && p.cat !== F.cat) return false;
      if (F.flag === 'promo' && !p.promo) return false;
      if (F.flag === 'new' && !p.isNew) return false;
      var words = norm(F.q).split(/\s+/).filter(Boolean);
      if (words.length && !words.every(function (w) { return p.hay.indexOf(w) >= 0; })) return false;
      if (F.min && p.price < +F.min) return false;
      if (F.max && p.price > +F.max) return false;
      for (var i = 0; i < F.feats.length; i++) if (!p.f[F.feats[i]]) return false;
      var w = +F.w || 0, h = +F.h || 0;
      p._fit = null;
      if (w || h) {
        if (!p.mount) return false;
        var dw = w ? Math.abs(p.mount[0] - w) : 0, dh = h ? Math.abs(p.mount[1] - h) : 0;
        if (dw > F.tol || dh > F.tol) return false;
        p._fit = Math.max(dw, dh);
      }
      return true;
    }
    function compute() {
      var sized = !!(+F.w || +F.h);
      var list = P.filter(function (p) { return matches(p); });
      var cmp = { pa: function (a, b) { return a.price - b.price; }, pd: function (a, b) { return b.price - a.price; },
        name: function (a, b) { return a.name.localeCompare(b.name, 'ro'); },
        rel: function (a, b) { return sized ? (a._fit - b._fit) || (a.price - b.price) : a.order - b.order; } };
      list.sort(cmp[F.sort] || cmp.rel);
      return { list: list, sized: sized };
    }
    function writeHash() {
      var qs = [];
      if (F.cat) qs.push('cat=' + F.cat);
      if (F.flag) qs.push('flag=' + F.flag);
      if (F.q) qs.push('q=' + encodeURIComponent(F.q));
      ['min', 'max', 'w', 'h'].forEach(function (k) { if (F[k]) qs.push(k + '=' + F[k]); });
      if ((F.w || F.h) && F.tol !== 20) qs.push('tol=' + F.tol);
      if (F.feats.length) qs.push('f=' + F.feats.join(','));
      if (F.sort !== 'rel') qs.push('sort=' + F.sort);
      history.replaceState(null, '', '#/produse' + (qs.length ? '?' + qs.join('&') : ''));
    }
    function title() {
      if (F.flag === 'promo') return t('nav.promo');
      if (F.flag === 'new') return t('nav.new');
      return F.cat ? catName(F.cat) : t('nav.all');
    }

    app.innerHTML = '<div id="cat-head"></div>' +
      '<div class="wrap catalog">' +
        '<aside class="filters" id="filters" aria-label="' + t('filter.title') + '">' +
          '<div class="filters__head"><h2>' + t('filter.title') + '</h2><button class="xbtn" type="button" data-close aria-label="' + t('close') + '">' + icon('x') + '</button></div>' +
          '<div class="fgroup fgroup--hl"><h3>' + icon('ruler', 'ico--sm') + t('filter.size') + '</h3>' +
            '<div class="frow"><label class="field"><span>' + t('filter.w') + '</span><input class="input" data-f="w" inputmode="numeric" placeholder="mm" value="' + esc(F.w) + '"></label>' +
            '<label class="field"><span>' + t('filter.h') + '</span><input class="input" data-f="h" inputmode="numeric" placeholder="mm" value="' + esc(F.h) + '"></label></div>' +
            '<div class="tolrow"><span>' + t('filter.tol') + '</span><span class="seg" id="tol">' + [10, 20, 30, 50].map(function (v) {
              return '<button type="button" data-tol="' + v + '" aria-pressed="' + (F.tol === v) + '">±' + v + '</button>'; }).join('') + '</span></div>' +
            '<p class="fhint">' + t('filter.size.hint') + '</p></div>' +
          '<div class="fgroup"><h3>' + t('filter.cat') + '</h3><div class="fcats" id="fcats"></div></div>' +
          '<div class="fgroup"><h3>' + t('filter.price') + '</h3><div class="frow">' +
            '<input class="input" data-f="min" inputmode="numeric" placeholder="' + t('filter.min') + '" aria-label="' + t('filter.min') + '" value="' + esc(F.min) + '">' +
            '<input class="input" data-f="max" inputmode="numeric" placeholder="' + t('filter.max') + '" aria-label="' + t('filter.max') + '" value="' + esc(F.max) + '"></div></div>' +
          '<div class="fgroup"><h3>' + t('filter.features') + '</h3><div class="fchecks">' + FEATS.map(function (f) {
            return '<label class="check"><input type="checkbox" data-feat="' + f + '"' + (F.feats.indexOf(f) >= 0 ? ' checked' : '') + '><span>' + t('f.' + f) + '</span></label>'; }).join('') + '</div></div>' +
          '<div class="filters__foot"><button class="btn btn--primary btn--block" type="button" data-close id="fshow"></button></div>' +
        '</aside>' +
        '<section>' +
          '<div class="toolbar"><button class="btn btn--ghost btn--sm filterbtn" type="button" id="fopen">' + icon('filter', 'ico--sm') + t('filter.title') + '</button>' +
            '<span class="toolbar__count" id="count"></span><span class="sp"></span>' +
            '<label><span>' + t('sort.label') + '</span><select class="select" id="sort">' + [['rel', 'sort.rel'], ['pa', 'sort.pa'], ['pd', 'sort.pd'], ['name', 'sort.name']].map(function (o) {
              return '<option value="' + o[0] + '"' + (F.sort === o[0] ? ' selected' : '') + '>' + t(o[1]) + '</option>'; }).join('') + '</select></label></div>' +
          '<div class="chips" id="chips"></div><div id="results"></div>' +
        '</section>' +
      '</div>';

    function update(keepLimit) {
      if (!keepLimit) F.limit = 24;
      var R = compute(), n = R.list.length;
      document.title = title() + ' — Uși Teracotă';
      $('#cat-head').innerHTML = crumbs(F.cat ? [[t('nav.products'), '#/produse'], [catName(F.cat)]] : [[title()]]) +
        '<div class="wrap pagehead"><h1>' + esc(title()) + '</h1>' + (F.cat && !F.flag ? '<p>' + esc(CAT[F.cat].title) + '</p>' : '') + '</div>';
      var counts = {}, total = 0;
      P.forEach(function (p) { if (matches(p, true)) { counts[p.cat] = (counts[p.cat] || 0) + 1; total++; } });
      $('#fcats').innerHTML = '<a href="#" data-setcat="0" class="' + (F.cat ? '' : 'is-active') + '">' + t('nav.all') + '<small>' + total + '</small></a>' +
        D.categories.map(function (c) {
          return '<a href="#" data-setcat="' + c.id + '" class="' + (F.cat === c.id ? 'is-active' : '') + '">' + esc(catName(c.id)) + '<small>' + (counts[c.id] || 0) + '</small></a>';
        }).join('');
      R.list.forEach(function (p) { matches(p); }); // recalculează _fit după numărătoare
      $('#count').textContent = n === 1 ? t('cat.results.one') : t('cat.results', { n: n });
      $('#fshow').textContent = t('filter.show', { n: n });
      var chips = [];
      if (F.flag) chips.push(['flag', title()]);
      if (F.q) chips.push(['q', t('q.label') + ': ' + F.q]);
      if (F.w || F.h) chips.push(['size', t('size.label') + ' ' + (F.w || '?') + ' × ' + (F.h || '?') + ' mm (±' + F.tol + ')']);
      if (F.min || F.max) chips.push(['price', (F.min || '0') + ' – ' + (F.max || '∞') + ' RON']);
      F.feats.forEach(function (f) { chips.push(['feat:' + f, t('f.' + f)]); });
      $('#chips').innerHTML = chips.map(function (c) { return '<button class="chip" type="button" data-chip="' + c[0] + '">' + esc(c[1]) + icon('x', 'ico--sm') + '</button>'; }).join('') +
        (chips.length > 1 ? '<button class="chip chip--clear" type="button" data-chip="all">' + t('filter.clear') + '</button>' : '');
      var shown = R.list.slice(0, F.limit);
      $('#results').innerHTML = n ? '<div class="grid grid--3">' + shown.map(function (p) { return card(p, R.sized ? p._fit : null); }).join('') + '</div>' +
        (n > shown.length ? '<div class="morerow"><span>' + t('shown', { a: shown.length, b: n }) + '</span><button class="btn btn--dark" type="button" id="more">' + t('more') + '</button></div>' : '')
        : '<div class="empty">' + icon('search') + '<h3>' + t('empty.title') + '</h3><p>' + t('empty.sub') + '</p><button class="btn btn--ghost" type="button" data-chip="all">' + t('filter.clear') + '</button></div>';
      writeHash();
    }
    function syncInputs() {
      $$('[data-f]', app).forEach(function (el) { el.value = F[el.dataset.f]; });
      $$('[data-feat]', app).forEach(function (el) { el.checked = F.feats.indexOf(el.dataset.feat) >= 0; });
      $$('[data-tol]', app).forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.tol === F.tol); });
    }
    app.addEventListener('input', function (e) {
      var el = e.target;
      if (el.dataset.f) { F[el.dataset.f] = el.value = el.value.replace(/\D/g, '').slice(0, 5); update(); }
      else if (el.dataset.feat) {
        var i = F.feats.indexOf(el.dataset.feat);
        if (el.checked && i < 0) F.feats.push(el.dataset.feat); else if (!el.checked && i >= 0) F.feats.splice(i, 1);
        update();
      }
    });
    $('#sort').addEventListener('change', function (e) { F.sort = e.target.value; update(); });
    $('#fopen').addEventListener('click', function () { $('#filters').classList.add('is-open'); $('#scrim').hidden = false; document.body.style.overflow = 'hidden'; });
    app.addEventListener('click', function (e) {
      var el;
      if ((el = e.target.closest('[data-setcat]'))) { e.preventDefault(); F.cat = +el.dataset.setcat; F.flag = ''; update(); }
      else if ((el = e.target.closest('[data-tol]'))) { F.tol = +el.dataset.tol; syncInputs(); update(); }
      else if ((el = e.target.closest('#more'))) { F.limit += 24; update(true); }
      else if ((el = e.target.closest('[data-chip]'))) {
        var c = el.dataset.chip;
        if (c === 'all') { F.q = F.min = F.max = F.w = F.h = F.flag = ''; F.feats = []; F.tol = 20; $('#q').value = ''; }
        else if (c === 'flag') F.flag = '';
        else if (c === 'q') { F.q = ''; $('#q').value = ''; }
        else if (c === 'size') F.w = F.h = '';
        else if (c === 'price') F.min = F.max = '';
        else if (c.indexOf('feat:') === 0) F.feats.splice(F.feats.indexOf(c.slice(5)), 1);
        syncInputs(); update();
      }
    });
    update();
    $('#q').value = F.q;
    if (q.get('finder')) { var wi = $('[data-f="w"]', app); if (wi && window.innerWidth > 900) wi.focus(); }
  }

  /* --- product --- */
  function dimSvg(p) {
    var e = p.ext, m = p.mount, base = e || m;
    if (!base) return '';
    var W = 420, H = 300, maxW = 250, maxH = 190;
    var bw = Math.max(base[0], m ? m[0] : 0), bh = Math.max(base[1], m ? m[1] : 0);
    var s = Math.min(maxW / bw, maxH / bh), cx = 190, cy = 150;
    function rect(d, attrs) { var w = d[0] * s, h = d[1] * s; return '<rect x="' + (cx - w / 2).toFixed(1) + '" y="' + (cy - h / 2).toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" ' + attrs + '/>'; }
    var out = '<svg class="dimdraw" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + t('p.dims') + '">';
    var font = 'font-family="DM Sans, sans-serif" font-size="13" font-weight="600"';
    if (e) {
      var ew = e[0] * s, eh = e[1] * s, x0 = cx - ew / 2, x1 = cx + ew / 2, y0 = cy - eh / 2, y1 = cy + eh / 2;
      out += rect(e, 'rx="5" fill="#f4f1ec" stroke="#1d1b1a" stroke-width="2"');
      out += '<g stroke="#1d1b1a" stroke-width="1.2"><path d="M' + x0 + ' ' + (y0 - 16) + 'H' + x1 + 'M' + x0 + ' ' + (y0 - 21) + 'v10M' + x1 + ' ' + (y0 - 21) + 'v10"/>' +
        '<path d="M' + (x1 + 16) + ' ' + y0 + 'V' + y1 + 'M' + (x1 + 11) + ' ' + y0 + 'h10M' + (x1 + 11) + ' ' + y1 + 'h10"/></g>' +
        '<text x="' + cx + '" y="' + (y0 - 24) + '" text-anchor="middle" fill="#1d1b1a" ' + font + '>' + e[0] + ' mm</text>' +
        '<text x="' + (x1 + 24) + '" y="' + (cy + 4) + '" fill="#1d1b1a" ' + font + '>' + e[1] + ' mm</text>';
    }
    if (m) {
      var mw = m[0] * s, mh = m[1] * s;
      out += rect(m, 'fill="' + (e ? '#fff' : '#f4f1ec') + '" stroke="#d9480f" stroke-width="2" stroke-dasharray="7 5"');
      out += '<text x="' + cx + '" y="' + (cy + mh / 2 - 9) + '" text-anchor="middle" fill="#bf3f0c" ' + font + '>' + m[0] + ' mm</text>' +
        '<text transform="translate(' + (cx - mw / 2 + 17) + ' ' + cy + ') rotate(-90)" text-anchor="middle" fill="#bf3f0c" ' + font + '>' + m[1] + ' mm</text>';
    }
    return out + '</svg>';
  }

  function viewProduct(id) {
    var p = BYID[id];
    if (!p) { app.innerHTML = '<div class="wrap section"><div class="empty"><h3>' + t('p.notfound') + '</h3><a class="btn btn--dark" href="#/produse">' + t('nav.all') + '</a></div></div>'; return; }
    document.title = p.name + ' — Uși Teracotă';
    var kv = [], feats = [];
    p.specs.forEach(function (s) { var i = s.indexOf(':'); if (i > 0 && i < 48) kv.push([s.slice(0, i).trim(), s.slice(i + 1).trim()]); else feats.push(s.replace(/\.$/, '')); });
    var ship = p.weight ? shipFor(p.weight) : null;
    var depth = (p.ext && p.ext[2]) || (p.mount && p.mount[2]);
    var quick = '';
    if (p.mount) quick += '<div><small>' + t('p.dims.mount') + '</small><b>' + dims(p.mount) + '</b></div>';
    if (p.ext) quick += '<div><small>' + t('p.dims.ext') + '</small><b>' + dims(p.ext) + '</b></div>';
    if (p.weight) quick += '<div><small>' + t('p.weight') + '</small><b>' + kg(p.weight) + '</b></div>';
    var related = P.filter(function (x) { return x.cat === p.cat && x.id !== p.id; }).map(function (x) {
      var d = (p.mount && x.mount) ? Math.abs(p.mount[0] - x.mount[0]) + Math.abs(p.mount[1] - x.mount[1]) : 400;
      return { p: x, s: (x.family && x.family === p.family ? 0 : 300) + d + Math.abs(x.price - p.price) / 10 };
    }).sort(function (a, b) { return a.s - b.s; }).slice(0, 4).map(function (x) { return x.p; });
    var shots = p.gal.slice(1);
    var until = p.promoUntil ? p.promoUntil.split('-').reverse().join('.') : '';

    app.innerHTML = crumbs([[t('nav.products'), '#/produse'], [catName(p.cat), '#/produse?cat=' + p.cat], [p.name]]) +
      '<div class="wrap product">' +
        '<div class="gallery"><div class="stage" id="stage" data-lb="0">' + badges(p) + '<img id="stage-img" src="' + esc(p.gal[0]) + '" alt="' + esc(p.name) + '" referrerpolicy="no-referrer"></div>' +
          (p.gal.length > 1 ? '<div class="thumbs" id="thumbs">' + p.gal.map(function (u, i) {
            return '<button type="button" data-thumb="' + i + '" aria-current="' + (i === 0) + '">' + img(u, '') + '</button>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<div class="pinfo">' +
          '<a class="card__cat link" href="#/produse?cat=' + p.cat + '">' + esc(catName(p.cat)) + '</a>' +
          '<h1>' + esc(p.name) + '</h1>' +
          '<div class="pinfo__sku"><span>' + t('p.sku') + ': <b>' + esc(p.sku) + '</b></span>' +
            (p.promo && until ? '<span class="badge badge--soft">' + t('p.promoUntil', { d: until }) + '</span>' : '') + '</div>' +
          (p.short ? '<p class="pinfo__short">' + esc(p.short) + '</p>' : '') +
          (quick ? '<div class="quick">' + quick + '</div>' : '') +
          '<div class="buybox">' +
            '<div class="buybox__price">' + priceHtml(p.price) + '<span>' + t('p.vat') + ' · ' + t('p.online') + '</span></div>' +
            '<div class="buybox__row"><span class="stepper"><button type="button" data-pq="-1" aria-label="−">' + icon('minus') + '</button><output id="pqty">1</output><button type="button" data-pq="1" aria-label="+">' + icon('plus') + '</button></span>' +
              '<button class="btn btn--primary btn--lg" type="button" data-add="' + p.id + '" data-qty="#pqty">' + icon('cartplus') + t('add') + '</button>' + favBtn(p) + '</div>' +
            '<ul class="perks">' +
              '<li>' + icon('truck') + '<span>' + (ship ? t('p.ship.est') + ': <b>' + money(ship) + '</b> · ' + t('p.ship.days') : t('p.ship.tbd') + ' · ' + t('p.ship.days')) + '</span></li>' +
              '<li>' + icon('cash') + '<span>' + t('p.cod') + '</span></li>' +
              '<li>' + icon('shield') + '<span>' + t('p.warranty') + '</span></li>' +
              '<li>' + icon('undo') + '<span>' + t('p.return') + '</span></li></ul>' +
          '</div>' +
          (p.video ? '<a class="btn btn--ghost btn--block" style="margin-top:14px" href="' + esc(p.video) + '" target="_blank" rel="noopener">' + icon('play') + t('p.video') + '</a>' : '') +
          '<div class="askbox">' + icon('phone') + '<div><b>' + t('p.ask') + '</b><p>' + t('p.ask.sub') + '</p></div><a class="link" href="' + PHONE_HREF + '">' + PHONE + '</a></div>' +
        '</div>' +
      '</div>' +
      '<div class="wrap pdetail">' +
        '<section class="panel"><h2>' + t('p.specs') + '</h2>' +
          (kv.length ? '<table class="spec"><tbody><tr><th>' + t('p.sku') + '</th><td>' + esc(p.sku) + '</td></tr>' + kv.map(function (r) { return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>'; }).join('') + '</tbody></table>' : '') +
          (feats.length ? '<ul class="feats">' + feats.map(function (f) { return '<li>' + icon('check', 'ico--sm') + '<span>' + esc(f) + '</span></li>'; }).join('') + '</ul>' : '') +
        '</section>' +
        ((p.ext || p.mount) ? '<section class="panel"><h2>' + t('p.dims') + '</h2>' + dimSvg(p) +
          '<div class="dimlegend">' + (p.ext ? '<span><i></i>' + t('p.dims.ext') + '</span>' : '') + (p.mount ? '<span><i class="d"></i>' + t('p.dims.mount') + '</span>' : '') +
          (depth ? '<span>' + t('p.depth') + ': <b>' + depth + ' mm</b></span>' : '') + '</div><p class="dimnote">' + t('p.dims.note') + '</p></section>' : '') +
        (p.detail ? '<section class="panel panel--full"><h2>' + t('p.details') + '</h2><p class="detailtext">' + esc(p.detail) + '</p></section>' : '') +
        (shots.length ? '<section class="panel panel--full"><h2>' + t('p.gallery') + '</h2><div class="shots">' + shots.map(function (u, i) {
          return '<button type="button" data-lb="' + (i + 1) + '">' + img(u, '') + '</button>'; }).join('') + '</div></section>' : '') +
      '</div>' +
      (related.length ? '<section class="section section--tight"><div class="wrap"><div class="sechead"><h2>' + t('p.related') + '</h2></div><div class="grid">' + related.map(function (x) { return card(x); }).join('') + '</div></div></section>' : '');

    // fotografiile actuale sunt mici (250–500 px): limităm mărirea ca să nu pară neclare
    var cur = 0, si = $('#stage-img');
    function fitStage() { if (si.naturalWidth) { si.style.maxWidth = Math.round(si.naturalWidth * 1.7) + 'px'; si.style.maxHeight = Math.round(si.naturalHeight * 1.7) + 'px'; } }
    si.addEventListener('load', fitStage); fitStage();
    app.addEventListener('click', function (e) {
      var el;
      if ((el = e.target.closest('[data-thumb]'))) {
        cur = +el.dataset.thumb; $('#stage-img').src = p.gal[cur]; $('#stage').dataset.lb = cur;
        $$('[data-thumb]', app).forEach(function (b) { b.setAttribute('aria-current', +b.dataset.thumb === cur); });
      } else if ((el = e.target.closest('[data-lb]'))) showLightbox(p.gal, +el.dataset.lb);
      else if ((el = e.target.closest('[data-pq]'))) { var o = $('#pqty'); o.textContent = Math.max(1, Math.min(99, +o.textContent + +el.dataset.pq)); }
    });
  }

  /* --- checkout --- */
  function viewCheckout() {
    document.title = t('co.title') + ' — Uși Teracotă';
    var T = cartTotals();
    if (!T.lines.length) {
      app.innerHTML = crumbs([[t('co.title')]]) + '<div class="wrap section"><div class="empty">' + icon('cart') + '<h3>' + t('cart.empty') + '</h3><p>' + t('cart.empty.sub') + '</p><a class="btn btn--dark" href="#/produse">' + t('nav.all') + '</a></div></div>';
      return;
    }
    function f(name, label, cls, attrs) { return '<label class="field ' + (cls || '') + '"><span>' + label + '</span><input class="input" name="' + name + '" ' + (attrs || '') + ' required></label>'; }
    app.innerHTML = crumbs([[t('co.title')]]) + '<div class="wrap pagehead"><h1>' + t('co.title') + '</h1></div>' +
      '<form class="wrap checkout" id="co" novalidate><div>' +
        '<div class="guestnote">' + icon('check') + t('co.guest') + '</div>' +
        '<fieldset class="fs"><h2><i>1</i>' + t('co.contact') + '</h2><div class="fgrid">' +
          f('last', t('co.last'), '', 'autocomplete="family-name"') + f('first', t('co.first'), '', 'autocomplete="given-name"') +
          f('email', t('co.email'), '', 'type="email" autocomplete="email"') + f('phone', t('co.phone'), '', 'type="tel" autocomplete="tel" placeholder="07xx xxx xxx"') + '</div></fieldset>' +
        '<fieldset class="fs"><h2><i>2</i>' + t('co.address') + '</h2><div class="fgrid">' +
          '<label class="field"><span>' + t('co.county') + '</span><select class="select" name="county" required><option value="">' + t('co.county.ph') + '</option>' + window.COUNTIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></label>' +
          f('city', t('co.city'), '', 'autocomplete="address-level2"') + f('street', t('co.street'), '', 'autocomplete="street-address"') + f('zip', t('co.zip'), '', 'inputmode="numeric" autocomplete="postal-code" maxlength="6"') + '</div></fieldset>' +
        '<fieldset class="fs"><h2><i>3</i>' + t('co.billing') + '</h2><div class="opts" style="grid-template-columns:1fr 1fr">' +
          '<label class="opt"><input type="radio" name="btype" value="p" checked><b>' + t('co.person') + '</b></label>' +
          '<label class="opt"><input type="radio" name="btype" value="c"><b>' + t('co.company') + '</b></label></div>' +
          '<div class="fgrid" id="cofirm" hidden style="margin-top:14px">' + f('cname', t('co.cname')) + f('cif', t('co.cif')) + '</div></fieldset>' +
        '<fieldset class="fs"><h2><i>4</i>' + t('co.delivery') + ' & ' + t('co.payment').toLowerCase() + '</h2><div class="opts">' +
          '<label class="opt"><input type="radio" name="ship" checked><span><b>' + t('co.ups') + '</b><small>' + t('co.ups.sub') + '</small></span><span class="r" id="co-ship"></span></label>' +
          '<label class="opt"><input type="radio" name="pay" value="cod" checked><span><b>' + t('co.cod') + '</b><small>' + t('co.cod.sub') + '</small></span>' + icon('cash') + '</label>' +
          '<label class="opt"><input type="radio" name="pay" value="card" disabled><span><b>' + t('co.card') + ' <span class="badge badge--soft">' + t('co.proposal') + '</span></b><small>' + t('co.card.sub') + '</small></span></label></div>' +
          '<label class="field" style="margin-top:14px"><span>' + t('co.notes') + '</span><textarea class="textarea" name="notes"></textarea></label></fieldset>' +
      '</div><aside class="summary" id="co-sum"></aside></form>';

    function drawSum() {
      var T2 = cartTotals();
      if (!T2.lines.length) return viewCheckout();
      $('#co-ship').textContent = T2.ship === null ? '—' : money(T2.ship);
      $('#co-sum').innerHTML = '<h2>' + t('co.summary') + '</h2>' + T2.lines.map(function (l) { return lineHtml(l, true); }).join('') + totalsHtml(T2) +
        '<label class="check" style="margin-top:16px"><input type="checkbox" name="terms" required><span style="font-size:13.5px">' + t('co.terms') + '</span></label>' +
        '<button class="btn btn--primary btn--block btn--lg" type="submit">' + t('co.place') + '</button><p class="formerr" id="co-err" hidden>' + t('co.required') + '</p>';
    }
    drawSum(); onCartChange = drawSum;
    var form = $('#co');
    form.addEventListener('change', function (e) {
      if (e.target.name === 'btype') { var c = form.btype.value === 'c'; $('#cofirm').hidden = !c; }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = 0, company = form.btype.value === 'c';
      $$('[required]', form).forEach(function (el) {
        var skip = (el.name === 'cname' || el.name === 'cif') && !company;
        var ok = skip || (el.type === 'checkbox' ? el.checked : el.type === 'email' ? /^\S+@\S+\.\S+$/.test(el.value) : el.value.trim() !== '');
        el.classList.toggle('is-bad', !ok); if (!ok) bad++;
      });
      if (bad) { $('#co-err').hidden = false; var first = $('.is-bad', form); if (first && first.type !== 'checkbox') first.focus(); return; }
      var total = cartTotals().total, no = 'DEMO-' + String(Date.now()).slice(-6);
      state.cart = {}; onCartChange = null; saveCart();
      app.innerHTML = '<div class="wrap"><div class="done"><div class="done__ico">' + icon('check', 'ico--lg') + '</div><h1>' + t('co.done') + '</h1><p>' + t('co.done.sub') + '</p>' +
        '<div class="orderno">' + t('co.done.no') + ': <b>' + no + '</b> · ' + money(total) + '</div><br><a class="btn btn--dark" href="#/">' + t('co.done.back') + '</a></div></div>';
      window.scrollTo(0, 0);
    });
  }

  /* --- shipping --- */
  function viewShipping() {
    document.title = t('sh.title') + ' — Uși Teracotă';
    app.innerHTML = crumbs([[t('sh.title')]]) + '<div class="wrap pagehead"><h1>' + t('sh.title') + '</h1><p>' + t('sh.lead') + '</p></div>' +
      '<div class="wrap twocol"><div>' +
        '<section class="panel"><h2>' + t('sh.calc') + '</h2><label class="field"><span>' + t('sh.weight') + ': <b id="sh-w">25 kg</b></span>' +
          '<input class="range" id="sh-range" type="range" min="1" max="200" value="25"></label>' +
          '<div class="calc__out"><span>' + t('cart.shipping') + '<br><small style="color:var(--ink-3)" id="sh-p"></small></span><b id="sh-out"></b></div></section>' +
        '<section class="panel" style="margin-top:20px"><h2>' + t('sh.good') + '</h2><ul class="bullets">' + t('sh.points').map(function (s) { return '<li>' + icon('check', 'ico--sm') + '<span>' + s + '</span></li>'; }).join('') + '</ul></section>' +
      '</div><section class="panel"><h2>' + t('sh.table') + '</h2><table class="table"><thead><tr><th>' + t('sh.col.w') + '</th><th class="r">' + t('sh.col.p') + '</th></tr></thead><tbody>' +
        D.shipping.map(function (r, i) { return '<tr data-row="' + i + '"><td class="num">' + r.from + ' – ' + r.to + ' kg</td><td class="r">' + money(r.price) + '</td></tr>'; }).join('') +
      '</tbody></table></section></div>';
    var range = $('#sh-range');
    function calc() {
      var w = +range.value, price = shipFor(w);
      $('#sh-w').textContent = w + ' kg'; $('#sh-out').textContent = money(price);
      $('#sh-p').textContent = t('cart.parcels', { n: Math.ceil(w / 25) });
      $$('[data-row]', app).forEach(function (tr) { var r = D.shipping[+tr.dataset.row]; tr.classList.toggle('is-hit', w >= r.from && w <= r.to); });
    }
    range.addEventListener('input', calc); calc();
  }

  /* --- price list --- */
  function viewPrices() {
    document.title = t('pl.title') + ' — Uși Teracotă';
    app.innerHTML = crumbs([[t('pl.title')]]) + '<div class="wrap pagehead"><h1>' + t('pl.title') + '</h1><p>' + t('pl.sub') + '</p></div>' +
      '<div class="wrap" style="padding-bottom:64px"><div class="plbar"><input class="input" id="pl-q" type="search" placeholder="' + t('pl.filter') + '">' +
      '<span style="flex:1"></span><button class="btn btn--ghost" type="button" id="pl-print">' + icon('print') + t('pl.print') + '</button></div>' +
      '<div class="panel" style="padding:0;overflow:auto"><table class="table"><thead><tr><th class="hide-sm">' + t('pl.col.sku') + '</th><th>' + t('pl.col.name') + '</th><th class="hide-sm">' + t('pl.col.mount') +
      '</th><th class="r hide-sm">' + t('pl.col.weight') + '</th><th class="r">' + t('pl.col.price') + '</th></tr></thead><tbody id="pl-body"></tbody></table></div></div>';
    function draw() {
      var words = norm($('#pl-q').value).split(/\s+/).filter(Boolean), html = '';
      D.categories.forEach(function (c) {
        var rows = P.filter(function (p) { return p.cat === c.id && words.every(function (w) { return p.hay.indexOf(w) >= 0; }); });
        if (!rows.length) return;
        html += '<tr class="grp"><td colspan="5">' + esc(catName(c.id)) + '</td></tr>' + rows.map(function (p) {
          return '<tr><td class="num hide-sm">' + esc(p.sku) + '</td><td><a href="#/p/' + p.id + '">' + esc(p.name) + '</a></td><td class="num hide-sm">' + (p.mount ? p.mount.slice(0, 2).join(' × ') : '—') +
            '</td><td class="r hide-sm">' + (p.weight ? kg(p.weight) : '—') + '</td><td class="r"><b>' + money(p.price) + '</b></td></tr>';
        }).join('');
      });
      $('#pl-body').innerHTML = html || '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--ink-3)">' + t('search.none') + '</td></tr>';
    }
    $('#pl-q').addEventListener('input', draw); $('#pl-print').addEventListener('click', function () { window.print(); }); draw();
  }

  /* --- info, contact, favorites --- */
  function viewInfo() {
    document.title = t('inf.title') + ' — Uși Teracotă';
    app.innerHTML = crumbs([[t('nav.info')]]) + '<div class="wrap pagehead"><h1>' + t('inf.title') + '</h1></div><div class="wrap"><div class="acc">' +
      t('inf.items').map(function (it, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + it[0] + '</summary><p>' + it[1] + '</p></details>'; }).join('') + '</div></div>';
  }
  function viewContact() {
    document.title = t('ct.title') + ' — Uși Teracotă';
    function row(ic, label, val) { return '<div>' + icon(ic) + '<span><small>' + label + '</small><b>' + val + '</b></span></div>'; }
    app.innerHTML = crumbs([[t('ct.title')]]) + '<div class="wrap pagehead"><h1>' + t('ct.title') + '</h1><p>' + t('ct.lead') + '</p></div>' +
      '<div class="wrap twocol"><section class="panel"><h2>' + t('ct.company') + '</h2><div class="kv">' +
        row('phone', t('ct.phone'), '<a class="link" href="' + PHONE_HREF + '">' + PHONE + '</a>') +
        row('mail', 'E-mail', '<a class="link" href="mailto:' + EMAIL + '">' + EMAIL + '</a>') +
        row('pin', t('ct.addr'), 'Erdent 2000 Bt. · 2100 Gödöllő, Alma utca 15, Hungary') +
        row('info', t('ct.reg') + ' · ' + t('ct.cif'), '13-06-034427 · HU20371478') + '</div></section>' +
      '<form class="panel" id="ct-form"><h2>' + t('ct.form') + '</h2><div class="fgrid">' +
        '<label class="field"><span>' + t('ct.name') + '</span><input class="input" required></label><label class="field"><span>E-mail</span><input class="input" type="email" required></label>' +
        '<label class="field full"><span>' + t('ct.msg') + '</span><textarea class="textarea" required></textarea></label></div>' +
        '<button class="btn btn--primary" style="margin-top:16px" type="submit">' + icon('mail') + t('ct.send') + '</button></form></div>';
    $('#ct-form').addEventListener('submit', function (e) { e.preventDefault(); e.target.reset(); toast(t('ct.sent')); });
  }
  function viewFavs() {
    document.title = t('favs.title') + ' — Uși Teracotă';
    var list = state.favs.map(function (id) { return BYID[id]; }).filter(Boolean);
    app.innerHTML = crumbs([[t('favs.title')]]) + '<div class="wrap pagehead"><h1>' + t('favs.title') + '</h1></div><div class="wrap" style="padding-bottom:64px">' +
      (list.length ? '<div class="grid">' + list.map(function (p) { return card(p); }).join('') + '</div>'
        : '<div class="empty">' + icon('heart') + '<h3>' + t('favs.empty') + '</h3><a class="btn btn--dark" href="#/produse">' + t('nav.all') + '</a></div>') + '</div>';
  }
  function showNew() {
    $('#modal').innerHTML = '<div class="modal__box" role="dialog" aria-modal="true"><button class="xbtn" type="button" data-close aria-label="' + t('close') + '">' + icon('x') + '</button><h2>' + t('new.title') + '</h2><ul class="newlist">' +
      t('new.items').map(function (it) { return '<li>' + icon('check') + '<div><b>' + it[0] + '</b><span>' + it[1] + '</span></div></li>'; }).join('') + '</ul></div>';
    $('#modal').hidden = false;
  }

  /* ----------------------------------------------------------------- router */
  function route() {
    var h = location.hash.replace(/^#/, '') || '/', parts = h.split('?'), path = parts[0], q = new URLSearchParams(parts[1] || '');
    closeOverlays(); onCartChange = null;
    var fresh = app.cloneNode(false); app.parentNode.replaceChild(fresh, app); app = fresh; // curăță listener-ele vechi
    var m;
    if (path === '/' || path === '') viewHome();
    else if (path === '/produse') viewCatalog(q);
    else if ((m = path.match(/^\/p\/(\d+)/))) viewProduct(+m[1]);
    else if (path === '/comanda') viewCheckout();
    else if (path === '/livrare') viewShipping();
    else if (path === '/preturi') viewPrices();
    else if (path === '/info') viewInfo();
    else if (path === '/contact') viewContact();
    else if (path === '/favorite') viewFavs();
    else viewHome();
    var key = path.split('/')[1] || '';
    if (key === 'p') key = 'produse';
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('is-active', a.dataset.nav === key); });
    if (path !== '/produse') { var qi = $('#q'); if (qi) qi.value = ''; }
    window.scrollTo(0, 0);
  }

  /* ---------------------------------------------------------- global events */
  document.addEventListener('click', function (e) {
    var el;
    if ((el = e.target.closest('[data-add]'))) {
      var src = el.dataset.qty && $(el.dataset.qty);
      addToCart(+el.dataset.add, src ? +src.textContent : 1);
      el.classList.add('is-done'); setTimeout(function () { el.classList.remove('is-done'); }, 1200);
    }
    else if ((el = e.target.closest('[data-fav]'))) { e.preventDefault(); toggleFav(+el.dataset.fav); }
    else if ((el = e.target.closest('[data-cart-open]'))) openCart();
    else if ((el = e.target.closest('[data-nav-open]'))) openDrawer('#nav-drawer');
    else if ((el = e.target.closest('[data-inc]'))) setQty(el.dataset.inc, (state.cart[el.dataset.inc] || 0) + 1);
    else if ((el = e.target.closest('[data-dec]'))) setQty(el.dataset.dec, (state.cart[el.dataset.dec] || 0) - 1);
    else if ((el = e.target.closest('[data-rm]'))) setQty(el.dataset.rm, 0);
    else if ((el = e.target.closest('[data-lang]'))) { state.lang = el.dataset.lang; store.set('lang', state.lang); renderChrome(); route(); }
    else if ((el = e.target.closest('[data-new]'))) showNew();
    else if ((el = e.target.closest('[data-lbstep]'))) { lb.i = (lb.i + +el.dataset.lbstep + lb.list.length) % lb.list.length; $('#lightbox')._draw(); }
    else if ((el = e.target.closest('[data-close]')) || e.target.id === 'scrim' || e.target.id === 'lightbox' || e.target.id === 'modal') closeOverlays();
    else if ((el = e.target.closest('.navlist a, .mega__panel a'))) {
      closeOverlays();
      var mega = el.closest('.mega');
      if (mega) { mega.style.pointerEvents = 'none'; setTimeout(function () { mega.style.pointerEvents = ''; }, 400); }
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeOverlays();
    if (!$('#lightbox').hidden && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { lb.i = (lb.i + (e.key === 'ArrowRight' ? 1 : -1) + lb.list.length) % lb.list.length; $('#lightbox')._draw(); }
  });
  // imagine lipsă -> substitut discret
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el.tagName === 'IMG' && !el.dataset.fb) {
      el.dataset.fb = 1;
      el.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#f4f1ec"/><path d="M38 86V56a22 22 0 0 1 44 0v30z" fill="none" stroke="#d0c8bc" stroke-width="4"/></svg>');
    }
  }, true);
  window.addEventListener('hashchange', route);

  renderChrome();
  route();
})();
