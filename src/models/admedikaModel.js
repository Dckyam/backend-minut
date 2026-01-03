const axios = require('axios');
const config = require('../config/config');
const { generateAdmedikaToken, generateRequestID, generateTimestamp } = require('../utils/admedikaHelper');
const db = require('../database/db');

class AdmedikaModel {
  /**
   * Get all coverage types
   */
  async getAllCoverageTypes() {
    try {
      const query = `
        SELECT coverage_id, coverage_code, description
        FROM coverage_type_admedika
        ORDER BY coverage_id
      `;

      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Model error - getAllCoverageTypes:', error);
      throw error;
    }
  }

  /**
   * Get all document types
   */
  async getAllDocumentTypes() {
    try {
      const query = `
        SELECT id, doc_code, doc_name, category, description, sort_order
        FROM document_types_admedika
        WHERE is_active = TRUE
        ORDER BY sort_order, doc_name
      `;

      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Model error - getAllDocumentTypes:', error);
      throw error;
    }
  }

  /**
   * Get document types by category
   */
  async getDocumentTypesByCategory(category) {
    try {
      const query = `
        SELECT id, doc_code, doc_name, category, description, sort_order
        FROM document_types_admedika
        WHERE is_active = TRUE AND category = $1
        ORDER BY sort_order, doc_name
      `;

      const result = await db.query(query, [category]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getDocumentTypesByCategory:', error);
      throw error;
    }
  }

  /**
   * Get registrasi by no_registrasi (is_void = 0)
   */
  async getRegistrasiByNoReg(noRegistrasi) {
    try {
      const query = `
        SELECT
          id, to_char(tanggal_registrasi, 'YYYY-MM-DD') as tanggal_registrasi,
          no_registrasi, no_mr, no_claim, no_kartu,
          nama_pasien, tanggal_lahir, coverage_id, coverage_code, coverage_desc,
          nama_layanan, dokter, penjamin, icd10, amount, acc_amount, decline_amount,
          claim_status, claim_desc, is_void, void_by, void_date, void_remarks,
          is_claim, claim_by, claim_date, created_by, created_date
        FROM registrasi_pasien_admedika
        WHERE no_registrasi = $1 AND is_void = 0
      `;
      const result = await db.query(query, [noRegistrasi]);
      return result.rows[0];
    } catch (error) {
      console.error('Model error - getRegistrasiByNoReg:', error);
      throw error;
    }
  }

  /**
   * Get registrasi by no_mr and tanggal_registrasi (is_void = 0)
   */
  async getRegistrasiByNoMrAndDate(noMr, tanggalRegistrasi) {
    try {
      const query = `
        SELECT
          id, to_char(tanggal_registrasi, 'YYYY-MM-DD') as tanggal_registrasi,
          no_registrasi, no_mr, no_claim, no_kartu,
          nama_pasien, tanggal_lahir, coverage_id, coverage_code, coverage_desc,
          nama_layanan, dokter, penjamin, icd10, amount, acc_amount, decline_amount,
          claim_status, claim_desc, is_void, void_by, void_date, void_remarks,
          is_claim, claim_by, claim_date, created_by, created_date
        FROM registrasi_pasien_admedika
        WHERE no_mr = $1
          AND tanggal_registrasi = $2
          AND is_void = 0
        ORDER BY created_date DESC
      `;
      const result = await db.query(query, [noMr, tanggalRegistrasi]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getRegistrasiByNoMrAndDate:', error);
      throw error;
    }
  }

  /**
   * Get benefits by no_claim
   */
  async getBenefitsByNoClaim(noClaim) {
    try {
      const query = `
        SELECT id, no_registrasi, no_claim, benefit_id, benefit_name,
               avail_limit, freq_desc, limit_desc
        FROM benefit_pasien_admedika 
        WHERE no_claim = $1
        ORDER BY benefit_id
      `;
      const result = await db.query(query, [noClaim]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getBenefitsByNoClaim:', error);
      throw error;
    }
  }

  /**
   * Get riwayat registrasi by No MR
   */
  async getRiwayatRegistrasiByNoMr(noMr) {
    try {
      const query = `
        SELECT
          id, to_char(tanggal_registrasi, 'YYYY-MM-DD') as tanggal_registrasi,
          no_registrasi, no_mr, no_claim, no_kartu,
          nama_pasien, nama_layanan, dokter, penjamin,
          is_void, is_claim, void_date, void_by, void_remarks,
          claim_date, claim_by, created_date
        FROM registrasi_pasien_admedika
        WHERE no_mr = $1
        ORDER BY tanggal_registrasi DESC, created_date DESC
      `;
      const result = await db.query(query, [noMr]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getRiwayatRegistrasiByNoMr:', error);
      throw error;
    }
  }

  /**
   * Insert registrasi pasien admedika
   */
  async insertRegistrasi(data) {
    try {
      const query = `
        INSERT INTO registrasi_pasien_admedika (
          tanggal_registrasi, no_registrasi, no_mr, no_claim, coverage_id, coverage_code, coverage_desc,
          nama_pasien, tanggal_lahir, nama_layanan, dokter, penjamin, no_kartu,
          claim_status, claim_desc, icd10, amount, acc_amount, decline_amount, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id, no_registrasi, no_claim
      `;

      const values = [
        data.tanggal_registrasi, data.no_registrasi, data.no_mr, data.no_claim,
        data.coverage_id, data.coverage_code, data.coverage_desc, data.nama_pasien,
        data.tanggal_lahir, data.nama_layanan, data.dokter, data.penjamin, data.no_kartu,
        data.claim_status, data.claim_desc, data.icd10, data.amount,
        data.acc_amount || 0, data.decline_amount || 0, data.created_by
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Model error - insertRegistrasi:', error);
      throw error;
    }
  }

  /**
   * Insert benefits (multiple)
   */
  async insertBenefits(benefits) {
    try {
      const query = `
        INSERT INTO benefit_pasien_admedika (
          no_registrasi, no_claim, benefit_id, benefit_name, avail_limit, freq_desc, limit_desc
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      // Insert satu per satu secara sequential agar ID terurut
      for (const benefit of benefits) {
        const values = [
          benefit.no_registrasi, benefit.no_claim, benefit.benefit_id,
          benefit.benefit_name, benefit.avail_limit, benefit.freq_desc, benefit.limit_desc
        ];
        await db.query(query, values);
      }
    } catch (error) {
      console.error('Model error - insertBenefits:', error);
      throw error;
    }
  }

  /**
   * Insert transaksi mapping (multiple items)
   */
  async insertTransaksiMapping(transaksiItems) {
    try {
      const query = `
        INSERT INTO transaksi_pasien_admedika (
          no_registrasi, no_claim, benefit_id, benefit_name,
          kode_item, nama_item, qty, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      // Insert satu per satu secara sequential agar ID terurut
      const insertedItems = [];
      for (const item of transaksiItems) {
        const values = [
          item.no_registrasi,
          item.no_claim,
          item.benefit_id,
          item.benefit_name,
          item.kode_item,
          item.nama_item,
          item.qty,
          item.total_amount
        ];
        const result = await db.query(query, values);
        insertedItems.push(result.rows[0]);
      }

      return insertedItems;
    } catch (error) {
      console.error('Model error - insertTransaksiMapping:', error);
      throw error;
    }
  }

  /**
   * Get transaksi mapping by no_registrasi
   */
  async getTransaksiByNoReg(noRegistrasi) {
    try {
      const query = `
        SELECT
          id, no_registrasi, no_claim, benefit_id, benefit_name,
          kode_item, nama_item, qty, total_amount
        FROM transaksi_pasien_admedika
        WHERE no_registrasi = $1
        ORDER BY benefit_id, id
      `;
      const result = await db.query(query, [noRegistrasi]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getTransaksiByNoReg:', error);
      throw error;
    }
  }

  /**
   * Get transaksi mapping by no_claim
   */
  async getTransaksiByNoClaim(noClaim) {
    try {
      const query = `
        SELECT
          id, no_registrasi, no_claim, benefit_id, benefit_name,
          kode_item, nama_item, qty, total_amount
        FROM transaksi_pasien_admedika
        WHERE no_claim = $1
        ORDER BY benefit_id, id
      `;
      const result = await db.query(query, [noClaim]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getTransaksiByNoClaim:', error);
      throw error;
    }
  }

  /**
   * Update registrasi void by no_kartu
   * Hanya void registrasi yang belum di-claim (is_claim = 0)
   */
  async voidRegistrasiByNoKartu(noKartu, voidBy, voidRemarks) {
    try {
      const query = `
        UPDATE registrasi_pasien_admedika 
        SET is_void = 1, void_by = $2, void_date = CURRENT_TIMESTAMP, void_remarks = $3
        WHERE no_kartu = $1 
          AND is_void = 0 
          AND is_claim = 0
        RETURNING id, no_registrasi, no_claim, no_kartu, tanggal_registrasi
      `;
      const result = await db.query(query, [noKartu, voidBy, voidRemarks]);
      return result.rows;
    } catch (error) {
      console.error('Model error - voidRegistrasiByNoKartu:', error);
      throw error;
    }
  }

  /**
   * Call Admedika API for eligibility check
   */
  async checkEligibility(cardNo, covID) {
    try {
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'ELIGIBILITY';

      // Generate tokenAuth
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare request payload
      const payload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            eligibilityRequest: {
              eligibility: {
                terminalID: config.admedika.terminalID,
                cardNo: cardNo,
                covID: covID,
                diagnosisCodeList: '',
                providerTransID: '',
                nationalID: '',
                familyCardID: '',
                physicianName: '',
                accidentFlag: '',
                surgicalFlag: '',
                roomType: '',
                roomPrice: '',
                remarks: ''
              }
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      console.log('📤 Admedika Request:', {
        url: config.admedika.baseUrl,
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        cardNo: cardNo,
        covID: covID
      });
      
      console.log('📋 Full Payload:', JSON.stringify(payload, null, 2));

      // Call Admedika API
      const response = await axios.post(config.admedika.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📥 Admedika Response Status:', response.status);

      return {
        success: true,
        data: response.data,
        requestInfo: {
          requestID: requestID,
          timestamp: timestamp,
          tokenAuth: tokenAuth
        }
      };
    } catch (error) {
      console.error('❌ Admedika API Error:', error.message);
      
      if (error.response) {
        // API responded with error
        return {
          success: false,
          error: 'Admedika API Error',
          message: error.response.data?.output?.statusMsg || error.message,
          statusCode: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        // No response received
        return {
          success: false,
          error: 'No Response from Admedika',
          message: 'Failed to connect to Admedika server',
        };
      } else {
        // Request setup error
        return {
          success: false,
          error: 'Request Error',
          message: error.message,
        };
      }
    }
  }

  /**
   * Call Admedika API for cancel open claims transaction
   */
  async cancelOpenClaimsTxn(cardNo, remarks) {
    try {
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'CANCEL_OPEN_CLAIMS_TXN';

      // Generate tokenAuth
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare request payload
      const payload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            cancelOpenClaimTxnRequest: {
              cancelOpenClaimTxn: {
                terminalID: config.admedika.terminalID,
                cardNo: cardNo,
                remarks: remarks
              }
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      console.log('📤 Admedika Cancel Request:', {
        url: config.admedika.baseUrl,
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        cardNo: cardNo,
        remarks: remarks
      });

      // Call Admedika API
      const response = await axios.post(config.admedika.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📥 Admedika Cancel Response Status:', response.status);

      return {
        success: true,
        data: response.data,
        requestInfo: {
          requestID: requestID,
          timestamp: timestamp,
          tokenAuth: tokenAuth
        }
      };
    } catch (error) {
      console.error('❌ Admedika Cancel API Error:', error.message);
      
      if (error.response) {
        return {
          success: false,
          error: 'Admedika API Error',
          message: error.response.data?.output?.statusMsg || error.message,
          statusCode: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'No Response from Admedika',
          message: 'Failed to connect to Admedika server',
        };
      } else {
        return {
          success: false,
          error: 'Request Error',
          message: error.message,
        };
      }
    }
  }

  /**
   * Call Admedika API for get entitlement
   */
  async getEntitlement(cardNo) {
    try {
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'GET_ENTITLEMENT';

      // Generate tokenAuth
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare request payload  
      const payload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            getEntitlementRequest: {
              getEntitlement: {
                terminalID: config.admedika.terminalID,
                cardNo: cardNo
              }
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      console.log('📤 Admedika Get Entitlement Request:', {
        url: config.admedika.baseUrl,
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        cardNo: cardNo
      });

      // Call Admedika API
      const response = await axios.post(config.admedika.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📥 Admedika Get Entitlement Response Status:', response.status);

      return {
        success: true,
        data: response.data,
        requestInfo: {
          requestID: requestID,
          timestamp: timestamp,
          tokenAuth: tokenAuth
        }
      };
    } catch (error) {
      console.error('❌ Admedika Get Entitlement API Error:', error.message);
      
      if (error.response) {
        return {
          success: false,
          error: 'Admedika API Error',
          message: error.response.data?.output?.statusMsg || error.message,
          statusCode: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'No Response from Admedika',
          message: 'Failed to connect to Admedika server',
        };
      } else {
        return {
          success: false,
          error: 'Request Error',
          message: error.message,
        };
      }
    }
  }

  /**
   * Call Admedika API for Hello World - Test Connection
   */
  async helloWorld() {
    try {
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'HELLO_WORLD';

      // Generate tokenAuth
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare request payload
      const payload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            helloRequest: {
              customerID: config.admedika.customerID
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      console.log('📤 Admedika Hello World Request:', {
        url: config.admedika.baseUrl,
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        customerID: config.admedika.customerID
      });

      // Call Admedika API
      const response = await axios.post(config.admedika.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📥 Admedika Hello World Response Status:', response.status);

      return {
        success: true,
        data: response.data,
        requestInfo: {
          requestID: requestID,
          timestamp: timestamp,
          tokenAuth: tokenAuth
        }
      };
    } catch (error) {
      console.error('❌ Admedika Hello World API Error:', error.message);
      
      if (error.response) {
        return {
          success: false,
          error: 'Admedika API Error',
          message: error.response.data?.output?.statusMsg || error.message,
          statusCode: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'No Response from Admedika',
          message: 'Failed to connect to Admedika server',
        };
      } else {
        return {
          success: false,
          error: 'Request Error',
          message: error.message,
        };
      }
    }
  }

  /**
   * Call Admedika API for Discharge OP
   */
  async dischargeOP(cardNo, dischargeData, entitlementData) {
    try {
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'DISCHARGE_OP';

      // Generate tokenAuth
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare entitlement array
      const entitlement = entitlementData.map(benefit => ({
        benID: String(benefit.benID),
        benAmount: String(benefit.benAmount),
        benItemList: benefit.benItemList.map(item => ({
          code: String(item.code),
          name: String(item.name),
          qty: String(item.qty),
          totPrice: String(item.totPrice)
        }))
      }));

      // Prepare request payload - include all fields even if empty (as per documentation)
      const payload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            dischargeRequest: {
              discharge: {
                terminalID: config.admedika.terminalID,
                cardNo: cardNo,
                diagnosisCodeList: dischargeData.diagnosisCodeList || '',
                mcDays: dischargeData.mcDays || '',
                physicianName: dischargeData.physicianName || '',
                accidentFlag: dischargeData.accidentFlag || 'N',
                surgicalFlag: dischargeData.surgicalFlag || 'N',
                remarks: dischargeData.remarks || '',
                entitlement: entitlement
              }
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      console.log('📤 Admedika Discharge OP Request:', {
        url: config.admedika.baseUrl,
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        cardNo: cardNo,
        totalBenefits: entitlement.length
      });

      console.log('📋 Full Payload:', JSON.stringify(payload, null, 2));

      // Call Admedika API
      const response = await axios.post(config.admedika.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📥 Admedika Discharge Response Status:', response.status);

      return {
        success: true,
        data: response.data,
        requestInfo: {
          requestID: requestID,
          timestamp: timestamp,
          tokenAuth: tokenAuth
        }
      };
    } catch (error) {
      console.error('❌ Admedika Discharge OP API Error:', error.message);
      
      if (error.response) {
        return {
          success: false,
          error: 'Admedika API Error',
          message: error.response.data?.output?.statusMsg || error.message,
          statusCode: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'No Response from Admedika',
          message: 'Failed to connect to Admedika server',
        };
      } else {
        return {
          success: false,
          error: 'Request Error',
          message: error.message,
        };
      }
    }
  }

  /**
   * Get response API by no_mr
   * JOIN dengan registrasi_pasien_admedika untuk filter is_void = 0
   * Filter hanya is_eligibility = 1
   */
  async getResponseApiByNoMr(noMr) {
    try {
      const query = `
        SELECT DISTINCT
          reg.tanggal_registrasi as tanggal_registrasi_raw,
          to_char(reg.tanggal_registrasi, 'YYYY-MM-DD') as tanggal_registrasi,
          reg.no_registrasi,
          reg.no_mr,
          reg.nama_pasien,
          reg.nama_layanan,
          reg.dokter,
          r.json_response,
          r.is_eligibility,
          r.is_claim,
          r.id
        FROM response_api_admedika r
        INNER JOIN registrasi_pasien_admedika reg
          ON r.no_mr = reg.no_mr
          AND r.no_registrasi = reg.no_registrasi
        WHERE r.no_mr = $1
          AND reg.is_void = 0
          AND r.is_eligibility = 1
        ORDER BY reg.tanggal_registrasi DESC, r.id DESC
      `;
      const result = await db.query(query, [noMr]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getResponseApiByNoMr:', error);
      throw error;
    }
  }

  /**
   * Get response API by no_mr untuk CETAK ULANG CLAIM (kasir-cibinong)
   * WHERE is_claim = 1 (bukan is_eligibility)
   */
  async getResponseApiClaimByNoMr(noMr) {
    try {
      const query = `
        SELECT DISTINCT
          reg.tanggal_registrasi as tanggal_registrasi_raw,
          to_char(reg.tanggal_registrasi, 'YYYY-MM-DD') as tanggal_registrasi,
          reg.no_registrasi,
          reg.no_mr,
          reg.nama_pasien,
          reg.nama_layanan,
          reg.dokter,
          r.json_response,
          r.is_eligibility,
          r.is_claim,
          r.id
        FROM response_api_admedika r
        INNER JOIN registrasi_pasien_admedika reg
          ON r.no_mr = reg.no_mr
          AND r.no_registrasi = reg.no_registrasi
        WHERE r.no_mr = $1
          AND reg.is_void = 0
          AND r.is_claim = 1
        ORDER BY reg.tanggal_registrasi DESC, r.id DESC
      `;
      const result = await db.query(query, [noMr]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getResponseApiClaimByNoMr:', error);
      throw error;
    }
  }

  /**
   * Insert response API admedika
   */
  async insertResponseApi(data) {
    try {
      const query = `
        INSERT INTO response_api_admedika (
          no_mr, no_registrasi, no_claim, json_response,
          is_eligibility, is_claim
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, no_registrasi, no_claim
      `;

      const values = [
        data.no_mr,
        data.no_registrasi,
        data.no_claim,
        data.json_response, // JSONB
        data.is_eligibility || 0,
        data.is_claim || 0
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Model error - insertResponseApi:', error);
      throw error;
    }
  }

  /**
   * Update registrasi_pasien_admedika dengan data claim hasil discharge
   * UPDATE no_registrasi dari dummy (TEMP-ELIG-xxx) ke asli (2512010395)
   */
  async updateRegistrasiClaim(data) {
    try {
      const query = `
        UPDATE registrasi_pasien_admedika
        SET
          no_registrasi = $1,
          amount = $2,
          acc_amount = $3,
          decline_amount = $4,
          is_claim = $5,
          claim_date = $6,
          claim_by = $7,
          icd10 = $8,
          claim_status = $9,
          claim_desc = $10
        WHERE no_registrasi = $11
        RETURNING *
      `;

      const values = [
        data.no_registrasi,      // UPDATE value (asli)
        data.amount,
        data.acc_amount,
        data.decline_amount,
        data.is_claim,
        data.claim_date,
        data.claim_by,
        data.icd10,
        data.claim_status,
        data.claim_desc,
        data.no_registrasi_dummy // WHERE clause (dummy)
      ];

      console.log('🔄 UPDATE registrasi_pasien_admedika WHERE no_registrasi =', data.no_registrasi_dummy);
      console.log('   SET no_registrasi =', data.no_registrasi);

      const result = await db.query(query, values);

      if (!result.rows[0]) {
        console.warn('⚠️ UPDATE returned 0 rows - no_registrasi not found:', data.no_registrasi_dummy);
      } else {
        console.log('✓ UPDATE successful - no_registrasi changed:', data.no_registrasi_dummy, '→', data.no_registrasi);
      }

      return result.rows[0];
    } catch (error) {
      console.error('Model error - updateRegistrasiClaim:', error);
      throw error;
    }
  }

  /**
   * Insert transaksi pasien admedika (untuk discharge result)
   */
  async insertTransaksiDischarge(transaksiItems) {
    try {
      console.log('📋 Model - insertTransaksiDischarge: received', transaksiItems.length, 'items');

      // Check untuk duplikasi sebelum insert
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM transaksi_pasien_admedika
        WHERE no_registrasi = $1 AND no_claim = $2 AND kode_item = $3
      `;

      const insertQuery = `
        INSERT INTO transaksi_pasien_admedika (
          no_registrasi, no_claim, benefit_id, benefit_name,
          kode_item, nama_item, qty, total_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      const insertedItems = [];
      let itemIndex = 0;
      let skippedCount = 0;

      for (const item of transaksiItems) {
        itemIndex++;
        console.log(`📝 Processing item ${itemIndex}:`, JSON.stringify(item, null, 2));

        // Check apakah item sudah ada
        const checkResult = await db.query(checkQuery, [
          item.no_registrasi,
          item.no_claim,
          item.kode_item
        ]);

        if (parseInt(checkResult.rows[0].count) > 0) {
          console.log(`   ⚠️ Item ${itemIndex} already exists, skipping (no_registrasi: ${item.no_registrasi}, no_claim: ${item.no_claim}, kode_item: ${item.kode_item})`);
          skippedCount++;
          continue;
        }

        // Insert jika belum ada
        const values = [
          item.no_registrasi,
          item.no_claim,
          item.benefit_id,
          item.benefit_name,
          item.kode_item,
          item.nama_item,
          item.qty,
          item.total_amount
        ];

        console.log(`   Values:`, values);

        try {
          const result = await db.query(insertQuery, values);
          console.log(`   ✅ Item ${itemIndex} inserted with id:`, result.rows[0].id);
          insertedItems.push(result.rows[0]);
        } catch (itemError) {
          console.error(`   ❌ Failed to insert item ${itemIndex}:`, itemError.message);
          console.error(`   Error detail:`, itemError);
          throw itemError;
        }
      }

      console.log(`✅ Transaction items processed: ${insertedItems.length} inserted, ${skippedCount} skipped (duplicates)`);
      return insertedItems;
    } catch (error) {
      console.error('❌ Model error - insertTransaksiDischarge:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  /**
   * Insert response API discharge dengan is_claim = 1
   */
  async insertDischargeResponse(data) {
    try {
      console.log('📄 Model - insertDischargeResponse called');
      console.log('   no_mr:', data.no_mr);
      console.log('   no_registrasi:', data.no_registrasi);
      console.log('   no_claim:', data.no_claim);
      console.log('   json_response type:', typeof data.json_response);
      console.log('   json_response keys:', data.json_response ? Object.keys(data.json_response) : 'null');

      // Check apakah response sudah pernah di-insert sebelumnya
      const checkQuery = `
        SELECT id, no_registrasi, no_claim
        FROM response_api_admedika
        WHERE no_mr = $1 AND no_claim = $2 AND is_claim = 1
      `;

      const checkResult = await db.query(checkQuery, [data.no_mr, data.no_claim]);

      if (checkResult.rows.length > 0) {
        console.log('   ⚠️ Response API already exists, updating instead of inserting');
        console.log('   Existing record id:', checkResult.rows[0].id);

        // Update existing record
        const updateQuery = `
          UPDATE response_api_admedika
          SET json_response = $1,
              no_registrasi = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE no_mr = $3 AND no_claim = $4 AND is_claim = 1
          RETURNING id, no_registrasi, no_claim
        `;

        const updateResult = await db.query(updateQuery, [
          data.json_response,
          data.no_registrasi,
          data.no_mr,
          data.no_claim
        ]);

        console.log('   ✅ Response API updated with id:', updateResult.rows[0].id);
        return updateResult.rows[0];
      }

      // Insert baru jika belum ada
      const insertQuery = `
        INSERT INTO response_api_admedika (
          no_mr, no_registrasi, no_claim, json_response, is_claim
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, no_registrasi, no_claim
      `;

      const values = [
        data.no_mr,
        data.no_registrasi,
        data.no_claim,
        data.json_response, // JSONB
        1 // is_claim
      ];

      console.log('   Executing INSERT with values:', values.map((v, i) => i === 3 ? '[JSON]' : v));

      const result = await db.query(insertQuery, values);
      console.log('   ✅ Response API inserted with id:', result.rows[0].id);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Model error - insertDischargeResponse:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  /**
   * Update no_registrasi di response_api_admedika dari dummy ke asli
   */
  async updateResponseApiNoRegistrasi(data) {
    try {
      console.log('📝 Model - updateResponseApiNoRegistrasi called');
      console.log('   no_registrasi_dummy (WHERE):', data.no_registrasi_dummy);
      console.log('   no_registrasi_asli (SET):', data.no_registrasi);

      const query = `
        UPDATE response_api_admedika
        SET no_registrasi = $1
        WHERE no_registrasi = $2
        RETURNING id, no_mr, no_registrasi, no_claim
      `;

      const values = [
        data.no_registrasi,       // SET value (no asli)
        data.no_registrasi_dummy  // WHERE clause (dummy)
      ];

      console.log('   Executing UPDATE with values:', values);

      const result = await db.query(query, values);
      console.log('   ✅ Updated', result.rows.length, 'response_api records');
      return result.rows;
    } catch (error) {
      console.error('❌ Model error - updateResponseApiNoRegistrasi:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  /**
   * Update no_registrasi di benefit_pasien_admedika dari dummy ke asli
   */
  async updateBenefitPasienNoRegistrasi(data) {
    try {
      console.log('📝 Model - updateBenefitPasienNoRegistrasi called');
      console.log('   no_registrasi_dummy (WHERE):', data.no_registrasi_dummy);
      console.log('   no_registrasi_asli (SET):', data.no_registrasi);

      const query = `
        UPDATE benefit_pasien_admedika
        SET no_registrasi = $1
        WHERE no_registrasi = $2
        RETURNING id, no_registrasi, benefit_id, benefit_name
      `;

      const values = [
        data.no_registrasi,       // SET value (no asli)
        data.no_registrasi_dummy  // WHERE clause (dummy)
      ];

      console.log('   Executing UPDATE with values:', values);

      const result = await db.query(query, values);
      console.log('   ✅ Updated', result.rows.length, 'benefit_pasien records');
      return result.rows;
    } catch (error) {
      console.error('❌ Model error - updateBenefitPasienNoRegistrasi:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }

  /**
   * Save upload document record
   */
  async saveUploadDocument(data) {
    try {
      const query = `
        INSERT INTO upload_document_admedika (
          no_registrasi, no_mr, no_kartu, no_claim, doc_type, remarks,
          file_name, file_path, file_size, api_response, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, no_registrasi, file_name, created_at
      `;

      const values = [
        data.no_registrasi,
        data.no_mr,
        data.no_kartu,
        data.no_claim,
        data.doc_type,
        data.remarks,
        data.file_name,
        data.file_path,
        data.file_size,
        JSON.stringify(data.api_response),
        data.uploaded_by
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Model error - saveUploadDocument:', error);
      throw error;
    }
  }

  /**
   * Get upload document history by no_claim
   * Also handles NULL/empty no_claim for temporary registrations
   */
  async getUploadHistoryByNoClaim(noClaim) {
    try {
      // If no_claim is null/undefined/empty, return empty array
      if (!noClaim || noClaim === 'null' || noClaim === 'undefined') {
        console.log('getUploadHistoryByNoClaim: no_claim is empty, returning empty array');
        return [];
      }

      const query = `
        SELECT
          id,
          no_registrasi,
          no_mr,
          no_kartu,
          no_claim,
          doc_type,
          remarks,
          file_name,
          file_path,
          file_size,
          api_response,
          uploaded_by,
          created_at
        FROM upload_document_admedika
        WHERE no_claim = $1
        ORDER BY created_at DESC
      `;

      const result = await db.query(query, [noClaim]);
      return result.rows;
    } catch (error) {
      console.error('Model error - getUploadHistoryByNoClaim:', error);
      throw error;
    }
  }

  /**
   * Call Admedika API for Get Member Enrolled Plan TC
   */
  async getMemberEnrolledPlanTC(cardNo, covID, searchForTermCondition = '') {
    try {
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'GET_MEMBER_ENROLLED_PLAN_TC';

      // Generate tokenAuth
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare request payload
      const payload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            getMemberEnrolledPlanTCRequest: {
              getMemberEnrolledPlanTC: {
                cardNo: cardNo,
                covID: covID,
                searchForTermCondition: searchForTermCondition || ''
              }
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      console.log('📤 Admedika Get Member Enrolled Plan TC Request:', {
        url: config.admedika.baseUrl,
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        cardNo: cardNo,
        covID: covID,
        searchForTermCondition: searchForTermCondition
      });

      console.log('📋 Full Payload:', JSON.stringify(payload, null, 2));

      // Call Admedika API
      const response = await axios.post(config.admedika.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📥 Admedika Get Member Enrolled Plan TC Response Status:', response.status);

      return {
        success: true,
        data: response.data,
        requestInfo: {
          requestID: requestID,
          timestamp: timestamp,
          tokenAuth: tokenAuth
        }
      };
    } catch (error) {
      console.error('❌ Admedika Get Member Enrolled Plan TC API Error:', error.message);

      if (error.response) {
        return {
          success: false,
          error: 'Admedika API Error',
          message: error.response.data?.output?.statusMsg || error.message,
          statusCode: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'No Response from Admedika',
          message: 'Failed to connect to Admedika server',
        };
      } else {
        return {
          success: false,
          error: 'Request Error',
          message: error.message,
        };
      }
    }
  }

  /**
   * Call Admedika API for Check ICD Exclusion
   */
  async checkIcdExclusion(cardNo, covID, diagnosisCodeList) {
    try {
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'CHECK_ICD_EXCLUSION';

      // Generate tokenAuth
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare request payload
      const payload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            checkIcdExclusionRequest: {
              checkIcdExclusion: {
                cardNo: cardNo,
                covID: covID,
                diagnosisCodeList: diagnosisCodeList
              }
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      console.log('📤 Admedika Check ICD Exclusion Request:', {
        url: config.admedika.baseUrl,
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        cardNo: cardNo,
        covID: covID,
        diagnosisCodeList: diagnosisCodeList
      });

      console.log('📋 Full Payload:', JSON.stringify(payload, null, 2));

      // Call Admedika API
      const response = await axios.post(config.admedika.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log('📥 Admedika Check ICD Exclusion Response Status:', response.status);

      return {
        success: true,
        data: response.data,
        requestInfo: {
          requestID: requestID,
          timestamp: timestamp,
          tokenAuth: tokenAuth
        }
      };
    } catch (error) {
      console.error('❌ Admedika Check ICD Exclusion API Error:', error.message);

      if (error.response) {
        return {
          success: false,
          error: 'Admedika API Error',
          message: error.response.data?.output?.statusMsg || error.message,
          statusCode: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'No Response from Admedika',
          message: 'Failed to connect to Admedika server',
        };
      } else {
        return {
          success: false,
          error: 'Request Error',
          message: error.message,
        };
      }
    }
  }
}

module.exports = new AdmedikaModel();

