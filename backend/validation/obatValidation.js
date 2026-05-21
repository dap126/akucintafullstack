const { body } = require('express-validator');
const { validate } = require('./sanitizer');

const obatRules = [
  body('nama_obat')
    .trim()
    .notEmpty().withMessage('Nama obat wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama obat harus 2-100 karakter'),

  body('kategori')
    .trim()
    .notEmpty().withMessage('Kategori wajib diisi')
    .isLength({ max: 100 }).withMessage('Kategori maksimal 100 karakter'),

  body('stok')
    .notEmpty().withMessage('Stok wajib diisi')
    .isInt({ min: 0 }).withMessage('Stok harus berupa angka positif atau nol')
    .toInt(),

  body('satuan')
    .trim()
    .notEmpty().withMessage('Satuan wajib diisi')
    .isLength({ max: 50 }).withMessage('Satuan maksimal 50 karakter'),

  validate,
];

module.exports = { obatRules };
