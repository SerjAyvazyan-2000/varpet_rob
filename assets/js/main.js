/* Varpet Rob — main.js (без библиотек) */
(() => {
  'use strict';

  /* ====== НАСТРОЙКИ: впишите реальные контакты мастера ====== */
  const CONFIG = {
    instagram: 'varpet_rob',
    phone: '',      // например: '+374 99 123 456' — показывается в контактах
    whatsapp: '',   // только цифры, например: '37499123456'
    telegram: '',   // username без @, например: 'varpet_rob'
  };

  /* ====== РАБОТЫ МАСТЕРА ======
     Фото кладите в assets/images/works/ и перечисляйте здесь.
     product — что подставится в форму заказа при клике «Хочу такой». */
  const WORKS = [
    // { src: 'assets/images/works/01.jpg', title: 'Ремень, коньяк', product: 'Ремень' },
    { src: 'assets/images/belt.svg', title: 'Ремень', product: 'Ремень' },
    { src: 'assets/images/wallet.svg', title: 'Кошелёк', product: 'Кошелёк' },
    { src: 'assets/images/cardholder.svg', title: 'Картхолдер', product: 'Картхолдер' },
    { src: 'assets/images/keyholder.svg', title: 'Брелок', product: 'Брелок' },
    { src: 'assets/images/strap.svg', title: 'Ремешок для часов', product: 'Ремешок для часов' },
    { src: 'assets/images/bag.svg', title: 'Сумка', product: 'Сумка / чехол' },
  ];

  /* ====== ОТЗЫВЫ (скриншоты сторис) ======
     Скриншоты кладите в assets/images/reviews/. Пока список пуст — блок скрыт. */
  const REVIEWS = [
    // { src: 'assets/images/reviews/01.jpg', title: 'Отзыв покупателя' },
  ];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } },
  };

  /* ====== Toast ====== */
  const toastEl = $('#toast');
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-visible'), 2800);
  };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  };

  /* ====== Contacts ====== */
  const igDirect = `https://ig.me/m/${CONFIG.instagram}`;
  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
  const contactRows = {
    phone: CONFIG.phone && { href: `tel:${CONFIG.phone.replace(/[^\d+]/g, '')}`, label: CONFIG.phone },
    whatsapp: CONFIG.whatsapp && { href: `https://wa.me/${CONFIG.whatsapp}`, label: 'Написать' },
    telegram: CONFIG.telegram && { href: `https://t.me/${CONFIG.telegram}`, label: `@${CONFIG.telegram}` },
  };
  $$('[data-contact]').forEach((a) => {
    const row = contactRows[a.dataset.contact];
    if (!row) { a.closest('li').hidden = true; return; }
    a.href = row.href; a.textContent = row.label;
  });
  $('#year').textContent = new Date().getFullYear();

  // Отправка текста мастеру: WhatsApp, если номер указан, иначе Instagram Direct
  const sendToMaster = async (text) => {
    if (CONFIG.whatsapp) { window.open(waLink(text), '_blank', 'noopener'); return; }
    const ok = await copy(text);
    toast(ok ? 'Текст заказа скопирован — вставьте его в Direct' : 'Откроется Direct — опишите заказ там');
    setTimeout(() => window.open(igDirect, '_blank', 'noopener'), 500);
  };

  /* ====== Load sequence (единственная «оркестрованная» анимация) ====== */
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded')));
  document.body.classList.add('is-loaded');

  /* ====== Header / menu ====== */
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });

  /* ====== Scroll engine: один rAF на всё ====== */
  const root = document.documentElement;
  const parallaxEls = $$('[data-parallax]');
  const steps = $$('.step');
  const stepNum = $('#stepNum');
  const stepRing = $('.process__ring');
  const navLinks = $$('.nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let lastY = scrollY, ticking = false, activeStep = 0;

  const onScroll = () => {
    const y = scrollY;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--p', clamp(y / max).toFixed(4));

    header.classList.toggle('is-solid', y > 40);
    if (!nav.classList.contains('is-open')) header.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;

    if (!reduce) {
      parallaxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.setProperty('--py', `${(r.top * parseFloat(el.dataset.parallax)).toFixed(1)}px`);
      });
    }

    // этапы работы
    const mid = innerHeight * 0.55;
    let idx = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) idx = i; });
    if (idx !== activeStep || !steps[idx].classList.contains('is-active')) {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      if (idx !== activeStep) {
        stepNum.classList.add('is-swap');
        requestAnimationFrame(() => { stepNum.textContent = idx + 1; requestAnimationFrame(() => stepNum.classList.remove('is-swap')); });
      }
      stepRing.style.setProperty('--sp', ((idx + 1) / steps.length).toFixed(2));
      activeStep = idx;
    }

    // активный пункт меню
    let cur = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s; });
    navLinks.forEach((a) => a.classList.toggle('is-active', cur && a.getAttribute('href') === `#${cur.id}`));

    ticking = false;
  };
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', requestTick, { passive: true });
  let rT;
  addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(onScroll, 120); });
  onScroll();

  /* ====== Hero: параллакс за курсором с инерцией ====== */
  const stage = $('#heroStage');
  if (stage && finePointer && !reduce) {
    const layers = $$('[data-depth]', stage).map((el) => ({ el, d: parseFloat(el.dataset.depth), x: 0, y: 0 }));
    let tx = 0, ty = 0, running = false;
    const hero = $('.hero');
    hero.addEventListener('pointermove', (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2;
      ty = (e.clientY / innerHeight - 0.5) * 2;
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    function loop() {
      let moving = false;
      const scrollShift = Math.min(scrollY, innerHeight) * 0.12;
      layers.forEach((l) => {
        const gx = tx * 22 * l.d, gy = ty * 18 * l.d - scrollShift * l.d;
        l.x += (gx - l.x) * 0.08; l.y += (gy - l.y) * 0.08;
        if (Math.abs(gx - l.x) > 0.05 || Math.abs(gy - l.y) > 0.05) moving = true;
        l.el.style.setProperty('--tx', l.x.toFixed(2));
        l.el.style.setProperty('--ty', l.y.toFixed(2));
      });
      if (moving) requestAnimationFrame(loop); else running = false;
    }
    addEventListener('scroll', () => { if (!running && scrollY < innerHeight) { running = true; requestAnimationFrame(loop); } }, { passive: true });
  }

  /* ====== Магнитные кнопки (мягко, через CSS-transition) ====== */
  if (finePointer && !reduce) {
    $$('.btn').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
        b.style.setProperty('--my', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  /* ====== Reveal ====== */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.2 }) : null;
  $$('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('is-in')));

  /* ====== Слайдеры работ и отзывов + лайтбокс ====== */
  const esc = (t) => String(t).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const lightbox = $('#lightbox');
  const lbImg = $('img', lightbox);
  const lbCap = $('figcaption', lightbox);
  let lbList = [], lbIndex = 0;
  const lbShow = (i) => {
    lbIndex = (i + lbList.length) % lbList.length;
    const it = lbList[lbIndex];
    lbImg.src = it.src; lbImg.alt = it.title || ''; lbCap.textContent = it.title || '';
  };
  const lbOpen = (list, i) => { lbList = list; lbShow(i); if (lightbox.showModal) lightbox.showModal(); else lightbox.setAttribute('open', ''); };
  $$('[data-dir]', lightbox).forEach((b) => b.addEventListener('click', () => lbShow(lbIndex + +b.dataset.dir)));
  $('[data-close]', lightbox).addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.tagName === 'FIGURE') lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') lbShow(lbIndex + 1); if (e.key === 'ArrowLeft') lbShow(lbIndex - 1); });
  let touchX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - touchX; if (Math.abs(d) > 50) lbShow(lbIndex + (d < 0 ? 1 : -1)); });

  const initSlider = (section, list, { order = true } = {}) => {
    if (!list.length) return;
    section.hidden = false;
    const slider = $('.slider', section);
    const track = $('.slider__track', section);
    track.innerHTML = list.map((it, i) => `
      <li class="work">
        <figure>
          <button class="work__media" type="button" data-i="${i}" aria-label="Открыть фото: ${esc(it.title || '')}">
            <img src="${esc(it.src)}" alt="${esc(it.title || '')}" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async" draggable="false">
          </button>
          ${order || it.title ? `<figcaption><b>${esc(it.title || '')}</b>${order ? `<a href="#order" data-product="${esc(it.product || '')}">Хочу такой</a>` : ''}</figcaption>` : ''}
        </figure>
      </li>`).join('');
    const items = $$('.work', track);
    const btns = $$('.slider__btn', section);
    const cur = $('.slider__count b', section);
    $('.slider__count i', section).textContent = list.length;
    const bar = $('.slider__progress span', section);
    const step = () => (items[1] ? items[1].offsetLeft - items[0].offsetLeft : slider.clientWidth);
    const update = () => {
      const max = slider.scrollWidth - slider.clientWidth;
      const idx = Math.min(list.length - 1, Math.round(slider.scrollLeft / step()));
      cur.textContent = idx + 1;
      bar.style.setProperty('--sp2', max > 0 ? (slider.scrollLeft / max).toFixed(3) : 1);
      btns[0].disabled = slider.scrollLeft < 4;
      btns[1].disabled = slider.scrollLeft > max - 4;
    };
    btns.forEach((b) => b.addEventListener('click', () => slider.scrollBy({ left: step() * +b.dataset.dir, behavior: reduce ? 'auto' : 'smooth' })));
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); slider.scrollBy({ left: step() * (e.key === 'ArrowRight' ? 1 : -1), behavior: 'smooth' }); }
    });
    let raf = 0;
    slider.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();

    // перетаскивание мышью на компьютере
    let down = false, moved = false, startX = 0, startL = 0;
    slider.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startL = slider.scrollLeft; });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; slider.classList.add('is-dragging'); }
      if (moved) slider.scrollLeft = startL - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false;
      if (moved) {
        slider.classList.remove('is-dragging');
        const target = Math.round(slider.scrollLeft / step()) * step();
        slider.scrollTo({ left: target, behavior: 'smooth' });
      }
    });
    track.addEventListener('click', (e) => {
      if (moved) { e.preventDefault(); return; }
      const b = e.target.closest('.work__media');
      if (b) lbOpen(list, +b.dataset.i);
    });
  };
  initSlider($('#works'), WORKS);
  initSlider($('#reviews'), REVIEWS, { order: false });
  if (REVIEWS.length) $$('[data-reviews-link]').forEach((a) => { a.hidden = false; });

  /* ====== Конструктор ремня ====== */
  const form = $('#builderForm');
  const el = {
    group: $('#beltGroup'), strap: $('#strap'), shade: $('#strapShadeR'), grain: $('#strapGrain'),
    stitch: $('#stitch'), holes: $('#holes'), initials: $('#initials'),
    frame: $('#buckleFrame'), pin: $('#bucklePin'), keeper: $('#keeper'), caption: $('#beltCaption'),
    bk: [$('#bk1'), $('#bk2'), $('#bk3')],
  };
  const BUCKLES = {
    'Сталь': ['#f1eee7', '#8f8c85', '#fbf9f4'],
    'Латунь': ['#f6e2a4', '#9c7a3c', '#efd383'],
    'Чёрная': ['#5a5a60', '#141416', '#46464c'],
  };
  const shade = (hex, amt) => {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.round(clamp(c + (amt > 0 ? (255 - c) * amt : c * amt), 0, 255));
    return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, '0')).join('')}`;
  };
  const read = () => {
    const fd = new FormData(form);
    const leatherInput = $('input[name="leather"]:checked', form);
    const threadInput = $('input[name="thread"]:checked', form);
    return {
      leather: fd.get('leather'), color: leatherInput.dataset.color,
      width: +fd.get('width'), buckle: fd.get('buckle'),
      thread: fd.get('thread'), threadColor: threadInput.dataset.color,
      initials: (fd.get('initials') || '').toUpperCase().trim(),
      waist: fd.get('waist'),
    };
  };
  const setRect = (node, x, y, w, h) => { node.setAttribute('x', x); node.setAttribute('y', y); node.setAttribute('width', w); node.setAttribute('height', h); };
  const describe = (c) => [
    'Здравствуйте! Хочу заказать ремень:',
    `• кожа: ${c.leather}`, `• ширина: ${c.width} мм`, `• пряжка: ${c.buckle}`, `• нить: ${c.thread}`,
    c.initials ? `• тиснение: ${c.initials}` : null,
    c.waist ? `• обхват талии: ${c.waist} см` : null,
  ].filter(Boolean).join('\n');

  const renderBelt = (bump = true) => {
    const c = read();
    const h = { 30: 52, 35: 60, 40: 68 }[c.width];
    const cy = 110, top = cy - h / 2;
    [el.strap, el.shade, el.grain].forEach((n) => setRect(n, 40, top, 820, h));
    el.strap.setAttribute('fill', c.color);
    setRect(el.stitch, 52, top + 8, 796, h - 16);
    el.stitch.setAttribute('stroke', c.threadColor === 'tone' ? shade(c.color, c.color === '#1b1715' ? 0.28 : 0.22) : c.threadColor);
    setRect(el.frame, 30, cy - (h + 36) / 2, 74, h + 36);
    setRect(el.pin, 62, cy - (h + 32) / 2, 9, h + 32);
    setRect(el.keeper, 128, cy - (h + 16) / 2, 22, h + 16);
    el.keeper.setAttribute('fill', shade(c.color, -0.12));
    BUCKLES[c.buckle].forEach((col, i) => el.bk[i].setAttribute('stop-color', col));
    el.holes.innerHTML = [0, 1, 2, 3, 4].map((i) => `<circle cx="${704 + i * 28}" cy="${cy}" r="${h > 60 ? 5.5 : 4.8}" fill="${shade(c.color, -0.6)}"/>`).join('');
    el.initials.textContent = c.initials;
    el.initials.setAttribute('y', cy + 9);
    el.caption.textContent = `${c.leather}, ${c.width} мм, пряжка — ${c.buckle.toLowerCase()}, нить — ${c.thread.toLowerCase()}${c.initials ? `, тиснение «${c.initials}»` : ''}`;
    if (bump && !reduce) {
      el.group.style.transform = 'scale(1.018)';
      clearTimeout(renderBelt.t);
      renderBelt.t = setTimeout(() => { el.group.style.transform = ''; }, 180);
    }
    return c;
  };
  form.addEventListener('input', () => renderBelt());
  form.addEventListener('submit', (e) => e.preventDefault());
  renderBelt(false);

  const sendWa = $('#sendWa');
  const sendTg = $('#sendTg');
  if (!CONFIG.whatsapp) sendWa.querySelector('span').textContent = 'Отправить в Instagram';
  if (!CONFIG.telegram) sendTg.hidden = true;
  sendWa.addEventListener('click', (e) => { e.preventDefault(); sendToMaster(describe(read())); });
  sendTg.addEventListener('click', async (e) => {
    e.preventDefault();
    const ok = await copy(describe(read()));
    toast(ok ? 'Текст скопирован — вставьте его в чат Telegram' : 'Откроется Telegram — опишите заказ там');
    setTimeout(() => window.open(`https://t.me/${CONFIG.telegram}`, '_blank', 'noopener'), 500);
  });
  $('#copyCfg').addEventListener('click', async () => {
    toast((await copy(describe(read()))) ? 'Конфигурация скопирована' : 'Не удалось скопировать — выделите текст под превью');
  });

  // Ссылки «Узнать цену» подставляют изделие в форму заказа
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-product]');
    if (!a) return;
    const sel = $('#orderForm select[name="product"]');
    const opt = [...sel.options].find((o) => o.text === a.dataset.product);
    if (opt) sel.value = opt.value;
  });

  /* ====== FAQ: плавное раскрытие ====== */
  $$('.qa').forEach((d) => {
    const sum = $('summary', d);
    const body = $('.qa__body', d);
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove('is-open');
        const done = () => { d.open = false; body.removeEventListener('transitionend', done); };
        if (reduce) done(); else body.addEventListener('transitionend', done);
      } else {
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
      }
    });
  });

  /* ====== Форма заказа ====== */
  const orderForm = $('#orderForm');
  const status = $('#orderStatus');
  const consentErr = $('.field__err--consent');
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    ['name', 'phone'].forEach((n) => {
      const input = orderForm.elements[n];
      const bad = n === 'phone' ? input.value.replace(/\D/g, '').length < 7 : !input.value.trim();
      input.closest('.field').classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', String(bad));
      if (bad && ok) { input.focus(); ok = false; }
    });
    const consent = orderForm.elements.consent.checked;
    consentErr.classList.toggle('is-shown', !consent);
    if (!ok || !consent) return;
    const f = orderForm.elements;
    const text = [
      'Здравствуйте! Заявка с сайта.',
      `Имя: ${f.name.value.trim()}`, `Телефон: ${f.phone.value.trim()}`, `Изделие: ${f.product.value}`,
      f.message.value.trim() ? `Комментарий: ${f.message.value.trim()}` : null,
    ].filter(Boolean).join('\n');
    sendToMaster(text);
    status.textContent = CONFIG.whatsapp ? 'Открываю WhatsApp с текстом заявки…' : 'Открываю Instagram Direct — текст заявки скопирован.';
  });
  orderForm.addEventListener('input', (e) => {
    const f = e.target.closest('.field');
    if (f) f.classList.remove('is-invalid');
    if (e.target.name === 'consent' && e.target.checked) consentErr.classList.remove('is-shown');
  });
  if (!CONFIG.whatsapp) $('#orderForm [type="submit"] span').textContent = 'Отправить заявку в Instagram';

  /* ====== Политика конфиденциальности (dialog) ====== */
  const privacy = $('#privacy');
  $$('[data-open="privacy"]').forEach((b) => b.addEventListener('click', () => {
    if (typeof privacy.showModal === 'function') privacy.showModal(); else privacy.setAttribute('open', '');
  }));
  $$('[data-close]', privacy).forEach((b) => b.addEventListener('click', () => privacy.close ? privacy.close() : privacy.removeAttribute('open')));
  privacy.addEventListener('click', (e) => { if (e.target === privacy) privacy.close(); });

  /* ====== Cookie consent ====== */
  const CONSENT_KEY = 'vr-consent-v1';
  const banner = $('#cookie');
  const prefs = $('#cookiePrefs');
  const ckAnalytics = $('#ckAnalytics');

  // Подключайте сюда счётчики (Яндекс.Метрика, GA и т.п.) — они загрузятся ТОЛЬКО после согласия
  const loadAnalytics = () => { /* window.__analyticsLoaded = true; */ };

  const applyConsent = (c) => { if (c && c.analytics) loadAnalytics(); };
  const showBanner = () => { banner.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('is-visible'))); };
  const hideBanner = () => { banner.classList.remove('is-visible'); setTimeout(() => { banner.hidden = true; }, 700); };
  const save = (analytics) => {
    const c = { analytics, necessary: true, date: new Date().toISOString() };
    store.set(CONSENT_KEY, c); applyConsent(c); hideBanner();
    toast(analytics ? 'Спасибо! Настройки сохранены' : 'Сохранено: только необходимые');
  };
  const existing = store.get(CONSENT_KEY);
  if (existing) applyConsent(existing); else setTimeout(showBanner, 1400);

  $('#ckAccept').addEventListener('click', () => save(true));
  $('#ckReject').addEventListener('click', () => save(false));
  $('#ckCustomize').addEventListener('click', (e) => {
    if (prefs.hidden) { prefs.hidden = false; e.currentTarget.querySelector('span').textContent = 'Сохранить выбор'; }
    else save(ckAnalytics.checked);
  });
  $('#cookieSettings').addEventListener('click', () => {
    const c = store.get(CONSENT_KEY);
    ckAnalytics.checked = !!(c && c.analytics);
    prefs.hidden = false;
    $('#ckCustomize span').textContent = 'Сохранить выбор';
    showBanner();
  });
})();
