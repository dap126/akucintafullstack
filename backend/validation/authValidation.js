const { body } = require('express-validator');
const { validate } = require('./sanitizer');

// Login 
const loginRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username wajib diisi'),

  body('password')
    .notEmpty().withMessage('Password wajib diisi'),

  validate,
];

// Register 
const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3, max: 50 }).withMessage('Username harus 3-50 karakter')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username hanya boleh huruf, angka, dan underscore'),

  body('nama')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter'),

  body('password')
    .notEmpty().withMessage('Password wajib diisi'),

  body('role')
    .notEmpty().withMessage('Role wajib diisi')
    .isIn(['admin', 'staff', 'dokter']).withMessage('Role harus admin, staff, atau dokter'),

  validate,
];

// Edit User
const editUserRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username wajib diisi')
    .isLength({ min: 3, max: 50 }).withMessage('Username harus 3-50 karakter')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username hanya boleh huruf, angka, dan underscore'),

  body('nama')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 }).withMessage('Nama maksimal 255 karakter'),

  body('role')
    .notEmpty().withMessage('Role wajib diisi')
    .isIn(['admin', 'staff', 'dokter']).withMessage('Role harus admin, staff, atau dokter'),

  body('password')
    .optional({ nullable: true, checkFalsy: true }),

  validate,
];

module.exports = { loginRules, registerRules, editUserRules };
