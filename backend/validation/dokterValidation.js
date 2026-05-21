const { body } = require('express-validator');
const { validate } = require('./sanitizer');

// Create / Update Dokter
const dokterRules = [
  body('nama_dokter')
    .trim()
    .notEmpty().withMessage('Nama dokter wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama dokter harus 2-100 karakter'),

  body('nip')
    .trim()
    .notEmpty().withMessage('NIP wajib diisi')
    .isLength({ min: 5, max: 30 }).withMessage('NIP harus 5-30 karakter')
    .isAlphanumeric().withMessage('NIP hanya boleh huruf dan angka'),

  body('no_hp')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-() ]{8,20}$/).withMessage('Format nomor HP tidak valid'),

  body('jadwal_praktik')
    .trim()
    .notEmpty().withMessage('Jadwal praktik wajib diisi')
    .isLength({ max: 255 }).withMessage('Jadwal praktik maksimal 255 karakter'),

  body('users_idusers')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('ID user harus berupa angka positif')
    .toInt(),

  body('poli_id_poli')
    .notEmpty().withMessage('Poli wajib dipilih')
    .isInt({ min: 1 }).withMessage('ID poli harus berupa angka positif')
    .toInt(),

  validate,
];

// Link Dokter ke User
const linkDokterRules = [
  body('users_idusers')
    .notEmpty().withMessage('ID user wajib diisi')
    .isInt({ min: 1 }).withMessage('ID user harus berupa angka positif')
    .toInt(),

  validate,
];

// Create Poli
const poliRules = [
  body('nama_poli')
    .trim()
    .notEmpty().withMessage('Nama poli wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama poli harus 2-100 karakter'),

  validate,
];

module.exports = { dokterRules, linkDokterRules, poliRules };
