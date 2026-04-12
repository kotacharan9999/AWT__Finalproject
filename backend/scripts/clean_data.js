const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = 'mongodb://127.0.0.1:27017/shopdb';

const CLEAN_BRANDS = [
    'Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'ASUS', 'Lenovo', 'OnePlus', 'Google',
    'Nike', 'Adidas', 'Puma', 'Levis', 'Bose', 'JBL', 'Canon', 'Dior', 'Ikea', 'Tanishq'
];

async function clean() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB. Starting deep clean of product names...');

        const products = await Product.find({});
        console.log(`Analyzing ${products.length} products...`);

        let cleanedCount = 0;

        for (const p of products) {
            let name = p.name || '';
            
            // Check for corruption: repetitive brands or weird lengths
            // Pattern: "Brand Brand Product Category Brand Category..."
            const words = name.split(' ');
            if (words.length > 8 || (new Set(words.filter(w => CLEAN_BRANDS.includes(w))).size > 2)) {
                // Determine the primary brand and category to reconstruct
                let primaryBrand = p.brand || CLEAN_BRANDS.find(b => name.includes(b)) || 'ShopPlus';
                let categoryKeyword = p.subcategory || p.category.split(' ')[0] || 'Product';
                
                // Reconstruct a professional Name: Brand + Category Detail + Model Variant
                // We use the first 3 original words that aren't duplicate brands
                const cleanWords = words.filter(w => !CLEAN_BRANDS.includes(w)).slice(0, 3);
                let newName = `${primaryBrand} ${cleanWords.join(' ')} ${categoryKeyword}`.trim();
                
                // Limit length and ensure it's not empty
                newName = newName.slice(0, 60).split(' ').filter((v, i, a) => a.indexOf(v) === i).join(' ');

                await Product.updateOne({ _id: p._id }, { $set: { name: newName } });
                cleanedCount++;
            }
        }

        console.log(`\n🎉 deep clean complete! Reconstructed ${cleanedCount} corrupted names.`);
        process.exit(0);
    } catch (err) {
        console.error('Clean failed:', err);
        process.exit(1);
    }
}

clean();
