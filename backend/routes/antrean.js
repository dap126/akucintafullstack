const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllAntrean, createAntrean, updateStatusAntrean, resetAntrean } = require('../controllers/antreanController');
const { antreanRules, updateStatusAntreanRules } = require('../validation/antreanValidation');
const { validateIdParam } = require('../validation/sanitizer');

const roles = ['admin', 'staff', 'dokter'];

// Antrean Routes
router.get('/', verifyToken, authorizeRoles(...roles), getAllAntrean);
router.post('/', verifyToken, authorizeRoles(...roles), antreanRules, createAntrean);
router.patch('/:id/status', verifyToken, authorizeRoles(...roles), ...validateIdParam(), updateStatusAntreanRules, updateStatusAntrean);
router.delete('/reset', verifyToken, authorizeRoles('admin', 'staff'), resetAntrean);

module.exports = router;