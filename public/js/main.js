// ─── ТЁМНАЯ ТЕМА — ПЕРЕКЛЮЧАТЕЛЬ ───────────────────────────────
function initThemeManager() {
  const savedTheme = localStorage.getItem('aura-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.onclick = toggleTheme;
  });
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('aura-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('aura-theme', 'dark');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initQuickWidget();
  });
} else {
  initThemeManager();
  initQuickWidget();
}

// ─── ФЛОАТИНГ-ВИДЖЕТ БЫСТРОЙ ЗАПИСИ (ПРАВЫЙ НИЖНИЙ УГОЛ) ───
function initQuickWidget() {
  if (document.getElementById('quickWidget')) return;

  const widgetHTML = `
    <div class="quick-widget" id="quickWidget">
      <div class="quick-widget-menu" id="quickWidgetMenu">
        <div class="quick-widget-head">
          <span>Связаться & Запись</span>
          <button type="button" class="quick-widget-close" id="quickWidgetClose">✕</button>
        </div>
        <a href="https://t.me/FitnesscenterAura" target="_blank" rel="noopener" class="quick-widget-item tg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
          <span>Telegram</span>
        </a>
        <a href="https://max.ru/join/hMsYRZJwLWOrTIuzHLBYySpwmK6H3SlUQPBJT-Xufik" target="_blank" rel="noopener" class="quick-widget-item max">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 2.05.62 3.96 1.69 5.54L2.05 22l4.63-1.6c1.6.86 3.42 1.35 5.32 1.35 5.52 0 10-4.48 10-10S17.52 2 12 2zm4 12.5h-2v-3.7l-2 3-2-3v3.7H8V8h2.2l1.8 2.7L13.8 8H16v6.5z"/></svg>
          <span>MAX канал</span>
        </a>
        <a href="https://vk.com/club46230813" target="_blank" rel="noopener" class="quick-widget-item vk">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.684 0H8.316C3.724 0 0 3.724 0 8.316v7.368C0 20.276 3.724 24 8.316 24h7.368C20.276 24 24 20.276 24 15.684V8.316C24 3.724 20.276 0 15.684 0zm3.692 17.143h-1.644c-.624 0-.816-.495-1.938-1.618-1.026-0.99-1.48-1.12-1.734-1.12-.358 0-.462.103-.462.597v1.442c0 .412-.132.657-1.218.657-1.802 0-3.799-1.093-5.208-3.13-2.128-3.023-2.709-5.302-2.709-5.76 0-.251.097-.487.594-.487h1.644c.446 0 .614.204.786.685.86 2.49 2.304 4.675 2.902 4.675.226 0 .33-.103.33-.668V11.23c-.094-1.493-.868-1.617-.868-2.148 0-.251.214-.504.562-.504h2.576c.371 0 .504.195.504.639v3.456c0 .375.163.504.275.504.226 0 .412-.129.83-.548 1.288-1.455 2.203-3.708 2.203-3.708.117-.251.332-.487.778-.487h1.644c.494 0 .6.251.494.639-.208.972-2.253 3.864-2.253 3.864-.176.275-.246.402 0 .727.176.233.754.744 1.139 1.196.711.815 1.258 1.496 1.403 1.966.147.466-.075.711-.564.711z"/></svg>
          <span>ВКонтакте</span>
        </a>
        <a href="tel:+79037977739" class="quick-widget-item phone">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>+7 (903) 797-77-39</span>
        </a>
        <button type="button" class="quick-widget-item book-btn" data-modal-open data-service="Быстрая запись" data-price="Консультация">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>Записаться онлайн</span>
        </button>
      </div>

      <button type="button" class="quick-widget-trigger" id="quickWidgetTrigger" aria-label="Быстрая запись">
        <span class="pulse-ring"></span>
        <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        <svg class="icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const widget = document.getElementById('quickWidget');
  const trigger = document.getElementById('quickWidgetTrigger');
  const closeBtn = document.getElementById('quickWidgetClose');

  if (trigger && widget) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      widget.classList.toggle('active');
    });
  }

  if (closeBtn && widget) {
    closeBtn.addEventListener('click', () => widget.classList.remove('active'));
  }

  document.addEventListener('click', (e) => {
    if (widget && !widget.contains(e.target)) {
      widget.classList.remove('active');
    }
  });
}

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
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('open');
  });
}
if (mobileMenuClose && mobileMenu) {
  mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
}
function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

document.addEventListener('click', (e) => {
  if (mobileMenu && mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && burger && !burger.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});

// Плавное проявление при прокрутке
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.05 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));

// Лайтбокс галереи с поддержкой листания (Prev/Next)
let activeGalleryItems = [];
let currentLightboxIndex = 0;

function openLightboxByIndex(index) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCat = document.getElementById('lightbox-cat');
  const lightboxTitle = document.getElementById('lightbox-title');

  if (!lightbox || !lightboxImg || !activeGalleryItems.length) return;

  currentLightboxIndex = (index + activeGalleryItems.length) % activeGalleryItems.length;
  const item = activeGalleryItems[currentLightboxIndex];

  lightboxImg.src = item.url || '/images/hero.jpg';
  lightboxImg.alt = item.caption || '';
  if (lightboxCat) lightboxCat.textContent = item.category || 'Фитнес-центр «Аура»';
  if (lightboxTitle) lightboxTitle.textContent = item.caption || item.category || '';

  lightbox.classList.add('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightboxByIndex(currentLightboxIndex - 1);
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightboxByIndex(currentLightboxIndex + 1);
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) lightbox.classList.remove('open');
    });
  }

  document.addEventListener('keydown', e => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lightbox.classList.remove('open');
    if (e.key === 'ArrowLeft') openLightboxByIndex(currentLightboxIndex - 1);
    if (e.key === 'ArrowRight') openLightboxByIndex(currentLightboxIndex + 1);
  });
});

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
    fullGrid.innerHTML = reviews.map((r, i) => {
      const initial = r.name ? r.name.charAt(0).toUpperCase() : 'А';
      const stars = '★'.repeat(r.rating || 5);
      const revealDir = i % 2 === 0 ? 'reveal-left' : 'reveal-right';
      return `
      <div class="review-avatar-card ${revealDir}">
        <div class="review-avatar-wrap">
          <div class="review-avatar-circle">${initial}</div>
        </div>
        <h3 class="review-card-author">${r.name}</h3>
        <div class="review-card-stars">${stars}</div>
        <p class="review-card-text">"${r.text}"</p>
      </div>`;
    }).join('');

    if (typeof revealObserver !== 'undefined') {
      fullGrid.querySelectorAll('.reveal-left, .reveal-right').forEach(el => revealObserver.observe(el));
    }
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



let allTrainersData = [];

function renderTrainers(trainers) {
  const grid = document.getElementById('trainers-grid');
  if (!grid) return;
  if (!trainers || !trainers.length) return;
  allTrainersData = trainers;

  renderTrainersList(trainers);
  setupTrainerFilterListeners();
}

function renderTrainersList(trainers) {
  const grid = document.getElementById('trainers-grid');
  if (!grid) return;

  grid.innerHTML = trainers.map((t, i) => `
    <div class="trainer-card-ios reveal visible">
      <div class="trainer-card-ios-img-wrap">
        <img src="${t.photo || '/images/hero.jpg'}" alt="${t.name}" loading="lazy">
        ${t.experience ? `<div class="trainer-ios-exp-tag">${t.experience}</div>` : ''}
        <div class="trainer-ios-gradient"></div>
      </div>
      
      <div class="trainer-card-ios-content">
        <h3 class="trainer-ios-name">
          ${t.name}
          <span class="trainer-ios-verified" title="Сертифицированный специалист Фитнес-центра «Аура»">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
        </h3>

        <div class="trainer-ios-spec">${t.specialization || 'Инструктор фитнес-центра'}</div>

        <div class="trainer-ios-details">
          ${t.education ? `
            <div class="trainer-ios-detail-item">
              <span class="detail-title">Образование:</span>
              <span class="detail-val">${t.education}</span>
            </div>` : ''}
          ${t.achievements ? `
            <div class="trainer-ios-detail-item">
              <span class="detail-title">Направления:</span>
              <span class="detail-val">${t.achievements}</span>
            </div>` : ''}
          ${t.certificates ? `
            <div class="trainer-ios-detail-item">
              <span class="detail-title">Сертификаты:</span>
              <span class="detail-val">${t.certificates}</span>
            </div>` : ''}
        </div>

        <div class="trainer-ios-footer">
          <button type="button" class="trainer-ios-btn" data-modal-open data-service="Тренер: ${t.name}" data-price="Персонально">
            Записаться +
          </button>
        </div>
      </div>
    </div>`).join('');
}

function setupTrainerFilterListeners() {
  const filterBtns = document.querySelectorAll('.trainer-filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filterKey = this.getAttribute('data-filter');
      if (filterKey === 'all') {
        renderTrainersList(allTrainersData);
      } else {
        const filtered = allTrainersData.filter(t => {
          const spec = ((t.specialization || '') + ' ' + (t.achievements || '') + ' ' + (t.certificates || '')).toLowerCase();
          if (filterKey === 'lfk') return spec.includes('лфк') || spec.includes('реабилитац') || spec.includes('сколиоз');
          if (filterKey === 'personal') return spec.includes('персональн') || spec.includes('аэробик');
          if (filterKey === 'antigravity') return spec.includes('antigravity') || spec.includes('гамак') || spec.includes('йога') || spec.includes('stretching');
          if (filterKey === 'power') return spec.includes('пауэрлифтинг') || spec.includes('кроссфит') || spec.includes('силовы');
          return true;
        });
        renderTrainersList(filtered.length ? filtered : allTrainersData);
      }
    });
  });
}

function renderPrices(prices) {
  // 1. Главная страница (если есть #prices-layout)
  const layout = document.getElementById('prices-layout');
  if (layout && prices) {
    const singleVal = prices.single || 800;
    const subs = prices.subscriptions || (prices.serviceSections && prices.serviceSections[0] && prices.serviceSections[0].subcategories && prices.serviceSections[0].subcategories[0] ? prices.serviceSections[0].subcategories[0].items : []);
    const h90 = prices.hall90 || (prices.serviceSections && prices.serviceSections[1] && prices.serviceSections[1].subcategories && prices.serviceSections[1].subcategories[0] ? prices.serviceSections[1].subcategories[0].items : []);
    const h50 = prices.hall50 || (prices.serviceSections && prices.serviceSections[1] && prices.serviceSections[1].subcategories && prices.serviceSections[1].subcategories[1] ? prices.serviceSections[1].subcategories[1].items : []);

    layout.innerHTML = `
      <div class="price-section reveal">
        <div class="price-section-header">
          <div style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem;">Визит</div>
          <h3>${prices.singleTitle || 'Разовое посещение'}</h3>
        </div>
        <div style="padding:2.5rem 1.8rem; text-align:center;">
          ${prices.singlePhoto ? `<img src="${prices.singlePhoto}" style="width:100%; max-height:160px; object-fit:cover; border-radius:12px; margin-bottom:1.2rem;">` : ''}
          <div style="font-family:var(--font-display); font-size:3.5rem; font-weight:900; color:var(--gold); line-height:1; margin-bottom:0.5rem;">${typeof singleVal === 'number' ? singleVal.toLocaleString('ru-RU') + ' ₽' : singleVal}</div>
          <div style="font-size:0.9rem; color:var(--white-muted); margin-bottom:0.8rem;">${prices.singleDesc || 'за 1 тренировку в клубе'}</div>
          <div style="display:inline-block; padding:0.4rem 1.2rem; background:rgba(212,175,55,0.15); border:1px solid var(--gold); border-radius:30px; font-size:0.75rem; font-weight:700; color:var(--gold);">Первый визит — БЕСПЛАТНО</div>
        </div>
      </div>

      <div class="price-section reveal delay-1">
        <div class="price-section-header">
          <div style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem;">Карты</div>
          <h3>Абонементы</h3>
        </div>
        <div style="padding:1rem;">
          ${(subs || []).map(s => `
            <div class="price-item" style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.06);">
              ${s.photo ? `<img src="${s.photo}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; margin-right:1rem;">` : ''}
              <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="price-item-name" style="font-weight:700;">${s.period || s.name}</span>
                  <span class="price-item-value">${typeof s.price === 'number' ? s.price.toLocaleString('ru-RU') + ' ₽' : s.price}</span>
                </div>
                ${s.desc ? `<div style="font-size:0.78rem; color:var(--white-muted); margin-top:0.3rem;">${s.desc}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="price-section reveal delay-2">
        <div class="price-section-header">
          <div style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem;">Аренда</div>
          <h3>Аренда зала 90 м²</h3>
        </div>
        <div style="padding:1rem;">
          ${(h90 || []).map(h => `
            <div class="price-item" style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.06);">
              ${h.photo ? `<img src="${h.photo}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; margin-right:1rem;">` : ''}
              <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="price-item-name" style="font-weight:700;">${h.duration || h.name}</span>
                  <span class="price-item-value">${typeof h.price === 'number' ? h.price.toLocaleString('ru-RU') + ' ₽' : h.price}</span>
                </div>
                ${h.desc ? `<div style="font-size:0.78rem; color:var(--white-muted); margin-top:0.3rem;">${h.desc}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>

      <div class="price-section reveal delay-3">
        <div class="price-section-header">
          <div style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); margin-bottom:0.4rem;">Аренда</div>
          <h3>Аренда зала 50 м²</h3>
        </div>
        <div style="padding:1rem;">
          ${(h50 || []).map(h => `
            <div class="price-item" style="padding:1rem; border-bottom:1px solid rgba(255,255,255,0.06);">
              ${h.photo ? `<img src="${h.photo}" style="width:48px; height:48px; border-radius:8px; object-fit:cover; margin-right:1rem;">` : ''}
              <div style="flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span class="price-item-name" style="font-weight:700;">${h.duration || h.name}</span>
                  <span class="price-item-value">${typeof h.price === 'number' ? h.price.toLocaleString('ru-RU') + ' ₽' : h.price}</span>
                </div>
                ${h.desc ? `<div style="font-size:0.78rem; color:var(--white-muted); margin-top:0.3rem;">${h.desc}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }

  // 2. Страница services.html (Динамическое обновление ВСЕХ разделов и карточек услуг)
  const navContainer = document.querySelector('#svcNav ol');
  const contentContainer = document.querySelector('.svc-content');
  if (navContainer && contentContainer && prices && prices.serviceSections) {
    const sections = prices.serviceSections;

    // Обновление левого меню навигации
    navContainer.innerHTML = sections.map((sec, idx) => `
      <li><a href="#${sec.id}" class="${idx === 0 ? 'active' : ''}">${sec.title}</a></li>
    `).join('');

    // Обновление основного контента разделов
    contentContainer.innerHTML = sections.map((sec, idx) => `
      <article class="svc-section in" id="${sec.id}">
        <div class="svc-head">
          <div class="svc-num">${sec.num || (idx < 9 ? '0' + (idx + 1) : idx + 1)}</div>
          <div class="svc-head-body">
            <span class="tag">${sec.tag || 'Услуга'}</span>
            <h2>${sec.title}</h2>
            ${sec.desc ? `<p class="desc">${sec.desc}</p>` : ''}
          </div>
        </div>

        ${(sec.subcategories || []).map(sub => `
          ${sub.title ? `<div class="svc-list-title">${sub.title}</div>` : ''}
          <div class="svc-card-grid">
            ${(sub.items || []).map(item => `
              <button type="button" class="svc-card-luxury" data-modal-open data-service="${item.name}" data-price="${item.price}" data-img="${item.photo || ''}" data-desc="${item.desc || ''}">
                ${item.photo ? `<div style="width:100%; height:160px; border-radius:12px; overflow:hidden; margin-bottom:0.8rem;"><img src="${item.photo}" style="width:100%; height:100%; object-fit:cover;"></div>` : ''}
                <div class="svc-card-body">
                  <h4 class="svc-card-title">${item.name}</h4>
                  ${item.desc ? `<p class="svc-card-sub">${item.desc}</p>` : ''}
                </div>
                <div class="svc-card-footer">
                  <span class="svc-card-price">${item.price}</span>
                  <span class="svc-card-cta">Записаться <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
                </div>
              </button>
            `).join('')}
          </div>
        `).join('')}
      </article>
    `).join('');

    if (typeof window.updateActiveNavOnScroll === 'function') {
      setTimeout(window.updateActiveNavOnScroll, 50);
    }
  }
}

function renderGallery(gallery) {
  const grid = document.getElementById('gallery-grid');
  if (!grid || !gallery) return;

  activeGalleryItems = gallery;

  grid.innerHTML = gallery.map((g, i) => {
    return `
    <div class="gallery-bento-card gallery-bento-card-${i + 1}" onclick="openLightboxByIndex(${i})">
      <div class="gallery-bento-inner">
        <img src="${g.url || '/images/hero.jpg'}" alt="${g.caption || ''}" loading="lazy">
        <div class="gallery-bento-overlay">
          <div class="gallery-bento-zoom" title="Увеличить">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderNews(news) {
  const grid = document.getElementById('news-grid');
  if (!grid || !news) return;

  grid.innerHTML = news.map((n, i) => `
    <div class="news-card reveal visible" style="display:flex; flex-direction:column; height:100%;">
      <div class="news-img-wrap">
        <img src="${n.image || '/images/hero.jpg'}" alt="${n.title}">
      </div>
      <div class="news-content" style="display:flex; flex-direction:column; justify-content:space-between; flex:1; padding:1.6rem;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
            <span style="font-size:0.72rem; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold);">${n.category || 'Акция'}</span>
            <span style="font-size:0.78rem; opacity:0.6;">${n.date || ''}</span>
          </div>
          <h3 class="news-card-title" style="font-family:'Oswald',sans-serif; font-size:1.3rem; font-weight:600; text-transform:uppercase; margin-bottom:0.8rem; line-height:1.2;">${n.title}</h3>
          <p class="news-card-desc" style="font-size:0.9rem; line-height:1.6; margin-bottom:1.5rem;">${n.content ? (n.content.length > 120 ? n.content.slice(0, 120) + '...' : n.content) : ''}</p>
        </div>
        <a href="/news-item.html?id=${n.id}" style="display:inline-flex; align-items:center; gap:0.4rem; font-size:0.82rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:var(--olive-deep); text-decoration:none; margin-top:auto;">
          Читать подробнее →
        </a>
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initHallsShowcase();
  });
} else {
  loadData();
  initHallsShowcase();
}

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
  const priceBlocks = document.querySelectorAll('.pricing-block, .pricing-section-block');

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

