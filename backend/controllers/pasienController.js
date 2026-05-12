const db = require('../config/db');

// GET /pasien
exports.getAllPasien = (req, res) => {
  db.query('SELECT * FROM pasien', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// POST /pasien
exports.createPasien = (req, res) => {
  const { nama_pasien, nik, tgl_lahir, jenis_kelamin, alamat, no_telpon } = req.body;
  const sql = 'INSERT INTO pasien (nama_pasien, nik, tgl_lahir, jenis_kelamin, alamat, no_telpon) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nama_pasien, nik, tgl_lahir, jenis_kelamin, alamat || '-', no_telpon], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pasien berhasil ditambahkan', id_pasien: result.insertId });
  });
};

// PUT /pasien/:id
exports.updatePasien = (req, res) => {
  const { id } = req.params;
  const { nama_pasien, nik, tgl_lahir, jenis_kelamin, alamat, no_telpon } = req.body;
  const sql = 'UPDATE pasien SET nama_pasien=?, nik=?, tgl_lahir=?, jenis_kelamin=?, alamat=?, no_telpon=? WHERE idpasien=?';
  db.query(sql, [nama_pasien, nik, tgl_lahir, jenis_kelamin, alamat || '-', no_telpon, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pasien berhasil diupdate' });
  });
};

// DELETE /pasien/:id
exports.deletePasien = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM pasien WHERE idpasien=?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pasien berhasil dihapus' });
  });
};
