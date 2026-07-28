const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Явное обслуживание статики
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для гибридной базы данных (Vercel KV / local file)
const isKVEnabled = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const KV_KEY = (process.env.KV_PREFIX || 'aura') + '_db';
let kvClient = null;

if (isKVEnabled) {
  try {
    const { kv } = require('@vercel/kv');
    kvClient = kv;
    console.log(`⚡ Vercel KV обнаружен и подключен. Ключ БД: ${KV_KEY}`);
  } catch (err) {
    console.error('⚠️ Ошибка инициализации Vercel KV:', err.message);
  }
}

function getFallbackDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { club: {}, prices: {}, reviews: [], gallery: [], settings: { adminPassword: "aura2026", rating: 4.9 } };
  }
}

async function initDBMiddleware(req, res, next) {
  try {
    if (isKVEnabled && kvClient) {
      const cached = await kvClient.get(KV_KEY);
      if (cached) {
        inMemoryDB = typeof cached === 'string' ? JSON.parse(cached) : cached;
      } else {
        console.log(`🌱 Инициализация Vercel KV начальными данными из db.json (ключ: ${KV_KEY})...`);
        const initial = getFallbackDB();
        await kvClient.set(KV_KEY, JSON.stringify(initial));
        inMemoryDB = initial;
      }
    } else {
      if (!inMemoryDB) {
        inMemoryDB = getFallbackDB();
      }
    }
    next();
  } catch (err) {
    console.error('⚠️ Ошибка инициализации базы данных:', err.message);
    if (!inMemoryDB) inMemoryDB = getFallbackDB();
    next();
  }
}

// Регистрируем middleware инициализации базы данных для API и динамических страниц
app.use(initDBMiddleware);

// Multer для загрузки файлов в оперативную память (для конвертации в Base64)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Вспомогательные функции БД ──────────────────────────────────────────────
let inMemoryDB = null;

function readDB() {
  if (inMemoryDB) return inMemoryDB;
  inMemoryDB = getFallbackDB();
  return inMemoryDB;
}

function writeDB(data) {
  inMemoryDB = data;
  if (isKVEnabled && kvClient) {
    kvClient.set(KV_KEY, JSON.stringify(data)).catch((err) => {
      console.error('⚠️ Ошибка асинхронной записи в Vercel KV:', err.message);
    });
  } else {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('⚠️ Ошибка записи в файл DB:', err.message);
    }
  }
}

function nextId(arr) {
  if (!arr || !arr.length) return 1;
  return Math.max(...arr.map(i => i.id)) + 1;
}

// ─── Проверка прав админа (SHA-256 / Stateless Token Security) ─────────────
function hashPassword(pass) {
  return crypto.createHash('sha256').update(String(pass || '')).digest('hex');
}

function adminAuth(req, res, next) {
  const token = String(req.headers['x-admin-token'] || '').trim();
  const db = readDB();
  const masterPass = String(db.settings.adminPassword || 'aura2026').trim();
  const masterHash = hashPassword(masterPass);

  if (token === masterPass || token === masterHash) {
    next();
  } else {
    res.status(401).json({ error: 'Необходима авторизация' });
  }
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  const db = readDB();
  const inputPass = String(password || '').trim();
  const masterPass = String(db.settings.adminPassword || 'aura2026').trim();

  if (inputPass === masterPass || hashPassword(inputPass) === hashPassword(masterPass)) {
    // Используем хэш пароля как stateless токен сессии
    const sessionToken = hashPassword(masterPass);
    res.json({ ok: true, token: sessionToken });
  } else {
    res.status(401).json({ error: 'Неверный пароль' });
  }
});

// ─── API ─────────────────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => {
  try {
    const db = readDB();
    res.json(db);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/club', (req, res) => res.json(readDB().club));
app.put('/api/club', adminAuth, (req, res) => {
  const db = readDB();
  db.club = { ...db.club, ...req.body };
  writeDB(db);
  res.json(db.club);
});

app.get('/api/prices', (req, res) => res.json(readDB().prices));
app.put('/api/prices', adminAuth, (req, res) => {
  const db = readDB();
  db.prices = { ...db.prices, ...req.body };
  writeDB(db);
  res.json(db.prices);
});

app.get('/api/trainers', (req, res) => res.json(readDB().trainers));
app.post('/api/trainers', adminAuth, (req, res) => {
  const db = readDB();
  const trainer = { id: nextId(db.trainers), ...req.body };
  db.trainers.push(trainer);
  writeDB(db);
  res.status(201).json(trainer);
});
app.put('/api/trainers/:id', adminAuth, (req, res) => {
  const db = readDB();
  const idx = db.trainers.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  db.trainers[idx] = { ...db.trainers[idx], ...req.body };
  writeDB(db);
  res.json(db.trainers[idx]);
});
app.delete('/api/trainers/:id', adminAuth, (req, res) => {
  const db = readDB();
  db.trainers = db.trainers.filter(t => t.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/news', (req, res) => res.json(readDB().news));
app.post('/api/news', adminAuth, (req, res) => {
  const db = readDB();
  const item = { id: nextId(db.news), date: new Date().toISOString().slice(0, 10), ...req.body };
  db.news.unshift(item);
  writeDB(db);
  res.status(201).json(item);
});
app.put('/api/news/:id', adminAuth, (req, res) => {
  const db = readDB();
  const idx = db.news.findIndex(n => n.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  db.news[idx] = { ...db.news[idx], ...req.body };
  writeDB(db);
  res.json(db.news[idx]);
});
app.delete('/api/news/:id', adminAuth, (req, res) => {
  const db = readDB();
  db.news = db.news.filter(n => n.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/reviews', (req, res) => res.json(readDB().reviews));
app.post('/api/reviews', adminAuth, (req, res) => {
  const db = readDB();
  const item = { id: nextId(db.reviews), date: new Date().toLocaleDateString('ru-RU'), ...req.body };
  db.reviews.unshift(item);
  writeDB(db);
  res.status(201).json(item);
});
app.put('/api/reviews/:id', adminAuth, (req, res) => {
  const db = readDB();
  const idx = db.reviews.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Не найдено' });
  db.reviews[idx] = { ...db.reviews[idx], ...req.body };
  writeDB(db);
  res.json(db.reviews[idx]);
});
app.delete('/api/reviews/:id', adminAuth, (req, res) => {
  const db = readDB();
  db.reviews = db.reviews.filter(r => r.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/gallery', (req, res) => res.json(readDB().gallery));
app.post('/api/gallery', adminAuth, (req, res) => {
  const db = readDB();
  const item = { id: nextId(db.gallery), ...req.body };
  db.gallery.push(item);
  writeDB(db);
  res.status(201).json(item);
});
app.delete('/api/gallery/:id', adminAuth, (req, res) => {
  const db = readDB();
  db.gallery = db.gallery.filter(g => g.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/schedule', (req, res) => res.json(readDB().schedule));
app.put('/api/schedule', adminAuth, (req, res) => {
  const db = readDB();
  db.schedule = req.body;
  writeDB(db);
  res.json(db.schedule);
});

app.post('/api/upload', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не выбран' });
  
  try {
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUrl = `data:${mimeType};base64,${base64Data}`;
    res.json({ url: dataUrl });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обработки файла' });
  }
});

app.get('/api/db/export', adminAuth, (req, res) => {
  const db = readDB();
  res.setHeader('Content-Disposition', 'attachment; filename="db.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

app.post('/api/db/import', adminAuth, (req, res) => {
  try {
    const data = req.body;
    if (!data.club || !data.prices || !data.reviews) {
      return res.status(400).json({ error: 'Неверная структура базы данных' });
    }
    writeDB(data);
    res.json({ ok: true, message: 'База данных успешно загружена' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ─── Страницы ───────────────────────────────────────────────────────────────
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/trainers', (req, res) => res.sendFile(path.join(__dirname, 'public', 'trainers.html')));
app.get('/prices', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'public', 'gallery.html')));
app.get('/reviews', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reviews.html')));
app.get('/news', (req, res) => res.sendFile(path.join(__dirname, 'public', 'news.html')));
app.get('/news-item', (req, res) => res.sendFile(path.join(__dirname, 'public', 'news-item.html')));
app.get('/news/:id', (req, res) => res.sendFile(path.join(__dirname, 'public', 'news-item.html')));
app.get('/contacts', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contacts.html')));
app.get('/aura-control-7739', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/admin', (req, res) => res.redirect('/'));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ─── Запуск сервера ─────────────────────────────────────────────────────────
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n🌿 Аура Фитнес сервер успешно запущен: http://localhost:${port}`);
    console.log(`🔐 Секретная панель управления: http://localhost:${port}/aura-control-7739\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Порт ${port} занят, пробуем ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Ошибка сервера:', err);
    }
  });
}

module.exports = app;

if (require.main === module) {
  startServer(DEFAULT_PORT);
}
