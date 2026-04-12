const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = 'mongodb://127.0.0.1:27017/shopdb';

async function audit() {
    try {
        await mongoose.connect(URI);
        const count = await Product.countDocuments({});
        console.log('Total products:', count);
        
        const samples = await Product.find({}).limit(50).select('name category image');
        console.log('--- Samples ---');
        samples.forEach(s => {
            console.log(`[${s.id}] ${s.name} (${s.category}) -> ${s.image}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
