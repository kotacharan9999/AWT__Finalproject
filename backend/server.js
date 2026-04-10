const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopdb';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully at:', MONGODB_URI);
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_from_shopease');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';

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

const isAdminRoute = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
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
    
    // In production with real keys, we map items to line_items.
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
        // Return a mock success URL so the app continues working natively testing without keys
        return res.json({ id: 'mock_session_id', url: `http://localhost:3000/order-success?mock=true` });
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
        success_url: `http://localhost:3000/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/checkout?canceled=true`,
        customer_email: userEmail,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = email === 'kotareddy9848@gmail.com';
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

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
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
app.get('/api/users/:email/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/users/:email/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/users/:email/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User State (Cart & Wishlist) Sync
app.get('/api/users/:email/state', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ cart: user.cart, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving state' });
  }
});

app.put('/api/users/:email/state', authenticateToken, async (req, res) => {
  try {
    const { cart, wishlist } = req.body;
    const user = await User.findOneAndUpdate(
      { email: req.params.email }, 
      { cart: cart || [], wishlist: wishlist || [] }, 
      { new: true }
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

app.get('/api/orders/:email', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.params.email }).sort({ _id: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/orders', authenticateToken, isAdminRoute, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ _id: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/orders/:id/status', authenticateToken, isAdminRoute, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    
    // Send Automated Email via Nodemailer
    if (transporter) {
        const mailOptions = {
            from: '"ShopEase Payments" <no-reply@shopease.com>',
            to: newOrder.userEmail,
            subject: `Order Confirmation - ₹${newOrder.total.toFixed(2)}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea;">
                    <h2 style="color: #0d9488;">Thank you for your order!</h2>
                    <p>Your payment of <strong>₹${newOrder.total.toFixed(2)}</strong> was successful.</p>
                    <h3>Order Summary</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${newOrder.items.map(item => `
                            <li style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                                <span>${item.quantity}x ${item.name}</span>
                                <b>₹${(item.price * item.quantity).toFixed(2)}</b>
                            </li>
                        `).join('')}
                    </ul>
                    <p>We'll notify you once it ships. Thanks for shopping with ShopEase!</p>
                </div>
            `
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
        const { userEmail, userName, rating, comment } = req.body;
        const newReview = new Review({
            productId: req.params.id,
            userEmail,
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
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch products with pagination and filters
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, brands, sort } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (brands) {
        const brandList = brands.split(',').filter(Boolean);
        if (brandList.length > 0) query.brand = { $in: brandList };
    }
    if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ name: regex }, { category: regex }, { brand: regex }];
    }
    
    let sortObj = {};
    if (sort === 'price-low') sortObj = { price: 1 };
    else if (sort === 'price-high') sortObj = { price: -1 };
    else sortObj = { _id: 1 }; // default order

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(parseInt(limit));
    const total = await Product.countDocuments(query);
    
    res.json({
        products,
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get product by id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Meta endpoint for brands
app.get('/api/meta/brands', async (req, res) => {
    try {
        const brands = await Product.distinct('brand');
        res.json(brands || []);
    } catch(err) {
        res.status(500).json({ message: 'Server Error' });
    }
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
