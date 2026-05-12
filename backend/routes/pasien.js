const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllPasien, createPasien, updatePasien, deletePasien } = require('../controllers/pasienController');

router.get('/pasien',        verifyToken, authorizeRoles('admin', 'staff', 'dokter'), getAllPasien);
router.post('/pasien',       verifyToken, authorizeRoles('admin', 'staff'),           createPasien);
router.put('/pasien/:id',    verifyToken, authorizeRoles('admin', 'staff'),           updatePasien);
router.delete('/pasien/:id', verifyToken, authorizeRoles('admin'),                    deletePasien);

module.exports = router;