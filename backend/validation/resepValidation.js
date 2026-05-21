const { body } = require('express-validator');
const { validate } = require('./sanitizer');

// Create Detail Resep
const createDetailResepRules = [
  body('jumlah_obat')
    .notEmpty().withMessage('Jumlah obat wajib diisi')
    .isInt({ min: 1, max: 9999 }).withMessage('Jumlah obat harus antara 1-9999')
    .toInt(),

  body('dosis')
    .trim()
    .notEmpty().withMessage('Dosis wajib diisi')
    .isLength({ min: 1, max: 255 }).withMessage('Dosis maksimal 255 karakter'),

  body('obat_id')
    .notEmpty().withMessage('ID obat wajib diisi')
    .isInt({ min: 1 }).withMessage('ID obat harus berupa angka positif')
    .toInt(),

  validate,
];

// Save Resep (transaksional) 
const saveResepRules = [
  body('rekam_medis_id_rm')
    .notEmpty().withMessage('ID rekam medis wajib diisi')
    .isInt({ min: 1 }).withMessage('ID rekam medis harus berupa angka positif')
    .toInt(),

  body('daftar_obat')
    .isArray({ min: 1 }).withMessage('Daftar obat harus berupa array dan tidak boleh kosong'),

  body('daftar_obat.*.jumlah_obat')
    .notEmpty().withMessage('Jumlah obat wajib diisi')
    .isInt({ min: 1, max: 9999 }).withMessage('Jumlah obat harus antara 1-9999')
    .toInt(),

  body('daftar_obat.*.dosis')
    .trim()
    .notEmpty().withMessage('Dosis wajib diisi')
    .isLength({ min: 1, max: 255 }).withMessage('Dosis maksimal 255 karakter'),

  body('daftar_obat.*.obat_id_obat')
    .notEmpty().withMessage('ID obat wajib diisi')
    .isInt({ min: 1 }).withMessage('ID obat harus berupa angka positif')
    .toInt(),

  validate,
];

// ─── Update Status Tebus ────────────────────────────────────────────────────────
const updateStatusTebusRules = [
  body('status_tebus')
    .trim()
    .notEmpty().withMessage('Status tebus wajib diisi')
    .isIn(['belum', 'sudah']).withMessage('Status tebus harus: belum atau sudah'),

  validate,
];

// ─── Update Resep By RM ─────────────────────────────────────────────────────────
const updateResepByRmRules = [
  body('daftar_obat')
    .isArray().withMessage('Daftar obat harus berupa array'),

  body('daftar_obat.*.jumlah_obat')
    .optional()
    .isInt({ min: 1, max: 9999 }).withMessage('Jumlah obat harus antara 1-9999')
    .toInt(),

  body('daftar_obat.*.dosis')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 }).withMessage('Dosis maksimal 255 karakter'),

  body('daftar_obat.*.obat_id_obat')
    .optional()
    .isInt({ min: 1 }).withMessage('ID obat harus berupa angka positif')
    .toInt(),

  validate,
];

module.exports = {
  createDetailResepRules,
  saveResepRules,
  updateStatusTebusRules,
  updateResepByRmRules,
};
