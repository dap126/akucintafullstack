const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllObat, createObat, updateObat, deleteObat } = require('../controllers/obatController');
const { obatRules } = require('../validation/obatValidation');
const { validateIdParam } = require('../validation/sanitizer');

router.get('/obat', verifyToken, authorizeRoles('admin', 'staff', 'dokter'), getAllObat);
router.post('/obat', verifyToken, authorizeRoles('admin', 'staff'), obatRules, createObat);
router.put('/obat/:id', verifyToken, authorizeRoles('admin', 'staff'), ...validateIdParam(), obatRules, updateObat);
router.delete('/obat/:id', verifyToken, authorizeRoles('admin', 'staff'), ...validateIdParam(), deleteObat);

module.exports = router;