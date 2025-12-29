const SimrsModel = require('../models/simrsModel');

class SimrsService {
  /**
   * Get transaksi SIMRS by no_registrasi
   */
  async getTransaksiByNoReg(noReg) {
    try {
      // Validasi input
      if (!noReg) {
        return {
          success: false,
          message: 'No registrasi is required'
        };
      }

      // Get data transaksi
      const transaksi = await SimrsModel.getTransaksiByNoReg(noReg);

      if (!transaksi || transaksi.length === 0) {
        return {
          success: false,
          message: 'Data transaksi tidak ditemukan untuk no registrasi: ' + noReg
        };
      }

      // Get summary
      const summary = await SimrsModel.getSummaryByNoReg(noReg);

      // Group data by jenis_layanan
      const groupedByJenisLayanan = transaksi.reduce((acc, item) => {
        const jenis = item.jenis_layanan || 'Lainnya';
        if (!acc[jenis]) {
          acc[jenis] = [];
        }
        acc[jenis].push(item);
        return acc;
      }, {});

      return {
        success: true,
        message: 'Data transaksi berhasil diambil',
        data: {
          summary: {
            regpid: summary.regpid,
            no_reg: summary.no_reg,
            mrn: summary.mrn,
            nama_pasien: summary.nama_pasien,
            total_items: parseInt(summary.total_items),
            total_biaya: parseFloat(summary.total_biaya),
            total_diskon: parseFloat(summary.total_diskon)
          },
          transaksi: transaksi,
          grouped_by_jenis_layanan: groupedByJenisLayanan
        }
      };
    } catch (error) {
      console.error('Service error - getTransaksiByNoReg:', error);
      return {
        success: false,
        message: 'Failed to get transaksi data',
        error: error.message
      };
    }
  }

  /**
   * Get summary only
   */
  async getSummaryByNoReg(noReg) {
    try {
      if (!noReg) {
        return {
          success: false,
          message: 'No registrasi is required'
        };
      }

      const summary = await SimrsModel.getSummaryByNoReg(noReg);

      if (!summary) {
        return {
          success: false,
          message: 'Data tidak ditemukan untuk no registrasi: ' + noReg
        };
      }

      return {
        success: true,
        message: 'Summary data berhasil diambil',
        data: {
          regpid: summary.regpid,
          no_reg: summary.no_reg,
          mrn: summary.mrn,
          nama_pasien: summary.nama_pasien,
          total_items: parseInt(summary.total_items),
          total_biaya: parseFloat(summary.total_biaya),
          total_diskon: parseFloat(summary.total_diskon)
        }
      };
    } catch (error) {
      console.error('Service error - getSummaryByNoReg:', error);
      return {
        success: false,
        message: 'Failed to get summary data',
        error: error.message
      };
    }
  }

  /**
   * Get ICD10 data
   */
  async getICD10() {
    try {
      const icd10Data = await SimrsModel.getICD10();

      if (!icd10Data || icd10Data.length === 0) {
        return {
          success: false,
          message: 'Data ICD10 tidak ditemukan'
        };
      }

      return {
        success: true,
        message: 'Data ICD10 berhasil diambil',
        data: icd10Data
      };
    } catch (error) {
      console.error('Service error - getICD10:', error);
      return {
        success: false,
        message: 'Failed to get ICD10 data',
        error: error.message
      };
    }
  }
}

module.exports = new SimrsService();
