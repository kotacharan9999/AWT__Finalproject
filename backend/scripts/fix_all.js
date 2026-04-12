const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = 'mongodb://127.0.0.1:27017/shopdb';

const BRAND_LIST = ['Apple','Samsung','Sony','Dell','HP','ASUS','Lenovo','OnePlus','Google',
    'Nike','Adidas','Puma','Levis','Bose','JBL','Canon','Dior','Ikea',
    'Xiaomi','Gucci','Zara','Microsoft','Philips','LG','Logitech'];

function isCorrupted(name) {
    const words = name.split(' ');
    const brandMatches = words.filter(w => BRAND_LIST.includes(w));
    return brandMatches.length > 1 || words.length > 7;
}

// Curated, stable Unsplash images per subcategory keyword
const IMAGE_MAP = {
    // Electronics
    'iphone': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80',
    'galaxy': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80',
    'oneplus': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
    'realme': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80',
    'pixel': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80',
    'redmi': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    'macbook': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
    'laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80',
    'rog': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    'xps': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    'spectre': 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80',
    'thinkpad': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
    'chromebook': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
    'headphone': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    'airpods': 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=600&q=80',
    'speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80',
    'wh-1000': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
    'tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80',
    'qled': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80',
    'ipad': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',
    'tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80',
    'camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    'canon': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    'nikon': 'https://images.unsplash.com/photo-1495745966610-2a67f2297e5e?w=600&q=80',
    'watch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    'smartwatch': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80',
    'mouse': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
    'keyboard': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
    'ssd': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80',
    'drone': 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80',
    'router': 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&q=80',
    'webcam': 'https://images.unsplash.com/photo-1587826080647-8e63ddbb61c8?w=600&q=80',
    'monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80',
    'power bank': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
    'projector': 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&q=80',
    'gaming': 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&q=80',
    
    // Ladies Fashion
    'saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
    'anarkali': 'https://images.unsplash.com/photo-1583391733981-7e6491a1aa91?w=600&q=80',
    'maxi dress': 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80',
    'blazer': 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=600&q=80',
    'kurti': 'https://images.unsplash.com/photo-1583391733981-7e6491a1aa91?w=600&q=80',
    'jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
    'sandals': 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80',
    'handbag': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
    'earring': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    'hoodie': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80',
    'yoga pants': 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
    'lehenga': 'https://images.unsplash.com/photo-1583391733981-7e6491a1aa91?w=600&q=80',
    'sports bra': 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=600&q=80',
    'perfume': 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',

    // Mens Fashion
    'shirt': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    'polo': 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80',
    'chinos': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80',
    'denim jacket': 'https://images.unsplash.com/photo-1576993537667-c6d2386f90a2?w=600&q=80',
    'running shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    'formal shoes': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',
    'suit': 'https://images.unsplash.com/photo-1594938298603-c8148c4b4c7f?w=600&q=80',
    'kurta': 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&q=80',
    'backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
    'chronograph': 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&q=80',
    'jogger': 'https://images.unsplash.com/photo-1547621736-f6f40c11c0db?w=600&q=80',
    'sunglasses': 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
    'shorts': 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=600&q=80',
    'sneaker': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80',
    'loafer': 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80',

    // Home & Furniture
    'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    'bed': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
    'mattress': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    'lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057ab3fe?w=600&q=80',
    'wardrobe': 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&q=80',
    'dining': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80',
    'bookshelf': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80',
    'curtain': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    'cushion': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80',
    'rug': 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
    'nightstand': 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&q=80',
    'chair': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80',
    'desk': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80',
    'mirror': 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80',
    'vase': 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80',

    // Appliances
    'air fryer': 'https://images.unsplash.com/photo-1648455250413-44c04e8e4a1c?w=600&q=80',
    'mixer': 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
    'oven': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&q=80',
    'refrigerator': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80',
    'washing machine': 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?w=600&q=80',
    'vacuum': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
    'iron': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
    'food processor': 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
    'dishwasher': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
    'coffee': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80',
    'kettle': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    'induction': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    'water purifier': 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80',

    // Beauty
    'serum': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    'moistur': 'https://images.unsplash.com/photo-1556228724-4e7f5fb6e2e9?w=600&q=80',
    'sunscreen': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    'shampoo': 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&q=80',
    'lipstick': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80',
    'foundation': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    'nail polish': 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
    'vitamin': 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&q=80',
    'essential oil': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
    'face mask': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80',
    'hair dryer': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    'makeup': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    'skincare': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    'fragrance': 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',

    // Grocery
    'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    'atta': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80',
    'dal': 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=600&q=80',
    'tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&q=80',
    'honey': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80',
    'chocolate': 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600&q=80',
    'snack': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80',
    'juice': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=600&q=80',
    'protein': 'https://images.unsplash.com/photo-1593095948071-474c5cc2c673?w=600&q=80',
    'quinoa': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    'spice': 'https://images.unsplash.com/photo-1596040033222-09e0d80e9136?w=600&q=80',

    // Lifestyle
    'yoga mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80',
    'dumbbell': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    'tent': 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80',
    'bicycle': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80',
    'cricket bat': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
    'football': 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=80',
    'novel': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
    'board game': 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&q=80',
    'puzzle': 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=600&q=80',
    'guitar': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80',
    'art supply': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    'telescope': 'https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?w=600&q=80',
    'fishing': 'https://images.unsplash.com/photo-1504472478235-9bc48ba4d60f?w=600&q=80',
    'skipping': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
};

// Category-level fallback images
const CATEGORY_FALLBACK = {
    'electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    'ladies': 'https://images.unsplash.com/photo-1558171813-01e29b05f69f?w=600&q=80',
    'mens': 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&q=80',
    'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    'furniture': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    'appliance': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    'kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    'beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    'personal care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
    'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    'lifestyle': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    'hobbies': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
};

function findBestImage(product) {
    const text = `${product.name} ${product.description || ''}`.toLowerCase();
    const cat = (product.category || '').toLowerCase();
    
    // Try specific keyword matches first
    for (const [keyword, url] of Object.entries(IMAGE_MAP)) {
        if (text.includes(keyword.toLowerCase())) {
            return url;
        }
    }
    
    // Try category fallback
    for (const [catKey, url] of Object.entries(CATEGORY_FALLBACK)) {
        if (cat.includes(catKey)) {
            return url;
        }
    }
    
    return null; // Will use SVG fallback
}

async function fixAll() {
    try {
        await mongoose.connect(URI);
        console.log('Connected to MongoDB.');
        
        // Step 1: Delete corrupted products
        const all = await Product.find({});
        let deleted = 0;
        for (const p of all) {
            if (isCorrupted(p.name)) {
                await Product.deleteOne({ _id: p._id });
                deleted++;
            }
        }
        console.log(`Step 1: Deleted ${deleted} corrupted products.`);
        
        // Step 2: Assign proper images to remaining clean products
        const cleanProducts = await Product.find({});
        let imageUpdated = 0;
        for (const p of cleanProducts) {
            const bestImage = findBestImage(p);
            if (bestImage) {
                await Product.updateOne({ _id: p._id }, { $set: { image: bestImage } });
                imageUpdated++;
            } else {
                // Clear any loremflickr URLs so SVG fallback works
                if (p.image && p.image.includes('loremflickr')) {
                    await Product.updateOne({ _id: p._id }, { $set: { image: '' } });
                }
            }
        }
        console.log(`Step 2: Assigned curated images to ${imageUpdated} products.`);
        
        const remaining = await Product.countDocuments({});
        console.log(`\n✅ Final catalog size: ${remaining} clean, professionally named products.`);
        
        // Show a sample
        const sample = await Product.find({}).limit(20).select('id name brand image');
        console.log('\nSample products:');
        sample.forEach(p => console.log(`  [${p.id}] ${p.name} (${p.brand}) -> ${p.image?.substring(0, 60)}...`));
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixAll();
