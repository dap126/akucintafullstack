const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            return res.status(401).json({ message: 'Username not found' });
        }
        const user = result[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid password' });
            }
            const token = jwt.sign({ id: user.idusers }, 'secretkey', { expiresIn: '1h' });
            res.json({
                message: "Login berhasil!",
                token: token,
                user: {
                    id: user.idusers,
                    username: user.username,
                    role: user.role
                }
            });
        });
    });
});

module.exports = router;