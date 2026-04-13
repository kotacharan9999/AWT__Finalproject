const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopdb';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'kotareddy9848@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'kotareddy9848';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

// Middleware
app.use(cors());
app.use(express.json());

const Product = require('./models/Product');
const User = require('./models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_from_shopease');
const nodemailer = require('nodemailer');
const { encryptData, decryptData, hashAdminAction } = require('./encryption');

const escapeSvg = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getProductPalette = (category = '') => {
  if (/electronics/i.test(category)) return ['#0f172a', '#2563eb', '#38bdf8'];
  if (/ladies/i.test(category)) return ['#7c2d12', '#db2777', '#f9a8d4'];
  if (/mens/i.test(category)) return ['#111827', '#0891b2', '#67e8f9'];
  if (/grocery/i.test(category)) return ['#14532d', '#16a34a', '#86efac'];
  if (/home/i.test(category)) return ['#4c1d95', '#7c3aed', '#c4b5fd'];
  if (/appliances/i.test(category)) return ['#7f1d1d', '#f97316', '#fdba74'];
  if (/beauty/i.test(category)) return ['#831843', '#ec4899', '#fbcfe8'];
  if (/lifestyle/i.test(category)) return ['#1f2937', '#0d9488', '#99f6e4'];
  return ['#1e293b', '#3b82f6', '#93c5fd'];
};

const buildProductImageUrl = (id) => `/api/products/${id}/image`;

const serializeProduct = (productDoc) => {
  const product = typeof productDoc.toObject === 'function' ? productDoc.toObject() : { ...productDoc };
  const hasExternalImage = product.image && (product.image.startsWith('http') || product.image.startsWith('https'));
  
  // Ensure we use the numeric 'id' field, not Mongoose's internal '_id' based virtual
  const numericId = productDoc.id || product.id;

  return {
    ...product,
    id: numericId,
    image: hasExternalImage ? product.image : buildProductImageUrl(numericId),
    originalImage: product.image || ''
  };
};

const getProductVisual = (product = {}) => {
  const text = `${product.name || ''} ${product.category || ''}`.toLowerCase();

  if (/phone|iphone|smartphone|pixel|galaxy|redmi|moto|nokia/.test(text)) {
    return {
      label: 'Smartphone',
      art: `
        <rect x="238" y="106" width="164" height="238" rx="28" fill="rgba(255,255,255,0.16)" />
        <rect x="254" y="124" width="132" height="198" rx="20" fill="rgba(255,255,255,0.92)" />
        <circle cx="320" cy="296" r="10" fill="rgba(15,23,42,0.35)" />
      `
    };
  }

  if (/watch|band|wearable/.test(text)) {
    return {
      label: 'Wearable',
      art: `
        <rect x="288" y="82" width="64" height="84" rx="28" fill="rgba(255,255,255,0.18)" />
        <rect x="264" y="152" width="112" height="140" rx="34" fill="rgba(255,255,255,0.92)" />
        <rect x="286" y="306" width="68" height="108" rx="30" fill="rgba(255,255,255,0.18)" />
      `
    };
  }

  if (/laptop|notebook|chromebook|thinkpad|matebook/.test(text)) {
    return {
      label: 'Laptop',
      art: `
        <rect x="196" y="120" width="248" height="146" rx="18" fill="rgba(255,255,255,0.92)" />
        <rect x="214" y="138" width="212" height="110" rx="10" fill="rgba(15,23,42,0.16)" />
        <path d="M174 286h292l28 42H146z" fill="rgba(255,255,255,0.78)" />
      `
    };
  }

  if (/tv|television|oled|qled|bravia/.test(text)) {
    return {
      label: 'Television',
      art: `
        <rect x="174" y="126" width="292" height="166" rx="18" fill="rgba(255,255,255,0.92)" />
        <rect x="194" y="144" width="252" height="128" rx="10" fill="rgba(15,23,42,0.16)" />
        <rect x="302" y="292" width="36" height="28" rx="8" fill="rgba(255,255,255,0.78)" />
        <rect x="256" y="320" width="128" height="12" rx="6" fill="rgba(255,255,255,0.56)" />
      `
    };
  }

  if (/headphone|earbud|speaker|audio|sound|bose|sony|jbl|marshall/.test(text)) {
    return {
      label: 'Audio',
      art: `
        <path d="M236 236c0-64 42-112 84-112s84 48 84 112" fill="none" stroke="rgba(255,255,255,0.88)" stroke-width="24" stroke-linecap="round" />
        <rect x="216" y="230" width="44" height="92" rx="18" fill="rgba(255,255,255,0.92)" />
        <rect x="380" y="230" width="44" height="92" rx="18" fill="rgba(255,255,255,0.92)" />
      `
    };
  }

  if (/camera|canon|nikon|fujifilm/.test(text)) {
    return {
      label: 'Camera',
      art: `
        <rect x="202" y="168" width="236" height="136" rx="24" fill="rgba(255,255,255,0.92)" />
        <circle cx="320" cy="236" r="46" fill="rgba(15,23,42,0.14)" />
        <circle cx="320" cy="236" r="24" fill="rgba(255,255,255,0.72)" />
        <rect x="230" y="146" width="74" height="30" rx="12" fill="rgba(255,255,255,0.7)" />
      `
    };
  }

  if (/shoe|loafer|sneaker|boot|footwear/.test(text)) {
    return {
      label: 'Footwear',
      art: `
        <path d="M188 264c18-8 38-36 58-36 22 0 28 30 60 44 28 12 70 8 108 30 16 10 22 20 22 34H188c0-30 0-52 0-72z" fill="rgba(255,255,255,0.92)" />
        <rect x="212" y="316" width="192" height="10" rx="5" fill="rgba(15,23,42,0.14)" />
      `
    };
  }

  if (/dress|saree|kurti|gown|skirt|blouse|top|fashion/.test(text)) {
    return {
      label: 'Fashion',
      art: `
        <circle cx="320" cy="132" r="30" fill="rgba(255,255,255,0.86)" />
        <path d="M270 172h100l32 144H238z" fill="rgba(255,255,255,0.92)" />
        <path d="M274 182l-40 54 34 20M366 182l40 54-34 20" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
      `
    };
  }

  if (/bag|handbag|backpack|wallet/.test(text)) {
    return {
      label: 'Accessories',
      art: `
        <rect x="220" y="176" width="200" height="154" rx="24" fill="rgba(255,255,255,0.92)" />
        <path d="M268 176c0-34 18-56 52-56s52 22 52 56" fill="none" stroke="rgba(255,255,255,0.82)" stroke-width="18" stroke-linecap="round" />
      `
    };
  }

  if (/sofa|couch|recliner/.test(text)) {
    return {
      label: 'Sofa',
      art: `
        <rect x="210" y="198" width="220" height="96" rx="26" fill="rgba(255,255,255,0.92)" />
        <rect x="184" y="220" width="44" height="82" rx="18" fill="rgba(255,255,255,0.78)" />
        <rect x="412" y="220" width="44" height="82" rx="18" fill="rgba(255,255,255,0.78)" />
        <rect x="232" y="294" width="18" height="34" rx="8" fill="rgba(255,255,255,0.6)" />
        <rect x="390" y="294" width="18" height="34" rx="8" fill="rgba(255,255,255,0.6)" />
      `
    };
  }

  if (/bed|mattress/.test(text)) {
    return {
      label: 'Bedroom',
      art: `
        <rect x="178" y="230" width="284" height="72" rx="18" fill="rgba(255,255,255,0.92)" />
        <rect x="178" y="196" width="64" height="44" rx="14" fill="rgba(255,255,255,0.78)" />
        <rect x="242" y="196" width="92" height="44" rx="14" fill="rgba(255,255,255,0.7)" />
        <rect x="198" y="302" width="18" height="34" rx="8" fill="rgba(255,255,255,0.58)" />
        <rect x="424" y="302" width="18" height="34" rx="8" fill="rgba(255,255,255,0.58)" />
      `
    };
  }

  if (/lamp|light|bulb/.test(text)) {
    return {
      label: 'Lighting',
      art: `
        <path d="M270 154c0-28 22-48 50-48s50 20 50 48c0 22-10 34-20 48-10 12-14 24-14 42h-32c0-18-4-30-14-42-10-14-20-26-20-48z" fill="rgba(255,255,255,0.92)" />
        <rect x="294" y="244" width="52" height="26" rx="10" fill="rgba(255,255,255,0.72)" />
        <rect x="304" y="270" width="32" height="74" rx="10" fill="rgba(255,255,255,0.6)" />
      `
    };
  }

  if (/air fryer|kettle|coffee|mixer|grinder|appliance/.test(text)) {
    return {
      label: 'Kitchen',
      art: `
        <rect x="228" y="154" width="184" height="176" rx="34" fill="rgba(255,255,255,0.92)" />
        <rect x="256" y="182" width="128" height="58" rx="16" fill="rgba(15,23,42,0.12)" />
        <rect x="276" y="266" width="88" height="22" rx="11" fill="rgba(255,255,255,0.68)" />
      `
    };
  }

  if (/vacuum|clean|mop|steam/.test(text)) {
    return {
      label: 'Cleaning',
      art: `
        <path d="M256 148h24v118h86v28h-110z" fill="rgba(255,255,255,0.92)" />
        <circle cx="388" cy="292" r="30" fill="rgba(255,255,255,0.78)" />
        <path d="M280 172l84-48" fill="none" stroke="rgba(255,255,255,0.76)" stroke-width="20" stroke-linecap="round" />
      `
    };
  }

  if (/serum|moistur|sunscreen|toner|shampoo|conditioner|fragrance|perfume/.test(text)) {
    return {
      label: 'Beauty',
      art: `
        <rect x="266" y="136" width="108" height="184" rx="30" fill="rgba(255,255,255,0.92)" />
        <rect x="286" y="108" width="68" height="38" rx="12" fill="rgba(255,255,255,0.72)" />
        <circle cx="320" cy="228" r="30" fill="rgba(15,23,42,0.12)" />
      `
    };
  }

  if (/rice|atta|dal|quinoa|coffee|tea|juice|water|snack|grocery/.test(text)) {
    return {
      label: 'Grocery',
      art: `
        <path d="M244 164h152l-20 156H264z" fill="rgba(255,255,255,0.92)" />
        <path d="M274 164c0-24 18-42 46-42s46 18 46 42" fill="none" stroke="rgba(255,255,255,0.74)" stroke-width="16" stroke-linecap="round" />
        <circle cx="320" cy="238" r="26" fill="rgba(15,23,42,0.12)" />
      `
    };
  }

  if (/book|novel|guide|playbook/.test(text)) {
    return {
      label: 'Book',
      art: `
        <path d="M212 152h160c30 0 56 12 56 38v144c-16-10-34-16-56-16H212z" fill="rgba(255,255,255,0.92)" />
        <path d="M428 152H268c-30 0-56 12-56 38v144c16-10 34-16 56-16h160z" fill="rgba(255,255,255,0.78)" />
        <rect x="308" y="152" width="24" height="182" fill="rgba(15,23,42,0.08)" />
      `
    };
  }

  return {
    label: 'Product',
    art: `
      <circle cx="320" cy="210" r="118" fill="rgba(255,255,255,0.16)" />
      <rect x="206" y="140" width="228" height="156" rx="32" fill="rgba(255,255,255,0.92)" />
      <rect x="238" y="176" width="164" height="22" rx="11" fill="rgba(15,23,42,0.12)" />
      <rect x="238" y="214" width="128" height="18" rx="9" fill="rgba(15,23,42,0.08)" />
    `
  };
};

const renderProductImageSvg = (product) => {
  const [dark, primary, light] = getProductPalette(product?.category);
  const name = escapeSvg((product?.name || 'ShopPlus Product').slice(0, 34));
  const brand = escapeSvg((product?.brand || 'ShopPlus').slice(0, 20));
  const category = escapeSvg((product?.category || 'Premium Collection').slice(0, 24));
  const price = Number.isFinite(product?.price) ? `Rs ${Number(product.price).toLocaleString('en-IN')}` : 'ShopPlus';
  const visual = getProductVisual(product);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${dark}" />
          <stop offset="55%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${light}" />
        </linearGradient>
      </defs>
      <rect width="640" height="640" rx="44" fill="url(#bg)" />
      <circle cx="320" cy="212" r="138" fill="rgba(255,255,255,0.10)" />
      ${visual.art}
      <rect x="240" y="344" width="160" height="34" rx="17" fill="rgba(255,255,255,0.16)" />
      <text x="320" y="366" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="700" text-anchor="middle">${escapeSvg(visual.label)}</text>
      <rect x="120" y="382" width="400" height="26" rx="13" fill="rgba(255,255,255,0.16)" />
      <rect x="156" y="426" width="328" height="18" rx="9" fill="rgba(255,255,255,0.12)" />
      <text x="320" y="504" fill="#ffffff" font-family="Arial, sans-serif" font-size="36" font-weight="700" text-anchor="middle">${name}</text>
      <text x="320" y="548" fill="rgba(255,255,255,0.9)" font-family="Arial, sans-serif" font-size="24" font-weight="600" text-anchor="middle">${brand} • ${category}</text>
      <text x="320" y="586" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="700" text-anchor="middle">${escapeSvg(price)}</text>
    </svg>
  `;
};

const ensureAdminAccount = async () => {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      isAdmin: true
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true
    }
  );

  console.log(`Admin account ready: ${ADMIN_EMAIL}`);
};

// ── Rate Limiter for Auth Routes ─────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again after 15 minutes.' }
});

// ── Health Check Endpoint ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ShopPlus API',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully at:', MONGODB_URI);
    await ensureAdminAccount();
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

const requireSelfOrAdmin = (req, res, next) => {
  const requestedEmail = normalizeEmail(req.params.email);
  const loggedInEmail = normalizeEmail(req.user?.email);

  if (!loggedInEmail || (loggedInEmail !== requestedEmail && !req.user?.isAdmin)) {
    return res.status(403).json({ message: 'Unauthorized access to user data' });
  }

  req.requestedEmail = requestedEmail;
  next();
};

// 🔐 Enhanced Admin Middleware with strict verification
const isAdminRoute = (req, res, next) => {
  // Verify user exists and has admin flag
  if (!req.user || !req.user.isAdmin) {
    console.warn(`⚠️ Unauthorized admin access attempt from: ${req.user?.email || 'unknown'}`);
    return res.status(403).json({ message: 'Admin access required', code: 'ADMIN_ONLY' });
  }
  
  // Log admin actions for audit trail
  console.log(`🔐 Admin Action: ${req.user.email} - ${req.method} ${req.path}`);
  
  next();
};

// 🔒 Enhanced admin verification for sensitive operations
const adminVerificationRequired = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    console.warn(`⚠️ Unauthorized admin verification attempt from: ${req.user?.email || 'unknown'}`);
    return res.status(403).json({ message: 'Admin verification required', code: 'VERIFICATION_FAILED' });
  }
  
  // Additional verification header check
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== 'verified') {
    console.warn(`⚠️ Invalid admin key for: ${req.user.email}`);
    return res.status(403).json({ message: 'Invalid admin credentials', code: 'INVALID_CREDENTIALS' });
  }
  
  next();
};

// Setup Nodemailer Ethereal mock transport
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return;
    }
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});

// Stripe Payments Route
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { orderItems, userEmail, totalAmount } = req.body;
    
    const protocol = req.protocol;
    const host = req.get('host');
    const origin = req.get('origin') || `${protocol}://${host}`;

    // In production with real keys, we map items to line_items.
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
        // Return a mock success URL so the app continues working natively testing without keys
        return res.json({ id: 'mock_session_id', url: `${origin}/order-success?mock=true` });
    }

    const lineItems = orderItems.map(item => ({
        price_data: {
            currency: 'inr',
            product_data: {
                name: item.name,
                images: [item.image.split('?')[0]], // Avoid complicated dynamic URLs blocking stripe caching
            },
            unit_amount: Math.round(item.price * 100), // convert to paise
        },
        quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?canceled=true`,
        customer_email: userEmail,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/signup', authLimiter, async (req, res) => {
  const { name, password } = req.body;
  const email = normalizeEmail(req.body.email);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === ADMIN_EMAIL;
    const newUser = new User({ name, email, password: hashedPassword, isAdmin });
    await newUser.save();

    const token = jwt.sign({ email: newUser.email, isAdmin: newUser.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'User created successfully', 
      user: { name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin, token } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      message: 'Login successful', 
      user: { name: user.name, email: user.email, isAdmin: user.isAdmin, token } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// User Addresses Routes
app.get('/api/users/:email/addresses', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.requestedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/:email/addresses', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.requestedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.addresses) user.addresses = [];
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/users/:email/addresses/:id', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.requestedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (!user.addresses) user.addresses = [];
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User State (Cart & Wishlist) Sync
app.get('/api/users/:email/state', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.requestedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ cart: user.cart, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving state' });
  }
});

app.put('/api/users/:email/state', authenticateToken, requireSelfOrAdmin, async (req, res) => {
  try {
    const { cart, wishlist } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.requestedEmail }, 
      { cart: cart || [], wishlist: wishlist || [] }, 
      { returnDocument: 'after' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'State synced securely' });
  } catch (error) {
    console.error('State sync error:', error);
    res.status(500).json({ message: 'Server error saving state' });
  }
});

// Order Routes
const Order = require('./models/Order');

// Get user's own orders (not admin-only)
app.get('/api/orders/:email', authenticateToken, async (req, res) => {
  try {
    // Users can only see their own orders
    if (normalizeEmail(req.user.email) !== normalizeEmail(req.params.email) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to view these orders' });
    }
    
    const orders = await Order.find({ userEmail: normalizeEmail(req.params.email) }).sort({ _id: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin only) - 🔐 with encryption
app.get('/api/orders', authenticateToken, isAdminRoute, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ _id: -1 });
    
    // Return orders with encrypted sensitive data
    const secureOrders = orders.map(order => ({
      _id: order._id,
      userEmail: order.userEmail,
      date: order.date,
      items: order.items,
      total: order.total,
      status: order.status,
      deliveryAddress: order.deliveryAddress ? encryptData(order.deliveryAddress) : null,
      // Add encryption hash for verification
      _hash: hashAdminAction('view_order', req.user.email, order._id)
    }));
    
    res.json(secureOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only) - 🔐 enhanced protection
app.put('/api/orders/:id/status', authenticateToken, isAdminRoute, adminVerificationRequired, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Log admin action
    console.log(`✅ Admin ${req.user.email} updated order ${req.params.id} to ${status}`);
    
    res.json({
      _id: order._id,
      userEmail: order.userEmail,
      status: order.status,
      date: order.date,
      total: order.total
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order (admin only) - 🔐 highest security
app.delete('/api/orders/:id', authenticateToken, isAdminRoute, adminVerificationRequired, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Log admin action with hash
    const hash = hashAdminAction('delete_order', req.user.email, req.params.id);
    console.log(`🗑️ Admin ${req.user.email} deleted order ${req.params.id} | Hash: ${hash}`);
    
    res.json({ message: 'Order deleted successfully', deletedOrderId: order._id, hash });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel order (user can cancel their own processing orders)
app.put('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Security check: ensure order belongs to user
    if (normalizeEmail(order.userEmail) !== normalizeEmail(req.user.email)) {
      return res.status(403).json({ message: 'Unauthorized to cancel this order' });
    }

    if (order.status !== 'Processing') {
      return res.status(400).json({ message: 'Only processing orders can be cancelled' });
    }

    order.status = 'Cancelled';
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const safeItems = (req.body.items || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: buildProductImageUrl(item.id)
    }));

    const newOrder = new Order({
      userEmail: normalizeEmail(req.user.email),
      items: safeItems,
      total: req.body.total,
      date: req.body.date,
      status: req.body.status || 'Processing'
    });
    await newOrder.save();
    
    // Send Automated Email via Nodemailer
    if (transporter) {
        const mailOptions = {
            from: '"ShopEase Payments" <no-reply@shopease.com>',
            to: newOrder.userEmail,
            subject: `Order Confirmation - ₹${newOrder.total.toFixed(2)}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea;">
                    <h2 style="color: #0d9488;">Thank you for your order!</h2>
                    <p>Your payment of <strong>₹${newOrder.total.toFixed(2)}</strong> was successful.</p>
                    <h3>Order Summary</h3>
                    <ul style="list-style: none; padding: 0;">` +
                    (newOrder.items || []).map(item => `
                        <li style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                            <span>${item.quantity || 1}x ${item.name || 'Product'}</span>
                            <b>₹${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</b>
                        </li>`).join('') +
                    `</ul>
                    <p>We'll notify you once it ships. Thanks for shopping with ShopEase!</p>
                </div>`
        };
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error occurred sending email:', err.message);
            } else {
                console.log('Automated Receipt Sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
            }
        });
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Product Routes
const Review = require('./models/Review');

// Create product (admin only) - 🔐 enhanced protection
app.post('/api/products', authenticateToken, isAdminRoute, adminVerificationRequired, async (req, res) => {
  try {
    const { name, brand, category, subcategory, price, rating, description, stock } = req.body;
    if (!name || !price || !category) return res.status(400).json({ message: 'Name, price, category required' });
    const lastProduct = await Product.findOne({}).sort({ id: -1 });
    const newId = (lastProduct?.id || 0) + 1;
    const product = new Product({
      id: newId, name, brand, category,
      subcategory: subcategory || '',
      price: parseFloat(price),
      rating: parseFloat(rating) || 4.0,
      description: description || '',
      stock: parseInt(stock) || 100
    });
    await product.save();
    res.status(201).json(serializeProduct(product));
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Update product (admin only) - 🔐 enhanced protection
app.put('/api/products/:id', authenticateToken, isAdminRoute, adminVerificationRequired, async (req, res) => {
  try {
    const { name, brand, category, subcategory, price, rating, description, stock } = req.body;
    const product = await Product.findOneAndUpdate(
      { id: parseInt(req.params.id, 10) },
      { name, brand, category, subcategory, price: parseFloat(price), rating: parseFloat(rating), description, stock: parseInt(stock) },
      { returnDocument: 'after' }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(serializeProduct(product));
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product (admin only) - 🔐 enhanced protection
app.delete('/api/products/:id', authenticateToken, isAdminRoute, adminVerificationRequired, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: parseInt(req.params.id, 10) });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    console.log(`🗑️ Admin ${req.user.email} deleted product ID ${req.params.id}`);
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

app.get('/api/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.id }).sort({ date: -1 });
        res.json(reviews);
    } catch(err) {
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

app.post('/api/products/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const { userName, rating, comment } = req.body;
        const newReview = new Review({
            productId: req.params.id,
            userEmail: normalizeEmail(req.user.email),
            userName,
            rating,
            comment
        });
        await newReview.save();
        res.status(201).json(newReview);
    } catch(err) {
        res.status(500).json({ message: 'Server error saving review' });
    }
});

app.get('/api/products/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    const regex = new RegExp(q, 'i');
    
    // Search in name or category
    const products = await Product.find({
      $or: [ { name: regex }, { category: regex }, { brand: regex } ]
    }).limit(10);
    
    res.json(products.map(serializeProduct));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch products with pagination and full filters
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, brands, sort, minPrice, maxPrice, minRating, sub } = req.query;
    
    let query = {};

    // Category (support partial match for overlapping names)
    if (category) {
      if (category === 'Electronics') {
        query.category = { $regex: 'Electronics', $options: 'i' };
      } else {
        query.category = { $regex: category.replace(/&/g, '\\&'), $options: 'i' };
      }
    }

    // Subcategory
    if (sub) query.subcategory = { $regex: sub, $options: 'i' };

    // Brand filter
    if (brands) {
      const brandList = brands.split(',').filter(Boolean);
      if (brandList.length > 0) query.brand = { $in: brandList };
    }

    // Text search (name, brand, category, description)
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { category: regex }, { brand: regex }, { description: regex }];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Minimum rating
    if (minRating) query.rating = { $gte: parseFloat(minRating) };

    // Sorting
    let sortObj = {};
    if (sort === 'price-low') sortObj = { price: 1 };
    else if (sort === 'price-high') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'newest') sortObj = { _id: -1 };
    else sortObj = { rating: -1 }; // popularity = highest rated

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(parseInt(limit));
    const total = await Product.countDocuments(query);
    
    res.json({
      products: products.map(serializeProduct),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/products/:id/image', async (req, res) => {
  try {
    const product = await Product.findOne({ id: parseInt(req.params.id, 10) });
    const svg = renderProductImageSvg(product);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  } catch (error) {
    res.status(500).send(renderProductImageSvg(null));
  }
});

// Get product by id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) res.json(serializeProduct(product));
    else res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Meta: brands scoped to category
app.get('/api/meta/brands', async (req, res) => {
  try {
    const { category } = req.query;
    const match = category ? { category: { $regex: category, $options: 'i' } } : {};
    const brands = await Product.distinct('brand', match);
    res.json((brands || []).sort());
  } catch(err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Exception:', err.stack);
  res.status(500).json({ 
    message: 'An unexpected error occurred', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// --- Production Deployment Setup ---
const path = require('path');

// Serve frontend static files inside the simpleapp build directory
app.use(express.static(path.join(__dirname, '../simpleapp/build')));

// Any route that doesn't match the API should just return the React index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.resolve(__dirname, '../simpleapp/build', 'index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
module.exports = app;
