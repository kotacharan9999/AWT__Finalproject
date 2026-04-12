const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
  subcategory: String,
  brand: String,
  rating: Number,
  description: String,
  image: String,
  stock: { type: Number, default: 100 }
});

module.exports = mongoose.model('Product', productSchema);
