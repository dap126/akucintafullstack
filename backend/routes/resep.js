const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getDetailResep,
  createDetailResep,
  batalResep,
  updateStatusTebus,
  saveResep,
} = require('../controllers/resepController');

const roles = ['admin', 'dokter', 'staff'];

router.get('/detail-resep',               verifyToken, authorizeRoles(...roles),          getDetailResep);
router.post('/detail-resep',              verifyToken, authorizeRoles(...roles),          createDetailResep);
router.post('/resep',                     verifyToken, authorizeRoles(...roles),          saveResep);

// Soft delete: set status_tebus = 'batal' (data tetap ada di DB)
router.patch('/resep-obat/:id/batal',     verifyToken, authorizeRoles('admin', 'staff'), batalResep);

// Toggle status tebus: 'belum' ↔ 'sudah'
router.patch('/resep-obat/:id/status',    verifyToken, authorizeRoles(...roles),          updateStatusTebus);

// Ambil dan update resep berdasarkan id_rm
const { getResepByRm, updateResepByRm } = require('../controllers/resepController');
router.get('/resep/by-rm/:id_rm',               verifyToken, authorizeRoles(...roles),          getResepByRm);
router.put('/resep/by-rm/:id_rm',               verifyToken, authorizeRoles(...roles),          updateResepByRm);

module.exports = router;