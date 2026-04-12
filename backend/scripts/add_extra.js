const mongoose = require('mongoose');
const Product = require('../models/Product');

async function addMore() {
  await mongoose.connect('mongodb://127.0.0.1:27017/shopdb');
  const lastDoc = await Product.findOne().sort({id:-1});
  const lastId = lastDoc ? lastDoc.id : 2850;
  
  const extras = [];

  // 50 more smartphones
  const brands = ['iPhone','Samsung','Xiaomi','Realme','Vivo'];
  const imgs = ['photo-1592899677977-9c10ca588bbd','photo-1610945415295-d9bbf067e59c','photo-1598327105666-5b89351aff97','photo-1601784551446-20c9e07cdbdb','photo-1511707171634-5f897ff02aa9'];
  for (let i = 0; i < 50; i++) {
    extras.push({
      id: lastId + 1 + i,
      name: `${brands[i%5]} ${['Galaxy S25','Mi 14 Ultra','GT Neo 6','V30 Pro','Narzo 70 Pro'][i%5]} ${['128GB','256GB','512GB','8/256','12/512'][i%5]}`,
      brand: brands[i%5], category: 'Electronics & Gadgets', subcategory: 'Smartphones',
      price: 14999 + (i * 1200 % 100000), rating: 4.2,
      description: 'Premium flagship smartphone with advanced camera and display.',
      image: `https://images.unsplash.com/${imgs[i%5]}?w=600&q=80`, stock: 50
    });
  }

  // 50 more perfumes
  const pBrands = ['Dior','Chanel','Tom Ford','Gucci','Versace','Prada','YSL','Armani','Burberry','Hermes'];
  const pNames = ['Sauvage EDP','No.5 Parfum','Black Orchid','Bloom EDP','Eros Flame','Luna Rossa','Libre Intense','Acqua Di Gio','Her London','Terre d\'Hermes'];
  const pImgs = ['photo-1541643600914-78b084683702','photo-1523293182086-7651a899d37f','photo-1594035910387-fea081728d72'];
  for (let i = 0; i < 50; i++) {
    extras.push({
      id: lastId + 51 + i,
      name: `${pBrands[i%10]} ${pNames[i%10]}`,
      brand: pBrands[i%10], category: 'Beauty & Personal Care', subcategory: 'Fragrances',
      price: 2999 + (i * 500 % 15000), rating: 4.4,
      description: 'Luxury designer fragrance.',
      image: `https://images.unsplash.com/${pImgs[i%3]}?w=600&q=80`, stock: 30
    });
  }

  // 50 more furniture items
  const fBrands = ['IKEA','Urban Ladder','Wakefit','Pepperfry','Nilkamal'];
  const fNames = ['Modern Coffee Table','Adjustable Standing Desk','Floating Wall Shelf Set','3-Tier Shoe Cabinet','Dining Bench Wooden'];
  const fImgs = ['photo-1518455027359-f3f8164ba6bd','photo-1555041469-a586c61ea9bc','photo-1594620302200-9a762244a156','photo-1558997519-83ea9252edf8','photo-1617806118233-18e1de247200'];
  for (let i = 0; i < 50; i++) {
    extras.push({
      id: lastId + 101 + i,
      name: `${fBrands[i%5]} ${fNames[i%5]} ${['Oak','Walnut','Teak','Bamboo','Pine'][i%5]}`,
      brand: fBrands[i%5], category: 'Home & Furniture', subcategory: 'Tables',
      price: 4999 + (i * 1000 % 40000), rating: 4.1,
      description: 'Premium quality furniture.',
      image: `https://images.unsplash.com/${fImgs[i%5]}?w=600&q=80`, stock: 20
    });
  }

  await Product.insertMany(extras);
  const total = await Product.countDocuments();
  console.log(`✅ Added 150 more products. Total now: ${total}`);
  process.exit(0);
}

addMore();
