const db = require('../config/db');

// GET /
exports.getAllAntrean = (req, res) => {
  const sql = `
    SELECT a.*, p.nama_pasien, po.nama_poli 
    FROM antrean a
    JOIN pasien p ON a.pasien_idpasien = p.idpasien
    JOIN poli po ON a.poli_id_poli = po.id_poli
    ORDER BY a.tgl_antrean DESC, a.no_antrean ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// POST /
exports.createAntrean = (req, res) => {
  const { tgl_antrean, no_antrean, status, pasien_idpasien, poli_id_poli } = req.body;
  const sql = 'INSERT INTO antrean (tgl_antrean, no_antrean, status, pasien_idpasien, poli_id_poli) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [tgl_antrean, no_antrean, status, pasien_idpasien, poli_id_poli], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Berhasil mengambil antrean', id: result.insertId });
  });
};

// PATCH /:id/status
exports.updateStatusAntrean = (req, res) => {
  const { status } = req.body;
  db.query('UPDATE antrean SET status = ? WHERE idantrean = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status antrean diperbarui' });
  });
};

// DELETE /reset
exports.resetAntrean = (req, res) => {
  db.query('DELETE FROM antrean WHERE DATE(tgl_antrean) = CURDATE()', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Berhasil mereset ${result.affectedRows} antrean hari ini` });
  });
};
