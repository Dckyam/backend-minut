const AdmedikaModel = require('../models/admedikaModel');

class AdmedikaService {
  /**
   * Get all coverage types
   */
  async getAllCoverageTypes() {
    try {
      const coverageTypes = await AdmedikaModel.getAllCoverageTypes();

      return {
        success: true,
        count: coverageTypes.length,
        data: coverageTypes
      };
    } catch (error) {
      console.error('Service error - getAllCoverageTypes:', error);
      return {
        success: false,
        message: 'Failed to fetch coverage types',
        error: error.message
      };
    }
  }

  /**
   * Get all document types
   */
  async getAllDocumentTypes() {
    try {
      const documentTypes = await AdmedikaModel.getAllDocumentTypes();

      return {
        success: true,
        count: documentTypes.length,
        data: documentTypes
      };
    } catch (error) {
      console.error('Service error - getAllDocumentTypes:', error);
      return {
        success: false,
        message: 'Failed to fetch document types',
        error: error.message
      };
    }
  }

  /**
   * Get document types by category
   */
  async getDocumentTypesByCategory(category) {
    try {
      const documentTypes = await AdmedikaModel.getDocumentTypesByCategory(category);

      return {
        success: true,
        count: documentTypes.length,
        data: documentTypes,
        category: category
      };
    } catch (error) {
      console.error('Service error - getDocumentTypesByCategory:', error);
      return {
        success: false,
        message: 'Failed to fetch document types by category',
        error: error.message
      };
    }
  }

  /**
   * Get registrasi by no_registrasi dengan auto include benefits
   */
  async getRegistrasiByNoReg(noRegistrasi) {
    try {
      const registrasi = await AdmedikaModel.getRegistrasiByNoReg(noRegistrasi);

      if (!registrasi) {
        return {
          success: false,
          message: 'Data registrasi tidak ditemukan atau sudah di-void'
        };
      }

      // Otomatis get benefits berdasarkan no_claim
      let benefits = [];
      if (registrasi.no_claim) {
        benefits = await AdmedikaModel.getBenefitsByNoClaim(registrasi.no_claim);
      }

      return {
        success: true,
        message: 'Data registrasi berhasil diambil',
        data: {
          registrasi: registrasi,
          benefits: benefits,
          total_benefits: benefits.length
        }
      };
    } catch (error) {
      console.error('Service error - getRegistrasiByNoReg:', error);
      return {
        success: false,
        message: 'Gagal mengambil data registrasi',
        error: error.message
      };
    }
  }

  /**
   * Get registrasi by no_mr and tanggal_registrasi dengan auto include benefits
   */
  async getRegistrasiByNoMrAndDate(noMr, tanggalRegistrasi) {
    try {
      const registrasiList = await AdmedikaModel.getRegistrasiByNoMrAndDate(noMr, tanggalRegistrasi);

      if (!registrasiList || registrasiList.length === 0) {
        return {
          success: false,
          message: 'Data registrasi tidak ditemukan atau sudah di-void'
        };
      }

      // Untuk setiap registrasi, ambil benefits
      const registrasiWithBenefits = await Promise.all(
        registrasiList.map(async (registrasi) => {
          let benefits = [];
          if (registrasi.no_claim) {
            benefits = await AdmedikaModel.getBenefitsByNoClaim(registrasi.no_claim);
          }
          return {
            ...registrasi,
            benefits: benefits,
            total_benefits: benefits.length
          };
        })
      );

      return {
        success: true,
        message: 'Data registrasi berhasil diambil',
        count: registrasiWithBenefits.length,
        data: registrasiWithBenefits
      };
    } catch (error) {
      console.error('Service error - getRegistrasiByNoMrAndDate:', error);
      return {
        success: false,
        message: 'Gagal mengambil data registrasi',
        error: error.message
      };
    }
  }

  /**
   * Convert Admedika date format to YYYY-MM-DD
   */
  convertAdmedikaDate(dateStr) {
    if (!dateStr) return null;

    const monthMap = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    // Format: "Feb-19-1991" atau "19-Feb-1991"
    const parts = dateStr.split('-');
    
    if (parts.length === 3) {
      // Cek format mana
      if (monthMap[parts[0]]) {
        // Format: Feb-19-1991
        return `${parts[2]}-${monthMap[parts[0]]}-${parts[1].padStart(2, '0')}`;
      } else if (monthMap[parts[1]]) {
        // Format: 19-Feb-1991
        return `${parts[2]}-${monthMap[parts[1]]}-${parts[0].padStart(2, '0')}`;
      }
    }

    return dateStr;
  }

  /**
   * Save registrasi dengan benefits
   */
  async saveRegistrasiWithBenefits(registrasiData, eligibilityResponse) {
    try {
      const clID = eligibilityResponse.eligibility?.clID;
      const cardNo = eligibilityResponse.eligibility?.cardNo;
      const dob = eligibilityResponse.eligibility?.dob;
      const clStatus = eligibilityResponse.eligibility?.clStatus || '';
      const clDesc = eligibilityResponse.eligibility?.clDesc || '';
      const entitlement = eligibilityResponse.entitlement;

      // PENJAMIN: Ambil dari request (registrasiData.penjamin), BUKAN dari API response
      // API response PayorName selalu berisi "jaminan Kesehatan" yang tidak akurat
      console.log('🔍 Penjamin check:');
      console.log('  - registrasiData.penjamin:', registrasiData.penjamin);
      console.log('  - API PayorName:', eligibilityResponse.eligibility?.PayorName);

      // PENTING: Hanya gunakan API PayorName jika registrasiData.penjamin benar-benar tidak ada
      const penjaminFinal = registrasiData.penjamin || eligibilityResponse.eligibility?.PayorName || '';
      console.log('  - Final penjamin to save:', penjaminFinal);

      const dataToInsert = {
        tanggal_registrasi: new Date().toISOString().split('T')[0],
        no_registrasi: registrasiData.no_registrasi,
        no_mr: registrasiData.no_mr,
        no_claim: parseInt(clID),
        coverage_id: registrasiData.coverage_id,
        coverage_code: registrasiData.coverage_code,
        coverage_desc: registrasiData.coverage_desc,
        nik: registrasiData.nik,
        nama_pasien: registrasiData.nama_pasien,
        tanggal_lahir: this.convertAdmedikaDate(dob),
        nama_layanan: registrasiData.nama_layanan,
        dokter: registrasiData.dokter,
        penjamin: penjaminFinal, // DARI FORM (prioritas), fallback ke API response
        no_kartu: cardNo,
        claim_status: clStatus,
        claim_desc: clDesc,
        icd10: registrasiData.icd10,
        amount: 0.00,
        acc_amount: 0.00,
        decline_amount: 0.00,
        created_by: registrasiData.created_by
      };

      const insertedRegistrasi = await AdmedikaModel.insertRegistrasi(dataToInsert);

      // Prepare benefits data dari entitlement
      const benefits = [];
      if (entitlement && Array.isArray(entitlement)) {
        entitlement.forEach(benefit => {
          benefits.push({
            no_registrasi: registrasiData.no_registrasi,
            no_claim: clID,
            benefit_id: benefit.benID || '',
            benefit_name: benefit.longName || '',
            avail_limit: benefit.availLimit || 'n/a',
            freq_desc: benefit.freqDesc || '',
            limit_desc: benefit.limitDesc || ''
          });
        });
      }

      // Insert benefits jika ada
      if (benefits.length > 0) {
        await AdmedikaModel.insertBenefits(benefits);
      }

      return {
        success: true,
        message: 'Registrasi dan benefit berhasil disimpan',
        data: {
          id: insertedRegistrasi.id,
          no_registrasi: registrasiData.no_registrasi,
          no_claim: clID,
          total_benefits: benefits.length
        }
      };
    } catch (error) {
      console.error('Service error - saveRegistrasiWithBenefits:', error);
      return {
        success: false,
        message: 'Gagal menyimpan data registrasi',
        error: error.message
      };
    }
  }

  /**
   * Void registrasi by no_kartu
   */
  async voidRegistrasiByNoKartu(noKartu, voidBy, voidRemarks) {
    try {
      const voidedRecords = await AdmedikaModel.voidRegistrasiByNoKartu(noKartu, voidBy, voidRemarks);

      if (voidedRecords.length === 0) {
        return {
          success: false,
          message: 'Tidak ada registrasi aktif yang ditemukan dengan no_kartu tersebut'
        };
      }

      return {
        success: true,
        message: 'Registrasi berhasil di-void',
        data: {
          total_voided: voidedRecords.length,
          records: voidedRecords
        }
      };
    } catch (error) {
      console.error('Service error - voidRegistrasiByNoKartu:', error);
      return {
        success: false,
        message: 'Gagal void registrasi',
        error: error.message
      };
    }
  }

  /**
   * Check eligibility from Admedika
   */
  async checkEligibility(cardNo, covID, registrasiData = null) {
    try {
      // Validasi input
      if (!cardNo || !covID) {
        return {
          success: false,
          message: 'cardNo and covID are required'
        };
      }

      // Call Admedika API through model
      const result = await AdmedikaModel.checkEligibility(cardNo, covID);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to check eligibility',
          error: result.error,
          data: result.data
        };
      }

      // Process successful response
      const output = result.data?.output;
      
      const responseData = {
        referenceID: output?.referenceID,
        statusCode: output?.statusCode,
        statusMsg: output?.statusMsg,
        eligibility: output?.txnData?.eligibilityResponse?.eligibility,
        entitlement: output?.txnData?.eligibilityResponse?.eligibility?.entitlement,
        txnResponseDatetime: output?.txnResponseDatetime,
        server: output?.server
      };

      // Jika statusCode "00" atau 0 (berhasil) dan ada registrasiData, simpan ke database
      let registrasiResult = null;
      let responseApiResult = null;
      
      console.log('🔍 Check save condition - statusCode:', output?.statusCode, 'hasRegistrasiData:', !!registrasiData);
      
      if ((output?.statusCode === "00" || output?.statusCode === 0) && registrasiData) {
        console.log('✅ Condition met, saving to database...');
        
        // Save registrasi dan benefits
        registrasiResult = await this.saveRegistrasiWithBenefits(
          registrasiData,
          responseData
        );
        console.log('✓ Registrasi saved:', registrasiResult);

        // Save response API
        try {
          const clID = responseData.eligibility?.clID;
          const responseApiData = {
            no_mr: registrasiData.no_mr,
            no_registrasi: registrasiData.no_registrasi,
            no_claim: parseInt(clID),
            json_response: result.data, // Full response dari API
            is_eligibility: 1, // 1 karena ini dari eligibility check
            is_claim: 0
          };

          responseApiResult = await AdmedikaModel.insertResponseApi(responseApiData);
          console.log('✓ Response API saved:', responseApiResult);
        } catch (error) {
          console.error('❌ Error saving response API:', error);
          // Tidak throw error, tetap lanjut karena registrasi sudah tersimpan
        }
      } else {
        console.log('❌ Condition NOT met, skipping database save');
      }

      return {
        success: true,
        message: 'Eligibility check successful',
        data: responseData,
        registrasi: registrasiResult,
        responseApi: responseApiResult,
        requestInfo: result.requestInfo
      };
    } catch (error) {
      console.error('Service error - checkEligibility:', error);
      return {
        success: false,
        message: 'Failed to check eligibility',
        error: error.message
      };
    }
  }

  /**
   * Cancel open claims transaction
   * Otomatis void registrasi di database jika cancel berhasil
   */
  async cancelOpenClaimsTxn(cardNo, remarks, voidBy = null) {
    try {
      // Validasi input
      if (!cardNo || !remarks) {
        return {
          success: false,
          message: 'cardNo and remarks are required'
        };
      }

      // Call Admedika API through model
      const result = await AdmedikaModel.cancelOpenClaimsTxn(cardNo, remarks);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to cancel open claims transaction',
          error: result.error,
          data: result.data
        };
      }

      // Process successful response
      const output = result.data?.output;
      
      const responseData = {
        referenceID: output?.referenceID,
        statusCode: output?.statusCode,
        statusMsg: output?.statusMsg,
        cancelOpenClaimTxn: output?.txnData?.cancelOpenClaimTxnResponse?.cancelOpenClaimTxn,
        txnResponseDatetime: output?.txnResponseDatetime,
        server: output?.server
      };

      // Jika statusCode "00" atau 0 (berhasil) dan ada voidBy, void registrasi di database
      let voidResult = null;
      if ((output?.statusCode === "00" || output?.statusCode === 0) && voidBy) {
        console.log('Voiding registration for cardNo:', cardNo, 'by:', voidBy);
        voidResult = await this.voidRegistrasiByNoKartu(
          cardNo,
          voidBy,
          remarks
        );
        console.log('Void result:', voidResult);
      } else {
        console.log('Skipping void - statusCode:', output?.statusCode, 'voidBy:', voidBy);
      }

      return {
        success: true,
        message: output?.statusCode === "00" ? 'Cancel open claims transaction successful' : 'Transaction sent but not successful',
        data: responseData,
        void: voidResult,
        requestInfo: result.requestInfo
      };
    } catch (error) {
      console.error('Service error - cancelOpenClaimsTxn:', error);
      return {
        success: false,
        message: 'Failed to cancel open claims transaction',
        error: error.message
      }
    }
  }

  /**
   * Get entitlement from Admedika
   */
  async getEntitlement(cardNo) {
    try {
      // Validasi input
      if (!cardNo) {
        return {
          success: false,
          message: 'cardNo is required'
        };
      }

      // Call Admedika API through model
      const result = await AdmedikaModel.getEntitlement(cardNo);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to get entitlement',
          error: result.error,
          data: result.data
        };
      }

      // Process successful response
      const output = result.data?.output;
      
      return {
        success: true,
        message: 'Get entitlement successful',
        data: {
          referenceID: output?.referenceID,
          statusCode: output?.statusCode,
          statusMsg: output?.statusMsg,
          entitlement: output?.txnData?.getEntitlementResponse?.getEntitlement,
          txnResponseDatetime: output?.txnResponseDatetime,
          server: output?.server
        },
        requestInfo: result.requestInfo
      };
    } catch (error) {
      console.error('Service error - getEntitlement:', error);
      return {
        success: false,
        message: 'Failed to get entitlement',
        error: error.message
      };
    }
  }

  /**
   * Save transaksi mapping
   */
  async saveTransaksiMapping(mappingData) {
    try {
      const { no_registrasi, no_claim, items } = mappingData;

      // Validasi input
      if (!no_registrasi || !no_claim || !items || !Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          message: 'Invalid input: no_registrasi, no_claim, and items array are required'
        };
      }

      // Prepare data untuk insert
      const transaksiItems = items.map(item => ({
        no_registrasi: no_registrasi,
        no_claim: no_claim,
        benefit_id: item.benefit_id,
        benefit_name: item.benefit_name,
        kode_item: item.kode_item || item.item_code,
        nama_item: item.nama_item || item.item,
        qty: parseFloat(item.qty || item.jml || 0),
        total_amount: parseInt(item.total_amount || item.tot_harga || 0)
      }));

      // Insert ke database
      const insertedItems = await AdmedikaModel.insertTransaksiMapping(transaksiItems);

      return {
        success: true,
        message: 'Transaksi mapping berhasil disimpan',
        data: {
          total_items: insertedItems.length,
          items: insertedItems
        }
      };
    } catch (error) {
      console.error('Service error - saveTransaksiMapping:', error);
      return {
        success: false,
        message: 'Failed to save transaksi mapping',
        error: error.message
      };
    }
  }

  /**
   * Get transaksi mapping by no_registrasi
   */
  async getTransaksiMapping(noRegistrasi) {
    try {
      const transaksi = await AdmedikaModel.getTransaksiByNoReg(noRegistrasi);

      // Group by benefit_id
      const groupedByBenefit = transaksi.reduce((acc, item) => {
        const key = item.benefit_id;
        if (!acc[key]) {
          acc[key] = {
            benefit_id: item.benefit_id,
            benefit_name: item.benefit_name,
            items: []
          };
        }
        acc[key].items.push({
          id: item.id,
          kode_item: item.kode_item,
          nama_item: item.nama_item,
          qty: item.qty,
          total_amount: item.total_amount
        });
        return acc;
      }, {});

      return {
        success: true,
        message: 'Data transaksi mapping berhasil diambil',
        data: {
          no_registrasi: noRegistrasi,
          no_claim: transaksi.length > 0 ? transaksi[0].no_claim : null,
          total_items: transaksi.length,
          benefits: Object.values(groupedByBenefit)
        }
      };
    } catch (error) {
      console.error('Service error - getTransaksiMapping:', error);
      return {
        success: false,
        message: 'Failed to get transaksi mapping',
        error: error.message
      };
    }
  }

  /**
   * Get transaksi mapping by no_claim
   */
  async getTransaksiByNoClaim(noClaim) {
    try {
      const transaksi = await AdmedikaModel.getTransaksiByNoClaim(noClaim);

      // Group by benefit_id
      const groupedByBenefit = transaksi.reduce((acc, item) => {
        const key = item.benefit_id;
        if (!acc[key]) {
          acc[key] = {
            benefit_id: item.benefit_id,
            benefit_name: item.benefit_name,
            items: []
          };
        }
        acc[key].items.push({
          id: item.id,
          kode_item: item.kode_item,
          nama_item: item.nama_item,
          qty: item.qty,
          total_amount: item.total_amount
        });
        return acc;
      }, {});

      return {
        success: true,
        message: 'Data transaksi mapping berhasil diambil',
        data: {
          no_claim: noClaim,
          no_registrasi: transaksi.length > 0 ? transaksi[0].no_registrasi : null,
          total_items: transaksi.length,
          benefits: Object.values(groupedByBenefit)
        }
      };
    } catch (error) {
      console.error('Service error - getTransaksiByNoClaim:', error);
      return {
        success: false,
        message: 'Failed to get transaksi mapping by no_claim',
        error: error.message
      };
    }
  }

  /**
   * Hello World - Test koneksi ke Admedika
   */
  async helloWorld() {
    try {
      // Call Admedika API through model
      const result = await AdmedikaModel.helloWorld();

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to connect to Admedika',
          error: result.error,
          data: result.data
        };
      }

      // Process successful response
      const output = result.data?.output;
      
      return {
        success: true,
        message: 'Hello World successful',
        data: {
          referenceID: output?.referenceID,
          statusCode: output?.statusCode,
          statusMsg: output?.statusMsg,
          helloWorld: output?.txnData?.helloResponse?.helloWorld,
          txnResponseDatetime: output?.txnResponseDatetime,
          server: output?.server
        },
        requestInfo: result.requestInfo
      };
    } catch (error) {
      console.error('Service error - helloWorld:', error);
      return {
        success: false,
        message: 'Failed to connect to Admedika',
        error: error.message
      };
    }
  }

  /**
   * Discharge OP - Submit discharge dengan entitlement dari extension
   */
  async dischargeOP(requestData) {
    try {
      const { cardNo, diagnosisCodeList, mcDays, physicianName, accidentFlag, surgicalFlag, remarks, entitlement } = requestData;

      // Validasi input
      if (!cardNo) {
        return {
          success: false,
          message: 'cardNo is required'
        };
      }

      if (!entitlement || !Array.isArray(entitlement) || entitlement.length === 0) {
        return {
          success: false,
          message: 'entitlement data is required'
        };
      }

      // Prepare discharge data
      const dischargeData = {
        diagnosisCodeList: diagnosisCodeList || '',
        mcDays: mcDays || '',
        physicianName: physicianName || '',
        accidentFlag: accidentFlag || 'N',
        surgicalFlag: surgicalFlag || 'N',
        remarks: remarks || ''
      };

      // Call Admedika API
      const result = await AdmedikaModel.dischargeOP(cardNo, dischargeData, entitlement);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to discharge OP',
          error: result.error,
          data: result.data
        };
      }

      // Process successful response
      const output = result.data?.output;

      // Calculate total items from entitlement
      const totalItems = entitlement.reduce((sum, benefit) => {
        return sum + (benefit.benItemList ? benefit.benItemList.length : 0);
      }, 0);

      // Check if there's an error from Admedika API
      const hasError = output?.statusCode && output.statusCode !== '00' && output.statusCode !== 0;

      return {
        success: !hasError,
        message: hasError ? `Admedika API Error: ${output?.statusMsg || 'Unknown error'}` : 'Discharge OP successful',
        data: {
          referenceID: output?.referenceID,
          statusCode: output?.statusCode,
          statusMsg: output?.statusMsg,
          discharge: output?.txnData?.dischargeResponse?.discharge,
          txnResponseDatetime: output?.txnResponseDatetime,
          server: output?.server,
          // Include full txnData for debugging
          fullTxnData: output?.txnData
        },
        requestInfo: result.requestInfo,
        entitlementSummary: {
          total_benefits: entitlement.length,
          total_items: totalItems,
          benefits: entitlement.map(b => ({
            benID: b.benID,
            benAmount: b.benAmount,
            items_count: b.benItemList ? b.benItemList.length : 0
          }))
        },
        // Include full raw response for debugging
        rawResponse: result.data
      };
    } catch (error) {
      console.error('Service error - dischargeOP:', error);
      return {
        success: false,
        message: 'Failed to discharge OP',
        error: error.message
      };
    }
  }

  /**
   * Get response API by no_mr
   * JOIN dengan registrasi_pasien_admedika untuk filter is_void = 0
   */
  async getResponseApiByNoMr(noMr) {
    try {
      const responseApi = await AdmedikaModel.getResponseApiByNoMr(noMr);

      if (!responseApi || responseApi.length === 0) {
        return {
          success: false,
          message: 'Data response API tidak ditemukan'
        };
      }

      return {
        success: true,
        message: 'Data response API berhasil diambil',
        count: responseApi.length,
        data: responseApi
      };
    } catch (error) {
      console.error('Service error - getResponseApiByNoMr:', error);
      return {
        success: false,
        message: 'Failed to get response API data',
        error: error.message
      };
    }
  }

  /**
   * Get riwayat registrasi by No MR
   */
  async getRiwayatRegistrasiByNoMr(noMr) {
    try {
      const riwayat = await AdmedikaModel.getRiwayatRegistrasiByNoMr(noMr);

      if (!riwayat || riwayat.length === 0) {
        return {
          success: false,
          message: 'Data riwayat registrasi tidak ditemukan'
        };
      }

      return {
        success: true,
        message: 'Data riwayat registrasi berhasil diambil',
        count: riwayat.length,
        data: riwayat
      };
    } catch (error) {
      console.error('Service error - getRiwayatRegistrasiByNoMr:', error);
      return {
        success: false,
        message: 'Failed to get riwayat registrasi data',
        error: error.message
      };
    }
  }

  /**
   * Get response API CLAIM by no_mr (untuk cetak ulang di kasir-cibinong)
   * JOIN dengan registrasi_pasien_admedika untuk filter is_void = 0
   * WHERE is_claim = 1
   */
  async getResponseApiClaimByNoMr(noMr) {
    try {
      const responseApi = await AdmedikaModel.getResponseApiClaimByNoMr(noMr);

      if (!responseApi || responseApi.length === 0) {
        return {
          success: false,
          message: 'Data response API claim tidak ditemukan'
        };
      }

      return {
        success: true,
        message: 'Data response API claim berhasil diambil',
        count: responseApi.length,
        data: responseApi
      };
    } catch (error) {
      console.error('Service error - getResponseApiClaimByNoMr:', error);
      return {
        success: false,
        message: 'Failed to get response API claim data',
        error: error.message
      };
    }
  }

  /**
   * Save discharge result - Update registrasi, insert transaksi, dan insert response API
   */
  async saveDischargeResult(data) {
    try {
      const {
        no_registrasi_dummy,  // Untuk WHERE clause (TEMP-ELIG-xxx)
        no_registrasi,        // Untuk UPDATE value (no asli)
        no_mr,
        no_claim,
        claim_by,
        icd10,
        discharge_response,
        transaction_items
      } = data;

      // Validasi input
      if (!no_registrasi || !no_mr || !no_claim || !discharge_response) {
        return {
          success: false,
          message: 'no_registrasi, no_mr, no_claim, and discharge_response are required'
        };
      }

      console.log('📋 No Registrasi untuk save:', {
        dummy: no_registrasi_dummy,
        asli: no_registrasi
      });

      // Extract data dari response
      const dischargeData = discharge_response.output?.txnData?.dischargeRequestResponse?.dischargeRequest;

      if (!dischargeData) {
        console.error('❌ Invalid discharge response structure:', discharge_response);
        return {
          success: false,
          message: 'Invalid discharge response structure'
        };
      }

      console.log('📋 Discharge data extracted:', {
        totAmtIncurred: dischargeData.totAmtIncurred,
        totAmtApproved: dischargeData.totAmtApproved,
        totAmtNotApproved: dischargeData.totAmtNotApproved,
        clStatus: dischargeData.clStatus,
        clDesc: dischargeData.clDesc
      });

      // 1. Update registrasi_pasien_admedika
      // Gunakan no_registrasi_dummy untuk WHERE, no_registrasi untuk UPDATE
      const updateData = {
        no_registrasi_dummy: no_registrasi_dummy || no_registrasi, // WHERE (fallback ke asli jika dummy tidak ada)
        no_registrasi: no_registrasi,        // SET value (no asli)
        amount: dischargeData.totAmtIncurred || '0',
        acc_amount: dischargeData.totAmtApproved || '0',
        decline_amount: dischargeData.totAmtNotApproved || '0',
        is_claim: 1,
        claim_date: new Date(),
        claim_by: claim_by || 'System',
        icd10: icd10 || '',
        claim_status: dischargeData.clStatus || '',
        claim_desc: dischargeData.clDesc || ''
      };

      console.log('📤 Updating registrasi with data:', updateData);
      const updatedRegistrasi = await AdmedikaModel.updateRegistrasiClaim(updateData);

      // 1b. Update response_api_admedika - ubah no_registrasi dari dummy ke asli
      console.log('📊 Step 1b: Update response_api_admedika no_registrasi');
      let updatedResponseApi = [];
      if (no_registrasi_dummy && no_registrasi_dummy !== no_registrasi) {
        try {
          const updateResponseApiData = {
            no_registrasi_dummy: no_registrasi_dummy,  // WHERE (TEMP-ELIG-xxx)
            no_registrasi: no_registrasi                // SET (no asli)
          };
          updatedResponseApi = await AdmedikaModel.updateResponseApiNoRegistrasi(updateResponseApiData);
          console.log('✓ Updated response_api records:', updatedResponseApi.length);
        } catch (updateError) {
          console.error('❌ Failed to update response_api no_registrasi:', updateError.message);
          // Don't throw, just log warning - this is not critical
          console.warn('⚠️ Continuing despite response_api update failure');
        }
      } else {
        console.log('ℹ️ No dummy no_registrasi, skipping response_api update');
      }

      // 1c. Update benefit_pasien_admedika - ubah no_registrasi dari dummy ke asli
      console.log('📊 Step 1c: Update benefit_pasien_admedika no_registrasi');
      let updatedBenefitPasien = [];
      if (no_registrasi_dummy && no_registrasi_dummy !== no_registrasi) {
        try {
          const updateBenefitPasienData = {
            no_registrasi_dummy: no_registrasi_dummy,  // WHERE (TEMP-ELIG-xxx)
            no_registrasi: no_registrasi                // SET (no asli)
          };
          updatedBenefitPasien = await AdmedikaModel.updateBenefitPasienNoRegistrasi(updateBenefitPasienData);
          console.log('✓ Updated benefit_pasien records:', updatedBenefitPasien.length);
        } catch (updateError) {
          console.error('❌ Failed to update benefit_pasien no_registrasi:', updateError.message);
          // Don't throw, just log warning - this is not critical
          console.warn('⚠️ Continuing despite benefit_pasien update failure');
        }
      } else {
        console.log('ℹ️ No dummy no_registrasi, skipping benefit_pasien update');
      }

      // 2. Insert transaksi_pasien_admedika
      console.log('📊 Step 2: Insert transaction items');
      let insertedTransaksi = [];
      if (transaction_items && Array.isArray(transaction_items) && transaction_items.length > 0) {
        console.log('📤 Inserting transaction items:', transaction_items.length, 'items');
        console.log('📋 Sample transaction item:', JSON.stringify(transaction_items[0], null, 2));
        try {
          insertedTransaksi = await AdmedikaModel.insertTransaksiDischarge(transaction_items);
          console.log('✓ Inserted transactions:', insertedTransaksi.length);
        } catch (transaksiError) {
          console.error('❌ Failed to insert transaction items:', transaksiError.message);
          throw transaksiError;
        }
      } else {
        console.warn('⚠️ No transaction items to insert - transaction_items:', transaction_items);
      }

      // 3. Insert response_api_admedika
      console.log('📊 Step 3: Insert response API');
      const responseData = {
        no_mr: no_mr,
        no_registrasi: no_registrasi,
        no_claim: no_claim,
        json_response: discharge_response
      };

      console.log('📤 Preparing response data:', {
        no_mr: responseData.no_mr,
        no_registrasi: responseData.no_registrasi,
        no_claim: responseData.no_claim,
        has_json_response: !!responseData.json_response
      });

      let insertedResponse;
      try {
        insertedResponse = await AdmedikaModel.insertDischargeResponse(responseData);
        console.log('✓ Response API inserted');
      } catch (responseError) {
        console.error('❌ Failed to insert response API:', responseError.message);
        throw responseError;
      }

      return {
        success: true,
        message: 'Discharge result saved successfully',
        data: {
          registrasi: updatedRegistrasi,
          updated_response_api_count: updatedResponseApi.length,
          updated_benefit_pasien_count: updatedBenefitPasien.length,
          transaksi_count: insertedTransaksi.length,
          response_api: insertedResponse
        }
      };
    } catch (error) {
      console.error('Service error - saveDischargeResult:', error);
      return {
        success: false,
        message: 'Failed to save discharge result',
        error: error.message
      };
    }
  }

  /**
   * Upload document to Admedika API
   */
  async uploadDocument(uploadData, file) {
    try {
      const axios = require('axios');
      const FormData = require('form-data');
      const s3Service = require('./s3Service');
      const { generateAdmedikaToken, generateRequestID, generateTimestamp } = require('../utils/admedikaHelper');
      const config = require('../config/config');

      // Generate requestID and timestamp properly
      const requestID = generateRequestID();
      const timestamp = generateTimestamp();
      const serviceID = 'EDOCS_UPLOAD';

      // Generate tokenAuth using proper hash method
      const tokenAuth = generateAdmedikaToken(
        config.admedika.customerID,
        config.admedika.securityWord,
        timestamp,
        requestID,
        serviceID
      );

      // Prepare API payload sesuai contoh JSON yang benar
      const apiPayload = {
        input: {
          tokenAuth: tokenAuth,
          serviceID: serviceID,
          customerID: config.admedika.customerID,
          requestID: requestID,
          txnData: {
            edocsUploadRequest: {
              edocsUpload: {
                cardNo: String(uploadData.cardNo),
                clID: String(uploadData.clID),
                docType: uploadData.docType,
                remarks: uploadData.remarks || '',
                patientName: uploadData.patientName
              }
            }
          },
          txnRequestDateTime: timestamp
        }
      };

      // Create FormData

      // Per dokumentasi EDOCS_UPLOAD - menggunakan form-data standard:
      // - Field 'data' berisi complete JSON input request format
      // - Field 'files' berisi file source (binary file)
      const formData = new FormData();
      const dataPayload = JSON.stringify(apiPayload.input);
      formData.append('data', dataPayload);

      // Send file as binary buffer (standard multipart/form-data)
      formData.append('files', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      console.log('📤 Uploading document to Admedika API:', {
        requestID: requestID,
        timestamp: timestamp,
        tokenAuth: tokenAuth,
        cardNo: uploadData.cardNo,
        clID: uploadData.clID,
        docType: uploadData.docType,
        fileName: file.originalname
      });
      console.log('📋 Full Payload:', JSON.stringify(apiPayload, null, 2));
      console.log('📦 FormData field "data":', dataPayload.substring(0, 200) + '...');


      // Call Admedika API
      // Khusus uploadDocument, gunakan URL dari .env ADMEDIKA_BASE_URL_PROD
      const uploadUrl = process.env.ADMEDIKA_BASE_URL_PROD || config.admedika.baseUrl;
      console.log('📡 Upload URL:', uploadUrl);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 seconds
      });

      console.log('✅ API Response:', response.data);

      // Check if API response is successful
      const apiOutput = response.data?.output;
      const statusCode = apiOutput?.statusCode;

      // Admedika API returns statusCode 501 for errors
      if (statusCode && statusCode !== 0 && statusCode !== 200) {
        console.error('❌ Admedika API Error:', {
          statusCode: statusCode,
          statusMsg: apiOutput?.statusMsg
        });

        return {
          success: false,
          message: `Admedika API Error: ${apiOutput?.statusMsg || 'Unknown error'}`,
          error: {
            statusCode: statusCode,
            statusMsg: apiOutput?.statusMsg,
            api_response: response.data
          }
        };
      }

      // Upload file to S3 ONLY if API is successful
      console.log('☁️ Uploading file to S3...');

      const s3Metadata = {
        no_registrasi: uploadData.no_registrasi,
        no_mr: uploadData.no_mr,
        no_kartu: uploadData.cardNo,
        no_claim: uploadData.clID,
        doc_type: uploadData.docType,
        uploaded_by: uploadData.uploaded_by || 'system'
      };

      const s3UploadResult = await s3Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        s3Metadata
      );

      console.log('✅ File uploaded to S3:', {
        key: s3UploadResult.s3Key,
        url: s3UploadResult.url,
        size: s3UploadResult.size
      });

      // Save record to database with S3 path
      const recordData = {
        no_registrasi: uploadData.no_registrasi,
        no_mr: uploadData.no_mr,
        no_kartu: uploadData.cardNo,
        no_claim: uploadData.clID,
        doc_type: uploadData.docType,
        remarks: uploadData.remarks,
        file_name: file.originalname,
        file_path: s3UploadResult.s3Key, // Store S3 key instead of local path
        file_size: file.size,
        api_response: response.data,
        uploaded_by: uploadData.uploaded_by || 'system'
      };

      const savedRecord = await AdmedikaModel.saveUploadDocument(recordData);
      console.log('✅ Upload record saved to database:', savedRecord);

      return {
        success: true,
        message: 'Document uploaded successfully',
        data: {
          record: savedRecord,
          s3_url: s3UploadResult.url,
          s3_key: s3UploadResult.s3Key,
          api_response: response.data
        }
      };
    } catch (error) {
      console.error('Service error - uploadDocument:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      return {
        success: false,
        message: 'Failed to upload document',
        error: error.message,
        errorDetails: error.response?.data
      };
    }
  }

  /**
   * Get upload document history
   */
  async getUploadHistory(noRegistrasi) {
    try {
      const history = await AdmedikaModel.getUploadHistoryByNoRegistrasi(noRegistrasi);

      if (!history || history.length === 0) {
        return {
          success: false,
          message: 'No upload history found'
        };
      }

      return {
        success: true,
        message: 'Upload history retrieved successfully',
        count: history.length,
        data: history
      };
    } catch (error) {
      console.error('Service error - getUploadHistory:', error);
      return {
        success: false,
        message: 'Failed to get upload history',
        error: error.message
      };
    }
  }

  /**
   * Get Member Enrolled Plan TC from Admedika
   */
  async getMemberEnrolledPlanTC(cardNo, covID, searchForTermCondition = '') {
    try {
      // Validasi input
      if (!cardNo || !covID) {
        return {
          success: false,
          message: 'cardNo and covID are required'
        };
      }

      // Call Admedika API through model
      const result = await AdmedikaModel.getMemberEnrolledPlanTC(cardNo, covID, searchForTermCondition);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to get member enrolled plan TC',
          error: result.error,
          data: result.data
        };
      }

      // Process successful response
      const output = result.data?.output;

      return {
        success: true,
        message: 'Get member enrolled plan TC successful',
        data: {
          referenceID: output?.referenceID,
          statusCode: output?.statusCode,
          statusMsg: output?.statusMsg,
          memberPlanTC: output?.txnData?.getMemberEnrolledPlanTCResponse?.getMemberEnrolledPlanTC,
          txnResponseDatetime: output?.txnResponseDatetime,
          server: output?.server
        },
        requestInfo: result.requestInfo
      };
    } catch (error) {
      console.error('Service error - getMemberEnrolledPlanTC:', error);
      return {
        success: false,
        message: 'Failed to get member enrolled plan TC',
        error: error.message
      };
    }
  }

  /**
   * Check ICD Exclusion from Admedika
   */
  async checkIcdExclusion(cardNo, covID, diagnosisCodeList) {
    try {
      // Validasi input
      if (!cardNo || !covID || !diagnosisCodeList) {
        return {
          success: false,
          message: 'cardNo, covID, and diagnosisCodeList are required'
        };
      }

      // Call Admedika API through model
      const result = await AdmedikaModel.checkIcdExclusion(cardNo, covID, diagnosisCodeList);

      if (!result.success) {
        return {
          success: false,
          message: result.message || 'Failed to check ICD exclusion',
          error: result.error,
          data: result.data
        };
      }

      // Process successful response
      const output = result.data?.output;

      return {
        success: true,
        message: 'Check ICD exclusion successful',
        data: {
          referenceID: output?.referenceID,
          statusCode: output?.statusCode,
          statusMsg: output?.statusMsg,
          icdExclusion: output?.txnData?.checkIcdExclusionResponse?.checkIcdExclusion,
          txnResponseDatetime: output?.txnResponseDatetime,
          server: output?.server
        },
        requestInfo: result.requestInfo
      };
    } catch (error) {
      console.error('Service error - checkIcdExclusion:', error);
      return {
        success: false,
        message: 'Failed to check ICD exclusion',
        error: error.message
      };
    }
  }
}

module.exports = new AdmedikaService();
