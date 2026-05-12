const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getAllMedis, createMedis, updateMedis, deleteMedis } = require('../controllers/medisController');

const roles = ['admin', 'staff', 'dokter'];

router.get('/',      verifyToken, authorizeRoles(...roles), getAllMedis);
router.post('/',     verifyToken, authorizeRoles(...roles), createMedis);
router.put('/:id',   verifyToken, authorizeRoles(...roles), updateMedis);
router.delete('/:id', verifyToken, authorizeRoles(...roles), deleteMedis);

module.exports = router;