const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = 'mongodb://127.0.0.1:27017/shopdb';

async function check() {
    try {
        await mongoose.connect(URI);
        const count = await Product.countDocuments({});
        console.log('Total products:', count);
        
        const sample = await Product.findOne({});
        console.log('Sample product:', JSON.stringify(sample, null, 2));

        const mappingTest = await Product.countDocuments({
            $or: [
                { name: { $regex: /phone/i } },
                { category: { $regex: /phone/i } }
            ]
        });
        console.log('Products matching "phone":', mappingTest);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
