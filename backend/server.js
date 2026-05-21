const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const antreanRoutes = require('./routes/antrean');
const dokterRoutes = require('./routes/dokter');
const medisRoutes = require('./routes/medis');
const pasienRoutes = require('./routes/pasien');
const obatRoutes = require('./routes/obat');
const resepRoutes = require('./routes/resep');

dotenv.config();

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────
// Helmet: Set berbagai HTTP security headers (XSS protection, HSTS, dll)
app.use(helmet());

// CORS
app.use(cors());

// Rate Limiter: Batasi request per IP untuk mencegah brute force / DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200,                 // maksimal 200 request per 15 menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak permintaan, silakan coba lagi nanti.' },
});
app.use(globalLimiter);

// Rate limiter khusus untuk login (lebih ketat: anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 menit
  max: 10,                   // maksimal 10 percobaan login per 15 menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Terlalu banyak percobaan login, silakan coba lagi dalam 15 menit.' },
});
app.use('/api/auth/login', loginLimiter);

// Body parsers
app.use(express.json({ limit: '1mb' }));           // batasi ukuran body
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

app.get('/', (req, res) => {
  res.send('Puskesmas API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/antrean', antreanRoutes);
app.use('/api/dokter', dokterRoutes);
app.use('/api/medis', medisRoutes);
app.use('/api', pasienRoutes);
app.use('/api', obatRoutes);
app.use('/api', resepRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
