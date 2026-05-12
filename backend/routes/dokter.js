const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllDokter, createDokter, updateDokter, deleteDokter, linkDokterToUser,
  getAllPoli, createPoli, deletePoli,
} = require('../controllers/dokterController');

const roles = ['admin', 'staff', 'dokter'];

// Poli routes — harus SEBELUM /:id agar tidak tertangkap sebagai parameter dinamis
router.get('/poli',       verifyToken, authorizeRoles(...roles),  getAllPoli);
router.post('/poli',      verifyToken, authorizeRoles('admin'),   createPoli);
router.delete('/poli/:id', verifyToken, authorizeRoles('admin'),  deletePoli);

// Dokter routes
router.get('/',           verifyToken, authorizeRoles(...roles),  getAllDokter);
router.post('/',          verifyToken, authorizeRoles(...roles),  createDokter);
router.put('/:id',        verifyToken, authorizeRoles(...roles),  updateDokter);
router.delete('/:id',     verifyToken, authorizeRoles(...roles),  deleteDokter);
router.patch('/:id/link-user', verifyToken, authorizeRoles('admin'), linkDokterToUser);

module.exports = router;