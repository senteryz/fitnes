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
        <a href="https://api.whatsapp.com/send/?phone=79037977739&text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21+%D0%AF+%D0%BD%D0%B0%D1%81%D1%87%D1%91%D1%82+%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D0%B8+%D0%B2+%D1%84%D0%B8%D1%82%D0%BD%D0%B5%D1%81-%D0%BA%D0%BB%D1%83%D0%B1" target="_blank" rel="noopener" class="quick-widget-item wa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.763.459 3.486 1.332 5.001l-1.417 5.176 5.297-1.389c1.458.796 3.097 1.214 4.774 1.215h.004c5.505 0 9.988-4.478 9.989-9.985 0-2.667-1.037-5.175-2.924-7.062s-4.394-2.94-7.065-2.940zm5.666 14.168c-.234.656-1.365 1.252-1.898 1.309-.504.053-1.157.085-3.673-.956-3.219-1.331-5.289-4.596-5.45-4.81-.161-.214-1.307-1.739-1.307-3.316 0-1.577.828-2.353 1.12-2.67.293-.317.643-.396.857-.396.214 0 .428.002.615.011.197.009.462-.075.723.551.268.643.914 2.227.994 2.388.08.161.134.348.027.562-.107.214-.161.348-.321.536-.161.188-.339.393-.483.527-.161.149-.328.312-.141.633.187.321.832 1.373 1.785 2.222 1.226 1.093 2.259 1.432 2.58 1.593.321.161.509.134.696-.08.187-.214.803-.937 1.017-1.258.214-.321.428-.268.723-.161.294.107 1.874.883 2.195 1.044.321.161.535.241.615.375.08.134.08.777-.154 1.433z"/></svg>
          <span>WhatsApp</span>
        </a>
        <a href="https://vk.com" target="_blank" rel="noopener" class="quick-widget-item vk">
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
  if (lightboxCat) lightboxCat.textContent = item.category || 'Аура Фитнес';
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

