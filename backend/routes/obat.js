const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllObat, createObat, updateObat, deleteObat } = require('../controllers/obatController');

router.get('/obat',        verifyToken, authorizeRoles('admin', 'staff', 'dokter'), getAllObat);
router.post('/obat',       verifyToken, authorizeRoles('admin', 'staff'),           createObat);
router.put('/obat/:id',    verifyToken, authorizeRoles('admin', 'staff'),           updateObat);
router.delete('/obat/:id', verifyToken, authorizeRoles('admin', 'staff'),           deleteObat);

module.exports = router;