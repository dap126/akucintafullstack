const { validationResult } = require('express-validator');

// Middleware yang diletakkan SETELAH array rules express-validator.
// Jika ada error validasi, langsung respon 422 beserta daftar error.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validasi gagal',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// Strip karakter HTML/script berbahaya secara manual (fallback).
// Digunakan jika ingin sanitasi di luar express-validator chain.
const stripDangerousChars = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '')       
    .replace(/javascript:/gi, '') 
    .replace(/on\w+\s*=/gi, '')  
    .trim();
};

// Validasi bahwa parameter :id di URL adalah integer positif.
// Mencegah path traversal atau injection via URL param.
const { param } = require('express-validator');
const validateIdParam = (paramName = 'id') => [
  param(paramName)
    .isInt({ min: 1 })
    .withMessage(`Parameter ${paramName} harus berupa angka positif`)
    .toInt(),
  validate,
];

module.exports = { validate, stripDangerousChars, validateIdParam };
