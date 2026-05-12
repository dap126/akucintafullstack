const db = require('../config/db');

// ─── Helper: generate no_resep dari tabel detail_resep ───────────────────────
function generateNoResep(callback) {
  const dateObj = new Date();
  const year  = dateObj.getFullYear().toString().slice(-2);
  const month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  const day   = ('0' + dateObj.getDate()).slice(-2);
  const prefix = `RSP-${year}${month}${day}-`;

  db.query(
    'SELECT no_resep FROM detail_resep WHERE no_resep LIKE ? ORDER BY id_detail DESC LIMIT 1',
    [`${prefix}%`],
    (err, results) => {
      if (err) return callback(err);
      let urutanBaru = 1;
      if (results.length > 0) {
        const nomorTerakhir = parseInt(results[0].no_resep.split('-')[2], 10);
        urutanBaru = nomorTerakhir + 1;
      }
      const urutanFormatted = ('000' + urutanBaru).slice(-3);
      callback(null, `${prefix}${urutanFormatted}`);
    }
  );
}

// GET /detail-resep  — hanya tampilkan yang status_tebus != 'batal'
exports.getDetailResep = (req, res) => {
  const sql = `
    SELECT dr.id_detail, dr.no_resep, dr.jumlah_obat, dr.dosis,
           o.nama_obat, o.satuan,
           dr.resep_obat_id_resep,
           ro.status_tebus,
           p.nama_pasien
    FROM detail_resep dr
    JOIN obat o        ON dr.obat_id_obat         = o.id_obat
    JOIN resep_obat ro ON dr.resep_obat_id_resep   = ro.id_resep
    JOIN rekam_medis rm ON ro.rekam_medis_id_rm    = rm.id_rm
    JOIN pasien p       ON rm.pasien_idpasien      = p.idpasien
    WHERE ro.status_tebus != 'batal'
    ORDER BY dr.id_detail DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil detail resep' });
    res.json(results);
  });
};

// POST /detail-resep  (auto buat resep + no_resep + kurangi stok)
exports.createDetailResep = (req, res) => {
  const { jumlah_obat, dosis, obat_id } = req.body;

  db.query('SELECT stok FROM obat WHERE id_obat = ?', [obat_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error cek stok' });
    if (result.length === 0) return res.status(404).json({ message: 'Obat tidak ditemukan' });

    const stok = result[0].stok;
    if (stok < jumlah_obat) return res.status(400).json({ message: 'Stok tidak mencukupi!' });

    db.query('SELECT id_rm FROM rekam_medis ORDER BY id_rm DESC LIMIT 1', (err, rmResult) => {
      if (err || rmResult.length === 0) {
        return res.status(400).json({ message: 'Belum ada data rekam medis. Tambahkan rekam medis terlebih dahulu.' });
      }

      const rmId = rmResult[0].id_rm;

      db.query(
        "INSERT INTO resep_obat (tgl_resep, status_tebus, rekam_medis_id_rm) VALUES (NOW(), 'belum', ?)",
        [rmId],
        (err, resepResult) => {
          if (err) return res.status(500).json({ error: 'Gagal membuat resep otomatis', detail: err.message });

          const resepId = resepResult.insertId;

          generateNoResep((err, no_resep) => {
            if (err) return res.status(500).json({ error: 'Gagal generate no_resep' });

            db.query(
              'INSERT INTO detail_resep (no_resep, jumlah_obat, dosis, resep_obat_id_resep, obat_id_obat) VALUES (?, ?, ?, ?, ?)',
              [no_resep, jumlah_obat, dosis, resepId, obat_id],
              (err) => {
                if (err) return res.status(500).json({ error: 'Gagal tambah detail resep', detail: err.message });

                db.query('UPDATE obat SET stok = stok - ? WHERE id_obat = ?', [jumlah_obat, obat_id]);

                res.status(201).json({
                  message: 'Detail resep berhasil ditambahkan & stok dikurangi',
                  resep_id: resepId,
                  no_resep,
                });
              }
            );
          });
        }
      );
    });
  });
};

// PATCH /resep-obat/:id/batal  — soft delete: set status_tebus = 'batal'
exports.batalResep = (req, res) => {
  const { id } = req.params; // id_resep dari resep_obat
  db.query(
    "UPDATE resep_obat SET status_tebus = 'batal' WHERE id_resep = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Gagal membatalkan resep' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Resep tidak ditemukan' });
      res.json({ message: 'Resep berhasil dibatalkan' });
    }
  );
};

// PATCH /resep-obat/:id/status  — toggle antara 'belum' dan 'sudah'
exports.updateStatusTebus = (req, res) => {
  const { id } = req.params; // id_resep dari resep_obat
  const { status_tebus } = req.body;

  if (!['belum', 'sudah'].includes(status_tebus)) {
    return res.status(400).json({ message: 'Status tidak valid. Gunakan: belum atau sudah' });
  }

  db.query(
    'UPDATE resep_obat SET status_tebus = ? WHERE id_resep = ?',
    [status_tebus, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Gagal update status tebus' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Resep tidak ditemukan' });
      res.json({ message: `Status tebus berhasil diubah menjadi: ${status_tebus}` });
    }
  );
};

// POST /resep  (simpan pemeriksaan + resep secara transaksional)
exports.saveResep = (req, res) => {
  const { rekam_medis_id_rm, daftar_obat } = req.body;

  if (!rekam_medis_id_rm || !daftar_obat || !Array.isArray(daftar_obat) || daftar_obat.length === 0) {
    return res.status(400).json({ message: 'Data rekam medis atau daftar obat tidak lengkap' });
  }

  generateNoResep((err, no_resep) => {
    if (err) return res.status(500).json({ error: 'Gagal generate no_resep' });

    db.beginTransaction((err) => {
      if (err) return res.status(500).json({ error: 'Gagal memulai transaksi', detail: err.message });

      db.query(
        "INSERT INTO resep_obat (tgl_resep, status_tebus, rekam_medis_id_rm) VALUES (NOW(), 'belum', ?)",
        [rekam_medis_id_rm],
        (err, resepResult) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: 'Gagal membuat resep_obat', detail: err.message });
            });
          }

          const resepId = resepResult.insertId;
          let completed = 0;
          let hasError = false;

          for (let i = 0; i < daftar_obat.length; i++) {
            const obat = daftar_obat[i];
            db.query(
              'INSERT INTO detail_resep (no_resep, jumlah_obat, dosis, resep_obat_id_resep, obat_id_obat) VALUES (?, ?, ?, ?, ?)',
              [no_resep, obat.jumlah_obat, obat.dosis, resepId, obat.obat_id_obat],
              (err) => {
                if (hasError) return;

                if (err) {
                  hasError = true;
                  return db.rollback(() => {
                    res.status(500).json({ error: 'Gagal menyimpan detail_resep', detail: err.message });
                  });
                }

                completed++;

                if (completed === daftar_obat.length) {
                  db.commit((err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ error: 'Gagal commit transaksi', detail: err.message });
                      });
                    }
                    res.status(201).json({
                      message: 'Pemeriksaan dan Resep Obat berhasil disimpan secara transaksional',
                      resep_id: resepId,
                      no_resep,
                    });
                  });
                }
              }
            );
          }
        }
      );
    });
  });
};

// GET /resep/by-rm/:id_rm
// Sertakan juga resep yang berstatus 'batal' agar form edit tidak kosong
exports.getResepByRm = (req, res) => {
  const { id_rm } = req.params;
  const sql = `
    SELECT dr.id_detail, dr.no_resep, dr.jumlah_obat, dr.dosis,
           o.id_obat, o.nama_obat, o.satuan,
           ro.id_resep, ro.status_tebus
    FROM resep_obat ro
    LEFT JOIN detail_resep dr ON dr.resep_obat_id_resep = ro.id_resep
    LEFT JOIN obat o ON dr.obat_id_obat = o.id_obat
    WHERE ro.rekam_medis_id_rm = ?
    ORDER BY ro.id_resep DESC
    LIMIT 1
  `;
  db.query(sql, [id_rm], (err, results) => {
    if (err) return res.status(500).json({ error: 'Gagal ambil resep' });
    // Filter baris yang tidak punya obat (resep kosong tanpa detail)
    const filtered = results.filter(r => r.id_detail !== null);
    res.json(filtered);
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

    // 1. Cari resep_obat terbaru untuk id_rm ini (termasuk yang berstatus 'batal')
    db.query('SELECT id_resep, status_tebus FROM resep_obat WHERE rekam_medis_id_rm = ? ORDER BY id_resep DESC LIMIT 1', [id_rm], (err, results) => {
      if (err) {
        require('fs').appendFileSync('error.log', 'Gagal cari resep: ' + err.message + '\n');
        return db.rollback(() => res.status(500).json({ error: 'Gagal mencari resep', detail: err.message }));
      }
      
      let id_resep = null;
      let status_tebus = 'belum';
      
      if (results.length > 0) {
        id_resep = results[0].id_resep;
        status_tebus = results[0].status_tebus;
      }

      if (status_tebus === 'sudah') {
         return db.rollback(() => res.status(403).json({ message: 'Resep sudah ditebus, tidak bisa diubah' }));
      }

      // Jika resep ditemukan dengan status 'batal', aktifkan kembali ke 'belum'
      const reactivateIfCancelled = (callback) => {
        if (id_resep && status_tebus === 'batal') {
          db.query('UPDATE resep_obat SET status_tebus = ? WHERE id_resep = ?', ['belum', id_resep], (err) => {
            if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal reaktivasi resep' }));
            callback();
          });
        } else {
          callback();
        }
      };

      reactivateIfCancelled(() => {

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
              return db.commit((err) => {
                if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal commit transaksi' }));
                res.json({ message: 'Tidak ada resep dibuat' });
              });
           }
           generateNoResep((err, no_resep) => {
              if (err) return db.rollback(() => res.status(500).json({ error: 'Gagal generate no resep' }));
              db.query("INSERT INTO resep_obat (tgl_resep, status_tebus, rekam_medis_id_rm) VALUES (NOW(), 'belum', ?)", [id_rm], (err, resResult) => {
                 if (err) {
                   require('fs').appendFileSync('error.log', 'Gagal buat resep: ' + err.message + '\n');
                   return db.rollback(() => res.status(500).json({ error: 'Gagal buat resep', detail: err.message }));
                 }
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
      }); // end reactivateIfCancelled
    });
  });
};
