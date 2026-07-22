/* =================================================
   admin.js — Аура Fitness Admin Panel Logic
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
  const pass = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.remove('show');
  try {
    const res = await fetch('/api/data', { headers: { 'x-admin-token': pass } });
    if (res.ok) {
      token = pass;
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

// ─── Prices ────────────────────────────────────────────────────
function renderPricesEditor() {
  const el = document.getElementById('prices-editor');
  if (!db || !el) return;
  const p = db.prices;

  el.innerHTML = `
    <div class="price-editor-grid">
      <div class="card">
        <div class="card-title">Разовое посещение</div>
        <div class="form-group" style="margin-top:1rem;">
          <label class="form-label">Цена (₽)</label>
          <input class="form-control" id="price-single" type="number" value="${p.single}">
        </div>
      </div>
      <div class="card">
        <div class="card-title">Абонементы</div>
        ${p.subscriptions.map(s => `
          <div class="form-group" style="display:flex; gap:0.5rem; align-items:center; margin-top:0.5rem;">
            <span style="font-size:0.8rem; color:var(--gray); min-width:80px;">${s.period}</span>
            <input class="form-control price-table-input" data-sub-id="${s.id}" type="number" value="${s.price}">
            <span style="font-size:0.8rem; color:var(--gray)">₽</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">Аренда 90 м²</div>
        ${p.hall90.map(h => `
          <div class="form-group" style="display:flex; gap:0.5rem; align-items:center; margin-top:0.5rem;">
            <span style="font-size:0.8rem; color:var(--gray); min-width:80px;">${h.duration}</span>
            <input class="form-control price-table-input" data-h90-id="${h.id}" type="number" value="${h.price}">
            <span style="font-size:0.8rem; color:var(--gray)">₽</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">Аренда 50 м²</div>
        ${p.hall50.map(h => `
          <div class="form-group" style="display:flex; gap:0.5rem; align-items:center; margin-top:0.5rem;">
            <span style="font-size:0.8rem; color:var(--gray); min-width:80px;">${h.duration}</span>
            <input class="form-control price-table-input" data-h50-id="${h.id}" type="number" value="${h.price}">
            <span style="font-size:0.8rem; color:var(--gray)">₽</span>
          </div>`).join('')}
      </div>
    </div>`;
}

async function savePrices() {
  const p = JSON.parse(JSON.stringify(db.prices));
  p.single = parseInt(document.getElementById('price-single').value) || p.single;
  document.querySelectorAll('[data-sub-id]').forEach(el => {
    const sub = p.subscriptions.find(s => s.id === parseInt(el.dataset.subId));
    if (sub) sub.price = parseInt(el.value) || sub.price;
  });
  document.querySelectorAll('[data-h90-id]').forEach(el => {
    const h = p.hall90.find(h => h.id === parseInt(el.dataset.h90Id));
    if (h) h.price = parseInt(el.value) || h.price;
  });
  document.querySelectorAll('[data-h50-id]').forEach(el => {
    const h = p.hall50.find(h => h.id === parseInt(el.dataset.h50Id));
    if (h) h.price = parseInt(el.value) || h.price;
  });
  try {
    await apiPut('/api/prices', p);
    toast('Цены сохранены', 'success');
    await loadDB();
  } catch { toast('Ошибка сохранения', 'error'); }
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

// ─── Reviews ─────────────────────────────────────────────────
function renderReviewsList() {
  const list = document.getElementById('reviews-list');
  if (!db || !list) return;
  if (!db.reviews.length) {
    list.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--gray)">Отзывов пока нет</div>`;
    return;
  }
  list.innerHTML = db.reviews.map(r => `
    <div class="review-admin-card">
      <div class="review-admin-avatar">${r.name.charAt(0)}</div>
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
