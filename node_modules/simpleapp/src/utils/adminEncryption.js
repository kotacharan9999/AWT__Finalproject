/**
 * 🔐 Client-side encryption utilities for React app
 * Note: This is for UI decryption only. Real encryption happens on backend.
 * The frontend can display encrypted data or we can provide a utility to decrypt if needed.
 */

/**
 * Helper to safely display encrypted sensitive data
 * @param {string} encryptedData - Encrypted hex string
 * @returns {string} - Masked string for display
 */
export const maskSensitiveData = (encryptedData) => {
  if (!encryptedData) return 'N/A';
  const str = String(encryptedData);
  return '🔒 ' + str.substring(0, 16) + '...';
};

/**
 * Verify admin action hash
 * @param {string} hash - Action hash from server
 * @returns {boolean} - Is valid hash format
 */
export const isValidActionHash = (hash) => {
  return hash && typeof hash === 'string' && hash.length === 64;
};

/**
 * Format audit log entry
 * @param {string} action - Admin action performed
 * @param {string} adminEmail - Admin email
 * @param {string} timestamp - When action occurred
 * @returns {object} - Formatted audit entry
 */
export const formatAuditEntry = (action, adminEmail, timestamp) => {
  return {
    action,
    admin: adminEmail,
    time: new Date(timestamp).toLocaleString('en-IN'),
    icon: getActionIcon(action)
  };
};

/**
 * Get icon for audit action
 */
const getActionIcon = (action) => {
  switch (action) {
    case 'update_status':
      return '✏️';
    case 'delete_order':
      return '🗑️';
    case 'view_order':
      return '👁️';
    default:
      return '📋';
  }
};

/**
 * Create secure headers for admin requests
 * @param {string} token - JWT token
 * @param {boolean} isSensitive - Is sensitive operation
 * @returns {object} - Headers object
 */
export const getAdminHeaders = (token, isSensitive = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  if (isSensitive) {
    headers['X-Admin-Key'] = 'verified';
  }
  
  return headers;
};
