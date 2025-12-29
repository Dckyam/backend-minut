const express = require('express');
const admedikaController = require('../controllers/admedikaController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage (file akan disimpan di memory buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

const router = express.Router();

// Coverage Types - Protected dengan JWT
router.get('/coverage-types', authMiddleware, admedikaController.getAllCoverageTypes);

// Document Types - Protected dengan JWT
router.get('/document-types', authMiddleware, admedikaController.getAllDocumentTypes);
router.get('/document-types/:category', authMiddleware, admedikaController.getDocumentTypesByCategory);

// Registrasi - Protected dengan JWT
router.get('/registrasi/:noRegistrasi', authMiddleware, admedikaController.getRegistrasiByNoReg);
router.get('/registrasi/by-mr-date/:noMr/:tanggalRegistrasi', authMiddleware, admedikaController.getRegistrasiByNoMrAndDate);

// Response API - Protected dengan JWT
router.get('/response-api/:noMr', authMiddleware, admedikaController.getResponseApiByNoMr);
router.get('/response-api-claim/:noMr', authMiddleware, admedikaController.getResponseApiClaimByNoMr);

// Riwayat Registrasi - Protected dengan JWT
router.get('/riwayat-registrasi/:noMr', authMiddleware, admedikaController.getRiwayatRegistrasiByNoMr);

// Transaksi Mapping - Protected dengan JWT
router.post('/transaksi-mapping', authMiddleware, admedikaController.saveTransaksiMapping);
router.get('/transaksi-mapping/:noRegistrasi', authMiddleware, admedikaController.getTransaksiMapping);
router.get('/transaksi-mapping/claim/:noClaim', authMiddleware, admedikaController.getTransaksiByNoClaim);

// Check eligibility - Protected dengan JWT
router.post('/eligibility', authMiddleware, admedikaController.checkEligibility);

// Discharge OP - Protected dengan JWT
router.post('/discharge-op', authMiddleware, admedikaController.dischargeOP);

// Save discharge result - Protected dengan JWT
router.post('/save-discharge-result', authMiddleware, admedikaController.saveDischargeResult);

// Cancel open claims transaction - Protected dengan JWT
router.post('/cancel-open-claims', authMiddleware, admedikaController.cancelOpenClaimsTxn);

// Get entitlement - Protected dengan JWT
router.post('/get-entitlement', authMiddleware, admedikaController.getEntitlement);

// Get eligibility preview - Protected dengan JWT
router.post('/eligibility-preview', authMiddleware, admedikaController.getEligibilityPreview);

// Get discharge preview - Protected dengan JWT
router.post('/discharge-preview', authMiddleware, admedikaController.getDischargePreview);

// Generate PDF for eligibility - Protected dengan JWT
router.post('/generate-pdf', authMiddleware, admedikaController.generateEligibilityPDF);

// Generate PDF for discharge - Protected dengan JWT
router.post('/generate-pdf-discharge', authMiddleware, admedikaController.generateDischargePDF);

// Hello World - Protected dengan JWT
router.post('/hello-world', authMiddleware, admedikaController.helloWorld);

// Upload Document - Protected dengan JWT
router.post('/upload-document', authMiddleware, upload.single('file'), admedikaController.uploadDocument);

// Get Upload History - Protected dengan JWT
router.get('/upload-history/:noRegistrasi', authMiddleware, admedikaController.getUploadHistory);

// Download Document - Protected dengan JWT
router.get('/download-document/:id', authMiddleware, admedikaController.downloadDocument);

// Get Member Enrolled Plan TC - Protected dengan JWT
router.post('/member-enrolled-plan-tc', authMiddleware, admedikaController.getMemberEnrolledPlanTC);

// Check ICD Exclusion - Protected dengan JWT
router.post('/check-icd-exclusion', authMiddleware, admedikaController.checkIcdExclusion);

module.exports = router;
