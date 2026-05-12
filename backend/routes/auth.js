const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { login, getUsers, register, editUser, deleteUser } = require('../controllers/authController');

router.post('/login',        login);
router.get('/users',         verifyToken, authorizeRoles('admin'), getUsers);
router.post('/register',     verifyToken, authorizeRoles('admin'), register);
router.put('/users/:id',     verifyToken, authorizeRoles('admin'), editUser);
router.delete('/users/:id',  verifyToken, authorizeRoles('admin'), deleteUser);

module.exports = router;