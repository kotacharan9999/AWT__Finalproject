const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  category: String,
  brand: String,
  rating: Number,
  description: String,
  image: String
});

module.exports = mongoose.model('Product', productSchema);
