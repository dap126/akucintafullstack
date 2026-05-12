const db = require('../config/db');

// GET /
exports.getAllMedis = (req, res) => {
  const sql = `
    SELECT rm.*, p.nama_pasien, d.nama_dokter, ro.status_tebus
    FROM rekam_medis rm
    JOIN pasien p ON rm.pasien_idpasien = p.idpasien
    JOIN dokter d ON rm.dokter_id_dokter = d.id_dokter
    LEFT JOIN resep_obat ro ON ro.rekam_medis_id_rm = rm.id_rm
    ORDER BY rm.tgl_periksa DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// POST /
exports.createMedis = (req, res) => {
  const {
    tgl_periksa, keluhan, tinggi_badan, berat_badan,
    tekanan_darah, diagnosa, pasien_idpasien, dokter_id_dokter,
  } = req.body;

  const sql = `
    INSERT INTO rekam_medis 
      (tgl_periksa, keluhan, tinggi_badan, berat_badan, tekanan_darah, diagnosa, pasien_idpasien, dokter_id_dokter) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [tgl_periksa, keluhan, tinggi_badan, berat_badan, tekanan_darah, diagnosa, pasien_idpasien, dokter_id_dokter];

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Rekam medis berhasil disimpan', id: result.insertId });
  });
};

// PUT /:id
exports.updateMedis = (req, res) => {
  const { id } = req.params;
  const { keluhan, tinggi_badan, berat_badan, tekanan_darah, diagnosa } = req.body;
  const sql = `
    UPDATE rekam_medis 
    SET keluhan=?, tinggi_badan=?, berat_badan=?, tekanan_darah=?, diagnosa=? 
    WHERE id_rm=?
  `;
  db.query(sql, [keluhan, tinggi_badan, berat_badan, tekanan_darah, diagnosa, id], (err) => {
    if (err) {
      console.error('Error in updateMedis:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Rekam medis berhasil diperbarui' });
  });
};

// DELETE /:id
exports.deleteMedis = (req, res) => {
  db.query('DELETE FROM rekam_medis WHERE id_rm = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Rekam medis berhasil dihapus' });
  });
};
