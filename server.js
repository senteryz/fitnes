const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

// Multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
    const dir = isVercel ? '/tmp' : path.join(__dirname, 'public', 'uploads');
    try {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    } catch (e) {}
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── Вспомогательные функции БД ──────────────────────────────────────────────
let inMemoryDB = null;

function readDB() {
  if (inMemoryDB) return inMemoryDB;
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    inMemoryDB = JSON.parse(raw);
    return inMemoryDB;
  } catch (e) {
    if (inMemoryDB) return inMemoryDB;
    throw e;
  }
}

function writeDB(data) {
  inMemoryDB = data;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('⚠️ Ошибка записи в файл DB (Vercel Serverless):', err.message);
  }
}

function nextId(arr) {
  if (!arr || !arr.length) return 1;
  return Math.max(...arr.map(i => i.id)) + 1;
}

// ─── Проверка прав админа ────────────────────────────────────────────────────
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  const db = readDB();
  if (token === db.settings.adminPassword) {
    next();
  } else {
    res.status(401).json({ error: 'Необходима авторизация' });
  }
}

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
  res.json({ url: '/uploads/' + req.file.filename });
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
app.get('/contacts', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contacts.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ─── Запуск сервера ─────────────────────────────────────────────────────────
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n🌿 Аура Фитнес сервер успешно запущен: http://localhost:${port}`);
    console.log(`🔐 Панель администратора: http://localhost:${port}/admin\n`);
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
