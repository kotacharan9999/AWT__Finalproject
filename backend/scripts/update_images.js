const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = 'mongodb://127.0.0.1:27017/shopdb';

async function redistribute() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB. Starting precision image redistribution...');

        const products = await Product.find({});
        console.log(`Analyzing ${products.length} products...`);

        let updated = 0;
        const total = products.length;

        for (let i = 0; i < total; i++) {
            const p = products[i];
            const brand = (p.brand || '').toLowerCase();
            const name = (p.name || '').toLowerCase();
            const category = (p.category || '').toLowerCase();

            let query = '';

            // Construct specific keyword queries for LoremFlickr variety
            if (category.includes('electronics')) {
                if (name.includes('phone') || name.includes('iphone')) query = `${brand},smartphone,mobile`;
                else if (name.includes('laptop') || name.includes('macbook')) query = `${brand},laptop,computer`;
                else if (name.includes('watch')) query = `${brand},watch,smartwatch`;
                else query = `${brand},gadget,technology`;
            } 
            else if (category.includes('ladies') || category.includes('mens') || category.includes('fashion')) {
                if (name.includes('shoe') || name.includes('sneaker')) query = `${brand},shoes,fashion`;
                else if (name.includes('shirt') || name.includes('t-shirt')) query = `${brand},clothing,shirt`;
                else query = `${brand},fashion,apparel`;
            }
            else if (category.includes('furniture') || category.includes('home')) {
                query = `${brand},furniture,interior`;
            }
            else {
                query = `${category.split(' ')[0]},product`;
            }

            // Using placeholder.com / loremflickr for 100% deterministic variety based on keywords
            // Each refresh or session will feel unique but relevant to the brand
            const imageUrl = `https://loremflickr.com/800/800/${query.replace(/\s+/g, '')}?lock=${p.id}`;

            await Product.updateOne({ _id: p._id }, { $set: { image: imageUrl } });
            
            if (i % 100 === 0) console.log(`Redistributed ${i}/${total} products...`);
            updated++;
        }

        console.log(`\n🎉 Success! Precision variety redistribution complete for ${updated} products.`);
        process.exit(0);
    } catch (err) {
        console.error('Variety redistribution failed:', err);
        process.exit(1);
    }
}

redistribute();
