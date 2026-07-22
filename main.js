/* ═══════════════════════════════════════════════════
   main.js — Аура Фитнес (client-only, embedded DB)
═══════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────
// Embedded DB (no backend in this preview)
// ─────────────────────────────────────────────────
const DB = {
  trainers: [
    {
      id: 1, name: "Инга Владимирова",
      specialization: "Персональный тренинг · Силовой",
      experience: "более 7 лет",
      photo: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=800&q=80&auto=format&fit=crop",
    },
    {
      id: 2, name: "Кирилл Владимирович",
      specialization: "Персональный · Коррекция фигуры",
      experience: "более 6 лет",
      photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80&auto=format&fit=crop",
    },
  ],
  prices: {
    single: 800,
    subscriptions: [
      { id: 1, period: "1 месяц", price: 3500 },
      { id: 2, period: "3 месяца", price: 9000 },
      { id: 3, period: "6 месяцев", price: 15000 },
      { id: 4, period: "12 месяцев", price: 23000 },
    ],
    hall90: [
      { id: 1, duration: "1 час", price: 1800 },
      { id: 2, duration: "1,5 часа", price: 2400 },
      { id: 3, duration: "2 часа", price: 3000 },
      { id: 4, duration: "3 часа", price: 4400 },
    ],
  },
  reviews: [
    { name: "Кристина Г.", level: "Знаток города 5 уровня", date: "13 июня", rating: 5,
      text: "Посетила единожды этот фитнес зал, взяла персональную тренировку у Инги Владимировой и осталась очень довольна — тренер достаточно строгий, но в меру, всё чётко и хорошо объясняет." },
    { name: "Алёна Х.", level: "Знаток города 3 уровня", date: "21 июля", rating: 5,
      text: "Очень довольна этим фитнес-залом! Здесь всегда чисто, уютно и комфортно заниматься. Атмосфера дружелюбная, чувствуешь себя как дома. Спасибо всей команде за профессионализм!" },
    { name: "Дарья М.", level: "Знаток города 3 уровня", date: "17 февраля", rating: 5,
      text: "Отмечаю для себя, что клуб очень заботится о своих клиентах. Поддерживают чистоту и порядок в зале, устраивают мероприятия на праздники, ответят на любой ваш вопрос." },
    { name: "Алина", level: "Знаток города 4 уровня", date: "7 августа 2025", rating: 5,
      text: "Всем рекомендую данный фитнес клуб! Замечательный персонал, профессиональные тренера, массажисты, а также чудесные администраторы и управляющая Олеся!" },
    { name: "Татьяна Г.", level: "Знаток города 4 уровня", date: "30 октября 2025", rating: 5,
      text: "Мне нравится этот фитнесс клуб из-за отзывчивого и квалифицированного персонала — администраторы, управляющая Олеся, массажист Людмила выше всяческих похвал." },
    { name: "Наталья Богданова", level: "Знаток города 8 уровня", date: "4 января", rating: 5,
      text: "Прекрасный клуб, есть всё необходимое, индивидуальные и групповые тренировки, всегда очень приятный вежливый персонал, чистота и порядок. Есть солярий." },
    { name: "Natalia M.", level: "Знаток города 5 уровня", date: "14 мая 2025", rating: 5,
      text: "Больше всего понравилась атмосфера клуба, очень уютная, доброжелательная и невероятно дружественная! Зал для групповых занятий комфортный, просторный. Чисто, красиво, с шиком!" },
    { name: "Seeing red", level: "Знаток города 8 уровня", date: "28 апреля 2025", rating: 5,
      text: "Хожу на массаж к Людмиле уже больше трёх лет и всем рекомендую! Людмила очень внимательно подходит к клиенту и руководствуется принципом «не навреди»." },
    { name: "Дмитрий Смирнов", level: "Знаток города 6 уровня", date: "18 декабря 2025", rating: 5,
      text: "Сегодня впервые побывал в данном зале, мне понравилось. Персонал очень вежливый, всё показали, объяснили. Тренажёры, сауна и душевая — ок." },
    { name: "Ваня Хрилёв", level: "Знаток города 4 уровня", date: "13 августа 2025", rating: 5,
      text: "Отзывчивый персонал, особенно Олеся, её доброту не переплюнет никто. Пол года занимаюсь с Кириллом Владимировичем, почти научился подтягиваться!" },
  ],
  gallery: [
    { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80&auto=format&fit=crop", category: "Тренажёрный зал", caption: "Зона силовых и кардио" },
    { url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80&auto=format&fit=crop", category: "Тренажёрный зал", caption: "Свободные веса" },
    { url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80&auto=format&fit=crop", category: "Залы", caption: "Групповой зал 90 м²" },
    { url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=900&q=80&auto=format&fit=crop", category: "Залы", caption: "Зал для растяжки 50 м²" },
    { url: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=900&q=80&auto=format&fit=crop", category: "Сауна", caption: "Финская сауна" },
    { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop", category: "Массаж", caption: "Массажный кабинет" },
    { url: "https://images.unsplash.com/photo-1552693673-1bf958298935?w=900&q=80&auto=format&fit=crop", category: "Массаж", caption: "СПА и релакс" },
    { url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=80&auto=format&fit=crop", category: "Солярий", caption: "Зона восстановления" },
  ],
  news: [
    { title: "Первое посещение — бесплатно!", category: "Акция", content: "Приходите познакомиться с клубом. Первая индивидуальная тренировка для новых гостей — бесплатно. Оцените атмосферу, чистоту и уровень сервиса.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&auto=format&fit=crop" },
    { title: "Летнее специальное предложение", category: "Скидка", content: "Скидка 10% на абонементы от 3 месяцев. Доступ в фитнес-зал, финскую сауну и групповые программы без ограничений.", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80&auto=format&fit=crop" },
    { title: "Массаж и солярий в Аура Фитнес", category: "Услуга", content: "Полное восстановление мышц после нагрузки. Запишитесь на сеанс расслабляющего или спортивного массажа к нашим специалистам.", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=900&q=80&auto=format&fit=crop" },
  ],
  settings: { totalReviews: 145, rating: 4.8 },
};

// Fallback image map — for HTML that references /images/*.jpg
const IMG_FALLBACKS = {
  "hero.jpg":            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&auto=format&fit=crop",
  "group_hall.jpg":      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80&auto=format&fit=crop",
  "massage.jpg":         "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1600&q=80&auto=format&fit=crop",
  "sauna.jpg":           "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1600&q=80&auto=format&fit=crop",
  "trainer_inga.jpg":    "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=1200&q=80&auto=format&fit=crop",
  "trainer_kirill.jpg":  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=80&auto=format&fit=crop",
};
function resolveImage(src) {
  if (!src) return "";
  const name = src.split("/").pop();
  return IMG_FALLBACKS[name] || src;
}

// ─────────────────────────────────────────────────
// Active nav link
// ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.replace(/\/$/, "");
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((link) => {
    const href = link.getAttribute("href").replace(/\/$/, "");
    if (href === path) link.classList.add("active");
    else link.classList.remove("active");
  });

  // Replace any /images/*.jpg with unsplash fallbacks
  document.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src") || "";
    if (src.startsWith("/images/") || src.startsWith("/site/images/")) {
      img.src = resolveImage(src);
    }
    img.addEventListener("error", () => {
      const s = img.getAttribute("src") || "";
      const n = s.split("/").pop();
      if (IMG_FALLBACKS[n]) img.src = IMG_FALLBACKS[n];
    }, { once: true });
  });
  // Same for hero background
  const heroBg = document.querySelector(".hero-banner-wrap");
  if (heroBg) heroBg.style.backgroundImage = `url('${IMG_FALLBACKS["hero.jpg"]}')`;
});

// ─────────────────────────────────────────────────
// Scroll header + mobile menu + reveal
// ─────────────────────────────────────────────────
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobile-menu");
const mobileMenuClose = document.getElementById("mobile-menu-close");
if (burger && mobileMenu) burger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
if (mobileMenuClose && mobileMenu) mobileMenuClose.addEventListener("click", () => mobileMenu.classList.remove("open"));
function closeMobileMenu() { if (mobileMenu) mobileMenu.classList.remove("open"); }
window.closeMobileMenu = closeMobileMenu;

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -50px 0px" });

function bindReveals() {
  document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-up, .reveal-scale")
    .forEach((el) => { if (!el.classList.contains("visible")) revealObserver.observe(el); });
}
bindReveals();

// ─────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");
window.openLightbox = function (src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src; lightboxImg.alt = alt || "";
  lightbox.classList.add("open");
};
if (lightboxClose && lightbox) lightboxClose.addEventListener("click", () => lightbox.classList.remove("open"));
if (lightbox) lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("open"); });

// ─────────────────────────────────────────────────
// Reviews slider (autoplay, dots, arrows, progress)
// ─────────────────────────────────────────────────
let reviewsIndex = 0;
let totalReviewSlides = 0;
let reviewsAutoplay = null;
const AUTOPLAY_MS = 6000;

function starSvg() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
}

function renderReviews(reviews) {
  const track = document.getElementById("reviews-track");
  const fullGrid = document.getElementById("full-reviews-grid");
  if (!reviews || !reviews.length) return;

  const cardHtml = (r) => `
    <div class="review-slide-card">
      <div>
        <div class="review-rating-row">${Array.from({length: r.rating || 5}).map(() => starSvg()).join("")}</div>
        <div class="review-slide-quote">${r.text}</div>
      </div>
      <div class="review-slide-user">
        <div class="review-avatar-letter">${r.name.charAt(0)}</div>
        <div>
          <div class="review-user-name">${r.name}</div>
          <div class="review-user-meta">${r.level || "Клиент клуба"} · ${r.date}</div>
        </div>
      </div>
    </div>`;

  if (track) {
    track.innerHTML = reviews.map(cardHtml).join("");
    totalReviewSlides = reviews.length;
    updateReviewsSlider();
    startAutoplay();
  }
  if (fullGrid) {
    fullGrid.innerHTML = reviews.map(cardHtml).join("");
    bindReveals();
  }
}

function perView() {
  if (window.innerWidth < 720) return 1;
  if (window.innerWidth < 1100) return 2;
  return 3;
}

function updateReviewsSlider() {
  const track = document.getElementById("reviews-track");
  if (!track) return;
  const slides = track.querySelectorAll(".review-slide-card");
  if (!slides.length) return;

  const pv = perView();
  const maxIdx = Math.max(0, slides.length - pv);
  reviewsIndex = Math.max(0, Math.min(reviewsIndex, maxIdx));

  const gap = 26;
  const viewport = track.parentElement.offsetWidth;
  const slideWidth = (viewport - gap * (pv - 1)) / pv;
  slides.forEach((s) => (s.style.flex = `0 0 ${slideWidth}px`));
  track.style.transform = `translateX(-${reviewsIndex * (slideWidth + gap)}px)`;

  renderSliderDots(maxIdx + 1);
  const prev = document.getElementById("reviews-prev-btn");
  const next = document.getElementById("reviews-next-btn");
  if (prev) prev.disabled = reviewsIndex === 0;
  if (next) next.disabled = reviewsIndex >= maxIdx;
  updateProgress();
}

function renderSliderDots(count) {
  const dotsBox = document.getElementById("reviews-dots-box");
  if (!dotsBox) return;
  dotsBox.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("button");
    dot.className = "slider-dot-item" + (i === reviewsIndex ? " active" : "");
    dot.setAttribute("aria-label", "Слайд " + (i + 1));
    dot.addEventListener("click", () => { reviewsIndex = i; updateReviewsSlider(); restartAutoplay(); });
    dotsBox.appendChild(dot);
  }
}

function updateProgress() {
  const fill = document.getElementById("slider-progress-fill");
  if (!fill) return;
  fill.style.transition = "none";
  fill.style.width = "0%";
  requestAnimationFrame(() => {
    fill.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    fill.style.width = "100%";
  });
}

function nextSlide() {
  const track = document.getElementById("reviews-track");
  if (!track) return;
  const slides = track.querySelectorAll(".review-slide-card");
  const pv = perView();
  const maxIdx = Math.max(0, slides.length - pv);
  reviewsIndex = reviewsIndex >= maxIdx ? 0 : reviewsIndex + 1;
  updateReviewsSlider();
}
function prevSlide() {
  const track = document.getElementById("reviews-track");
  if (!track) return;
  const slides = track.querySelectorAll(".review-slide-card");
  const pv = perView();
  const maxIdx = Math.max(0, slides.length - pv);
  reviewsIndex = reviewsIndex <= 0 ? maxIdx : reviewsIndex - 1;
  updateReviewsSlider();
}
function startAutoplay() {
  stopAutoplay();
  reviewsAutoplay = setInterval(nextSlide, AUTOPLAY_MS);
}
function stopAutoplay() {
  if (reviewsAutoplay) { clearInterval(reviewsAutoplay); reviewsAutoplay = null; }
}
function restartAutoplay() { startAutoplay(); }

const sliderPrev = document.getElementById("reviews-prev-btn");
const sliderNext = document.getElementById("reviews-next-btn");
if (sliderPrev) sliderPrev.addEventListener("click", () => { prevSlide(); restartAutoplay(); });
if (sliderNext) sliderNext.addEventListener("click", () => { nextSlide(); restartAutoplay(); });

const sliderViewport = document.querySelector(".reviews-slider-viewport");
if (sliderViewport) {
  sliderViewport.addEventListener("mouseenter", stopAutoplay);
  sliderViewport.addEventListener("mouseleave", startAutoplay);
}
window.addEventListener("resize", updateReviewsSlider, { passive: true });

// ─────────────────────────────────────────────────
// Trainers
// ─────────────────────────────────────────────────
function renderTrainers(trainers) {
  const grid = document.getElementById("trainers-grid");
  if (!grid || !trainers || !trainers.length) return;
  grid.innerHTML = trainers.map((t, i) => `
    <div class="trainer-card-full reveal delay-${i + 1}">
      <div class="trainer-card-full-imgwrap">
        <img src="${t.photo || ""}" alt="${t.name}">
      </div>
      <div class="trainer-card-full-body">
        <div class="trainer-spec">${t.specialization || "Тренер"}</div>
        <div class="trainer-name">${t.name}</div>
        <div class="trainer-exp">${t.experience ? "Опыт: " + t.experience : ""}</div>
      </div>
    </div>`).join("");
  bindReveals();
}

// ─────────────────────────────────────────────────
// Prices
// ─────────────────────────────────────────────────
function renderPrices(prices) {
  const layout = document.getElementById("prices-layout");
  if (!layout || !prices) return;
  layout.innerHTML = `
    <div class="price-section reveal">
      <div class="price-section-header">
        <div style="font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--olive); margin-bottom:0.4rem;">Визит</div>
        <h3>Разовое посещение</h3>
      </div>
      <div style="padding:3rem 2rem; text-align:center;">
        <div style="font-family:var(--font-display); font-size:3.6rem; font-weight:900; color:var(--olive-dark); line-height:1; margin-bottom:0.5rem;">
          ${(prices.single || 800).toLocaleString("ru-RU")} ₽
        </div>
        <div style="font-size:0.9rem; color:var(--text-muted);">за 1 тренировку</div>
        <div style="display:inline-block; padding:0.5rem 1.2rem; background:var(--olive-light); border-radius:30px; font-size:0.72rem; font-weight:700; color:var(--olive-dark); margin-top:1.4rem; letter-spacing:0.1em; text-transform:uppercase;">
          Первый визит — бесплатно
        </div>
      </div>
    </div>
    <div class="price-section reveal delay-1">
      <div class="price-section-header">
        <div style="font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--olive); margin-bottom:0.4rem;">Карты</div>
        <h3>Абонементы</h3>
      </div>
      <div>
        ${(prices.subscriptions || []).map((s) => `
          <div class="price-item">
            <span class="price-item-name">${s.period}</span>
            <span class="price-item-value">${s.price.toLocaleString("ru-RU")} ₽</span>
          </div>`).join("")}
      </div>
    </div>
    <div class="price-section reveal delay-2">
      <div class="price-section-header">
        <div style="font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--olive); margin-bottom:0.4rem;">Аренда</div>
        <h3>Зал 90 м²</h3>
      </div>
      <div>
        ${(prices.hall90 || []).map((h) => `
          <div class="price-item">
            <span class="price-item-name">${h.duration}</span>
            <span class="price-item-value">${h.price.toLocaleString("ru-RU")} ₽</span>
          </div>`).join("")}
      </div>
    </div>`;
  bindReveals();
}

// ─────────────────────────────────────────────────
// Gallery
// ─────────────────────────────────────────────────
function renderGallery(gallery) {
  const grid = document.getElementById("gallery-grid");
  const filters = document.getElementById("gallery-filters");
  if (!grid || !gallery) return;

  const cats = ["Все", ...new Set(gallery.map((g) => g.category).filter(Boolean))];
  if (filters) {
    filters.innerHTML = cats.map((c, i) => `
      <button class="filter-btn ${i === 0 ? "active" : ""}" data-cat="${c}">${c}</button>`).join("");
    filters.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.cat;
        grid.querySelectorAll(".gallery-item").forEach((item) => {
          item.style.display = (cat === "Все" || item.dataset.cat === cat) ? "" : "none";
        });
      });
    });
  }
  grid.innerHTML = gallery.map((g, i) => `
    <div class="gallery-item reveal delay-${(i % 4) + 1}" data-cat="${g.category}" onclick="openLightbox('${g.url}', '${(g.caption || "").replace(/'/g,"\\'")}')">
      <img src="${g.url}" alt="${g.caption || ""}" loading="lazy">
      <div class="gallery-overlay"><span>${g.caption || g.category}</span></div>
    </div>`).join("");
  bindReveals();
}

// ─────────────────────────────────────────────────
// News
// ─────────────────────────────────────────────────
function renderNews(news) {
  const grid = document.getElementById("news-grid");
  if (!grid || !news) return;
  grid.innerHTML = news.map((n, i) => `
    <div class="news-card reveal delay-${(i % 3) + 1}">
      <div class="news-img-wrap"><img src="${n.image || ""}" alt="${n.title}"></div>
      <div class="news-content">
        <span class="news-category">${n.category || "Новости"}</span>
        <h3 class="news-title">${n.title}</h3>
        <p class="news-body">${n.content || ""}</p>
      </div>
    </div>`).join("");
  bindReveals();
}

// ─────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderTrainers(DB.trainers);
  renderPrices(DB.prices);
  renderGallery(DB.gallery);
  renderReviews(DB.reviews);
  renderNews(DB.news);
});
