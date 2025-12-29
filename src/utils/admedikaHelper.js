const crypto = require('crypto');

/**
 * Generate SHA256 hash
 */
const generateSHA256 = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Generate random 5 digit requestID
 */
const generateRequestID = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

/**
 * Generate timestamp format: YYYYMMDDHHmmss (WIB - UTC+7)
 */
const generateTimestamp = () => {
  const now = new Date();
  
  // Convert to WIB (UTC+7)
  const wibOffset = 7 * 60; // 7 hours in minutes
  const localOffset = now.getTimezoneOffset(); // Local timezone offset in minutes
  const wibTime = new Date(now.getTime() + (wibOffset + localOffset) * 60000);
  
  const year = wibTime.getFullYear();
  const month = String(wibTime.getMonth() + 1).padStart(2, '0');
  const day = String(wibTime.getDate()).padStart(2, '0');
  const hours = String(wibTime.getHours()).padStart(2, '0');
  const minutes = String(wibTime.getMinutes()).padStart(2, '0');
  const seconds = String(wibTime.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Generate tokenAuth untuk Admedika
 * Format: SHA256(customerID:SHA256(securityWord):timestamp:requestID:serviceID)
 */
const generateAdmedikaToken = (customerID, securityWord, timestamp, requestID, serviceID) => {
  const securityWordHash = generateSHA256(securityWord);
  const rawToken = `${customerID}:${securityWordHash}:${timestamp}:${requestID}:${serviceID}`;
  return generateSHA256(rawToken);
};

module.exports = {
  generateSHA256,
  generateRequestID,
  generateTimestamp,
  generateAdmedikaToken,
};
