const mongoose = require('mongoose');
const crypto = require('crypto');

// A secure key for AES-256-CBC, must be 32 bytes.
// In production, ALWAYS load this from an environment variable!
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')).padEnd(32, '0').substring(0, 32); 
const IV_LENGTH = 16;

const encryptText = (text) => {
  if (!text) return text;
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decryptText = (text) => {
  if (!text) return text;
  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true, set: encryptText, get: decryptText },
  street: { type: String, required: true, set: encryptText, get: decryptText },
  city: { type: String, required: true, set: encryptText, get: decryptText },
  postalCode: { type: String, required: true, set: encryptText, get: decryptText },
  phone: { type: String, required: true, set: encryptText, get: decryptText } 
});

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    set: encryptText, get: decryptText // Encrypting user's name as well for total security!
  },
  email: { 
    type: String, 
    required: true, 
    unique: true // Note: Email is not encrypted to allow for easy lookup, but it could be hashed for searching if needed.
  },
  password: { 
    type: String, 
    required: true 
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  addresses: [addressSchema],
  cart: { type: Array, default: [] },
  wishlist: { type: Array, default: [] }
}, {
  collection: 'shopease', 
  toJSON: { getters: true }, // Important: This ensures Mongoose runs the 'get' decryption logic when converting to JSON.
  toObject: { getters: true }
});

module.exports = mongoose.model('User', userSchema);
