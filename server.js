const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(session({
  secret: 'teacher-portfolio-secret-2026',
  resave: false,
  saveUninitialized: false
}));

// Admin credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin';

// Helper: read/write content
function getContent() {
  const filePath = path.join(__dirname, 'data', 'content.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function saveContent(data) {
  const filePath = path.join(__dirname, 'data', 'content.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  res.redirect('/admin/login');
}

// ============ PUBLIC ROUTES ============
app.get('/', (req, res) => {
  const content = getContent();
  res.render('index', { content });
});

// ============ ADMIN ROUTES ============
app.get('/admin/login', (req, res) => {
  res.render('admin', { page: 'login', content: null, error: null });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('admin', { page: 'login', content: null, error: 'Неверный логин или пароль' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

app.get('/admin', requireAuth, (req, res) => {
  const content = getContent();
  res.render('admin', { page: 'dashboard', content, error: null });
});

// Upload photo
app.post('/admin/upload', requireAuth, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, error: 'Файл не загружен' });
  }
  res.json({ success: true, path: '/uploads/' + req.file.filename });
});

// Save all content
app.post('/admin/save', requireAuth, (req, res) => {
  try {
    const newContent = req.body;
    saveContent(newContent);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Delete uploaded file
app.post('/admin/delete-file', requireAuth, (req, res) => {
  const { filePath } = req.body;
  if (filePath && filePath.startsWith('/uploads/')) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🎓 Сайт-портфолио запущен: http://localhost:${PORT}`);
  console.log(`📋 Админ-панель: http://localhost:${PORT}/admin`);
  console.log(`   Логин: ${ADMIN_USER} / Пароль: ${ADMIN_PASS}`);
});
