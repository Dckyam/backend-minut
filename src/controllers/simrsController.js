const simrsService = require('../services/simrsService');

class SimrsController {
  /**
   * Get transaksi by no_registrasi
   * GET /api/simrs/transaksi/:noReg
   * atau
   * GET /api/simrs/transaksi?no_reg=xxx
   */
  async getTransaksi(req, res) {
    try {
      const noReg = req.params.noReg || req.query.no_reg;

      if (!noReg) {
        return res.status(400).json({
          success: false,
          message: 'No registrasi is required. Use /api/simrs/transaksi/:noReg or ?no_reg=xxx'
        });
      }

      const result = await simrsService.getTransaksiByNoReg(noReg);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getTransaksi:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting transaksi data',
        error: error.message
      });
    }
  }

  /**
   * Get summary only by no_registrasi
   * GET /api/simrs/summary/:noReg
   * atau
   * GET /api/simrs/summary?no_reg=xxx
   */
  async getSummary(req, res) {
    try {
      const noReg = req.params.noReg || req.query.no_reg;

      if (!noReg) {
        return res.status(400).json({
          success: false,
          message: 'No registrasi is required. Use /api/simrs/summary/:noReg or ?no_reg=xxx'
        });
      }

      const result = await simrsService.getSummaryByNoReg(noReg);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getSummary:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting summary data',
        error: error.message
      });
    }
  }

  /**
   * Get ICD10 data
   * GET /api/simrs/icd10
   */
  async getICD10(req, res) {
    try {
      const result = await simrsService.getICD10();

      const statusCode = result.success ? 200 : 500;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getICD10:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting ICD10 data',
        error: error.message
      });
    }
  }
}

module.exports = new SimrsController();
