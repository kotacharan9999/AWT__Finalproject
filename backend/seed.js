const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/shopdb';

const Product = require('./models/Product');

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Read mock data file from the frontend
    const dataPath = path.join(__dirname, '../simpleapp/src/data/mockData.js');
    if (!fs.existsSync(dataPath)) {
        console.error('Mock data file not found!');
        process.exit(1);
    }

    const contents = fs.readFileSync(dataPath, 'utf8');
    
    // Extract the JSON string for products
    const match = contents.match(/export const products = (\[[\s\S]*?\]);\n/);
    if (match && match[1]) {
        const products = JSON.parse(match[1]);
        
        await Product.deleteMany({});
        console.log('Cleared existing products in DB');
        
        await Product.insertMany(products);
        console.log(`Successfully inserted ${products.length} products!`);
    } else {
        console.log('Could not extract JSON from mockData.js');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

seed();
