const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllDokter, createDokter, updateDokter, deleteDokter, linkDokterToUser,
  getAllPoli, createPoli, deletePoli,
} = require('../controllers/dokterController');
const { dokterRules, linkDokterRules, poliRules } = require('../validation/dokterValidation');
const { validateIdParam } = require('../validation/sanitizer');

const roles = ['admin', 'staff', 'dokter'];

// Poli routes — harus SEBELUM /:id agar tidak tertangkap sebagai parameter dinamis
router.get('/poli', verifyToken, authorizeRoles(...roles), getAllPoli);
router.post('/poli', verifyToken, authorizeRoles('admin'), poliRules, createPoli);
router.delete('/poli/:id', verifyToken, authorizeRoles('admin'), ...validateIdParam(), deletePoli);

// Dokter routes
router.get('/', verifyToken, authorizeRoles(...roles), getAllDokter);
router.post('/', verifyToken, authorizeRoles(...roles), dokterRules, createDokter);
router.put('/:id', verifyToken, authorizeRoles(...roles), ...validateIdParam(), dokterRules, updateDokter);
router.delete('/:id', verifyToken, authorizeRoles(...roles), ...validateIdParam(), deleteDokter);
router.patch('/:id/link-user', verifyToken, authorizeRoles('admin'), ...validateIdParam(), linkDokterRules, linkDokterToUser);

module.exports = router;