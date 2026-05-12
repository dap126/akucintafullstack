const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllAntrean, createAntrean, updateStatusAntrean, resetAntrean } = require('../controllers/antreanController');

const roles = ['admin', 'staff', 'dokter'];

router.get('/',              verifyToken, authorizeRoles(...roles),          getAllAntrean);
router.post('/',             verifyToken, authorizeRoles(...roles),          createAntrean);
router.patch('/:id/status',  verifyToken, authorizeRoles(...roles),          updateStatusAntrean);
router.delete('/reset',      verifyToken, authorizeRoles('admin', 'staff'),  resetAntrean);

module.exports = router;