const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userEmail: { 
    type: String, 
    required: true 
  },
  items: [orderItemSchema],
  total: { 
    type: Number, 
    required: true 
  },
  date: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Processing'
  }
}, {
  collection: 'orders'
});

module.exports = mongoose.model('Order', orderSchema);
