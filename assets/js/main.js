/* Varpet Rob — main.js (без библиотек) */
(() => {
  'use strict';

  /* ====== КОНТАКТЫ ====== */
  const CONFIG = {
    instagram: 'varpet_rob',
    phone: '+7 918 982-68-57',
    whatsapp: '79189826857', // только цифры; оставьте '' — заявки пойдут в Instagram Direct
  };

  /* ====== РАБОТЫ МАСТЕРА (фото из Instagram @varpet_rob) ======
     cat: wallet | cover | card | shoes | acc
     product — что подставится в форму заказа по кнопке «Хочу такой» */
  const W = 'assets/images/works/';
  const WORKS = [
    { src: W + 'portmone-ryzhee.webp', title: 'Портмоне, рыжий', cat: 'wallet', product: 'Портмоне' },
    { src: W + 'koshelek-bordo.webp', title: 'Кошелёк на молнии, бордо', cat: 'wallet', product: 'Кошелёк' },
    { src: W + 'oblozhka-raskrytaya.webp', title: 'Обложки для документов', cat: 'cover', product: 'Обложка для документов' },
    { src: W + 'shlepancy-krest.webp', title: 'Шлёпанцы с перекрёстом', cat: 'shoes', product: 'Шлёпанцы' },
    { src: W + 'zazhim.webp', title: 'Зажим для купюр и карт', cat: 'card', product: 'Зажим для купюр' },
    { src: W + 'portmone-bordo.webp', title: 'Портмоне на кнопке, бордо', cat: 'wallet', product: 'Портмоне' },
    { src: W + 'kartholdery.webp', title: 'Картхолдеры', cat: 'card', product: 'Картхолдер' },
    { src: W + 'futlyar-dlya-ochkov.webp', title: 'Футляр для очков', cat: 'acc', product: 'Футляр для очков' },
    { src: W + 'oblozhka-bordo.webp', title: 'Обложка для паспорта, бордо', cat: 'cover', product: 'Обложка для документов' },
    { src: W + 'shlepancy-tisnenie.webp', title: 'Шлёпанцы с тиснением', cat: 'shoes', product: 'Шлёпанцы' },
    { src: W + 'portmone-shokolad.webp', title: 'Портмоне, шоколад', cat: 'wallet', product: 'Портмоне' },
    { src: W + 'oblozhki-ryzhie.webp', title: 'Обложки, рыжий', cat: 'cover', product: 'Обложка для документов' },
    { src: W + 'shlepancy-klassika.webp', title: 'Шлёпанцы, классика', cat: 'shoes', product: 'Шлёпанцы' },
    { src: W + 'nabor-bordo.webp', title: 'Изделия в бордо', cat: 'wallet', product: 'Портмоне' },
    { src: W + 'zazhim-instrumenty.webp', title: 'Зажим для купюр, шоколад', cat: 'card', product: 'Зажим для купюр' },
    { src: W + 'shlepancy-krest-2.webp', title: 'Шлёпанцы на мягкой подошве', cat: 'shoes', product: 'Шлёпанцы' },
    { src: W + 'shlepancy-detal.webp', title: 'Шлёпанцы, детали', cat: 'shoes', product: 'Шлёпанцы' },
  ];
  const CAT_LABEL = { wallet: 'Портмоне', cover: 'Обложка', card: 'Картхолдер', shoes: 'Обувь', acc: 'Аксессуар' };

  /* Подбор изделия: какие реальные фото показывать */
  const PREVIEW = {
    'Портмоне': { ryzhiy: 'portmone-ryzhee', bordo: 'portmone-bordo', shokolad: 'portmone-shokolad' },
    'Кошелёк': { bordo: 'koshelek-bordo' },
    'Обложка для документов': { ryzhiy: 'oblozhki-ryzhie', bordo: 'oblozhka-bordo' },
    'Картхолдер': { ryzhiy: 'kartholdery', shokolad: 'kartholdery' },
    'Зажим для купюр': { shokolad: 'zazhim' },
    'Футляр для очков': { ryzhiy: 'futlyar-dlya-ochkov' },
    'Шлёпанцы': { black: 'shlepancy-klassika' },
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const esc = (t) => String(t).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage off */ } },
  };

  /* ====== Toast / clipboard ====== */
  const toastEl = $('#toast');
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-visible'), 2800);
  };
  const copy = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };

  /* ====== Contacts ====== */
  const igDirect = `https://ig.me/m/${CONFIG.instagram}`;
  const contactRows = {
    phone: CONFIG.phone && { href: `tel:${CONFIG.phone.replace(/[^\d+]/g, '')}`, label: CONFIG.phone },
    whatsapp: CONFIG.whatsapp && { href: `https://wa.me/${CONFIG.whatsapp}`, label: 'Написать' },
  };
  $$('[data-contact]').forEach((a) => {
    const row = contactRows[a.dataset.contact];
    if (!row) { a.closest('li').hidden = true; return; }
    a.href = row.href; a.textContent = row.label;
  });
  $('#year').textContent = new Date().getFullYear();
  const sendToMaster = async (text) => {
    if (CONFIG.whatsapp) { window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener'); return; }
    const ok = await copy(text);
    toast(ok ? 'Текст скопирован — вставьте его в Direct' : 'Откроется Direct — опишите заказ там');
    setTimeout(() => window.open(igDirect, '_blank', 'noopener'), 500);
  };

  /* ====== Split headings into words ====== */
  $$('[data-split]').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
  });
  $$('[data-reveal-group]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty('--i', i)));

  /* ====== Load sequence ====== */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.documentElement.classList.add('is-loaded');
    document.body.classList.add('is-loaded');
  }));

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

  /* ====== Reveal ====== */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('[data-reveal], [data-reveal-group], [data-split]').forEach((el) => (io && !reduce ? io.observe(el) : el.classList.add('is-in')));

  /* ====== Scroll engine: один rAF на всё ====== */
  const root = document.documentElement;
  const parallaxEls = $$('[data-parallax]');
  const innerPar = $$('[data-inner-parallax]');
  const steps = $$('.step');
  const stepNum = $('#stepNum');
  const stepImgs = $$('.process__media img');
  const navLinks = $$('.nav a');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  let lastY = scrollY, ticking = false, activeStep = 0;

  const setStep = (idx) => {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    if (idx === activeStep) return;
    stepImgs.forEach((im, i) => { im.classList.toggle('was-on', i === activeStep); im.classList.toggle('is-on', i === idx); });
    stepNum.classList.add('is-swap');
    requestAnimationFrame(() => { stepNum.textContent = idx + 1; requestAnimationFrame(() => stepNum.classList.remove('is-swap')); });
    activeStep = idx;
  };

  const onScroll = () => {
    const y = scrollY;
    root.style.setProperty('--p', clamp(y / (root.scrollHeight - innerHeight)).toFixed(4));
    header.classList.toggle('is-solid', y > 40);
    if (!nav.classList.contains('is-open')) header.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;

    if (!reduce) {
      parallaxEls.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.setProperty('--py', `${(r.top * parseFloat(el.dataset.parallax)).toFixed(1)}px`);
      });
      innerPar.forEach((im) => {
        const r = im.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        im.style.setProperty('--ip', `${(-p * r.height * 0.15 - r.height * 0.09).toFixed(1)}px`);
      });
    }

    const mid = innerHeight * 0.55;
    let idx = 0;
    steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) idx = i; });
    setStep(idx);

    let cur = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s; });
    navLinks.forEach((a) => a.classList.toggle('is-active', !!cur && a.getAttribute('href') === `#${cur.id}`));
    ticking = false;
  };
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', requestTick);
  steps[0] && steps[0].classList.add('is-active');
  onScroll();

  /* ====== Hero: параллакс за курсором и скроллом с инерцией ====== */
  const stage = $('#heroStage');
  if (stage && !reduce) {
    const layers = $$('[data-depth]', stage).map((el) => ({ el, d: parseFloat(el.dataset.depth), x: 0, y: 0 }));
    let tx = 0, ty = 0, running = false;
    const hero = $('.hero');
    const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };
    if (finePointer) {
      hero.addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; kick(); });
      hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
    }
    function loop() {
      let moving = false;
      const s = Math.min(scrollY, innerHeight) * 0.14;
      layers.forEach((l) => {
        const gx = tx * 18 * l.d, gy = ty * 14 * l.d - s * (l.d - 0.2);
        l.x += (gx - l.x) * 0.08; l.y += (gy - l.y) * 0.08;
        if (Math.abs(gx - l.x) > 0.05 || Math.abs(gy - l.y) > 0.05) moving = true;
        l.el.style.setProperty('--tx', l.x.toFixed(2));
        l.el.style.setProperty('--ty', l.y.toFixed(2));
      });
      if (moving) requestAnimationFrame(loop); else running = false;
    }
    addEventListener('scroll', () => { if (scrollY < innerHeight * 1.2) kick(); }, { passive: true });
  }

  /* ====== Магнитные кнопки ====== */
  if (finePointer && !reduce) {
    document.addEventListener('pointermove', (e) => {
      const b = e.target.closest && e.target.closest('.btn');
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
      b.style.setProperty('--my', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
    });
    document.addEventListener('pointerout', (e) => {
      const b = e.target.closest && e.target.closest('.btn');
      if (b && !b.contains(e.relatedTarget)) { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); }
    });
  }

  /* ====== Курсор-подсказка ====== */
  const cursor = $('#cursor');
  if (finePointer && !reduce) {
    let cx = -200, cy = -200;
    addEventListener('pointermove', (e) => {
      cx = e.clientX; cy = e.clientY;
      cursor.style.setProperty('--cx', `${cx}px`); cursor.style.setProperty('--cy', `${cy}px`);
    }, { passive: true });
  }

  /* ====== Лайтбокс ====== */
  const lightbox = $('#lightbox');
  const lbImg = $('img', lightbox);
  const lbCap = $('figcaption', lightbox);
  let lbList = [], lbIndex = 0;
  const lbShow = (i) => {
    lbIndex = (i + lbList.length) % lbList.length;
    const it = lbList[lbIndex];
    lbImg.src = it.src; lbImg.alt = it.title; lbCap.textContent = it.title;
  };
  const lbOpen = (list, i) => { lbList = list; lbShow(i); if (lightbox.showModal) lightbox.showModal(); else lightbox.setAttribute('open', ''); };
  $$('[data-dir]', lightbox).forEach((b) => b.addEventListener('click', () => lbShow(lbIndex + +b.dataset.dir)));
  $('[data-close]', lightbox).addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target.tagName === 'FIGURE') lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') lbShow(lbIndex + 1); if (e.key === 'ArrowLeft') lbShow(lbIndex - 1); });
  let touchX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - touchX; if (Math.abs(d) > 50) lbShow(lbIndex + (d < 0 ? 1 : -1)); });

  /* ====== Слайдер работ: фильтры, 3D-перспектива, автопрокрутка, drag ====== */
  const section = $('#works');
  const slider = $('#worksSlider');
  const track = $('#worksTrack');
  const btns = $$('.slider__btn', section);
  const curEl = $('.slider__count b', section);
  const totalEl = $('.slider__count i', section);
  const bar = $('.slider__progress span', section);
  let list = WORKS.slice();
  const pad = (n) => String(n).padStart(2, '0');

  const render = () => {
    track.innerHTML = list.map((it, i) => `
      <li class="work is-entering" style="--i:${i}">
        <figure>
          <button class="work__media" type="button" data-i="${i}" aria-label="Открыть фото: ${esc(it.title)}">
            <span class="work__tag">${CAT_LABEL[it.cat]}</span>
            <img src="${esc(it.src)}" alt="${esc(it.title)}" loading="${i < 4 ? 'eager' : 'lazy'}" decoding="async" draggable="false">
          </button>
          <figcaption><b>${esc(it.title)}</b><a href="#order" data-product="${esc(it.product)}">Хочу такой</a></figcaption>
        </figure>
      </li>`).join('');
    totalEl.textContent = pad(list.length);
    slider.scrollLeft = 0;
    setTimeout(() => $$('.work', track).forEach((w) => w.classList.remove('is-entering')), 1600);
    update();
  };
  const step = () => { const it = $$('.work', track); return it[1] ? it[1].offsetLeft - it[0].offsetLeft : slider.clientWidth; };
  const update = () => {
    const max = slider.scrollWidth - slider.clientWidth;
    const idx = Math.min(list.length - 1, Math.round(slider.scrollLeft / step()));
    curEl.textContent = pad(idx + 1);
    bar.style.setProperty('--sp2', max > 0 ? (slider.scrollLeft / max).toFixed(3) : 1);
    btns[0].disabled = slider.scrollLeft < 4;
    btns[1].disabled = slider.scrollLeft > max - 4;
    if (reduce) return;
    // 3D: карточки по краям слегка поворачиваются и уменьшаются, фото внутри смещается
    const vw = innerWidth, center = vw / 2;
    $$('.work', track).forEach((w) => {
      const r = w.getBoundingClientRect();
      if (r.right < -200 || r.left > vw + 200) return;
      const d = clamp((r.left + r.width / 2 - center) / vw, -1, 1);
      const f = w.firstElementChild;
      f.style.setProperty('--ry', `${(-d * 10).toFixed(2)}deg`);
      f.style.setProperty('--sc', (1 - Math.abs(d) * 0.08).toFixed(3));
      f.style.setProperty('--lift', `${(Math.abs(d) * 18).toFixed(1)}px`);
      const img = w.querySelector('.work__media img');
      img.style.setProperty('--px', `${(d * -28).toFixed(1)}px`);
    });
  };
  let raf = 0;
  slider.addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update);
  const go = (dir) => slider.scrollBy({ left: step() * dir, behavior: reduce ? 'auto' : 'smooth' });
  btns.forEach((b) => b.addEventListener('click', () => { go(+b.dataset.dir); pauseAuto(); }));
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1); pauseAuto(); }
  });

  // фильтры
  $$('.filters button').forEach((b) => b.addEventListener('click', () => {
    $$('.filters button').forEach((x) => { x.classList.toggle('is-active', x === b); x.setAttribute('aria-selected', String(x === b)); });
    const f = b.dataset.filter;
    list = f === 'all' ? WORKS.slice() : WORKS.filter((w) => w.cat === f);
    render(); pauseAuto();
  }));

  // drag мышью + курсор «Тяните»
  let down = false, moved = false, startX = 0, startL = 0, vel = 0, lastX = 0;
  slider.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') return;
    down = true; moved = false; startX = lastX = e.clientX; startL = slider.scrollLeft; vel = 0;
    cursor.classList.add('is-down'); pauseAuto();
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    vel = e.clientX - lastX; lastX = e.clientX;
    if (!moved && Math.abs(dx) > 6) { moved = true; slider.classList.add('is-dragging'); }
    if (moved) slider.scrollLeft = startL - dx;
  });
  addEventListener('pointerup', () => {
    if (!down) return; down = false; cursor.classList.remove('is-down');
    if (moved) {
      slider.classList.remove('is-dragging');
      const s = step();
      const target = Math.round((slider.scrollLeft - vel * 6) / s) * s;
      slider.scrollTo({ left: target, behavior: 'smooth' });
    }
  });
  slider.addEventListener('pointerenter', () => cursor.classList.add('is-on'));
  slider.addEventListener('pointerleave', () => cursor.classList.remove('is-on', 'is-down'));
  track.addEventListener('click', (e) => {
    if (moved) { e.preventDefault(); moved = false; return; }
    const b = e.target.closest('.work__media');
    if (b) lbOpen(list, +b.dataset.i);
  });

  // автопрокрутка: только когда блок на экране и пользователь не трогает
  let autoT = 0, paused = false, visible = false;
  const autoTick = () => {
    if (paused || !visible || document.hidden || reduce) return;
    const max = slider.scrollWidth - slider.clientWidth;
    if (slider.scrollLeft >= max - 4) slider.scrollTo({ left: 0, behavior: 'smooth' }); else go(1);
  };
  const pauseAuto = () => { paused = true; clearTimeout(pauseAuto.t); pauseAuto.t = setTimeout(() => { paused = false; }, 8000); };
  slider.addEventListener('pointerenter', () => { paused = true; });
  slider.addEventListener('pointerleave', () => { paused = false; });
  slider.addEventListener('touchstart', pauseAuto, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0.4 }).observe(slider);
  autoT = setInterval(autoTick, 3800);

  render();

  /* ====== Подбор изделия ====== */
  const form = $('#builderForm');
  const pvA = $('#pvA'), pvB = $('#pvB');
  const pvTitle = $('#pvTitle'), pvNote = $('#pvNote');
  const summary = $('#summary');
  const fSize = $('#fSize'), fInitials = $('#fInitials');
  let front = pvA, lastSrc = '';
  const read = () => {
    const fd = new FormData(form);
    const colorInput = $('input[name="color"]:checked', form);
    return {
      item: fd.get('item'), color: fd.get('color'), key: colorInput.dataset.key,
      thread: fd.get('thread'), initials: (fd.get('initials') || '').trim(), size: fd.get('size'),
    };
  };
  const describe = (c) => [
    `Здравствуйте, Роберт! Хочу заказать: ${c.item.toLowerCase()}.`,
    `Цвет кожи: ${c.color.toLowerCase()}`, `Нить: ${c.thread.toLowerCase()}`,
    c.item === 'Шлёпанцы' ? (c.size ? `Размер: ${c.size}` : null) : (c.initials ? `Тиснение: ${c.initials}` : null),
  ].filter(Boolean).join('\n');
  const renderPreview = (originEvent) => {
    const c = read();
    const map = PREVIEW[c.item];
    const exact = map[c.key];
    const name = exact || Object.values(map)[0];
    const src = `${W}${name}.webp`;
    pvTitle.textContent = c.item;
    pvNote.textContent = exact ? 'Работа мастера в этом цвете' : `Пример работы. В цвете «${c.color.toLowerCase()}» сошью так же`;
    const isShoes = c.item === 'Шлёпанцы';
    fSize.hidden = !isShoes; fInitials.hidden = isShoes;
    summary.textContent = describe(c);
    if (src === lastSrc) return;
    lastSrc = src;
    const back = front === pvA ? pvB : pvA;
    if (originEvent && originEvent.target && originEvent.target.closest) {
      const lbl = originEvent.target.closest('label');
      const fr = $('.builder__frame');
      if (lbl && fr) {
        const a = lbl.getBoundingClientRect(), b = fr.getBoundingClientRect();
        fr.style.setProperty('--ox', `${clamp((a.left + a.width / 2 - b.left) / b.width, 0, 1) * 100}%`);
        fr.style.setProperty('--oy', `${clamp((a.top + a.height / 2 - b.top) / b.height, 0, 1) * 100}%`);
      }
    }
    back.alt = `${c.item} — работа мастера Varpet Rob`;
    let done = false;
    const swap = () => { if (done) return; done = true; back.classList.add('is-on'); front.classList.remove('is-on'); front = back; };
    back.onload = swap; back.src = src;
    if (back.complete && back.naturalWidth) swap();
  };
  form.addEventListener('change', renderPreview);
  form.addEventListener('input', (e) => { if (e.target.type !== 'radio') renderPreview(); });
  form.addEventListener('submit', (e) => e.preventDefault());
  renderPreview();

  const sendWa = $('#sendWa');
  if (!CONFIG.whatsapp) sendWa.hidden = true;
  sendWa.addEventListener('click', (e) => { e.preventDefault(); sendToMaster(describe(read())); });
  $('#sendIg').addEventListener('click', async () => { if (await copy(describe(read()))) toast('Текст скопирован — вставьте его в Direct'); });
  $('#copyCfg').addEventListener('click', async () => toast((await copy(describe(read()))) ? 'Скопировано' : 'Не удалось скопировать — выделите текст выше'));

  // «Хочу такой» подставляет изделие в форму заказа
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
      const bad = n === 'phone' ? input.value.replace(/\D/g, '').length < 10 : !input.value.trim();
      input.closest('.field').classList.toggle('is-invalid', bad);
      input.setAttribute('aria-invalid', String(bad));
      if (bad && ok) { input.focus(); ok = false; }
    });
    const consent = orderForm.elements.consent.checked;
    consentErr.classList.toggle('is-shown', !consent);
    if (!ok || !consent) return;
    const f = orderForm.elements;
    const text = [
      'Здравствуйте, Роберт! Заявка с сайта.',
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

  /* ====== Политика конфиденциальности ====== */
  const privacy = $('#privacy');
  $$('[data-open="privacy"]').forEach((b) => b.addEventListener('click', () => {
    if (typeof privacy.showModal === 'function') privacy.showModal(); else privacy.setAttribute('open', '');
  }));
  $$('[data-close]', privacy).forEach((b) => b.addEventListener('click', () => privacy.close()));
  privacy.addEventListener('click', (e) => { if (e.target === privacy) privacy.close(); });

  /* ====== Cookie consent ====== */
  const CONSENT_KEY = 'vr-consent-v1';
  const banner = $('#cookie');
  const prefs = $('#cookiePrefs');
  const ckAnalytics = $('#ckAnalytics');
  // Счётчики (Яндекс.Метрика и т.п.) подключайте здесь — загрузятся ТОЛЬКО после согласия
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
  if (existing) applyConsent(existing); else setTimeout(showBanner, 1600);
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
