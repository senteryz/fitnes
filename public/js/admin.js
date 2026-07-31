/* =================================================
   admin.js — Фитнес-центр «Аура» Admin Panel Logic
================================================= */

const TOKEN_KEY = 'aura_admin_token';
let token = localStorage.getItem(TOKEN_KEY) || '';
let db = null;
let editingTrainerId = null;
let editingNewsId = null;
let currentSchedule = [];

// ─── Toast ────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── Auth ─────────────────────────────────────────────────────────
document.getElementById('login-btn').addEventListener('click', tryLogin);
document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') tryLogin();
});

async function tryLogin() {
  const pass = (document.getElementById('login-password').value || '').trim();
  const errEl = document.getElementById('login-error');
  errEl.classList.remove('show');
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      token = data.token;
      localStorage.setItem(TOKEN_KEY, token);
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('admin-app').style.display = 'flex';
      await loadDB();
    } else {
      errEl.classList.add('show');
    }
  } catch {
    errEl.classList.add('show');
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(TOKEN_KEY);
  token = '';
  document.getElementById('admin-app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-password').value = '';
});

// ─── API ─────────────────────────────────────────────────────────
function checkAuthError(res) {
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    token = '';
    document.getElementById('admin-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    toast('Сессия истекла. Пожалуйста, войдите снова.', 'error');
    throw new Error('Unauthorized');
  }
}

async function apiGet(url) {
  const res = await fetch(url, { headers: { 'x-admin-token': token } });
  checkAuthError(res);
  return res.json();
}
async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body)
  });
  checkAuthError(res);
  return res.json();
}
async function apiPut(url, body) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body)
  });
  checkAuthError(res);
  return res.json();
}
async function apiDelete(url) {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'x-admin-token': token }
  });
  checkAuthError(res);
  return res.json();
}

// ─── Load DB ───────────────────────────────────────────────────
async function loadDB() {
  db = await apiGet('/api/data');
  renderDashboard();
  renderTrainersTable();
  renderPricesEditor();
  renderNewsTable();
  renderReviewsList();
  renderGalleryAdmin();
  renderScheduleAdmin();
  renderDBPreview();
}

// ─── Navigation ─────────────────────────────────────────────────
const panelTitles = {
  dashboard: 'Дашборд',
  trainers: 'Тренеры',
  prices: 'Цены',
  news: 'Новости',
  reviews: 'Отзывы',
  gallery: 'Галерея',
  schedule: 'Расписание',
  database: 'База данных'
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchPanel(item.dataset.panel));
});

function switchPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`panel-${name}`).classList.add('active');
  document.getElementById(`nav-${name}`).classList.add('active');
  document.getElementById('topbar-title').textContent = panelTitles[name] || name;
}

// ─── Modal Helpers ──────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});

// ─── Dashboard ──────────────────────────────────────────────────
function renderDashboard() {
  if (!db) return;
  document.getElementById('stat-trainers').textContent = db.trainers.length;
  document.getElementById('stat-news').textContent = db.news.length;
  document.getElementById('stat-reviews').textContent = db.reviews.length;
  document.getElementById('stat-gallery').textContent = db.gallery.length;
}

// ─── Trainers ──────────────────────────────────────────────────
function renderTrainersTable() {
  const tbody = document.getElementById('trainers-tbody');
  if (!db || !tbody) return;
  if (!db.trainers.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--gray); padding:2rem;">Тренеры ещё не добавлены</td></tr>`;
    return;
  }
  tbody.innerHTML = db.trainers.map(t => `
    <tr>
      <td>${t.photo ? `<img src="${t.photo}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">` : '<div style="width:36px;height:36px;border-radius:50%;background:var(--black-4);display:flex;align-items:center;justify-content:center;font-size:0.8rem;">' + t.name.charAt(0) + '</div>'}</td>
      <td style="font-weight:500;">${t.name}</td>
      <td style="color:var(--gold);font-size:0.8rem;">${t.specialization || '—'}</td>
      <td style="color:var(--gray);font-size:0.8rem;">${t.experience || '—'}</td>
      <td style="color:var(--gray);font-size:0.8rem;">${t.education || '—'}</td>
      <td><div class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="editTrainer(${t.id})">Изменить</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTrainer(${t.id})">Удалить</button>
      </div></td>
    </tr>`).join('');
}

function openTrainerModal(trainer = null) {
  editingTrainerId = trainer ? trainer.id : null;
  document.getElementById('trainer-modal-title').textContent = trainer ? 'Редактировать тренера' : 'Добавить тренера';
  document.getElementById('t-name').value = trainer ? trainer.name : '';
  document.getElementById('t-spec').value = trainer ? (trainer.specialization || '') : '';
  document.getElementById('t-exp').value = trainer ? (trainer.experience || '') : '';
  document.getElementById('t-edu').value = trainer ? (trainer.education || '') : '';
  document.getElementById('t-ach').value = trainer ? (trainer.achievements || '') : '';
  document.getElementById('t-cert').value = trainer ? (trainer.certificates || '') : '';
  document.getElementById('t-photo').value = trainer ? (trainer.photo || '') : '';
  openModal('trainer-modal');
}

function editTrainer(id) {
  const t = db.trainers.find(t => t.id === id);
  if (t) openTrainerModal(t);
}

async function saveTrainer() {
  const name = document.getElementById('t-name').value.trim();
  if (!name) { toast('Укажите имя тренера', 'error'); return; }
  const data = {
    name,
    specialization: document.getElementById('t-spec').value.trim(),
    experience: document.getElementById('t-exp').value.trim(),
    education: document.getElementById('t-edu').value.trim(),
    achievements: document.getElementById('t-ach').value.trim(),
    certificates: document.getElementById('t-cert').value.trim(),
    photo: document.getElementById('t-photo').value.trim(),
  };
  try {
    if (editingTrainerId) {
      await apiPut(`/api/trainers/${editingTrainerId}`, data);
      toast('Тренер обновлён', 'success');
    } else {
      await apiPost('/api/trainers', data);
      toast('Тренер добавлен', 'success');
    }
    closeModal('trainer-modal');
    await loadDB();
  } catch { toast('Ошибка', 'error'); }
}

async function deleteTrainer(id) {
  if (!confirm('Удалить тренера?')) return;
  await apiDelete(`/api/trainers/${id}`);
  toast('Тренер удалён', 'success');
  await loadDB();
}

// ─── Photo Upload Helper (Supports file upload & URL input) ────────
async function uploadImage(event, targetElementOrId) {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('image', file);
  try {
    toast('Загрузка файла...', 'info');
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'x-admin-token': token },
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.url) {
      if (typeof targetElementOrId === 'string') {
        const input = document.getElementById(targetElementOrId);
        if (input) input.value = data.url;
      } else if (targetElementOrId && targetElementOrId.value !== undefined) {
        targetElementOrId.value = data.url;
      }
      toast('Фото успешно загружено', 'success');
    } else {
      toast(data.error || 'Ошибка загрузки', 'error');
    }
  } catch (e) {
    toast('Ошибка сервера при загрузке', 'error');
  }
}

// ─── Prices & Services Editor ──────────────────────────────────────
function getDefaultServiceSections() {
  return [
    {
      id: "gym",
      num: "01",
      tag: "Клубные карты & Тренинг",
      title: "Тренажёрный зал & Персональные тренировки",
      desc: "Абонементы, разовые посещения, индивидуальные и СПЛИТ-тренировки с опытными инструкторами.",
      subcategories: [
        {
          title: "Абонементы и Разовый визит",
          items: [
            { name: "Разовое посещение", price: "800 ₽", desc: "Доступ в клуб на весь день без ограничений", tag: "Полный день", photo: "" },
            { name: "Абонемент на 1 месяц", price: "3 500 ₽", desc: "Безлимитный доступ на 30 дней ко всем зонам", tag: "Безлимитно", photo: "" },
            { name: "Абонемент на 3 месяца", price: "9 000 ₽", desc: "Клубная карта с возможностью заморозки", tag: "90 Дней", photo: "" },
            { name: "Абонемент на 6 месяцев", price: "15 000 ₽", desc: "Полгода тренировок + заморозка визитов", tag: "Полгода", photo: "" },
            { name: "Абонемент на 12 месяцев", price: "23 000 ₽", desc: "Годовой безлимит по выгодной цене", tag: "1 Год", photo: "" }
          ]
        },
        {
          title: "Персональный тренинг & СПЛИТ",
          items: [
            { name: "Персональная тренировка (1 занятие)", price: "2 800 ₽", desc: "Персональное занятие с топ-тренером", tag: "1 на 1", photo: "" },
            { name: "Блок из 10 персональных тренировок", price: "25 000 ₽", desc: "Курс индивидуальных занятий", tag: "Выгода", photo: "" },
            { name: "СПЛИТ тренировка (2 человека)", price: "2 100 ₽/чел", desc: "Занятие для двоих с тренером", tag: "Мини-группа", photo: "" },
            { name: "СПЛИТ тренировка (3 человека)", price: "1 900 ₽/чел", desc: "Занятие для троих с тренером", tag: "Мини-группа", photo: "" },
            { name: "СПЛИТ тренировка (от 4х человек)", price: "1 700 ₽/чел", desc: "Занятие от 4х человек", tag: "Группа", photo: "" }
          ]
        }
      ]
    },
    {
      id: "halls",
      num: "02",
      tag: "Пространство",
      title: "Аренда залов 90 м² и 50 м²",
      desc: "Аренда профессиональных залов с паркетом, акустикой и зеркалами.",
      subcategories: [
        {
          title: "Большой зал (90 м²)",
          items: [
            { name: "1 час аренды (90 м²)", price: "1 800 ₽", desc: "Зеркальная стена, коврики, станки", tag: "90 м²", photo: "/images/bolshoyzal.jpg" },
            { name: "1.5 часа аренды (90 м²)", price: "2 400 ₽", desc: "Зеркальная стена, акустическая система", tag: "90 м²", photo: "/images/bolshoyzal.jpg" },
            { name: "2 часа аренды (90 м²)", price: "3 000 ₽", desc: "Для мастер-классов и практики", tag: "90 м²", photo: "/images/bolshoyzal.jpg" },
            { name: "3 часа аренды (90 м²)", price: "4 400 ₽", desc: "Длительная аренда под мероприятия", tag: "90 м²", photo: "/images/bolshoyzal.jpg" }
          ]
        },
        {
          title: "Малый зал (50 м²)",
          items: [
            { name: "1 час аренды (50 м²)", price: "1 500 ₽", desc: "Уютный зал для 1-5 человек", tag: "50 м²", photo: "/images/malizal.jpg" },
            { name: "1.5 часа аренды (50 м²)", price: "2 000 ₽", desc: "Для малых групп и репетиций", tag: "50 м²", photo: "/images/malizal.jpg" },
            { name: "2 часа аренды (50 м²)", price: "2 700 ₽", desc: "Оборудован звуком и зеркалами", tag: "50 м²", photo: "/images/malizal.jpg" },
            { name: "3 часа аренды (50 м²)", price: "3 900 ₽", desc: "Выгодная цена при длительной аренде", tag: "50 м²", photo: "/images/malizal.jpg" },
            { name: "4 часа аренды (50 м²)", price: "5 000 ₽", desc: "Максимальный пакет аренды", tag: "50 м²", photo: "/images/malizal.jpg" }
          ]
        }
      ]
    },
    {
      id: "solarium",
      num: "03",
      tag: "Инсоляция & Загар",
      title: "Солярий",
      desc: "Вертикальный солярий с новыми мощными лампами. В стоимость входит шапочка, стикини и коврик.",
      subcategories: [
        {
          title: "Прайс на солярий",
          items: [
            { name: "1 минута инсоляции", price: "60 ₽/мин", desc: "Шапочка, стикини и коврик включены", tag: "Загар", photo: "/images/solyar.jpg" }
          ]
        }
      ]
    },
    {
      id: "massage",
      num: "04",
      tag: "Тело и Релакс",
      title: "Массаж и СПА-уход",
      desc: "Антицеллюлитный, лимфодренажный, классический, мадеротерапия и массаж спины от дипломированных специалистов.",
      subcategories: [
        {
          title: "Классический и Корректирующий массаж",
          items: [
            { name: "Классический массаж (60 мин)", price: "от 3 200 ₽", desc: "Женский: 3200 ₽ / Мужской: 3700 ₽", tag: "60 мин", photo: "/images/cabinetmassage.jpg" },
            { name: "Мадеротерапия (60 мин)", price: "от 3 700 ₽", desc: "Женский: 3700 ₽ / Мужской: 4200 ₽", tag: "60 мин", photo: "/images/cabinetmassage.jpg" },
            { name: "Мадеротерапия (90 мин)", price: "от 4 400 ₽", desc: "Женский: 4400 ₽ / Мужской: 4900 ₽", tag: "90 мин", photo: "/images/cabinetmassage.jpg" },
            { name: "Антицеллюлитный / Лимфодренажный (60 мин)", price: "от 3 700 ₽", desc: "Женский: 3700 ₽ / Мужской: 4200 ₽", tag: "60 мин", photo: "/images/cabinetmassage.jpg" },
            { name: "Массаж спины и ШВЗ (40 мин)", price: "от 2 200 ₽", desc: "Женский: 2200 ₽ / Мужской: 2700 ₽", tag: "40 мин", photo: "/images/cabinetmassage.jpg" },
            { name: "Массаж лица (30 мин)", price: "от 2 000 ₽", desc: "Женский: 2000 ₽ / Мужской: 2500 ₽", tag: "30 мин", photo: "/images/cabinetmassage.jpg" }
          ]
        }
      ]
    },
    {
      id: "laser",
      num: "05",
      tag: "Инновационная Косметология",
      title: "Лазерная эпиляция",
      desc: "Новое поколение диодного лазера. Безболезненно, эффективно и быстро.",
      subcategories: [
        {
          title: "Выгодные комбо-комплексы",
          items: [
            { name: "Комплекс МИНИ", price: "2 700 ₽", desc: "Глубокое бикини + подмышки", tag: "Хит", photo: "/images/apparat.jpg" },
            { name: "Комплекс СТАНДАРТ", price: "3 900 ₽", desc: "Глубокое бикини + подмышки + голени", tag: "Популярно", photo: "/images/apparat.jpg" },
            { name: "Комплекс ПОПУЛЯРНЫЙ", price: "5 000 ₽", desc: "Глубокое бикини + подмышки + ноги полностью", tag: "Макс", photo: "/images/apparat.jpg" },
            { name: "Комплекс ВСЕ ТЕЛО", price: "7 000 ₽", desc: "Полная обработка тела", tag: "Всё включено", photo: "/images/apparat.jpg" }
          ]
        }
      ]
    }
  ];
}

function renderPricesEditor() {
  const el = document.getElementById('prices-editor');
  if (!db || !el) return;
  if (!db.prices) db.prices = {};
  if (!db.prices.serviceSections || !db.prices.serviceSections.length) {
    db.prices.serviceSections = getDefaultServiceSections();
  }
  const p = db.prices;
  const sections = p.serviceSections;

  el.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:2rem;">
      <div style="display:flex; justify-content:flex-end; align-items:center;">
        <button class="btn btn-primary" onclick="addServiceSection()">+ Добавить раздел</button>
      </div>

      <div id="service-sections-container" style="display:flex; flex-direction:column; gap:2rem;">
        ${sections.map((sec, secIdx) => `
          <div class="svc-sec-box card" style="border:1px solid var(--border-color); border-radius:18px; padding:1.8rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.8rem; border-bottom:1px solid var(--border-color);">
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <span class="svc-sec-num" style="font-family:'Oswald',sans-serif; font-size:1.2rem; font-weight:700; color:var(--gold-dark);">${sec.num || (secIdx < 9 ? '0' + (secIdx + 1) : secIdx + 1)}</span>
                <strong style="font-family:'Oswald',sans-serif; font-size:1.2rem; text-transform:uppercase; color:var(--olive-dark);">Раздел #${secIdx + 1}: ${sec.title || 'Новый раздел'}</strong>
              </div>
              <button class="btn btn-sm btn-danger" onclick="deleteServiceSection(${secIdx})">Удалить раздел</button>
            </div>

            <div class="form-grid" style="margin-bottom:1.5rem;">
              <div class="form-group form-full">
                <label class="form-label">Заголовок раздела *</label>
                <input class="form-control sec-title" value="${sec.title || ''}" placeholder="например, Лазерная эпиляция">
              </div>
              <div class="form-group form-full">
                <label class="form-label">Описание раздела</label>
                <input class="form-control sec-desc" value="${sec.desc || ''}" placeholder="Описание услуг данного раздела">
              </div>
            </div>

            <!-- Подкатегории и карточки услуг -->
            <div class="subcategories-container" style="display:flex; flex-direction:column; gap:1.5rem;">
              ${(sec.subcategories || []).map((sub, subIdx) => `
                <div class="subcat-box" style="background:#fcfdfb; border:1px solid var(--border-color); border-radius:14px; padding:1.2rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex:1;">
                      <label class="form-label" style="margin:0; white-space:nowrap;">Подкатегория:</label>
                      <input class="form-control subcat-title" value="${sub.title || ''}" placeholder="Заголовок подкатегории" style="font-weight:700; max-width:340px;">
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="deleteSubcategory(${secIdx}, ${subIdx})">Удалить подкатегорию</button>
                  </div>

                  <!-- Карточки услуг -->
                  <div class="items-container" style="display:flex; flex-direction:column; gap:1rem;">
                    ${(sub.items || []).map((item, itemIdx) => `
                      <div class="item-box" style="background:#ffffff; border:1px solid var(--border-color); border-radius:12px; padding:1.1rem;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                          <span style="font-size:0.75rem; font-weight:800; color:var(--gold-dark); text-transform:uppercase;">Услуга #${itemIdx + 1}</span>
                          <button class="btn btn-sm btn-danger" onclick="deleteServiceItem(${secIdx}, ${subIdx}, ${itemIdx})">Удалить услугу</button>
                        </div>
                        <div class="form-grid">
                          <div class="form-group">
                            <label class="form-label">Название услуги *</label>
                            <input class="form-control item-name" value="${item.name || ''}" placeholder="например, Абонемент на 1 месяц">
                          </div>
                          <div class="form-group">
                            <label class="form-label">Цена *</label>
                            <input class="form-control item-price" value="${item.price || ''}" placeholder="например, 3 500 ₽ или от 2 000 ₽">
                          </div>
                          <div class="form-group">
                            <label class="form-label">Тэг / Бейдж (опционально)</label>
                            <input class="form-control item-tag" value="${item.tag || ''}" placeholder="например, Хит или 30 Дней">
                          </div>
                          <div class="form-group">
                            <label class="form-label">Описание карточки</label>
                            <input class="form-control item-desc" value="${item.desc || ''}" placeholder="краткое описание условий">
                          </div>
                          <div class="form-group form-full">
                            <label class="form-label">Фотография (Загрузка файла или URL)</label>
                            <div style="display:flex; gap:0.6rem; align-items:center;">
                              <input class="form-control item-photo" value="${item.photo || ''}" placeholder="Вставьте URL или загрузите фото →">
                              <label class="btn btn-ghost" style="cursor:pointer; flex-shrink:0;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Загрузить
                                <input type="file" accept="image/*" style="display:none" onchange="uploadImage(event, this.parentElement.previousElementSibling)">
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>`).join('')}
                  </div>

                  <button class="btn btn-sm btn-ghost" style="margin-top:1rem; width:100%; justify-content:center;" onclick="addServiceItem(${secIdx}, ${subIdx})">+ Добавить услугу в подкатегорию</button>
                </div>`).join('')}
            </div>

            <button class="btn btn-sm btn-ghost" style="margin-top:1.2rem; width:100%; justify-content:center;" onclick="addSubcategory(${secIdx})">+ Добавить подкатегорию в раздел</button>
          </div>`).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
        <button class="btn btn-ghost" onclick="addServiceSection()">+ Добавить новый раздел</button>
        <button class="btn btn-primary btn-lg" onclick="savePrices()">Сохранить все изменения</button>
      </div>
    </div>`;
}

function addServiceSection() {
  if (!db.prices.serviceSections) db.prices.serviceSections = [];
  const idx = db.prices.serviceSections.length + 1;
  db.prices.serviceSections.push({
    id: 'section-' + idx,
    num: idx < 10 ? '0' + idx : '' + idx,
    tag: 'НОВАЯ КАТЕГОРИЯ',
    title: 'Новый раздел услуг',
    desc: 'Описание нового раздела',
    subcategories: [
      {
        title: 'Заголовок подкатегории',
        items: [
          { name: 'Название услуги', price: '1 000 ₽', desc: 'Описание услуги', tag: 'Новинка', photo: '' }
        ]
      }
    ]
  });
  renderPricesEditor();
}

function deleteServiceSection(secIdx) {
  if (!confirm('Удалить этот раздел и все входящие в него услуги?')) return;
  db.prices.serviceSections.splice(secIdx, 1);
  renderPricesEditor();
}

function addSubcategory(secIdx) {
  if (!db.prices.serviceSections[secIdx].subcategories) db.prices.serviceSections[secIdx].subcategories = [];
  db.prices.serviceSections[secIdx].subcategories.push({
    title: 'Новая подкатегория',
    items: [
      { name: 'Новая услуга', price: '1 000 ₽', desc: 'Описание услуги', tag: '', photo: '' }
    ]
  });
  renderPricesEditor();
}

function deleteSubcategory(secIdx, subIdx) {
  db.prices.serviceSections[secIdx].subcategories.splice(subIdx, 1);
  renderPricesEditor();
}

function addServiceItem(secIdx, subIdx) {
  if (!db.prices.serviceSections[secIdx].subcategories[subIdx].items) {
    db.prices.serviceSections[secIdx].subcategories[subIdx].items = [];
  }
  db.prices.serviceSections[secIdx].subcategories[subIdx].items.push({
    name: 'Новая услуга',
    price: '1 000 ₽',
    desc: 'Описание услуги',
    tag: '',
    photo: ''
  });
  renderPricesEditor();
}

function deleteServiceItem(secIdx, subIdx, itemIdx) {
  db.prices.serviceSections[secIdx].subcategories[subIdx].items.splice(itemIdx, 1);
  renderPricesEditor();
}

async function savePrices() {
  const p = JSON.parse(JSON.stringify(db.prices || {}));
  const sections = [];

  document.querySelectorAll('.svc-sec-box').forEach((secBox, secIdx) => {
    const origSec = (p.serviceSections && p.serviceSections[secIdx]) || {};
    const title = secBox.querySelector('.sec-title').value.trim();
    const desc = secBox.querySelector('.sec-desc').value.trim();
    const num = secBox.querySelector('.svc-sec-num').textContent.trim();
    const id = origSec.id || ('sec-' + (secIdx + 1));
    const tag = origSec.tag || 'Услуги';

    const subcategories = [];
    secBox.querySelectorAll('.subcat-box').forEach((subBox) => {
      const subTitle = subBox.querySelector('.subcat-title').value.trim();
      const items = [];

      subBox.querySelectorAll('.item-box').forEach((itemBox) => {
        items.push({
          name: itemBox.querySelector('.item-name').value.trim(),
          price: itemBox.querySelector('.item-price').value.trim(),
          tag: itemBox.querySelector('.item-tag').value.trim(),
          desc: itemBox.querySelector('.item-desc').value.trim(),
          photo: itemBox.querySelector('.item-photo').value.trim()
        });
      });

      subcategories.push({
        title: subTitle,
        items
      });
    });

    sections.push({
      id,
      num,
      tag,
      title,
      desc,
      subcategories
    });
  });

  p.serviceSections = sections;

  try {
    await apiPut('/api/prices', p);
    toast('Все изменения разделов и услуг сохранены!', 'success');
    await loadDB();
  } catch {
    toast('Ошибка сохранения', 'error');
  }
}

// ─── News ─────────────────────────────────────────────────────
function renderNewsTable() {
  const tbody = document.getElementById('news-tbody');
  if (!db || !tbody) return;
  if (!db.news.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--gray); padding:2rem;">Новостей пока нет</td></tr>`;
    return;
  }
  tbody.innerHTML = db.news.map(n => `
    <tr>
      <td style="color:var(--gray);font-size:0.8rem;">${n.date || '—'}</td>
      <td><span style="background:rgba(196,169,106,0.12);padding:0.2rem 0.6rem;border-radius:10px;font-size:0.7rem;color:var(--gold);">${n.category || 'Новость'}</span></td>
      <td style="font-weight:500;">${n.title}</td>
      <td style="color:var(--gray);font-size:0.8rem;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.content ? n.content.slice(0, 80) + '...' : '—'}</td>
      <td><div class="td-actions">
        <button class="btn btn-ghost btn-sm" onclick="editNews(${n.id})">Изменить</button>
        <button class="btn btn-danger btn-sm" onclick="deleteNews(${n.id})">Удалить</button>
      </div></td>
    </tr>`).join('');
}

function openNewsModal(news = null) {
  editingNewsId = news ? news.id : null;
  document.getElementById('news-modal-title').textContent = news ? 'Редактировать новость' : 'Добавить новость';
  document.getElementById('n-title').value = news ? news.title : '';
  document.getElementById('n-cat').value = news ? (news.category || 'Новость') : 'Новость';
  document.getElementById('n-date').value = news ? (news.date || '') : new Date().toISOString().slice(0, 10);
  document.getElementById('n-content').value = news ? (news.content || '') : '';
  document.getElementById('n-image').value = news ? (news.image || '') : '';
  openModal('news-modal');
}

function editNews(id) {
  const n = db.news.find(n => n.id === id);
  if (n) openNewsModal(n);
}

async function saveNews() {
  const title = document.getElementById('n-title').value.trim();
  const content = document.getElementById('n-content').value.trim();
  if (!title || !content) { toast('Заполните обязательные поля', 'error'); return; }
  const data = {
    title,
    content,
    category: document.getElementById('n-cat').value,
    date: document.getElementById('n-date').value,
    image: document.getElementById('n-image').value.trim(),
  };
  try {
    if (editingNewsId) {
      await apiPut(`/api/news/${editingNewsId}`, data);
      toast('Новость обновлена', 'success');
    } else {
      await apiPost('/api/news', data);
      toast('Новость добавлена', 'success');
    }
    closeModal('news-modal');
    await loadDB();
  } catch { toast('Ошибка', 'error'); }
}

async function deleteNews(id) {
  if (!confirm('Удалить новость?')) return;
  await apiDelete(`/api/news/${id}`);
  toast('Новость удалена', 'success');
  await loadDB();
}

async function tryLogin() {
  const pass = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.remove('show');
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      token = data.token;
      localStorage.setItem(TOKEN_KEY, token);
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('admin-app').style.display = 'flex';
      await loadDB();
    } else {
      errEl.classList.add('show');
    }
  } catch {
    errEl.classList.add('show');
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem(TOKEN_KEY);
  token = '';
  document.getElementById('admin-app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('login-password').value = '';
});

// ─── API ─────────────────────────────────────────────────────────
async function apiGet(url) {
  const res = await fetch(url, { headers: { 'x-admin-token': token } });
  return res.json();
}
async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body)
  });
  return res.json();
}
async function apiPut(url, body) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(body)
  });
  return res.json();
}
async function apiDelete(url) {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'x-admin-token': token }
  });
  return res.json();
}

// ─── Reviews ─────────────────────────────────────────────────
let editingReviewId = null;

function renderReviewsList() {
  const list = document.getElementById('reviews-list');
  if (!db || !list) return;
  if (!db.reviews.length) {
    list.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--gray)">Отзывов пока нет</div>`;
    return;
  }
  list.innerHTML = db.reviews.map(r => `
    <div class="review-admin-card">
      <div class="review-admin-avatar">${(r.name || 'А').charAt(0)}</div>
      <div class="review-admin-meta">
        <div class="review-admin-name">${r.name} <span style="color:var(--gold);font-size:0.75rem;"> ${'★'.repeat(r.rating || 5)}</span></div>
        <div class="review-admin-date">${r.level || ''} &middot; ${r.date}</div>
        <div class="review-admin-text">${r.text}</div>
      </div>
      <div class="review-admin-actions">
        <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id})">Удалить</button>
      </div>
    </div>`).join('');
}

function openReviewModal() { openModal('review-modal'); }

async function saveReview() {
  const name = document.getElementById('r-name').value.trim();
  const text = document.getElementById('r-text').value.trim();
  if (!name || !text) { toast('Заполните обязательные поля', 'error'); return; }
  const data = {
    name,
    text,
    date: document.getElementById('r-date').value.trim() || new Date().toLocaleDateString('ru-RU'),
    rating: parseInt(document.getElementById('r-rating').value),
    level: ''
  };
  try {
    await apiPost('/api/reviews', data);
    toast('Отзыв добавлен', 'success');
    closeModal('review-modal');
    await loadDB();
  } catch { toast('Ошибка', 'error'); }
}

async function deleteReview(id) {
  if (!confirm('Удалить отзыв?')) return;
  await apiDelete(`/api/reviews/${id}`);
  toast('Отзыв удалён', 'success');
  await loadDB();
}

// ─── Gallery ─────────────────────────────────────────────────
function renderGalleryAdmin() {
  const grid = document.getElementById('admin-gallery-grid');
  if (!db || !grid) return;
  if (!db.gallery.length) {
    grid.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--gray);border:1px dashed rgba(196,169,106,0.2);border-radius:4px;grid-column:1/-1;">Фото пока не добавлено</div>`;
    return;
  }
  grid.innerHTML = db.gallery.map(g => `
    <div class="admin-gallery-item">
      ${g.url
        ? `<img src="${g.url}" alt="${g.caption || ''}" loading="lazy">`
        : `<div style="width:100%;height:100%;min-height:150px;display:flex;align-items:center;justify-content:center;color:var(--gray-2);font-size:0.75rem;">${g.caption || g.category}</div>`
      }
      <div class="admin-gallery-overlay">
        <button class="btn btn-danger btn-sm" onclick="deleteGallery(${g.id})">Удалить</button>
      </div>
      <div class="admin-gallery-caption">${g.category} ${g.caption ? '&middot; ' + g.caption : ''}</div>
    </div>`).join('');
}

function openGalleryModal() { openModal('gallery-modal'); }

async function saveGalleryItem() {
  const url = document.getElementById('g-url').value.trim();
  if (!url) { toast('Укажите URL фото', 'error'); return; }
  const data = {
    url,
    category: document.getElementById('g-cat').value,
    caption: document.getElementById('g-caption').value.trim()
  };
  try {
    await apiPost('/api/gallery', data);
    toast('Фото добавлено', 'success');
    closeModal('gallery-modal');
    document.getElementById('g-url').value = '';
    document.getElementById('g-caption').value = '';
    await loadDB();
  } catch { toast('Ошибка', 'error'); }
}

async function deleteGallery(id) {
  if (!confirm('Удалить фото?')) return;
  await apiDelete(`/api/gallery/${id}`);
  toast('Фото удалено', 'success');
  await loadDB();
}

// ─── Schedule ────────────────────────────────────────────────
function renderScheduleAdmin() {
  const grid = document.getElementById('schedule-grid');
  if (!db || !grid) return;
  currentSchedule = JSON.parse(JSON.stringify(db.schedule));
  grid.innerHTML = currentSchedule.map(day => `
    <div class="schedule-day" id="sched-day-${day.id}">
      <div class="schedule-day-title">${day.day}</div>
      <div id="sched-classes-${day.id}">
        ${renderDayClasses(day)}
      </div>
      <button class="schedule-add" onclick="openScheduleModal(${day.id})">+ Добавить</button>
    </div>`).join('');
}

function renderDayClasses(day) {
  if (!day.classes || !day.classes.length) return '<div style="font-size:0.7rem;color:var(--gray-2);text-align:center;padding:0.5rem;">—</div>';
  return day.classes.map((cls, idx) => `
    <div class="schedule-class">
      <div class="schedule-class-time">${cls.time}</div>
      <div class="schedule-class-name">${cls.name}</div>
      ${cls.trainer ? `<div style="font-size:0.65rem;color:var(--gray);">${cls.trainer}</div>` : ''}
      <button class="schedule-class-delete" onclick="deleteScheduleClass(${day.id}, ${idx})">×</button>
    </div>`).join('');
}

function openScheduleModal(dayId) {
  document.getElementById('sched-day-id').value = dayId;
  document.getElementById('sched-time').value = '';
  document.getElementById('sched-name').value = '';
  document.getElementById('sched-trainer').value = '';
  openModal('schedule-modal');
}

function saveScheduleClass() {
  const dayId = parseInt(document.getElementById('sched-day-id').value);
  const time = document.getElementById('sched-time').value;
  const name = document.getElementById('sched-name').value.trim();
  const trainer = document.getElementById('sched-trainer').value.trim();
  if (!time || !name) { toast('Укажите время и название', 'error'); return; }
  const day = currentSchedule.find(d => d.id === dayId);
  if (day) {
    if (!day.classes) day.classes = [];
    day.classes.push({ time, name, trainer });
    day.classes.sort((a, b) => a.time.localeCompare(b.time));
    document.getElementById(`sched-classes-${dayId}`).innerHTML = renderDayClasses(day);
  }
  closeModal('schedule-modal');
}

function deleteScheduleClass(dayId, idx) {
  const day = currentSchedule.find(d => d.id === dayId);
  if (day && day.classes) {
    day.classes.splice(idx, 1);
    document.getElementById(`sched-classes-${dayId}`).innerHTML = renderDayClasses(day);
  }
}

async function saveSchedule() {
  try {
    await apiPut('/api/schedule', currentSchedule);
    toast('Расписание сохранено', 'success');
    await loadDB();
  } catch { toast('Ошибка', 'error'); }
}

// ─── Database ────────────────────────────────────────────────
function renderDBPreview() {
  const pre = document.getElementById('db-preview');
  if (!pre || !db) return;
  const summary = {
    trainers: db.trainers.length,
    news: db.news.length,
    reviews: db.reviews.length,
    gallery: db.gallery.length,
    prices: { single: db.prices.single, subscriptions: db.prices.subscriptions.length },
    schedule: db.schedule.length
  };
  pre.textContent = JSON.stringify(summary, null, 2) + '\n\n// Полный файл доступен по кнопке "Скачать db.json"';
}

async function exportDB() {
  const a = document.createElement('a');
  a.href = '/api/db/export';
  a.setAttribute('download', 'db.json');
  // Need token in header, use fetch
  const res = await fetch('/api/db/export', { headers: { 'x-admin-token': token } });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = 'db.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('База данных скачана', 'success');
}

async function importDB(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!confirm('Заменить всю базу данных? Это действие нельзя отменить.')) return;
    const res = await apiPost('/api/db/import', data);
    if (res.ok) {
      toast('База загружена успешно', 'success');
      await loadDB();
    } else {
      toast('Ошибка: ' + (res.error || 'неверный формат'), 'error');
    }
  } catch (e) {
    toast('Ошибка чтения файла: ' + e.message, 'error');
  }
  event.target.value = '';
}

// ─── Auto login check ────────────────────────────────────────
if (token) {
  tryLogin();
}
