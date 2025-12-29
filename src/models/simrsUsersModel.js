const dbSimrs = require('../database/dbSimrs');

/**
 * Model untuk mengambil data users dari SIMRS database
 * Hanya untuk mendapatkan list users untuk menu access di extension
 */
class SimrsUsersModel {
  /**
   * Get users for menu access dropdown
   * Query EXACT dari user yang sudah tested dan berhasil dalam 2 detik
   * Hanya mengambil nama_asli saja
   */
  async getUsersForMenuAccess() {
    const query = `
      SELECT
        a.name_real AS nama_asli
      FROM vweb_users a
      LEFT JOIN emp e
        ON e.pid = a.pid
      WHERE
        COALESCE(a.webgroups, '') <> ''
        AND e.is_discharged = FALSE
        AND (
          (a.is_lock = FALSE AND a.is_del = FALSE)
          OR (a.is_lock IS NULL AND a.is_del IS NULL)
        )
    `;

    const result = await dbSimrs.query(query);
    return result.rows;
  }
}

module.exports = new SimrsUsersModel();
