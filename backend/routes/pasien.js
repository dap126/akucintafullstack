const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllPasien, createPasien, updatePasien, deletePasien } = require('../controllers/pasienController');
const { pasienRules } = require('../validation/pasienValidation');
const { validateIdParam } = require('../validation/sanitizer');

router.get('/pasien', verifyToken, authorizeRoles('admin', 'staff', 'dokter'), getAllPasien);
router.post('/pasien', verifyToken, authorizeRoles('admin', 'staff'), pasienRules, createPasien);
router.put('/pasien/:id', verifyToken, authorizeRoles('admin', 'staff'), ...validateIdParam(), pasienRules, updatePasien);
router.delete('/pasien/:id', verifyToken, authorizeRoles('admin'), ...validateIdParam(), deletePasien);

module.exports = router;