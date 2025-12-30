const admedikaService = require('../services/admedikaService');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
const db = require('../config/database');

class AdmedikaController {
  /**
   * Get all coverage types
   * GET /api/admedika/coverage-types
   */
  async getAllCoverageTypes(req, res) {
    try {
      const result = await admedikaService.getAllCoverageTypes();

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching coverage types:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching coverage types',
        error: error.message
      });
    }
  }

  /**
   * Get all document types
   * GET /api/admedika/document-types
   */
  async getAllDocumentTypes(req, res) {
    try {
      const result = await admedikaService.getAllDocumentTypes();

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching document types:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching document types',
        error: error.message
      });
    }
  }

  /**
   * Get document types by category
   * GET /api/admedika/document-types/:category
   */
  async getDocumentTypesByCategory(req, res) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category is required'
        });
      }

      const result = await admedikaService.getDocumentTypesByCategory(category);

      if (!result.success) {
        return res.status(500).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error fetching document types by category:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching document types by category',
        error: error.message
      });
    }
  }

  /**
   * Get registrasi by no_registrasi
   * GET /api/admedika/registrasi/:noRegistrasi
   */
  async getRegistrasiByNoReg(req, res) {
    try {
      const { noRegistrasi } = req.params;

      if (!noRegistrasi) {
        return res.status(400).json({
          success: false,
          message: 'No registrasi is required'
        });
      }

      const result = await admedikaService.getRegistrasiByNoReg(noRegistrasi);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getByNoRegistrasi:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting registrasi data',
        error: error.message
      });
    }
  }

  /**
   * Get registrasi by no_mr and tanggal_registrasi
   * GET /api/admedika/registrasi/by-mr-date/:noMr/:tanggalRegistrasi
   */
  async getRegistrasiByNoMrAndDate(req, res) {
    try {
      const { noMr, tanggalRegistrasi } = req.params;

      if (!noMr || !tanggalRegistrasi) {
        return res.status(400).json({
          success: false,
          message: 'No MR and tanggal registrasi are required'
        });
      }

      const result = await admedikaService.getRegistrasiByNoMrAndDate(noMr, tanggalRegistrasi);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getRegistrasiByNoMrAndDate:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting registrasi data',
        error: error.message
      });
    }
  }

  /**
   * Check eligibility
   * POST /api/admedika/eligibility
   * Body: { 
   *   cardNo, 
   *   covID,
   *   // Optional - untuk save ke database:
   *   no_registrasi,
   *   no_mr,
   *   coverage_id,
   *   coverage_code,
   *   coverage_desc,
   *   nama_pasien,
   *   nama_layanan,
   *   dokter,
   *   nik,
   *   icd10,
   *   amount,
   *   created_by
   * }
   */
  async checkEligibility(req, res) {
    try {
      const {
        cardNo,
        covID,
        // Data untuk registrasi (optional)
        no_registrasi,
        no_mr,
        coverage_id,
        coverage_code,
        coverage_desc,
        nama_pasien,
        nik,
        nama_layanan,
        dokter,
        penjamin, // DARI FORM (bukan dari response API)
        icd10,
        amount,
        created_by
      } = req.body;

      // Validasi input wajib
      if (!cardNo || !covID) {
        return res.status(400).json({
          success: false,
          message: 'cardNo and covID are required'
        });
      }

      // Prepare registrasi data jika lengkap
      let registrasiData = null;
      if (no_registrasi && no_mr && created_by) {
        registrasiData = {
          no_registrasi,
          no_mr,
          coverage_id: coverage_id || parseInt(covID), // Use covID as coverage_id if not provided
          coverage_code,
          coverage_desc,
          nama_pasien,
          nik,
          nama_layanan,
          dokter,
          penjamin, // DARI FORM (bukan dari response API)
          icd10,
          amount,
          created_by
        };

        // DEBUG: Cek nilai penjamin yang diterima dari request
        console.log('🔍 DEBUG Backend Controller - Penjamin dari request:');
        console.log('  - req.body.penjamin:', req.body.penjamin);
        console.log('  - registrasiData.penjamin:', registrasiData.penjamin);
      }

      // Call service
      const result = await admedikaService.checkEligibility(cardNo, covID, registrasiData);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - checkEligibility:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking eligibility',
        error: error.message
      });
    }
  }

  /**
   * Cancel open claims transaction
   * POST /api/admedika/cancel-open-claims
   * Body: { 
   *   cardNo, 
   *   remarks,
   *   void_by (optional - untuk update database is_void = 1)
   * }
   */
  async cancelOpenClaimsTxn(req, res) {
    try {
      const { cardNo, remarks, void_by } = req.body;

      // Validasi input
      if (!cardNo || !remarks) {
        return res.status(400).json({
          success: false,
          message: 'cardNo and remarks are required'
        });
      }

      // Call service dengan void_by (optional)
      const result = await admedikaService.cancelOpenClaimsTxn(cardNo, remarks, void_by);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - cancelOpenClaimsTxn:', error);
      res.status(500).json({
        success: false,
        message: 'Error canceling open claims transaction',
        error: error.message
      });
    }
  }

  /**
   * Get entitlement
   * POST /api/admedika/get-entitlement
   * Body: { cardNo }
   */
  async getEntitlement(req, res) {
    try {
      const { cardNo } = req.body;

      // Validasi input
      if (!cardNo) {
        return res.status(400).json({
          success: false,
          message: 'cardNo is required'
        });
      }

      // Call service
      const result = await admedikaService.getEntitlement(cardNo);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getEntitlement:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting entitlement',
        error: error.message
      });
    }
  }

  /**
   * Save transaksi mapping
   * POST /api/admedika/transaksi-mapping
   * Body: { 
   *   no_registrasi, 
   *   no_claim,
   *   items: [
   *     {
   *       benefit_id,
   *       benefit_name,
   *       kode_item (atau item_code),
   *       nama_item (atau item),
   *       amount (atau harga_awal),
   *       qty (atau jml),
   *       total_amount (atau tot_harga)
   *     }
   *   ]
   * }
   */
  async saveTransaksiMapping(req, res) {
    try {
      const { no_registrasi, no_claim, items } = req.body;

      // Validasi input
      if (!no_registrasi || !no_claim || !items) {
        return res.status(400).json({
          success: false,
          message: 'no_registrasi, no_claim, and items are required'
        });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'items must be a non-empty array'
        });
      }

      // Call service
      const result = await admedikaService.saveTransaksiMapping(req.body);

      // Set status code based on result
      const statusCode = result.success ? 201 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - saveTransaksiMapping:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving transaksi mapping',
        error: error.message
      });
    }
  }

  /**
   * Get transaksi mapping
   * GET /api/admedika/transaksi-mapping/:noRegistrasi
   */
  async getTransaksiMapping(req, res) {
    try {
      const { noRegistrasi } = req.params;

      // Validasi input
      if (!noRegistrasi) {
        return res.status(400).json({
          success: false,
          message: 'noRegistrasi is required'
        });
      }

      // Call service
      const result = await admedikaService.getTransaksiMapping(noRegistrasi);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getTransaksiMapping:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting transaksi mapping',
        error: error.message
      });
    }
  }

  /**
   * Get transaksi mapping by no_claim
   * GET /api/admedika/transaksi-mapping/claim/:noClaim
   */
  async getTransaksiByNoClaim(req, res) {
    try {
      const { noClaim } = req.params;

      // Validasi input
      if (!noClaim) {
        return res.status(400).json({
          success: false,
          message: 'noClaim is required'
        });
      }

      // Call service
      const result = await admedikaService.getTransaksiByNoClaim(noClaim);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getTransaksiByNoClaim:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting transaksi mapping by no_claim',
        error: error.message
      });
    }
  }

  /**
   * Hello World - Test koneksi ke Admedika
   * POST /api/admedika/hello-world
   * Body: tidak ada
   */
  async helloWorld(req, res) {
    try {
      // Call service
      const result = await admedikaService.helloWorld();

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - helloWorld:', error);
      res.status(500).json({
        success: false,
        message: 'Error testing connection to Admedika',
        error: error.message
      });
    }
  }

  /**
   * Discharge OP
   * POST /api/admedika/discharge-op
   * Body: { 
   *   cardNo,
   *   no_claim,
   *   dischargeData: {
   *     diagnosisCodeList,
   *     mcDays,
   *     physicianName,
   *     accidentFlag,
   *     surgicalFlag,
   *     remarks
   *   }
   * }
   */
  async dischargeOP(req, res) {
    try {
      const { cardNo, diagnosisCodeList, mcDays, physicianName, accidentFlag, surgicalFlag, remarks, entitlement } = req.body;

      // Validasi input
      if (!cardNo) {
        return res.status(400).json({
          success: false,
          message: 'cardNo is required'
        });
      }

      if (!entitlement || !Array.isArray(entitlement) || entitlement.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'entitlement data is required'
        });
      }

      // Call service
      const result = await admedikaService.dischargeOP(req.body);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - dischargeOP:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing discharge OP',
        error: error.message
      });
    }
  }

  /**
   * Generate PDF for eligibility response
   * POST /api/admedika/generate-pdf
   */
  async generateEligibilityPDF(req, res) {
    try {
      const { eligibilityData, patientInfo, isPrint, signatureDataUrl } = req.body;

      if (!eligibilityData || !eligibilityData.eligibility) {
        return res.status(400).json({
          success: false,
          message: 'Eligibility data is required'
        });
      }

      const eligibility = eligibilityData.eligibility;
      const isReprint = isPrint === false; // isPrint=false means it's a reprint

      // Query database untuk get created_date dari registrasi_pasien_admedika
      let registrationDate = null;
      try {
        const query = `
          SELECT created_date
          FROM registrasi_pasien_admedika
          WHERE no_registrasi = $1
          LIMIT 1
        `;
        const result = await db.query(query, [patientInfo.no_registrasi]);

        if (result.rows.length > 0) {
          registrationDate = result.rows[0].created_date;
        }
      } catch (dbError) {
        console.error('Error querying registration date:', dbError);
        // Continue dengan null date jika query gagal
      }

      // Format registration date (dari database)
      let formattedRegDate = '-';
      if (registrationDate) {
        const regDate = new Date(registrationDate);
        const day = String(regDate.getDate()).padStart(2, '0');
        const month = String(regDate.getMonth() + 1).padStart(2, '0');
        const year = regDate.getFullYear();
        const hours = String(regDate.getHours()).padStart(2, '0');
        const minutes = String(regDate.getMinutes()).padStart(2, '0');
        const seconds = String(regDate.getSeconds()).padStart(2, '0');
        const ampm = regDate.getHours() >= 12 ? 'pm' : 'am';

        formattedRegDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}${ampm}`;
      }

      // Format current date/time untuk "By: SENTRACI Re Print on..." (UTC+7)
      const now = new Date();
      // Convert to UTC+7 (Jakarta time)
      const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      const reprintHours = utc7Time.getUTCHours();
      const reprintMinutes = utc7Time.getUTCMinutes();
      const reprintAmPm = reprintHours >= 12 ? 'pm' : 'am';
      const reprintHours12 = reprintHours % 12 || 12;

      const reprintDate = `${monthNames[utc7Time.getUTCMonth()]} ${utc7Time.getUTCDate()}, ${utc7Time.getUTCFullYear()}, ${reprintHours12}:${String(reprintMinutes).padStart(2, '0')} ${reprintAmPm}`;

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Eligibility-${patientInfo.no_registrasi || 'document'}-${eligibility.clID}.pdf`);

      // Pipe PDF to response
      doc.pipe(res);

      const pageHeight = doc.page.height;

      // Header - Letter of Authorization (with or without "Re-Print")
      let y = 50;
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(isReprint ? 'Re-Print Letter of Authorization' : 'Letter of Authorization', 50, y);

      y += 30;

      // Provider info
      doc.fontSize(9)
         .font('Helvetica')
         .text('Provider : RS SENTRA MEDIKA CIBINONG', 50, y);

      y += 15;
      doc.text('Terminal ID : 12389773', 50, y);

      y += 15;
      // Date and Time dari registrasi (created_date)
      doc.text(`Date and Time : ${formattedRegDate}`, 50, y);

      y += 15;
      doc.text(`Patient Name : ${eligibility.patientName || '-'}`, 50, y);

      y += 15;
      doc.text(`Reference ID : ${eligibility.clID || '-'}`, 50, y);

      y += 30;

      // Print Out Content - This is the main content from Admedika API
      const printOutLines = (eligibility.printOut || 'No data available').split('\n');
      doc.fontSize(8)
         .font('Courier');

      printOutLines.forEach(line => {
        // Check if we're near bottom of page
        if (y > pageHeight - 150) {
          doc.addPage();
          y = 50;
        }
        doc.text(line, 50, y);
        y += 12;
      });

      // Footer - By and scan reference ID
      y += 30;
      if (y > pageHeight - 180) {
        doc.addPage();
        y = 50;
      }

      // Add signature FIRST if provided (ABOVE the "By: SENTRACI" text)
      if (signatureDataUrl) {
        try {
          console.log('DEBUG: Adding signature at y position:', y);

          // Remove data:image/png;base64, prefix
          const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
          const signatureBuffer = Buffer.from(base64Data, 'base64');

          // Add signature image (width 150px, positioned at y)
          doc.image(signatureBuffer, 50, y, { width: 150, height: 50 }); // Tambah height constraint
          y += 60; // Increased spacing for thicker signature (5px line width)

          console.log('DEBUG: After signature, y position:', y);
        } catch (signError) {
          console.error('Error adding signature:', signError);
        }
      }

      // Get user name from request body (sent from frontend)
      const userName = req.body.userName || 'SENTRACI'; // Fallback to SENTRACI if not provided

      // Different footer text for first print vs reprint (BELOW signature)
      const footerText = isReprint
        ? `By: ${userName} Re Print on ${reprintDate}`
        : `By: ${userName} Print on ${reprintDate}`;

      console.log('DEBUG: Adding footer text at y position:', y);
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text(footerText, 50, y);
      console.log('DEBUG: Footer text added');

      y += 20;
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .text('Scan your Reference ID', 50, y);

      // Generate barcode using bwip-js
      y += 15;
      try {
        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'code128',       // Barcode type (Code 128)
          text: String(eligibility.clID || ''),
          scale: 1,              // 1x scaling factor (sama seperti discharge)
          height: 6,             // Bar height in millimeters
          includetext: true,     // Show text below barcode
          textxalign: 'center',  // Center the text
        });

        // Add barcode image to PDF (width 60px - sama seperti discharge)
        doc.image(barcodeBuffer, 50, y, { width: 60 });
      } catch (barcodeError) {
        console.error('Error generating barcode:', barcodeError);
        // Fallback to text if barcode generation fails
        doc.fontSize(10)
           .font('Courier-Bold')
           .text(`|||${eligibility.clID || ''}|||`, 50, y);
      }

      // NO BORDER - removed as requested

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error('Controller error - generateEligibilityPDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating eligibility PDF',
        error: error.message
      });
    }
  }

  /**
   * Get eligibility print preview HTML
   * POST /api/admedika/eligibility-preview
   */
  async getEligibilityPreview(req, res) {
    try {
      const { eligibilityData, patientInfo, isPrint } = req.body;

      if (!eligibilityData || !eligibilityData.eligibility) {
        return res.status(400).json({
          success: false,
          message: 'Eligibility data is required'
        });
      }

      const eligibility = eligibilityData.eligibility;
      const isReprint = isPrint === false;

      // Query database untuk get created_date
      let registrationDate = null;
      try {
        const query = `
          SELECT created_date
          FROM registrasi_pasien_admedika
          WHERE no_registrasi = $1
          LIMIT 1
        `;
        const result = await db.query(query, [patientInfo.no_registrasi]);

        if (result.rows.length > 0) {
          registrationDate = result.rows[0].created_date;
        }
      } catch (dbError) {
        console.error('Error querying registration date:', dbError);
      }

      // Format registration date
      let formattedRegDate = '-';
      if (registrationDate) {
        const regDate = new Date(registrationDate);
        const day = String(regDate.getDate()).padStart(2, '0');
        const month = String(regDate.getMonth() + 1).padStart(2, '0');
        const year = regDate.getFullYear();
        const hours = String(regDate.getHours()).padStart(2, '0');
        const minutes = String(regDate.getMinutes()).padStart(2, '0');
        const seconds = String(regDate.getSeconds()).padStart(2, '0');
        const ampm = regDate.getHours() >= 12 ? 'pm' : 'am';

        formattedRegDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}${ampm}`;
      }

      // Format current date/time
      const now = new Date();
      const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      const reprintHours = utc7Time.getUTCHours();
      const reprintMinutes = utc7Time.getUTCMinutes();
      const reprintAmPm = reprintHours >= 12 ? 'pm' : 'am';
      const reprintHours12 = reprintHours % 12 || 12;

      const reprintDate = `${monthNames[utc7Time.getUTCMonth()]} ${utc7Time.getUTCDate()}, ${utc7Time.getUTCFullYear()}, ${reprintHours12}:${String(reprintMinutes).padStart(2, '0')} ${reprintAmPm}`;

      // Get user name from request body (sent from frontend)
      const userName = req.body.userName || 'SENTRACI'; // Fallback to SENTRACI if not provided

      const footerText = isReprint
        ? `By: ${userName} Re Print on ${reprintDate}`
        : `By: ${userName} Print on ${reprintDate}`;

      const printOutLines = (eligibility.printOut || 'No data available').split('\n');

      // Return preview data
      res.json({
        success: true,
        data: {
          title: isReprint ? 'Re-Print Letter of Authorization' : 'Letter of Authorization',
          provider: 'RS SENTRA MEDIKA CIBINONG',
          terminalId: '12389773',
          dateTime: formattedRegDate,
          patientName: eligibility.patientName || '-',
          referenceID: eligibility.clID || '-',
          printOut: printOutLines.join('\n'),
          footerText: footerText,
          scanText: 'Scan your Reference ID'
        }
      });

    } catch (error) {
      console.error('Controller error - getEligibilityPreview:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting eligibility preview',
        error: error.message
      });
    }
  }

  /**
   * Get discharge print preview HTML
   * POST /api/admedika/discharge-preview
   */
  async getDischargePreview(req, res) {
    try {
      const { dischargeData, patientInfo, isPrint } = req.body;

      if (!dischargeData || !dischargeData.dischargeRequest) {
        return res.status(400).json({
          success: false,
          message: 'Discharge data is required'
        });
      }

      const discharge = dischargeData.dischargeRequest;
      const isReprint = isPrint === false;

      // Query database untuk get created_date
      let registrationDate = null;
      try {
        const query = `
          SELECT created_date
          FROM registrasi_pasien_admedika
          WHERE no_registrasi = $1
          LIMIT 1
        `;
        const result = await db.query(query, [patientInfo.no_registrasi]);

        if (result.rows.length > 0) {
          registrationDate = result.rows[0].created_date;
        }
      } catch (dbError) {
        console.error('Error querying registration date:', dbError);
      }

      // Format registration date
      let formattedRegDate = '-';
      if (registrationDate) {
        const regDate = new Date(registrationDate);
        const day = String(regDate.getDate()).padStart(2, '0');
        const month = String(regDate.getMonth() + 1).padStart(2, '0');
        const year = regDate.getFullYear();
        const hours = String(regDate.getHours()).padStart(2, '0');
        const minutes = String(regDate.getMinutes()).padStart(2, '0');
        const seconds = String(regDate.getSeconds()).padStart(2, '0');
        const ampm = regDate.getHours() >= 12 ? 'pm' : 'am';

        formattedRegDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}${ampm}`;
      }

      // Format current date/time
      const now = new Date();
      const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      const reprintHours = utc7Time.getUTCHours();
      const reprintMinutes = utc7Time.getUTCMinutes();
      const reprintAmPm = reprintHours >= 12 ? 'pm' : 'am';
      const reprintHours12 = reprintHours % 12 || 12;

      const reprintDate = `${monthNames[utc7Time.getUTCMonth()]} ${utc7Time.getUTCDate()}, ${utc7Time.getUTCFullYear()}, ${reprintHours12}:${String(reprintMinutes).padStart(2, '0')} ${reprintAmPm}`;

      // Get user name from request body (sent from frontend)
      const userName = req.body.userName || 'SENTRACI'; // Fallback to SENTRACI if not provided

      const footerText = isReprint
        ? `By: ${userName} Re Print on ${reprintDate}`
        : `By: ${userName} Print on ${reprintDate}`;

      const printOutLines = (discharge.printOut || 'No data available').split('\n');

      // Return preview data
      res.json({
        success: true,
        data: {
          title: isReprint ? 'Re-Print Letter of Confirmation' : 'Letter of Confirmation',
          provider: 'RS SENTRA MEDIKA CIBINONG',
          terminalId: '12389773',
          dateTime: formattedRegDate,
          patientName: discharge.patientName || '-',
          referenceID: discharge.clID || '-',
          printOut: printOutLines.join('\n'),
          footerText: footerText,
          scanText: 'Scan your Reference ID'
        }
      });

    } catch (error) {
      console.error('Controller error - getDischargePreview:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting discharge preview',
        error: error.message
      });
    }
  }

  /**
   * Generate PDF for discharge response
   * POST /api/admedika/generate-pdf-discharge
   */
  async generateDischargePDF(req, res) {
    try {
      const { dischargeData, patientInfo, isPrint, signatureDataUrl } = req.body;

      if (!dischargeData || !dischargeData.dischargeRequest) {
        return res.status(400).json({
          success: false,
          message: 'Discharge data is required'
        });
      }

      const discharge = dischargeData.dischargeRequest;

      // Query database untuk get created_date dari registrasi_pasien_admedika
      let registrationDate = null;
      try {
        const query = `
          SELECT created_date
          FROM registrasi_pasien_admedika
          WHERE no_registrasi = $1
          LIMIT 1
        `;
        const result = await db.query(query, [patientInfo.no_registrasi]);

        if (result.rows.length > 0) {
          registrationDate = result.rows[0].created_date;
        }
      } catch (dbError) {
        console.error('Error querying registration date:', dbError);
        // Continue dengan null date jika query gagal
      }

      // Format registration date (dari database)
      let formattedRegDate = '-';
      if (registrationDate) {
        const regDate = new Date(registrationDate);
        const day = String(regDate.getDate()).padStart(2, '0');
        const month = String(regDate.getMonth() + 1).padStart(2, '0');
        const year = regDate.getFullYear();
        const hours = String(regDate.getHours()).padStart(2, '0');
        const minutes = String(regDate.getMinutes()).padStart(2, '0');
        const seconds = String(regDate.getSeconds()).padStart(2, '0');
        const ampm = regDate.getHours() >= 12 ? 'pm' : 'am';

        formattedRegDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}${ampm}`;
      }

      // Format current date/time untuk "By: SENTRACI Re Print on..." (UTC+7)
      const now = new Date();
      // Convert to UTC+7 (Jakarta time)
      const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      const reprintHours = utc7Time.getUTCHours();
      const reprintMinutes = utc7Time.getUTCMinutes();
      const reprintAmPm = reprintHours >= 12 ? 'PM' : 'AM';
      const reprintHours12 = reprintHours % 12 || 12;

      const reprintDate = `${monthNames[utc7Time.getUTCMonth()]} ${utc7Time.getUTCDate()}, ${utc7Time.getUTCFullYear()}, ${reprintHours12}:${String(reprintMinutes).padStart(2, '0')} ${reprintAmPm}`;

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Discharge-${patientInfo.no_registrasi || 'document'}-${Date.now()}.pdf`);

      // Pipe PDF to response
      doc.pipe(res);

      const pageHeight = doc.page.height;

      // Header - Title based on isPrint flag
      // isPrint = true (first time) -> "Letter of Confirmation"
      // isPrint = false (re-print) -> "Re-Print Letter of Confirmation"
      const title = isPrint ? 'Letter of Confirmation' : 'Re-Print Letter of Confirmation';

      let y = 50;
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(title, 50, y);

      y += 30;

      // Provider info
      doc.fontSize(9)
         .font('Helvetica')
         .text('Provider : RS SENTRA MEDIKA CIBINONG', 50, y);

      y += 15;
      doc.text('Terminal ID : 12389773', 50, y);

      y += 15;
      // Date and Time dari registrasi (created_date)
      doc.text(`Date and Time : ${formattedRegDate}`, 50, y);

      y += 15;
      doc.text(`Patient Name : ${discharge.patientName || '-'}`, 50, y);

      y += 15;
      doc.text(`Reference ID : ${discharge.clID || '-'}`, 50, y);

      y += 30;

      // Print Out Content - This is the main content from Admedika API
      const printOutLines = (discharge.printOut || 'No data available').split('\n');
      doc.fontSize(8)
         .font('Courier');

      printOutLines.forEach(line => {
        // Check if we're near bottom of page
        if (y > pageHeight - 150) {
          doc.addPage();
          y = 50;
        }
        doc.text(line, 50, y);
        y += 12;
      });

      // Footer - By and scan reference ID
      y += 30;
      if (y > pageHeight - 180) {
        doc.addPage();
        y = 50;
      }

      // Add signature FIRST if provided (ABOVE the "By: SENTRACI" text)
      if (signatureDataUrl) {
        try {
          console.log('DEBUG: Adding signature at y position:', y);

          // Remove data:image/png;base64, prefix
          const base64Data = signatureDataUrl.replace(/^data:image\/\w+;base64,/, '');
          const signatureBuffer = Buffer.from(base64Data, 'base64');

          // Add signature image (width 150px, positioned at y)
          doc.image(signatureBuffer, 50, y, { width: 150, height: 50 }); // Add height constraint
          y += 60; // Increased spacing for thicker signature (5px line width)

          console.log('DEBUG: After signature, y position:', y);
        } catch (signError) {
          console.error('Error adding signature:', signError);
        }
      }

      // Get user name from request body (sent from frontend)
      const userName = req.body.userName || 'SENTRACI'; // Fallback to SENTRACI if not provided

      // Different footer text for first print vs reprint (BELOW signature)
      const footerText = isPrint
        ? `By: ${userName} Print on ${reprintDate}`
        : `By: ${userName} Re Print on ${reprintDate}`;

      console.log('DEBUG: Adding footer text at y position:', y);
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text(footerText, 50, y);
      console.log('DEBUG: Footer text added');

      y += 20;
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .text('Scan your Reference ID', 50, y);

      // Generate barcode using bwip-js
      y += 15;
      try {
        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'code128',       // Barcode type (Code 128)
          text: String(discharge.clID || ''),
          scale: 1,              // 1x scaling factor (dikecilkan lagi jadi setengahnya)
          height: 6,             // Bar height in millimeters (dikecilkan dari 8 ke 6)
          includetext: true,     // Show text below barcode
          textxalign: 'center',  // Center the text
        });

        // Add barcode image to PDF (width dikecilkan dari 120 ke 60 - setengahnya)
        doc.image(barcodeBuffer, 50, y, { width: 60 });
      } catch (barcodeError) {
        console.error('Error generating barcode:', barcodeError);
        // Fallback to text if barcode generation fails
        doc.fontSize(10)
           .font('Courier-Bold')
           .text(`|||${discharge.clID || ''}|||`, 50, y);
      }

      // NO BORDER - removed as requested

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error('Controller error - generateDischargePDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating discharge PDF',
        error: error.message
      });
    }
  }

  /**
   * Get response API by no_mr
   * GET /api/admedika/response-api/:noMr
   */
  async getResponseApiByNoMr(req, res) {
    try {
      const { noMr } = req.params;

      if (!noMr) {
        return res.status(400).json({
          success: false,
          message: 'No MR is required'
        });
      }

      const result = await admedikaService.getResponseApiByNoMr(noMr);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getResponseApiByNoMr:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting response API data',
        error: error.message
      });
    }
  }

  /**
   * Get riwayat registrasi by No MR
   * GET /api/admedika/riwayat-registrasi/:noMr
   */
  async getRiwayatRegistrasiByNoMr(req, res) {
    try {
      const { noMr } = req.params;

      if (!noMr) {
        return res.status(400).json({
          success: false,
          message: 'No MR is required'
        });
      }

      const result = await admedikaService.getRiwayatRegistrasiByNoMr(noMr);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getRiwayatRegistrasiByNoMr:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting riwayat registrasi data',
        error: error.message
      });
    }
  }

  /**
   * Get response API CLAIM by no_mr (untuk cetak ulang di kasir-cibinong)
   * GET /api/admedika/response-api-claim/:noMr
   */
  async getResponseApiClaimByNoMr(req, res) {
    try {
      const { noMr } = req.params;

      if (!noMr) {
        return res.status(400).json({
          success: false,
          message: 'No MR is required'
        });
      }

      const result = await admedikaService.getResponseApiClaimByNoMr(noMr);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getResponseApiClaimByNoMr:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting response API claim data',
        error: error.message
      });
    }
  }

  /**
   * Save discharge result
   * POST /api/admedika/save-discharge-result
   */
  async saveDischargeResult(req, res) {
    try {
      const {
        no_registrasi,
        no_mr,
        no_claim,
        claim_by,
        icd10,
        discharge_response,
        transaction_items
      } = req.body;

      // Validasi input
      if (!no_registrasi || !no_mr || !no_claim || !discharge_response) {
        return res.status(400).json({
          success: false,
          message: 'no_registrasi, no_mr, no_claim, and discharge_response are required'
        });
      }

      const result = await admedikaService.saveDischargeResult(req.body);

      const statusCode = result.success ? 200 : 500;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - saveDischargeResult:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving discharge result',
        error: error.message
      });
    }
  }

  /**
   * Upload document
   * POST /api/admedika/upload-document
   */
  async uploadDocument(req, res) {
    try {
      // Validate file
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate required fields
      const { cardNo, clID, docType, remarks, patientName, no_registrasi, no_mr, uploaded_by } = req.body;

      if (!cardNo || !clID || !docType || !patientName || !no_registrasi || !no_mr) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: cardNo, clID, docType, patientName, no_registrasi, no_mr'
        });
      }

      // Prepare upload data
      const uploadData = {
        cardNo,
        clID,
        docType,
        remarks: remarks || '',
        patientName,
        no_registrasi,
        no_mr,
        uploaded_by: uploaded_by || 'system'
      };

      const result = await admedikaService.uploadDocument(uploadData, req.file);

      const statusCode = result.success ? 200 : 500;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - uploadDocument:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading document',
        error: error.message
      });
    }
  }

  /**
   * Get upload document history
   * GET /api/admedika/upload-history/:noClaim
   */
  async getUploadHistory(req, res) {
    try {
      const { noClaim } = req.params;

      if (!noClaim) {
        return res.status(400).json({
          success: false,
          message: 'noClaim is required'
        });
      }

      const result = await admedikaService.getUploadHistory(noClaim);

      const statusCode = result.success ? 200 : 404;
      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getUploadHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting upload history',
        error: error.message
      });
    }
  }

  /**
   * Download uploaded document
   * GET /api/admedika/download-document/:id
   */
  async downloadDocument(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      // Get document info from database
      const db = require('../config/database');
      const result = await db.query('SELECT * FROM upload_document_admedika WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      const document = result.rows[0];
      const s3Service = require('../services/s3Service');

      console.log('📥 Downloading document from S3:', {
        id: id,
        s3Key: document.file_path,
        fileName: document.file_name
      });

      // Download file from S3
      const s3Result = await s3Service.downloadFile(document.file_path);

      // Set response headers for file download
      res.setHeader('Content-Type', s3Result.contentType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
      res.setHeader('Content-Length', s3Result.contentLength);

      // Pipe the S3 stream to response
      s3Result.stream.pipe(res);

    } catch (error) {
      console.error('Controller error - downloadDocument:', error);

      // Check if headers already sent
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading document',
          error: error.message
        });
      }
    }
  }

  /**
   * Get presigned URL for viewing document
   * GET /api/admedika/view-document/:id
   */
  async viewDocument(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Document ID is required'
        });
      }

      // Get document info from database
      const db = require('../config/database');
      const result = await db.query('SELECT * FROM upload_document_admedika WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      const document = result.rows[0];
      const s3Service = require('../services/s3Service');

      console.log('👁️ Generating view URL for document:', {
        id: id,
        s3Key: document.file_path,
        fileName: document.file_name
      });

      // Generate presigned URL (valid for 1 hour)
      const presignedUrl = await s3Service.getPresignedUrl(document.file_path, 3600);

      res.json({
        success: true,
        data: {
          url: presignedUrl,
          fileName: document.file_name,
          contentType: document.file_name.endsWith('.pdf') ? 'application/pdf' : 'image/*',
          expiresIn: 3600
        }
      });

    } catch (error) {
      console.error('Controller error - viewDocument:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating view URL',
        error: error.message
      });
    }
  }

  /**
   * Get Member Enrolled Plan TC (Term & Condition)
   * POST /api/admedika/member-enrolled-plan-tc
   * Body: {
   *   cardNo,
   *   covID,
   *   searchForTermCondition
   * }
   */
  async getMemberEnrolledPlanTC(req, res) {
    try {
      const { cardNo, covID, searchForTermCondition } = req.body;

      // Validasi input wajib
      if (!cardNo || !covID) {
        return res.status(400).json({
          success: false,
          message: 'cardNo and covID are required'
        });
      }

      // Call service
      const result = await admedikaService.getMemberEnrolledPlanTC(cardNo, covID, searchForTermCondition);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - getMemberEnrolledPlanTC:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting member enrolled plan TC',
        error: error.message
      });
    }
  }

  /**
   * Check ICD Exclusion
   * POST /api/admedika/check-icd-exclusion
   * Body: {
   *   cardNo,
   *   covID,
   *   diagnosisCodeList
   * }
   */
  async checkIcdExclusion(req, res) {
    try {
      const { cardNo, covID, diagnosisCodeList } = req.body;

      // Validasi input wajib
      if (!cardNo || !covID || !diagnosisCodeList) {
        return res.status(400).json({
          success: false,
          message: 'cardNo, covID, and diagnosisCodeList are required'
        });
      }

      // Call service
      const result = await admedikaService.checkIcdExclusion(cardNo, covID, diagnosisCodeList);

      // Set status code based on result
      const statusCode = result.success ? 200 : 500;

      res.status(statusCode).json(result);
    } catch (error) {
      console.error('Controller error - checkIcdExclusion:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking ICD exclusion',
        error: error.message
      });
    }
  }
}

module.exports = new AdmedikaController();
