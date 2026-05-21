const { body } = require('express-validator');
const { validate } = require('./sanitizer');

const pasienRules = [
  body('nama_pasien')
    .trim()
    .notEmpty().withMessage('Nama pasien wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama pasien harus 2-100 karakter'),

  body('nik')
    .trim()
    .notEmpty().withMessage('NIK wajib diisi')
    .isLength({ min: 16, max: 16 }).withMessage('NIK harus tepat 16 digit')
    .isNumeric().withMessage('NIK hanya boleh berisi angka'),

  body('tgl_lahir')
    .notEmpty().withMessage('Tanggal lahir wajib diisi')
    .isISO8601().withMessage('Format tanggal lahir tidak valid (gunakan YYYY-MM-DD)')
    .toDate(),

  body('jenis_kelamin')
    .trim()
    .notEmpty().withMessage('Jenis kelamin wajib diisi')
    .isIn(['L', 'P', 'Laki-laki', 'Perempuan']).withMessage('Jenis kelamin tidak valid'),

  body('alamat')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Alamat maksimal 500 karakter'),

  body('no_telpon')
    .trim()
    .notEmpty().withMessage('No telepon wajib diisi')
    .matches(/^[0-9+\-() ]{8,20}$/).withMessage('Format nomor telepon tidak valid'),

  validate,
];

module.exports = { pasienRules };
