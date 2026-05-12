const db = require('../config/db');

// GET /
exports.getAllDokter = (req, res) => {
  const sql = `
    SELECT dokter.*, poli.nama_poli 
    FROM dokter 
    LEFT JOIN poli ON dokter.poli_id_poli = poli.id_poli
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// POST /
exports.createDokter = (req, res) => {
  const { nama_dokter, nip, no_hp, jadwal_praktik, users_idusers, poli_id_poli } = req.body;
  const sql = 'INSERT INTO dokter (nama_dokter, nip, no_hp, jadwal_praktik, users_idusers, poli_id_poli) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [nama_dokter, nip, no_hp || null, jadwal_praktik, users_idusers || null, poli_id_poli], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Data dokter berhasil ditambahkan', id: result.insertId });
  });
};

// PUT /:id
exports.updateDokter = (req, res) => {
  const { id } = req.params;
  const { nama_dokter, nip, no_hp, jadwal_praktik, poli_id_poli } = req.body;
  const sql = 'UPDATE dokter SET nama_dokter = ?, nip = ?, no_hp = ?, jadwal_praktik = ?, poli_id_poli = ? WHERE id_dokter = ?';
  db.query(sql, [nama_dokter, nip, no_hp || null, jadwal_praktik, poli_id_poli, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Data dokter berhasil diperbarui' });
  });
};

// DELETE /:id
exports.deleteDokter = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM dokter WHERE id_dokter = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Data dokter berhasil dihapus' });
  });
};

// PATCH /:id/link-user
exports.linkDokterToUser = (req, res) => {
  const { id } = req.params;
  const { users_idusers } = req.body;
  db.query('UPDATE dokter SET users_idusers = ? WHERE id_dokter = ?', [users_idusers, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Dokter berhasil dihubungkan ke akun user' });
  });
};

// ─── Poli ────────────────────────────────────────────────────────────────────

// GET /poli
exports.getAllPoli = (req, res) => {
  db.query('SELECT * FROM poli', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

// POST /poli
exports.createPoli = (req, res) => {
  const { nama_poli } = req.body;
  db.query('INSERT INTO poli (nama_poli) VALUES (?)', [nama_poli], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Poli berhasil ditambahkan', id: result.insertId });
  });
};

// DELETE /poli/:id
exports.deletePoli = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM poli WHERE id_poli = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Poli berhasil dihapus' });
  });
};
