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

document.addEventListener('DOMContentLoaded', loadData);
