/* =================================================
   admin.js — Фитнес-центр «Аура» Admin Panel Logic
   (GitHub Pages + Client-Side GitHub REST API Edition)
================================================= */

// ─── GitHub API Client Configuration ──────────────────────────────
const GITHUB_REPO_DEFAULT = 'senteryz/fitnes';
const GITHUB_BRANCH_DEFAULT = 'main';
const GITHUB_PATH_DEFAULT = 'data/db.json';

const TOKEN_KEY = 'aura_admin_token';
const GH_TOKEN_KEY = 'aura_gh_token';
const GH_REPO_KEY = 'aura_gh_repo';
const GH_BRANCH_KEY = 'aura_gh_branch';
const GH_SHA_KEY = 'aura_gh_sha';

let token = localStorage.getItem(TOKEN_KEY) || '';
let ghToken = localStorage.getItem(GH_TOKEN_KEY) || '';
let ghRepo = localStorage.getItem(GH_REPO_KEY) || GITHUB_REPO_DEFAULT;
let ghBranch = localStorage.getItem(GH_BRANCH_KEY) || GITHUB_BRANCH_DEFAULT;
let lastSha = localStorage.getItem(GH_SHA_KEY) || null;

let db = null;
let editingTrainerId = null;
let editingNewsId = null;
let currentSchedule = [];

// ─── Toast Notifications ───────────────────────────────────────────
function toast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
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

// Автозаполнение токена в форме логина, если он сохранен
const loginTokenInput = document.getElementById('login-gh-token');
if (loginTokenInput && ghToken) {
  loginTokenInput.value = ghToken;
}

async function tryLogin() {
  const pass = (document.getElementById('login-password').value || '').trim();
  const tokenVal = (document.getElementById('login-gh-token')?.value || '').trim();
  const errEl = document.getElementById('login-error');
  errEl.classList.remove('show');

  if (tokenVal) {
    ghToken = tokenVal;
    localStorage.setItem(GH_TOKEN_KEY, ghToken);
  }

  try {
    toast('Вход и загрузка данных...', 'info');
    await loadDB();
    const masterPass = String((db && db.settings && db.settings.adminPassword) || 'aura2026').trim();
    if (pass === masterPass || (!pass && ghToken) || token === 'aura-gh-session') {
      token = 'aura-gh-session';
      localStorage.setItem(TOKEN_KEY, token);
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('admin-app').style.display = 'flex';
      updateGitHubStatusBadge();
      toast('Добро пожаловать в панель управления!', 'success');
    } else {
      errEl.textContent = 'Неверный пароль (по умолчанию: aura2026)';
      errEl.classList.add('show');
    }
  } catch (err) {
    errEl.textContent = 'Ошибка загрузки базы: ' + err.message;
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

// ─── Database Loader (GitHub API / Local File Fallback) ────────────
async function loadDB() {
  // 1. Если задан GitHub токен — пробуем получить актуальную версию через GitHub REST API
  if (ghToken) {
    try {
      const url = `https://api.github.com/repos/${ghRepo}/contents/${GITHUB_PATH_DEFAULT}?ref=${ghBranch}&_t=${Date.now()}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${ghToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const fileData = await res.json();
        lastSha = fileData.sha;
        localStorage.setItem(GH_SHA_KEY, lastSha);
        const jsonStr = decodeURIComponent(escape(atob(fileData.content)));
        db = JSON.parse(jsonStr);
        renderAll();
        updateGitHubStatusBadge();
        return db;
      }
    } catch (e) {
      console.warn('Не удалось загрузить через GitHub API, пробуем локальный файл:', e);
    }
  }

  // 2. Загрузка локального data/db.json
  const res = await fetch('data/db.json?_t=' + Date.now());
  if (!res.ok) throw new Error('Не удалось загрузить data/db.json');
  db = await res.json();
  renderAll();
  updateGitHubStatusBadge();
  return db;
}

// ─── Database Saver (Direct GitHub REST API Commit) ────────────────
async function saveDB(commitMessage = 'Update db.json from Aura Admin') {
  if (!db) return false;

  if (ghToken) {
    toast(`Коммит в GitHub: ${commitMessage}...`, 'info');
    try {
      if (!lastSha) {
        const metaRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${GITHUB_PATH_DEFAULT}?ref=${ghBranch}`, {
          headers: {
            'Authorization': `Bearer ${ghToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          lastSha = meta.sha;
        }
      }

      const jsonStr = JSON.stringify(db, null, 2);
      const b64 = btoa(unescape(encodeURIComponent(jsonStr)));

      const payload = {
        message: `${commitMessage} [skip ci]`,
        content: b64,
        branch: ghBranch,
        sha: lastSha
      };

      let putRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${GITHUB_PATH_DEFAULT}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ghToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // 409 Conflict: переполучаем SHA и повторяем 1 раз
      if (putRes.status === 409) {
        console.warn('Конфликт SHA, обновляем...');
        const metaRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${GITHUB_PATH_DEFAULT}?ref=${ghBranch}`, {
          headers: { 'Authorization': `Bearer ${ghToken}` }
        });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          lastSha = meta.sha;
          payload.sha = lastSha;
          putRes = await fetch(`https://api.github.com/repos/${ghRepo}/contents/${GITHUB_PATH_DEFAULT}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${ghToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }
      }

      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({}));
        throw new Error(err.message || ('HTTP ' + putRes.status));
      }

      const resData = await putRes.json();
      lastSha = resData.content?.sha || resData.commit?.sha || lastSha;
      localStorage.setItem(GH_SHA_KEY, lastSha);
      toast(`✅ Успешно закоммичено в GitHub! (${commitMessage})`, 'success');
      updateGitHubStatusBadge();
      renderDBPreview();
      return true;
    } catch (err) {
      console.error('Ошибка коммита в GitHub:', err);
      toast(`⚠️ Ошибка коммита: ${err.message}. Изменения сохранены в браузере.`, 'error');
      localStorage.setItem('aura_offline_db', JSON.stringify(db));
      return false;
    }
  } else {
    localStorage.setItem('aura_offline_db', JSON.stringify(db));
    toast('💾 Сохранено в браузере. Укажите GitHub Token для коммитов в репозиторий.', 'warning');
    renderDBPreview();
    return true;
  }
}

// ─── In-Browser Client-Side API Router ─────────────────────────────
function nextId(arr) {
  if (!arr || !arr.length) return 1;
  return Math.max(...arr.map(i => i.id || 0)) + 1;
}

async function apiGet(url) {
  if (url === '/api/data') return db || await loadDB();
  if (url === '/api/club') return (db && db.club) || {};
  if (url === '/api/prices') return (db && db.prices) || {};
  if (url === '/api/trainers') return (db && db.trainers) || [];
  if (url === '/api/news') return (db && db.news) || [];
  if (url === '/api/reviews') return (db && db.reviews) || [];
  if (url === '/api/gallery') return (db && db.gallery) || [];
  if (url === '/api/schedule') return (db && db.schedule) || [];
  if (url === '/api/leads') return (db && db.leads) || [];
  if (url === '/api/settings') return (db && db.settings) || {};
  if (url === '/api/admin/github-status') {
    return {
      enabled: Boolean(ghToken),
      repo: ghRepo,
      branch: ghBranch,
      path: GITHUB_PATH_DEFAULT,
      lastSha: lastSha ? lastSha.slice(0, 7) : null
    };
  }
  return {};
}

async function apiPost(url, body) {
  if (!db) await loadDB();

  if (url === '/api/admin/login') {
    const inputPass = String(body.password || '').trim();
    const masterPass = String((db.settings && db.settings.adminPassword) || 'aura2026').trim();
    if (inputPass === masterPass || (!inputPass && ghToken)) {
      return { ok: true, token: 'aura-gh-session' };
    }
    const err = new Error('Неверный пароль');
    err.status = 401;
    throw err;
  }

  if (url === '/api/trainers') {
    const item = { id: nextId(db.trainers), ...body };
    if (!db.trainers) db.trainers = [];
    db.trainers.push(item);
    await saveDB(`Добавление тренера: ${item.name || item.id}`);
    return item;
  }

  if (url === '/api/news') {
    const item = { id: nextId(db.news), date: new Date().toISOString().slice(0, 10), ...body };
    if (!db.news) db.news = [];
    db.news.unshift(item);
    await saveDB(`Добавление новости: ${item.title || item.id}`);
    return item;
  }

  if (url === '/api/reviews') {
    const item = { id: nextId(db.reviews), date: new Date().toLocaleDateString('ru-RU'), ...body };
    if (!db.reviews) db.reviews = [];
    db.reviews.unshift(item);
    await saveDB(`Добавление отзыва от: ${item.name || 'Гость'}`);
    return item;
  }

  if (url === '/api/gallery') {
    const item = { id: nextId(db.gallery), ...body };
    if (!db.gallery) db.gallery = [];
    db.gallery.push(item);
    await saveDB(`Добавление фото в галерею #${item.id}`);
    return item;
  }

  if (url === '/api/db/import') {
    db = body;
    await saveDB('Импорт базы данных db.json');
    return { ok: true };
  }

  if (url === '/api/db/reset-to-default') {
    const res = await fetch('data/db.json?_t=' + Date.now());
    db = await res.json();
    await saveDB('Сброс базы данных к исходному db.json');
    return { ok: true };
  }

  if (url === '/api/admin/github-sync') {
    if (!ghToken) throw new Error('GitHub Token не задан');
    await loadDB();
    return { ok: true };
  }

  return { ok: true };
}

async function apiPut(url, body) {
  if (!db) await loadDB();

  if (url === '/api/club') {
    db.club = { ...db.club, ...body };
    await saveDB('Обновление информации о клубе');
    return db.club;
  }

  if (url === '/api/prices') {
    db.prices = { ...db.prices, ...body };
    await saveDB('Обновление прайс-листа');
    return db.prices;
  }

  if (url.startsWith('/api/trainers/')) {
    const id = parseInt(url.split('/').pop(), 10);
    const idx = (db.trainers || []).findIndex(t => t.id === id);
    if (idx !== -1) {
      db.trainers[idx] = { ...db.trainers[idx], ...body };
      await saveDB(`Обновление тренера: ${db.trainers[idx].name || id}`);
      return db.trainers[idx];
    }
    throw new Error('Тренер не найден');
  }

  if (url.startsWith('/api/news/')) {
    const id = parseInt(url.split('/').pop(), 10);
    const idx = (db.news || []).findIndex(n => n.id === id);
    if (idx !== -1) {
      db.news[idx] = { ...db.news[idx], ...body };
      await saveDB(`Обновление новости #${id}`);
      return db.news[idx];
    }
    throw new Error('Новость не найдена');
  }

  if (url.startsWith('/api/reviews/')) {
    const id = parseInt(url.split('/').pop(), 10);
    const idx = (db.reviews || []).findIndex(r => r.id === id);
    if (idx !== -1) {
      db.reviews[idx] = { ...db.reviews[idx], ...body };
      await saveDB(`Обновление отзыва #${id}`);
      return db.reviews[idx];
    }
    throw new Error('Отзыв не найден');
  }

  if (url === '/api/schedule') {
    db.schedule = body;
    await saveDB('Обновление расписания');
    return db.schedule;
  }

  if (url.startsWith('/api/leads/') && url.endsWith('/status')) {
    const id = parseInt(url.split('/')[3], 10);
    const lead = (db.leads || []).find(l => l.id === id);
    if (lead) {
      lead.status = body.status || (lead.status === 'processed' ? 'new' : 'processed');
      await saveDB(`Изменение статуса заявки #${id} на ${lead.status}`);
      return lead;
    }
    throw new Error('Заявка не найдена');
  }

  if (url === '/api/settings') {
    db.settings = { ...db.settings, ...body };
    await saveDB('Обновление настроек сайта и акций');
    return db.settings;
  }

  return body;
}

async function apiDelete(url) {
  if (!db) await loadDB();

  if (url.startsWith('/api/trainers/')) {
    const id = parseInt(url.split('/').pop(), 10);
    db.trainers = (db.trainers || []).filter(t => t.id !== id);
    await saveDB(`Удаление тренера #${id}`);
    return { ok: true };
  }

  if (url.startsWith('/api/news/')) {
    const id = parseInt(url.split('/').pop(), 10);
    db.news = (db.news || []).filter(n => n.id !== id);
    await saveDB(`Удаление новости #${id}`);
    return { ok: true };
  }

  if (url.startsWith('/api/reviews/')) {
    const id = parseInt(url.split('/').pop(), 10);
    db.reviews = (db.reviews || []).filter(r => r.id !== id);
    await saveDB(`Удаление отзыва #${id}`);
    return { ok: true };
  }

  if (url.startsWith('/api/gallery/')) {
    const id = parseInt(url.split('/').pop(), 10);
    db.gallery = (db.gallery || []).filter(g => g.id !== id);
    await saveDB(`Удаление фото из галереи #${id}`);
    return { ok: true };
  }

  if (url.startsWith('/api/leads/')) {
    const id = parseInt(url.split('/').pop(), 10);
    db.leads = (db.leads || []).filter(l => l.id !== id);
    await saveDB(`Удаление заявки #${id}`);
    return { ok: true };
  }

  return { ok: true };
}

function renderAll() {
  renderDashboard();
  renderLeadsTable();
  renderTrainersTable();
  renderPricesEditor();
  renderNewsTable();
  renderReviewsList();
  renderGalleryAdmin();
  renderScheduleAdmin();
  renderDBPreview();
  renderPromoAdmin();
  checkGitHubStatus();
}

// ─── Navigation ─────────────────────────────────────────────────
const panelTitles = {
  dashboard: 'Дашборд',
  leads: 'Заявки с сайта',
  trainers: 'Тренеры',
  prices: 'Цены',
  news: 'Новости',
  reviews: 'Отзывы',
  gallery: 'Галерея',
  promo: 'Всплывающая акция (Pop-up)',
  schedule: 'Расписание',
  database: 'База данных'
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchPanel(item.dataset.panel));
});

function switchPanel(name) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const panel = document.getElementById(`panel-${name}`);
  const nav = document.getElementById(`nav-${name}`);
  if (panel) panel.classList.add('active');
  if (nav) nav.classList.add('active');
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
  const leads = db.leads || [];
  const newLeadsCount = leads.filter(l => l.status === 'new').length;
  
  const statLeadsEl = document.getElementById('stat-leads');
  if (statLeadsEl) statLeadsEl.textContent = leads.length;

  const badgeEl = document.getElementById('nav-leads-badge');
  if (badgeEl) {
    if (newLeadsCount > 0) {
      badgeEl.textContent = newLeadsCount;
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }

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

// ─── Photo Upload Helper (Supports file upload & URL input via FileReader) ──
async function uploadImage(event, targetElementOrId) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 8 * 1024 * 1024) {
    toast('Файл слишком большой (максимум 8 МБ)', 'error');
    return;
  }

  try {
    toast('Обработка фото...', 'info');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof targetElementOrId === 'string') {
        const input = document.getElementById(targetElementOrId);
        if (input) input.value = dataUrl;
      } else if (targetElementOrId && targetElementOrId.value !== undefined) {
        targetElementOrId.value = dataUrl;
      }
      toast('Фото успешно загружено!', 'success');
    };
    reader.onerror = () => toast('Ошибка чтения файла', 'error');
    reader.readAsDataURL(file);
  } catch (e) {
    toast('Ошибка обработки файла: ' + e.message, 'error');
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
            { name: "1.5 часа аренды (90 м²)", price: "2 400 ₽", desc: "Зеркальная стена, акустическая система", tag: "90 м²", photo: "/images/bolshoyzal.jpg" }
          ]
        },
        {
          title: "Малый зал (50 м²)",
          items: [
            { name: "1 час аренды (50 м²)", price: "1 500 ₽", desc: "Уютный зал для 1-5 человек", tag: "50 м²", photo: "/images/malizal.jpg" },
            { name: "1.5 часа аренды (50 м²)", price: "2 000 ₽", desc: "Для малых групп и репетиций", tag: "50 м²", photo: "/images/malizal.jpg" }
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

// ─── Leads Management ─────────────────────────────────────────
function renderLeadsTable() {
  const tbody = document.getElementById('leads-tbody');
  if (!db || !tbody) return;
  const leads = db.leads || [];

  if (!leads.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--gray); padding:2.5rem;">Заявок пока нет. Новые заявки с сайта появятся здесь автоматически.</td></tr>`;
    return;
  }

  tbody.innerHTML = leads.map(l => {
    const isNew = l.status === 'new';
    const statusBadge = isNew
      ? `<span style="display:inline-block; padding:0.25rem 0.6rem; border-radius:12px; background:rgba(212,175,55,0.18); border:1px solid var(--gold); color:var(--gold); font-size:0.75rem; font-weight:700;">Новая</span>`
      : `<span style="display:inline-block; padding:0.25rem 0.6rem; border-radius:12px; background:rgba(255,255,255,0.08); color:var(--gray); font-size:0.75rem;">Обработана</span>`;

    const cleanPhone = (l.phone || '').replace(/\D/g, '');

    return `
    <tr style="${isNew ? 'background:rgba(196,169,106,0.05);' : ''}">
      <td style="font-size:0.8rem; color:var(--gray); white-space:nowrap;">${l.date || '—'}</td>
      <td style="font-weight:600; color:#fff;">${l.name || 'Клиент'}</td>
      <td>
        <a href="tel:+${cleanPhone}" class="btn btn-ghost btn-sm" style="display:inline-flex; align-items:center; gap:0.4rem; color:var(--gold); font-weight:600; text-decoration:none;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          ${l.phone || '—'}
        </a>
      </td>
      <td style="font-size:0.85rem;">${l.service || 'Общая заявка'}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="td-actions">
          <button class="btn ${isNew ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="toggleLeadStatus(${l.id})">
            ${isNew ? 'Отметить обработанной' : 'В новые'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteLead(${l.id})" title="Удалить заявку">
            ✕
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

async function toggleLeadStatus(id) {
  try {
    const res = await apiPut(`/api/leads/${id}/status`, {});
    if (res && res.id) {
      toast('Статус заявки обновлен', 'success');
      await loadDB();
    }
  } catch (err) {
    toast('Ошибка обновления статуса', 'error');
  }
}

async function deleteLead(id) {
  if (!confirm('Удалить эту заявку?')) return;
  try {
    const res = await apiDelete(`/api/leads/${id}`);
    if (res.ok) {
      toast('Заявка удалена', 'info');
      await loadDB();
    }
  } catch (err) {
    toast('Ошибка удаления', 'error');
  }
}

function exportDB() {
  if (!db) {
    toast('База данных ещё не загружена', 'error');
    return;
  }
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'db.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('База данных успешно скачана', 'success');
}

async function importDB(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.club || !data.prices || !data.reviews) {
      toast('Неверная структура db.json', 'error');
      return;
    }
    if (!confirm('Заменить всю базу данных? Изменения будут сохранены и отправлены в GitHub.')) return;
    db = data;
    await saveDB('Импорт db.json из файла');
    renderAll();
    toast('База данных успешно загружена', 'success');
  } catch (e) {
    toast('Ошибка чтения файла: ' + e.message, 'error');
  }
  event.target.value = '';
}

async function resetDBFromCode() {
  if (!confirm('Сбросить базу данных к исходному файлу data/db.json?')) return;
  try {
    const res = await fetch('data/db.json?_t=' + Date.now());
    if (!res.ok) throw new Error('Не удалось прочитать data/db.json');
    db = await res.json();
    await saveDB('Сброс базы данных к исходному db.json');
    renderAll();
    toast('База данных успешно сброшена', 'success');
  } catch (e) {
    toast('Ошибка: ' + e.message, 'error');
  }
}

// ─── Promo Popup Admin ──────────────────────────────────────
function renderPromoAdmin() {
  const promo = (db && db.settings && db.settings.promoPopup) || {};
  const enabledEl = document.getElementById('promo-enabled');
  const badgeEl = document.getElementById('promo-badge');
  const serviceEl = document.getElementById('promo-service');
  const titleEl = document.getElementById('promo-title');
  const descEl = document.getElementById('promo-desc');
  const buttonTextEl = document.getElementById('promo-button-text');
  const noteEl = document.getElementById('promo-note');

  if (enabledEl) enabledEl.checked = promo.enabled !== false;
  if (badgeEl) badgeEl.value = promo.badge || 'СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ';
  if (serviceEl) serviceEl.value = promo.buttonService || 'Бесплатный первый визит';
  if (titleEl) titleEl.value = promo.title || 'Первая тренировка — бесплатно!';
  if (descEl) descEl.value = promo.desc || 'Запишитесь на ознакомительное занятие в фитнес-центр «Аура» или получите персональную консультацию тренера.';
  if (buttonTextEl) buttonTextEl.value = promo.buttonText || 'Записаться на бесплатный визит';
  if (noteEl) noteEl.value = promo.note || 'Акция действует для новых гостей клуба';
}

async function savePromoSettings() {
  const promo = {
    enabled: document.getElementById('promo-enabled').checked,
    badge: document.getElementById('promo-badge').value.trim(),
    buttonService: document.getElementById('promo-service').value.trim(),
    title: document.getElementById('promo-title').value.trim(),
    desc: document.getElementById('promo-desc').value.trim(),
    buttonText: document.getElementById('promo-button-text').value.trim(),
    note: document.getElementById('promo-note').value.trim()
  };

  const newSettings = {
    ...(db.settings || {}),
    promoPopup: promo
  };

  try {
    const res = await apiPut('/api/settings', newSettings);
    if (res) {
      db.settings = res;
      toast('Настройки акции успешно сохранены!', 'success');
    }
  } catch (err) {
    toast('Ошибка сохранения: ' + err.message, 'error');
  }
}

// ─── GitHub API DB Admin ────────────────────────────────────
function checkGitHubStatus() {
  const descEl = document.getElementById('gh-status-desc');
  if (!descEl) return;

  if (ghToken) {
    descEl.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e; margin-right:6px;"></span>
      <strong>GitHub API активен</strong>: Репозиторий <code>${ghRepo}</code>, ветка <code>${ghBranch}</code>.
      <br><span style="color:var(--gray); font-size:0.8rem;">Файл: <code>${GITHUB_PATH_DEFAULT}</code> | Последний SHA: <code>${lastSha ? lastSha.slice(0, 7) : 'нет'}</code></span>
    `;
  } else {
    descEl.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#eab308; margin-right:6px;"></span>
      <strong>Локальный режим (без авто-коммита)</strong>.
      <br><span style="color:var(--gray); font-size:0.8rem;">Для коммитов прямо в GitHub нажмите <strong>«Подключить GitHub»</strong> в верхнем меню и введите Personal Access Token.</span>
    `;
  }
  updateGitHubStatusBadge();
}

async function syncWithGitHub() {
  const btn = document.getElementById('gh-sync-btn');
  if (btn) btn.disabled = true;
  toast('Синхронизация с GitHub...', 'info');

  try {
    await loadDB();
    toast('Данные успешно загружены из GitHub!', 'success');
    checkGitHubStatus();
  } catch (err) {
    toast('Ошибка связи с GitHub: ' + err.message, 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ─── GitHub Token Modal Helpers ─────────────────────────────
function openGitHubModal() {
  const repoInput = document.getElementById('gh-modal-repo');
  const branchInput = document.getElementById('gh-modal-branch');
  const tokenInput = document.getElementById('gh-modal-token');

  if (repoInput) repoInput.value = ghRepo;
  if (branchInput) branchInput.value = ghBranch;
  if (tokenInput) tokenInput.value = ghToken;

  openModal('github-modal');
}

function saveGitHubModalSettings() {
  const repoInput = document.getElementById('gh-modal-repo');
  const branchInput = document.getElementById('gh-modal-branch');
  const tokenInput = document.getElementById('gh-modal-token');

  if (repoInput) {
    ghRepo = repoInput.value.trim() || GITHUB_REPO_DEFAULT;
    localStorage.setItem(GH_REPO_KEY, ghRepo);
  }
  if (branchInput) {
    ghBranch = branchInput.value.trim() || GITHUB_BRANCH_DEFAULT;
    localStorage.setItem(GH_BRANCH_KEY, ghBranch);
  }
  if (tokenInput) {
    ghToken = tokenInput.value.trim();
    localStorage.setItem(GH_TOKEN_KEY, ghToken);
  }

  updateGitHubStatusBadge();
  closeModal('github-modal');
  toast('Настройки GitHub сохранены!', 'success');
  checkGitHubStatus();
}

async function testGitHubConnection() {
  const tokenInput = document.getElementById('gh-modal-token');
  const tokenToTest = tokenInput ? tokenInput.value.trim() : ghToken;
  const repoToTest = (document.getElementById('gh-modal-repo')?.value.trim()) || ghRepo;

  if (!tokenToTest) {
    toast('Введите GitHub Token для проверки', 'error');
    return;
  }

  toast('Проверка связи с GitHub...', 'info');
  try {
    const res = await fetch(`https://api.github.com/repos/${repoToTest}`, {
      headers: {
        'Authorization': `Bearer ${tokenToTest}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (res.ok) {
      const data = await res.json();
      toast(`✅ Успешно! Подключено к репозиторию ${data.full_name}`, 'success');
    } else {
      const err = await res.json().catch(() => ({}));
      toast(`❌ Ошибка доступа (${res.status}): ${err.message || 'Неверный токен'}`, 'error');
    }
  } catch (e) {
    toast('Ошибка соединения: ' + e.message, 'error');
  }
}

function updateGitHubStatusBadge() {
  const dot = document.getElementById('gh-badge-dot');
  const text = document.getElementById('gh-badge-text');
  if (!dot || !text) return;

  if (ghToken) {
    dot.style.background = '#22c55e';
    text.textContent = `GitHub: ${ghRepo}`;
  } else {
    dot.style.background = '#eab308';
    text.textContent = 'GitHub: Подключить токен';
  }
}

// ─── Auto login check ────────────────────────────────────────
if (token) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';
  loadDB().catch(() => {});
}
