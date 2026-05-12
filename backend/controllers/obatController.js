const db = require('../config/db');

// GET /obat
exports.getAllObat = (req, res) => {
  db.query('SELECT * FROM obat ORDER BY id_obat DESC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil data obat' });
    res.json(results);
  });
};

// POST /obat
exports.createObat = (req, res) => {
  const { nama_obat, kategori, stok, satuan } = req.body;
  db.query(
    'INSERT INTO obat (nama_obat, kategori, stok, satuan) VALUES (?, ?, ?, ?)',
    [nama_obat, kategori, stok, satuan],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Gagal tambah obat' });
      res.status(201).json({ message: 'Obat berhasil ditambahkan', id_obat: result.insertId });
    }
  );
};

// PUT /obat/:id
exports.updateObat = (req, res) => {
  const { id } = req.params;
  const { nama_obat, kategori, stok, satuan } = req.body;
  const sql = `UPDATE obat SET nama_obat=?, kategori=?, stok=?, satuan=? WHERE id_obat=?`;
  db.query(sql, [nama_obat, kategori, stok, satuan, id], (err) => {
    if (err) return res.status(500).json({ error: 'Gagal update obat' });
    res.json({ message: 'Obat berhasil diupdate' });
  });
};

// DELETE /obat/:id
exports.deleteObat = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM obat WHERE id_obat=?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Gagal hapus obat' });
    res.json({ message: 'Obat berhasil dihapus' });
  });
};
