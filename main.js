/* ═══════════════════════════════════════════════════
   main.js — Аура Фитнес Мгновенная Логика Без Задержек
═══════════════════════════════════════════════════ */

// Активная ссылка навигации
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '/' && href === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// Скролл хедера
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    if (window.scrollY > 40) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
}, { passive: true });

// Мобильное меню
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuClose = document.getElementById('mobile-menu-close');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}
if (mobileMenuClose && mobileMenu) {
  mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
}
function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// Плавное проявление при прокрутке
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.05 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// Лайтбокс галереи
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.classList.add('open');
}

if (lightboxClose && lightbox) {
  lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
}
if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
}

// ═══════════════════════════════════════════════════
// LUXURY СЛАЙДЕР ОТЗЫВОВ
// ═══════════════════════════════════════════════════
let reviewsIndex = 0;
let totalReviewSlides = 0;
let reviewsData = [];
let reviewsAutoTimer = null;

function renderReviews(reviews) {
  if (!reviews || !reviews.length) return;
  reviewsData = reviews;
  totalReviewSlides = reviews.length;

  const track = document.getElementById('reviews-track');
  if (track) {
    track.innerHTML = reviews.map((r, i) => {
      const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
      return `
      <div class="lux-review-slide${i === 0 ? ' active' : ''}" data-index="${i}">
        <div class="lux-review-stars">${stars}</div>
        <blockquote class="lux-review-text">«${r.text}»</blockquote>
        <div class="lux-review-author">
          <div class="lux-review-avatar">${r.name.charAt(0)}</div>
          <div class="lux-review-author-info">
            <div class="lux-review-name">${r.name}</div>
            <div class="lux-review-date">${r.date}</div>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // Заполнить страницу всех отзывов
  const fullGrid = document.getElementById('full-reviews-grid');
  if (fullGrid) {
    fullGrid.innerHTML = reviews.map(r => `
      <div class="review-slide-card">
        <div class="review-slide-quote">"${r.text}"</div>
        <div class="review-slide-user">
          <div class="review-avatar-letter">${r.name.charAt(0)}</div>
          <div>
            <div class="review-user-name">${r.name}</div>
            <div class="review-user-meta">${r.level || 'Клиент клуба'} · ${r.date}</div>
          </div>
        </div>
      </div>`).join('');
  }

  buildDots();
  updateLuxSlider(0, 'none');
  startAutoSlide();
}

function buildDots() {
  const box = document.getElementById('reviews-dots-box');
  if (!box) return;
  box.innerHTML = '';
  reviewsData.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'lux-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Отзыв ${i + 1}`);
    d.addEventListener('click', () => goToSlide(i));
    box.appendChild(d);
  });
}

function goToSlide(idx) {
  const dir = idx > reviewsIndex ? 'next' : 'prev';
  reviewsIndex = idx;
  updateLuxSlider(idx, dir);
  resetAutoSlide();
}

function updateLuxSlider(idx, dir) {
  const slides = document.querySelectorAll('.lux-review-slide');
  if (!slides.length) return;

  // Убираем active только у предыдущего — не у всех сразу
  slides.forEach((s, i) => {
    if (i !== idx) s.classList.remove('active');
  });
  slides[idx].classList.add('active');

  // Прогресс-бар
  const fill = document.getElementById('reviews-progress-fill');
  if (fill) fill.style.width = `${((idx + 1) / totalReviewSlides) * 100}%`;

  // Точки
  document.querySelectorAll('.lux-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}


function startAutoSlide() {
  clearInterval(reviewsAutoTimer);
  reviewsAutoTimer = setInterval(() => {
    const next = (reviewsIndex + 1) % totalReviewSlides;
    goToSlide(next);
  }, 5000);
}

function resetAutoSlide() {
  clearInterval(reviewsAutoTimer);
  startAutoSlide();
}

const sliderPrev = document.getElementById('reviews-prev-btn');
const sliderNext = document.getElementById('reviews-next-btn');

if (sliderPrev) {
  sliderPrev.addEventListener('click', () => {
    const prev = (reviewsIndex - 1 + totalReviewSlides) % totalReviewSlides;
    goToSlide(prev);
  });
}
if (sliderNext) {
  sliderNext.addEventListener('click', () => {
    const next = (reviewsIndex + 1) % totalReviewSlides;
    goToSlide(next);
  });
}

// Свайп
(function() {
  let touchStartX = 0;
  const stage = document.querySelector('.lux-reviews-stage');
  if (!stage) return;
  stage.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) goToSlide((reviewsIndex + 1) % totalReviewSlides);
      else goToSlide((reviewsIndex - 1 + totalReviewSlides) % totalReviewSlides);
    }
  }, { passive: true });
})();

window.addEventListener('resize', () => updateLuxSlider(reviewsIndex, 'none'), { passive: true });



function renderTrainers(trainers) {
  const grid = document.getElementById('trainers-grid');
  if (!grid) return;
  if (!trainers || !trainers.length) return;

  grid.innerHTML = trainers.map((t, i) => `
    <div class="trainer-card-full reveal delay-${i + 1}">
      <img src="${t.photo || '/images/hero.jpg'}" alt="${t.name}">
      <div class="trainer-card-full-body">
        <div style="font-size:0.75rem; font-weight:700; color:var(--gold); letter-spacing:0.15em; text-transform:uppercase; margin-bottom:0.4rem;">${t.specialization || 'Тренер'}</div>
        <div style="font-family:var(--font-display); font-size:1.3rem; font-weight:800; margin-bottom:0.4rem;">${t.name}</div>
        <div style="font-size:0.9rem; color:var(--white-muted); margin-bottom:1rem;">${t.experience ? 'Опыт: ' + t.experience : ''}</div>
      </div>
    </div>`).join('');
}

function renderPrices(prices) {
  const layout = document.getElementById('prices-layout');
  if (!layout || !prices) return;

  layout.innerHTML = `
    <div class="price-section reveal">
      <div class="price-section-header">
        <div style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem;">Визит</div>
        <h3>Разовое посещение</h3>
      </div>
      <div style="padding:3rem 2rem; text-align:center;">
        <div style="font-family:var(--font-display); font-size:3.8rem; font-weight:900; color:var(--gold); line-height:1; margin-bottom:0.5rem;">${(prices.single || 800).toLocaleString('ru-RU')} ₽</div>
        <div style="font-size:0.9rem; color:var(--white-muted);">за 1 тренировку</div>
        <div style="display:inline-block; padding:0.4rem 1.2rem; background:rgba(212,175,55,0.15); border:1px solid var(--gold); border-radius:30px; font-size:0.75rem; font-weight:700; color:var(--gold); margin-top:1.2rem;">Первый визит — БЕСПЛАТНО</div>
      </div>
    </div>

    <div class="price-section reveal delay-1">
      <div class="price-section-header">
        <div style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem;">Карты</div>
        <h3>Абонементы</h3>
      </div>
      <div>
        ${(prices.subscriptions || []).map(s => `
          <div class="price-item">
            <span class="price-item-name">${s.period}</span>
            <span class="price-item-value">${s.price.toLocaleString('ru-RU')} ₽</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="price-section reveal delay-2">
      <div class="price-section-header">
        <div style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem;">Аренда</div>
        <h3>Аренда зала 90 м²</h3>
      </div>
      <div>
        ${(prices.hall90 || []).map(h => `
          <div class="price-item">
            <span class="price-item-name">${h.duration}</span>
            <span class="price-item-value">${h.price.toLocaleString('ru-RU')} ₽</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderGallery(gallery) {
  const grid = document.getElementById('gallery-grid');
  const filters = document.getElementById('gallery-filters');
  if (!grid || !gallery) return;

  const cats = ['Все', ...new Set(gallery.map(g => g.category).filter(Boolean))];
  if (filters) {
    filters.innerHTML = cats.map((c, i) => `
      <button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${c}">${c}</button>
    `).join('');

    filters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        grid.querySelectorAll('.gallery-item').forEach(item => {
          if (cat === 'Все' || item.dataset.cat === cat) item.style.display = '';
          else item.style.display = 'none';
        });
      });
    });
  }

  grid.innerHTML = gallery.map(g => `
    <div class="gallery-item" data-cat="${g.category}" onclick="openLightbox('${g.url}', '${g.caption || ''}')">
      <img src="${g.url || '/images/hero.jpg'}" alt="${g.caption || ''}" loading="lazy">
      <div class="gallery-overlay">
        <span style="font-size:0.85rem; font-weight:700; color:var(--white);">${g.caption || g.category}</span>
      </div>
    </div>`).join('');
}

function renderNews(news) {
  const grid = document.getElementById('news-grid');
  if (!grid || !news) return;

  grid.innerHTML = news.map((n, i) => `
    <div class="news-card reveal delay-${(i % 3) + 1}">
      <div class="news-img-wrap">
        <img src="${n.image || '/images/hero.jpg'}" alt="${n.title}">
      </div>
      <div class="news-content">
        <span style="font-size:0.75rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--gold); margin-bottom:0.6rem; display:block;">${n.category || 'Акция'}</span>
        <h3 style="font-family:var(--font-display); font-size:1.15rem; font-weight:800; margin-bottom:0.8rem; line-height:1.3;">${n.title}</h3>
        <p style="font-size:0.9rem; color:var(--white-muted); line-height:1.7;">${n.content || ''}</p>
      </div>
    </div>`).join('');
}

async function loadData() {
  try {
    const res = await fetch('/api/data');
    const db = await res.json();
    renderTrainers(db.trainers || []);
    renderPrices(db.prices || {});
    renderGallery(db.gallery || []);
    renderReviews(db.reviews || []);
    renderNews(db.news || []);
  } catch (err) {
    console.error('Data load error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initHallsShowcase();
});

let currentHallIndex = 0;

function initHallsShowcase() {
  const prevBtn = document.getElementById('halls-prev-btn');
  const nextBtn = document.getElementById('halls-next-btn');
  const slides = document.querySelectorAll('.halls-banner-slide');
  const dotsBox = document.getElementById('halls-dots-box');

  if (!slides.length) return;

  if (dotsBox) {
    dotsBox.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'halls-dot-item' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Слайд ${i + 1}`);
      dot.addEventListener('click', () => switchHallSlide(i));
      dotsBox.appendChild(dot);
    });
  }

  function switchHallSlide(index) {
    currentHallIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentHallIndex);
    });
    const dots = document.querySelectorAll('.halls-dot-item');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentHallIndex);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => switchHallSlide(currentHallIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => switchHallSlide(currentHallIndex + 1));
  }
}

// ─── ИНИЦИАЛИЗАЦИЯ НАВИГАЦИИ ПО КАТЕГОРИЯМ ЦЕН ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const catBtns = document.querySelectorAll('.cat-nav-btn');
  const priceBlocks = document.querySelectorAll('.pricing-block');

  if (catBtns.length && priceBlocks.length) {
    catBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = btn.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    window.addEventListener('scroll', () => {
      let current = '';
      priceBlocks.forEach(block => {
        const blockTop = block.offsetTop - 200;
        if (window.scrollY >= blockTop) {
          current = '#' + block.getAttribute('id');
        }
      });

      if (current) {
        catBtns.forEach(btn => {
          btn.classList.remove('active');
          if (btn.getAttribute('href') === current) {
            btn.classList.add('active');
          }
        });
      }
    });
  }
});


/* ✨ Аура — Услуги: улучшения анимаций и скроллспай */
(function () {
  // Индексы для каскадной анимации ценовых строк
  document.querySelectorAll('.pricing-rows-grid').forEach(grid => {
    [...grid.children].forEach((el, i) => el.style.setProperty('--i', i));
  });

  // Плавный скролл по кнопкам категории с учётом sticky-нава
  const catBtns = document.querySelectorAll('.pricing-cat-nav .cat-nav-btn');
  catBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const href = btn.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 170;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', href);
    });
  });

  // Скроллспай: подсветка активной категории
  const sections = [...document.querySelectorAll('.pricing-block[id]')];
  if (sections.length && catBtns.length) {
    const map = new Map();
    catBtns.forEach(b => map.set((b.getAttribute('href') || '').slice(1), b));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          catBtns.forEach(b => b.classList.remove('active'));
          const btn = map.get(en.target.id);
          if (btn) btn.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  // Магнитный tilt на карточках комплексов
  document.querySelectorAll('.complex-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ✨ Аура — Модалка деталей услуги */
(function () {
  const IMG = {
    laser:   '/images/1block.png',
    massage: '/images/1block.png',
    personal:'/images/1block.png',
    group:   '/images/1block.png',
    passes:  '/images/1block.png',
    rent:    '/images/1block.png',
    tanning: '/images/1block.png',
  };
  const LABEL = {
    laser:'Лазерная эпиляция', massage:'Массаж & СПА', personal:'Персональный тренинг',
    group:'Групповые программы', passes:'Абонементы', rent:'Аренда залов', tanning:'Солярий'
  };
  const FEATURES = {
    laser:   ['Безболезненная процедура','Диодный лазер премиум-класса','Стерильность и комфорт','Видимый результат за 3–5 сеансов'],
    massage: ['Дипломированные мастера','Ароматерапия и релакс-зона','Индивидуальный подход','СПА-косметика класса люкс'],
    personal:['Персональный план тренировок','Контроль техники и прогресса','Мотивация и поддержка','Гибкий график занятий'],
    group:   ['Атмосферный зал и музыка','Опытные инструкторы','Расписание 7 дней в неделю','Разные уровни подготовки'],
    passes:  ['Безлимитный доступ','Сауна и душевые включены','Заморозка абонемента','Полотенца в подарок'],
    rent:    ['Профессиональное оборудование','Гибкие часы аренды','Раздевалки и душ','Парковка у входа'],
    tanning: ['Новые лампы','Стикини и коврик включены','Косметика для загара','Ровный бронзовый тон'],
  };

  // Создаём модалку один раз
  const modal = document.createElement('div');
  modal.className = 'aura-modal';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.innerHTML = `
    <div class="aura-modal__backdrop" data-close></div>
    <div class="aura-modal__dialog">
      <button class="aura-modal__close" data-close aria-label="Закрыть">✕</button>
      <div class="aura-modal__media">
        <span class="aura-modal__tag"></span>
        <img alt="">
      </div>
      <div class="aura-modal__body">
        <h3 class="aura-modal__title"></h3>
        <p class="aura-modal__note"></p>
        <div class="aura-modal__price"></div>
        <ul class="aura-modal__features"></ul>
        <a class="aura-modal__cta" target="_blank" rel="noopener">
          Записаться в WhatsApp
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const $ = s => modal.querySelector(s);
  function open(data) {
    $('.aura-modal__tag').textContent   = data.tag;
    $('.aura-modal__title').textContent = data.title;
    const noteEl = $('.aura-modal__note');
    noteEl.textContent = data.note || '';
    noteEl.style.display = data.note ? '' : 'none';
    $('.aura-modal__price').textContent = data.price;
    const img = modal.querySelector('.aura-modal__media img');
    img.src = data.img; img.alt = data.title;
    const ul = $('.aura-modal__features');
    ul.innerHTML = '';
    (data.features || []).forEach(f => {
      const li = document.createElement('li'); li.textContent = f; ul.appendChild(li);
    });
    const cta = $('.aura-modal__cta');
    cta.href = 'https://api.whatsapp.com/send/?phone=79037977739&text=' +
               encodeURIComponent('Здравствуйте! Хочу записаться: ' + data.title);
    modal.classList.remove('closing');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.classList.remove('open','closing');
      document.body.style.overflow = '';
    }, 280);
  }
  modal.addEventListener('click', e => { if (e.target.hasAttribute('data-close')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });

  // Привязываем клики ко всем ценовым строкам
  document.querySelectorAll('.pricing-block[id]').forEach(block => {
    const key = block.id;
    const tag = LABEL[key] || 'Услуга';
    const img = IMG[key] || IMG.massage;
    const features = FEATURES[key] || [];
    block.querySelectorAll('.price-row-item').forEach(row => {
      // radial hover follow
      row.addEventListener('mousemove', e => {
        const r = row.getBoundingClientRect();
        row.style.setProperty('--mx', ((e.clientX - r.left)/r.width*100)+'%');
        row.style.setProperty('--my', ((e.clientY - r.top)/r.height*100)+'%');
      });
      row.addEventListener('click', () => {
        const name  = row.querySelector('.price-row-name')?.textContent.trim() || '';
        const note  = row.querySelector('.price-row-note')?.textContent.trim() || '';
        const price = row.querySelector('.price-row-val')?.textContent.trim() || '';
        open({ tag, title: name, note, price, img, features });
      });
      row.setAttribute('tabindex','0');
      row.setAttribute('role','button');
      row.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); row.click(); }
      });
    });
  });
})();
