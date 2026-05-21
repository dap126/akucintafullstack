const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getDetailResep,
  createDetailResep,
  batalResep,
  updateStatusTebus,
  saveResep,
  getResepByRm,
  updateResepByRm,
} = require('../controllers/resepController');
const {
  createDetailResepRules,
  saveResepRules,
  updateStatusTebusRules,
  updateResepByRmRules,
} = require('../validation/resepValidation');
const { validateIdParam } = require('../validation/sanitizer');

const roles = ['admin', 'dokter', 'staff'];

router.get('/detail-resep', verifyToken, authorizeRoles(...roles), getDetailResep);
router.post('/detail-resep', verifyToken, authorizeRoles(...roles), createDetailResepRules, createDetailResep);
router.post('/resep', verifyToken, authorizeRoles(...roles), saveResepRules, saveResep);

// Soft delete: set status_tebus = 'batal' (data tetap ada di DB)
router.patch('/resep-obat/:id/batal', verifyToken, authorizeRoles('admin', 'staff'), ...validateIdParam(), batalResep);

// Toggle status tebus: 'belum' ↔ 'sudah'
router.patch('/resep-obat/:id/status', verifyToken, authorizeRoles(...roles), ...validateIdParam(), updateStatusTebusRules, updateStatusTebus);

// Ambil dan update resep berdasarkan id_rm
router.get('/resep/by-rm/:id_rm', verifyToken, authorizeRoles(...roles), ...validateIdParam('id_rm'), getResepByRm);
router.put('/resep/by-rm/:id_rm', verifyToken, authorizeRoles(...roles), ...validateIdParam('id_rm'), updateResepByRmRules, updateResepByRm);

module.exports = router;