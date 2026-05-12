const db = require('../config/db');

// GET /statistik
exports.getDashboardStats = async (req, res) => {
  try {
    const [genderStats] = await db.promise().query(`
      SELECT jenis_kelamin, COUNT(*) as count 
      FROM pasien 
      GROUP BY jenis_kelamin
    `);

    const [ageStats] = await db.promise().query(`
      SELECT 
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) <= 2 THEN 1 ELSE 0 END) AS bayi,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) > 2 AND TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) <= 5 THEN 1 ELSE 0 END) AS balita,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) > 5 AND TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) <= 12 THEN 1 ELSE 0 END) AS anak_anak,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) > 12 AND TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) <= 17 THEN 1 ELSE 0 END) AS remaja,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) > 17 AND TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) <= 59 THEN 1 ELSE 0 END) AS dewasa,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tgl_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS lansia
      FROM pasien
    `);

    const [totalPasienRes] = await db.promise().query(`SELECT COUNT(*) as count FROM pasien`);
    const total_pasien = totalPasienRes[0].count;

    const [totalAntreanRes] = await db.promise().query(
      `SELECT COUNT(*) as count FROM antrean WHERE DATE(tgl_antrean) = CURDATE()`
    );
    const total_antrean = totalAntreanRes[0].count;

    const [totalStaffRes] = await db.promise().query(
      `SELECT COUNT(*) as count FROM users WHERE role IN ('dokter', 'staff')`
    );
    const total_staff = totalStaffRes[0].count;

    res.json({
      message: 'Berhasil mengambil statistik Dashboard',
      total_pasien,
      total_antrean,
      total_staff,
      gender_stats: genderStats,
      age_stats: ageStats[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' });
  }
};
