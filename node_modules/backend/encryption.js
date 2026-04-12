const crypto = require('crypto');

// 🔐 AES-256-CBC Encryption for sensitive admin data
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 64);
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || crypto.randomBytes(16).toString('hex').slice(0, 32);

// Convert hex keys to buffers
const keyBuffer = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
const ivBuffer = Buffer.from(ENCRYPTION_IV.slice(0, 32), 'hex');

/**
 * Encrypt sensitive data (order details, customer info, etc.)
 * @param {*} data - Data to encrypt
 * @returns {string} - Encrypted data in hex format
 */
const encryptData = (data) => {
  try {
    const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
  } catch (err) {
    console.error('Encryption error:', err.message);
    return null;
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data in hex format
 * @returns {*} - Decrypted data (parsed as JSON if applicable)
 */
const decryptData = (encryptedData) => {
  try {
    if (!encryptedData) return null;
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const plaintext = decrypted.toString('utf-8');
    
    // Try to parse as JSON, otherwise return as string
    try {
      return JSON.parse(plaintext);
    } catch {
      return plaintext;
    }
  } catch (err) {
    console.error('Decryption error:', err.message);
    return null;
  }
};

/**
 * Hash admin action for audit logging
 * @param {string} action - Action performed
 * @param {string} adminEmail - Admin email
 * @param {string} targetId - Target resource ID
 * @returns {string} - Hash for verification
 */
const hashAdminAction = (action, adminEmail, targetId) => {
  return crypto
    .createHash('sha256')
    .update(`${action}:${adminEmail}:${targetId}:${Date.now()}`)
    .digest('hex');
};

module.exports = {
  encryptData,
  decryptData,
  hashAdminAction
};
