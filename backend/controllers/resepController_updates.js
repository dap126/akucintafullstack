// GET /resep/by-rm/:id_rm
exports.getResepByRm = (req, res) => {
  const { id_rm } = req.params;
  const sql = `
    SELECT dr.id_detail, dr.no_resep, dr.jumlah_obat, dr.dosis,
           o.id_obat, o.nama_obat, o.satuan,
           ro.id_resep, ro.status_tebus
    FROM resep_obat ro
    LEFT JOIN detail_resep dr ON dr.resep_obat_id_resep = ro.id_resep
    LEFT JOIN obat o ON dr.obat_id_obat = o.id_obat
    WHERE ro.rekam_medis_id_rm = ? AND ro.status_tebus != 'batal'
  `;
  db.query(sql, [id_rm], (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil resep' });
    res.json(results);
  });
};

// PUT /resep/by-rm/:id_rm
exports.updateResepByRm = (req, res) => {
  const { id_rm } = req.params;
  const { daftar_obat } = req.body;

  if (!daftar_obat || !Array.isArray(daftar_obat)) {
    return res.status(400).json({ message: 'Daftar obat tidak valid' });
  }

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: 'Gagal memulai transaksi', detail: err.message });

    // 1. Cari resep_obat untuk id_rm ini
    db.query('SELECT id_resep, status_tebus FROM resep_obat WHERE rekam_medis_id_rm = ? AND status_tebus != "batal"', [id_rm], (err, results) => {
      if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal mencari resep', detail: err.message }));
      
      let id_resep = null;
      let status_tebus = 'belum';
      
      if (results.length > 0) {
        id_resep = results[0].id_resep;
        status_tebus = results[0].status_tebus;
      }

      if (status_tebus === 'sudah') {
         return db.rollback(() => res.status(403).json({ message: 'Resep sudah ditebus, tidak bisa diubah' }));
      }

      const processUpdate = (resepId, noResep) => {
        // 2. Jika ada id_resep lama, kembalikan stok obat lama
        db.query('SELECT obat_id_obat, jumlah_obat FROM detail_resep WHERE resep_obat_id_resep = ?', [resepId], (err, oldDetails) => {
          if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal mencari detail lama' }));

          let restorePromises = [];
          if (oldDetails && oldDetails.length > 0) {
             restorePromises = oldDetails.map(od => {
                return new Promise((resolve, reject) => {
                   db.query('UPDATE obat SET stok = stok + ? WHERE id_obat = ?', [od.jumlah_obat, od.obat_id_obat], (err) => {
                      if (err) reject(err);
                      else resolve();
                   });
                });
             });
          }

          Promise.all(restorePromises).then(() => {
             // 3. Hapus detail lama
             db.query('DELETE FROM detail_resep WHERE resep_obat_id_resep = ?', [resepId], (err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal menghapus detail lama' }));

                if (daftar_obat.length === 0) {
                   // Jika daftar_obat kosong, mungkin sekalian batalkan resepnya? Atau hapus resep_obatnya.
                   return db.commit((err) => {
                      if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal commit transaksi' }));
                      res.json({ message: 'Resep dikosongkan' });
                   });
                }

                // 4. Insert detail baru dan kurangi stok
                let completed = 0;
                let hasError = false;

                for (let i = 0; i < daftar_obat.length; i++) {
                   const obat = daftar_obat[i];
                   db.query(
                     'INSERT INTO detail_resep (no_resep, jumlah_obat, dosis, resep_obat_id_resep, obat_id_obat) VALUES (?, ?, ?, ?, ?)',
                     [noResep, obat.jumlah_obat, obat.dosis, resepId, obat.obat_id_obat],
                     (err) => {
                       if (hasError) return;
                       if (err) {
                         hasError = true;
                         return db.rollback(() => res.status(500).json({ error: 'Gagal menyimpan detail resep baru', detail: err.message }));
                       }

                       db.query('UPDATE obat SET stok = stok - ? WHERE id_obat = ?', [obat.jumlah_obat, obat.obat_id_obat], (err) => {
                          if (hasError) return;
                          if (err) {
                             hasError = true;
                             return db.rollback(() => res.status(500).json({ error: 'Gagal update stok baru' }));
                          }

                          completed++;
                          if (completed === daftar_obat.length) {
                             db.commit((err) => {
                               if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal commit transaksi' }));
                               res.json({ message: 'Resep berhasil diupdate' });
                             });
                          }
                       });
                     }
                   );
                }
             });
          }).catch(err => {
             db.rollback(() => res.status(500).json({ error: 'Gagal restore stok lama' }));
          });
        });
      };

      if (!id_resep) {
         // Buat resep_obat baru jika belum ada dan daftar_obat > 0
         if (daftar_obat.length === 0) {
            return db.commit((err) => res.json({ message: 'Tidak ada resep dibuat' }));
         }
         generateNoResep((err, no_resep) => {
            if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal generate no resep' }));
            db.query("INSERT INTO resep_obat (no_resep, tgl_resep, status_tebus, rekam_medis_id_rm) VALUES (?, NOW(), 'belum', ?)", [no_resep, id_rm], (err, resResult) => {
               if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal buat resep' }));
               processUpdate(resResult.insertId, no_resep);
            });
         });
      } else {
         // Dapatkan no_resep lama
         db.query('SELECT no_resep FROM detail_resep WHERE resep_obat_id_resep = ? LIMIT 1', [id_resep], (err, drRes) => {
            let noResep = '';
            if (!err && drRes.length > 0) {
               noResep = drRes[0].no_resep;
               processUpdate(id_resep, noResep);
            } else {
               // Fallback: generate new
               generateNoResep((err, no_resep) => {
                  if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal generate no resep fallback' }));
                  processUpdate(id_resep, no_resep);
               });
            }
         });
      }
    });
  });
};
