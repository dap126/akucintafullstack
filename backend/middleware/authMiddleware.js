const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token tidak ditemukan' });
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token tidak valid' });
        }
        req.user = decoded;
        next();
    });
}

module.exports = { verifyToken };