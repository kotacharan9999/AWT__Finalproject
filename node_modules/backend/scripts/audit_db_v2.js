const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = 'mongodb://127.0.0.1:27017/shopdb';

async function audit() {
    try {
        await mongoose.connect(URI);
        
        // Count products with clean vs corrupted names
        const all = await Product.find({}).select('id name brand category');
        
        let clean = 0;
        let corrupted = 0;
        const corruptedExamples = [];
        
        for (const p of all) {
            const words = p.name.split(' ');
            // A name is corrupted if it has multiple brand names or is too long
            const brandMatches = words.filter(w => 
                ['Apple','Samsung','Sony','Dell','HP','ASUS','Lenovo','OnePlus','Google',
                 'Nike','Adidas','Puma','Levis','Bose','JBL','Canon','Dior','Ikea',
                 'Xiaomi','Gucci','Zara','Microsoft','Philips','LG','Logitech'].includes(w)
            );
            
            if (brandMatches.length > 1 || words.length > 7) {
                corrupted++;
                if (corruptedExamples.length < 10) corruptedExamples.push(`[${p.id}] ${p.name}`);
            } else {
                clean++;
            }
        }
        
        console.log(`Total: ${all.length}`);
        console.log(`Clean: ${clean}`);
        console.log(`Corrupted: ${corrupted}`);
        console.log('\nCorrupted examples:');
        corruptedExamples.forEach(e => console.log('  ' + e));
        
        // Show ID ranges
        const cleanProducts = all.filter(p => {
            const words = p.name.split(' ');
            const brandMatches = words.filter(w => 
                ['Apple','Samsung','Sony','Dell','HP','ASUS','Lenovo','OnePlus','Google',
                 'Nike','Adidas','Puma','Levis','Bose','JBL','Canon','Dior','Ikea',
                 'Xiaomi','Gucci','Zara','Microsoft','Philips','LG','Logitech'].includes(w)
            );
            return brandMatches.length <= 1 && words.length <= 7;
        });
        
        const maxCleanId = Math.max(...cleanProducts.map(p => p.id));
        const minCleanId = Math.min(...cleanProducts.map(p => p.id));
        console.log(`\nClean product ID range: ${minCleanId} - ${maxCleanId}`);
        
        // Show ID distribution
        const ranges = {};
        for (const p of all) {
            const bucket = Math.floor(p.id / 100) * 100;
            const key = `${bucket}-${bucket+99}`;
            if (!ranges[key]) ranges[key] = { total: 0, corrupted: 0 };
            ranges[key].total++;
            const words = p.name.split(' ');
            const brandMatches = words.filter(w => 
                ['Apple','Samsung','Sony','Dell','HP','ASUS','Lenovo','OnePlus','Google',
                 'Nike','Adidas','Puma','Levis','Bose','JBL','Canon','Dior','Ikea',
                 'Xiaomi','Gucci','Zara','Microsoft','Philips','LG','Logitech'].includes(w)
            );
            if (brandMatches.length > 1 || words.length > 7) ranges[key].corrupted++;
        }
        
        console.log('\nID range breakdown:');
        Object.entries(ranges).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).forEach(([range, data]) => {
            console.log(`  ${range}: ${data.total} total, ${data.corrupted} corrupted`);
        });
            
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
