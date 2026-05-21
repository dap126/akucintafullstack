const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllMedis, createMedis, updateMedis, deleteMedis } = require('../controllers/medisController');
const { createMedisRules, updateMedisRules } = require('../validation/medisValidation');
const { validateIdParam } = require('../validation/sanitizer');

const roles = ['admin', 'staff', 'dokter'];

router.get('/', verifyToken, authorizeRoles(...roles), getAllMedis);
router.post('/', verifyToken, authorizeRoles(...roles), createMedisRules, createMedis);
router.put('/:id', verifyToken, authorizeRoles(...roles), ...validateIdParam(), updateMedisRules, updateMedis);
router.delete('/:id', verifyToken, authorizeRoles(...roles), ...validateIdParam(), deleteMedis);

module.exports = router;