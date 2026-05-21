const { body } = require('express-validator');
const { validate } = require('./sanitizer');

// Create Rekam Medis
const createMedisRules = [
  body('tgl_periksa')
    .notEmpty().withMessage('Tanggal periksa wajib diisi')
    .isISO8601().withMessage('Format tanggal periksa tidak valid (gunakan YYYY-MM-DD)')
    .toDate(),

  body('keluhan')
    .trim()
    .notEmpty().withMessage('Keluhan wajib diisi')
    .isLength({ min: 3, max: 1000 }).withMessage('Keluhan harus 3-1000 karakter'),

  body('tinggi_badan')
    .notEmpty().withMessage('Tinggi badan wajib diisi')
    .isFloat({ min: 1, max: 300 }).withMessage('Tinggi badan harus antara 1-300 cm')
    .toFloat(),

  body('berat_badan')
    .notEmpty().withMessage('Berat badan wajib diisi')
    .isFloat({ min: 0.5, max: 500 }).withMessage('Berat badan harus antara 0.5-500 kg')
    .toFloat(),

  body('tekanan_darah')
    .trim()
    .notEmpty().withMessage('Tekanan darah wajib diisi')
    .matches(/^\d{2,3}\/\d{2,3}$/).withMessage('Format tekanan darah tidak valid (contoh: 120/80)'),

  body('diagnosa')
    .trim()
    .notEmpty().withMessage('Diagnosa wajib diisi')
    .isLength({ min: 3, max: 1000 }).withMessage('Diagnosa harus 3-1000 karakter'),

  body('pasien_idpasien')
    .notEmpty().withMessage('ID pasien wajib diisi')
    .isInt({ min: 1 }).withMessage('ID pasien harus berupa angka positif')
    .toInt(),

  body('dokter_id_dokter')
    .notEmpty().withMessage('ID dokter wajib diisi')
    .isInt({ min: 1 }).withMessage('ID dokter harus berupa angka positif')
    .toInt(),

  validate,
];

// Update Rekam Medis
const updateMedisRules = [
  body('keluhan')
    .trim()
    .notEmpty().withMessage('Keluhan wajib diisi')
    .isLength({ min: 3, max: 1000 }).withMessage('Keluhan harus 3-1000 karakter'),

  body('tinggi_badan')
    .notEmpty().withMessage('Tinggi badan wajib diisi')
    .isFloat({ min: 1, max: 300 }).withMessage('Tinggi badan harus antara 1-300 cm')
    .toFloat(),

  body('berat_badan')
    .notEmpty().withMessage('Berat badan wajib diisi')
    .isFloat({ min: 0.5, max: 500 }).withMessage('Berat badan harus antara 0.5-500 kg')
    .toFloat(),

  body('tekanan_darah')
    .trim()
    .notEmpty().withMessage('Tekanan darah wajib diisi')
    .matches(/^\d{2,3}\/\d{2,3}$/).withMessage('Format tekanan darah tidak valid (contoh: 120/80)'),

  body('diagnosa')
    .trim()
    .notEmpty().withMessage('Diagnosa wajib diisi')
    .isLength({ min: 3, max: 1000 }).withMessage('Diagnosa harus 3-1000 karakter'),

  validate,
];

module.exports = { createMedisRules, updateMedisRules };
