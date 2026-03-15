const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Import Middleware Satpam yang sudah kita buat sebelumnya
const { verifyToken } = require('../middleware/authMiddleware');

// API Dashboard yang sudah digembok (hanya yang bawa Token valid yang bisa akses)
router.get('/statistik', verifyToken, (req, res) => {
  // Nanti query SQL untuk menghitung jumlah pasien dan antrean dimasukkan ke sini
  
    res.json({ 
        message: "Berhasil mengambil data rahasia Dashboard",
        // Data dummy sementara
        total_pasien: 8282,
        total_antrean: 215542
    });
});

module.exports = router;