const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/shopdb';
const Product = require('./models/Product');

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const additionalProducts = [];

const ladiesKeywords = ['dress', 'kurti', 'saree', 'blouse', 'heel', 'heel', 'handbag', 'skirt', 'gown', 'dupatta', 'bra', 'top', 'leggings', 'jewellery', 'jewelry'];
const mensKeywords = ['shirt', 't-shirt', 'jacket', 'hoodie', 'blazer', 'jeans', 'trouser', 'wallet', 'loafer', 'sneaker', 'watch', 'belt', 'kurta'];

const inferFashionCategory = (name = '', index = 0) => {
  const lowerName = name.toLowerCase();
  if (ladiesKeywords.some((keyword) => lowerName.includes(keyword))) return 'Ladies Corner';
  if (mensKeywords.some((keyword) => lowerName.includes(keyword))) return 'Mens Corner';
  return index % 2 === 0 ? 'Ladies Corner' : 'Mens Corner';
};

const deriveSubcategory = (category, name = '') => {
  const lowerName = name.toLowerCase();

  if (category === 'Electronics & Gadgets') {
    if (lowerName.includes('phone')) return 'Smartphones';
    if (lowerName.includes('laptop') || lowerName.includes('notebook') || lowerName.includes('chromebook')) return 'Laptops';
    if (lowerName.includes('headphone') || lowerName.includes('earbud') || lowerName.includes('speaker')) return 'Audio';
    if (lowerName.includes('watch') || lowerName.includes('band')) return 'Wearables';
    if (lowerName.includes('tablet') || lowerName.includes('ipad') || lowerName.includes('tab')) return 'Tablets';
    if (lowerName.includes('camera')) return 'Cameras';
    if (lowerName.includes('tv') || lowerName.includes('television')) return 'Televisions';
    return 'Gadgets';
  }

  if (category === 'Ladies Corner') return 'Fashion';
  if (category === 'Mens Corner') return 'Fashion';
  if (category === 'Grocery') return lowerName.includes('tea') || lowerName.includes('coffee') || lowerName.includes('juice') ? 'Beverages' : 'Staples';
  if (category === 'Home & Furniture') return lowerName.includes('lamp') || lowerName.includes('light') ? 'Lighting' : 'Home';
  if (category === 'Appliances & Kitchen') return lowerName.includes('vacuum') || lowerName.includes('clean') || lowerName.includes('mop') ? 'Cleaning' : 'Kitchen Appliances';
  if (category === 'Beauty & Personal Care') return lowerName.includes('shampoo') || lowerName.includes('conditioner') || lowerName.includes('serum') ? 'Hair Care' : 'Skincare';
  if (category === 'Lifestyle & Hobbies') return lowerName.includes('book') ? 'Books & Accessories' : 'Sports';
  return 'General';
};

const dedupeProducts = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = [item.cat, item.brand, item.name]
      .map((value) => String(value || '').trim().toLowerCase())
      .join('|');

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const loadMockProducts = () => {
  const mockDataPath = path.resolve(__dirname, '../simpleapp/src/data/mockData.js');
  const fileContents = fs.readFileSync(mockDataPath, 'utf8');
  const match = fileContents.match(/export const products = (\[[\s\S]*?\]);/);

  if (!match) {
    throw new Error('Unable to parse mock products from simpleapp/src/data/mockData.js');
  }

  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`products=${match[1]}`, sandbox);

  // Helper to get a real Unsplash image based on product name/type
  function getUnsplashImage(name, category) {
    const lower = name.toLowerCase();
    // Electronics
    if (lower.includes('phone') || lower.includes('smartphone') || lower.includes('iphone') || lower.includes('galaxy')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80';
    if (lower.includes('laptop') || lower.includes('notebook') || lower.includes('chromebook') || lower.includes('macbook')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';
    if (lower.includes('monitor') || lower.includes('screen') || lower.includes('display')) return 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&q=80';
    if (lower.includes('keyboard')) return 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80';
    if (lower.includes('mouse')) return 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80';
    if (lower.includes('earbud') || lower.includes('headphone') || lower.includes('earphone')) return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
    if (lower.includes('speaker')) return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80';
    if (lower.includes('tv') || lower.includes('television')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=500&q=80';
    if (lower.includes('tablet') || lower.includes('ipad')) return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80';
    if (lower.includes('camera') || lower.includes('dslr') || lower.includes('webcam')) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80';
    if (lower.includes('watch') || lower.includes('smartwatch')) return 'https://images.unsplash.com/photo-1579721801357-be41a91b49be?w=500&q=80';
    if (lower.includes('printer')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';
    if (lower.includes('router')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';
    if (lower.includes('microphone')) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80';
    // Fashion
    if (lower.includes('backpack') || lower.includes('bag')) return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80';
    if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot')) return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80';
    if (lower.includes('dress') || lower.includes('hoodie') || lower.includes('jacket') || lower.includes('scarf') || lower.includes('kurti') || lower.includes('shirt') || lower.includes('t-shirt') || lower.includes('kurta') || lower.includes('pant') || lower.includes('jean') || lower.includes('trouser') || lower.includes('skirt') || lower.includes('gown') || lower.includes('blouse') || lower.includes('dupatta') || lower.includes('bra') || lower.includes('top') || lower.includes('legging')) return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80';
    if (lower.includes('jewellery') || lower.includes('jewelry') || lower.includes('ring') || lower.includes('necklace')) return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80';
    if (lower.includes('cap') || lower.includes('hat')) return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80';
    if (lower.includes('sunglass') || lower.includes('glasses')) return 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80';
    // Home & Furniture
    if (lower.includes('sofa') || lower.includes('couch')) return 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&q=80';
    if (lower.includes('bed') || lower.includes('mattress')) return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80';
    if (lower.includes('lamp') || lower.includes('light')) return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80';
    // Kitchen & Appliances
    if (lower.includes('fridge') || lower.includes('kettle') || lower.includes('appliance') || lower.includes('mixer') || lower.includes('grinder') || lower.includes('fryer') || lower.includes('coffee maker')) return 'https://images.unsplash.com/photo-1517957754645-2ca1c1bb6e78?w=500&q=80';
    // Grocery
    if (lower.includes('rice') || lower.includes('atta') || lower.includes('quinoa') || lower.includes('dal') || lower.includes('moong')) return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80';
    if (lower.includes('juice') || lower.includes('coffee') || lower.includes('tea') || lower.includes('water') || lower.includes('beverage')) return 'https://images.unsplash.com/photo-1510626176961-4b34f54c9de2?w=500&q=80';
    // Beauty & Personal Care
    if (lower.includes('perfume') || lower.includes('fragrance')) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80';
    if (lower.includes('cream') || lower.includes('serum') || lower.includes('moisturiser') || lower.includes('toner') || lower.includes('skincare')) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80';
    if (lower.includes('shampoo') || lower.includes('conditioner') || lower.includes('hair')) return 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&q=80';
    // Books & Accessories
    if (lower.includes('book') || lower.includes('novel') || lower.includes('guide') || lower.includes('playbook')) return 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80';
    // Sports & Hobbies
    if (lower.includes('yoga') || lower.includes('fitness') || lower.includes('gym') || lower.includes('tracker') || lower.includes('glove')) return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80';
    // Fallback by category
    if ((category || '').toLowerCase().includes('fashion')) return 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&q=80';
    if ((category || '').toLowerCase().includes('electronics')) return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80';
    if ((category || '').toLowerCase().includes('grocery')) return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80';
    if ((category || '').toLowerCase().includes('home')) return 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&q=80';
    if ((category || '').toLowerCase().includes('appliance')) return 'https://images.unsplash.com/photo-1517957754645-2ca1c1bb6e78?w=500&q=80';
    if ((category || '').toLowerCase().includes('beauty')) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80';
    if ((category || '').toLowerCase().includes('sports')) return 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80';
    // Final fallback
    return 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=500&q=80';
  }

  return (sandbox.products || []).map((product, index) => {
    const mappedCategory = product.category === 'Fashion & Apparel'
      ? inferFashionCategory(product.name, index)
      : product.category;

    return {
      name: product.name,
      brand: product.brand || 'ShopPlus',
      price: Number(product.price) || randomInt(499, 49999),
      cat: mappedCategory,
      sub: deriveSubcategory(mappedCategory, product.name),
      rating: Number(product.rating) || 4.2,
      img: getUnsplashImage(product.name, mappedCategory),
      desc: product.description || `A premium ${product.name} for everyday use.`
    };
  });
};

const categoryBlueprints = [
  {
    category: 'Electronics & Gadgets',
    sub: 'Smartphones',
    brands: ['Google', 'Xiaomi', 'Vivo', 'Oppo', 'Motorola', 'Nokia'],
    titles: ['Pixel 8 Pro', 'Redmi Note 14 Pro', 'Xiaomi 14', 'Moto Edge X30', 'Nokia X30'],
    priceRange: [21999, 114999],
    descTemplates: ['AI camera system', '120Hz AMOLED display', 'Super-fast charging', '5G connectivity', 'Cinematic video recording'],
    images: ['https://images.unsplash.com/photo-1598026692334-3f0f9cb92f49?w=500&q=80', 'https://images.unsplash.com/photo-1562577309-2592ab84b1bc?w=500&q=80']
  },
  {
    category: 'Electronics & Gadgets',
    sub: 'Laptops',
    brands: ['Lenovo', 'Acer', 'Microsoft', 'Huawei'],
    titles: ['ThinkPad X1', 'Swift 5', 'Surface Pro 9', 'MateBook 16'],
    priceRange: [49999, 175000],
    descTemplates: ['Intel Evo platform', 'lightweight aluminium body', 'touchscreen with stylus support', 'Dolby Atmos audio'],
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80', 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=500&q=80']
  },
  {
    category: 'Electronics & Gadgets',
    sub: 'Audio',
    brands: ['Bose', 'Sennheiser', 'Sony', 'JBL', 'Marshall'],
    titles: ['QuietComfort 55', 'Momentum 4', 'Pulse 4', 'Soundcore Motion'],
    priceRange: [7499, 34990],
    descTemplates: ['Active noise cancellation', 'up to 40 hours battery', 'voice assistant support', 'premium ear cushions'],
    images: ['https://images.unsplash.com/photo-1505740106531-4243f3831d15?w=500&q=80', 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=500&q=80']
  },
  {
    category: 'Electronics & Gadgets',
    sub: 'Televisions',
    brands: ['LG', 'Sony', 'TCL', 'Samsung'],
    titles: ['OLED evo', 'Bravia XR', 'QLED Smart TV', 'NanoCell Pro'],
    priceRange: [49999, 159999],
    descTemplates: ['4K HDR display', 'Dolby Vision', 'smart TV OS', 'voice control', 'gaming mode'],
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&q=80']
  },
  {
    category: 'Electronics & Gadgets',
    sub: 'Tablets',
    brands: ['Samsung', 'Apple', 'Lenovo', 'Huawei'],
    titles: ['Galaxy Tab S9', 'iPad Air', 'Yoga Tab 13', 'MatePad Pro'],
    priceRange: [31999, 74999],
    descTemplates: ['S Pen included', 'high refresh rate', 'long battery life', 'kids mode available'],
    images: ['https://images.unsplash.com/photo-1611147843236-4d6ff8d48823?w=500&q=80', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80']
  },
  {
    category: 'Electronics & Gadgets',
    sub: 'Cameras',
    brands: ['Canon', 'Nikon', 'Sony', 'Fujifilm'],
    titles: ['EOS R7', 'Z 50', 'Alpha 7C', 'X-T5'],
    priceRange: [56999, 184999],
    descTemplates: ['mirrorless with 4K video', 'compact body', 'fast autofocus', 'weather-sealed lens included'],
    images: ['https://images.unsplash.com/photo-1519183071298-a2962d048e7d?w=500&q=80', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80']
  },
  {
    category: 'Electronics & Gadgets',
    sub: 'Wearables',
    brands: ['Fitbit', 'Samsung', 'Garmin', 'Amazfit'],
    titles: ['Charge 6', 'Galaxy Watch 7', 'Forerunner 265', 'GTR 4'],
    priceRange: [9999, 29999],
    descTemplates: ['health monitoring', 'GPS tracking', 'sleep analytics', 'water resistant'],
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80', 'https://images.unsplash.com/photo-1580894894511-a118b5f9a3e2?w=500&q=80']
  },
  {
    category: 'Home & Furniture',
    sub: 'Sofas',
    brands: ['Home Centre', 'Urban Ladder', 'Ikea', 'Durian'],
    titles: ['Lounge Sofa', 'Recliner Set', 'Modular Sofa', 'Velvet Corner Sofa'],
    priceRange: [29999, 99999],
    descTemplates: ['premium upholstery', 'stain resistant fabric', 'solid wood frame', 'luxury seating for 3'],
    images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=500&q=80', 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=500&q=80']
  },
  {
    category: 'Home & Furniture',
    sub: 'Beds',
    brands: ['Wakefit', 'Sleepwell', 'Hometown', 'Urban Ladder'],
    titles: ['Memory Foam Mattress', 'King Size Bed', 'Upholstered Bed', 'Storage Bed'],
    priceRange: [15999, 84999],
    descTemplates: ['orthopedic comfort', 'edge-to-edge support', 'temperature regulation', 'dust mite protection'],
    images: ['https://images.unsplash.com/photo-1494526585095-c41746248156?w=500&q=80', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80']
  },
  {
    category: 'Home & Furniture',
    sub: 'Lighting',
    brands: ['Philips', 'Syska', 'Havells', 'Wipro'],
    titles: ['Smart LED Bulb', 'Designer Pendant Light', 'Table Lamp', 'Floor Lamp'],
    priceRange: [799, 8999],
    descTemplates: ['warm white illumination', 'energy efficient', 'remote app control', 'dimmable lighting'],
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80', 'https://images.unsplash.com/photo-1557838921-4b3bbf8b35f5?w=500&q=80']
  },
  {
    category: 'Appliances & Kitchen',
    sub: 'Kitchen Appliances',
    brands: ['Philips', 'Prestige', 'Morphy Richards', 'Panasonic'],
    titles: ['Air Fryer', 'Mixer Grinder', 'Electric Kettle', 'Coffee Maker'],
    priceRange: [2999, 14999],
    descTemplates: ['rapid hot air cooking', 'multi-speed blender', 'auto shut-off', 'barista-grade espresso'],
    images: ['https://images.unsplash.com/photo-1517957754645-2ca1c1bb6e78?w=500&q=80', 'https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=500&q=80']
  },
  {
    category: 'Appliances & Kitchen',
    sub: 'Cleaning',
    brands: ['Dyson', 'Eureka Forbes', 'Philips', 'Karcher'],
    titles: ['Cordless Vacuum', 'Wet & Dry Vacuum', 'Robot Mop', 'Steam Cleaner'],
    priceRange: [7999, 44999],
    descTemplates: ['powerful suction', 'multi-surface cleaning', 'compact design', 'HEPA filtration'],
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9d3c8fcb?w=500&q=80', 'https://images.unsplash.com/photo-1536610777046-66827c1927a4?w=500&q=80']
  },
  {
    category: 'Beauty & Personal Care',
    sub: 'Skincare',
    brands: ['The Body Shop', 'Clinique', 'Mamaearth', 'Neutrogena'],
    titles: ['Vitamin C Serum', 'Anti-Age Moisturiser', 'Sunscreen SPF 50', 'Hydrating Toner'],
    priceRange: [499, 2499],
    descTemplates: ['oil-free formula', 'dermatologist tested', 'non-comedogenic', 'cruelty free'],
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80', 'https://images.unsplash.com/photo-1499084732479-de2c02d45fcc?w=500&q=80']
  },
  {
    category: 'Beauty & Personal Care',
    sub: 'Hair Care',
    brands: ["L'Oreal", 'Tresemme', 'Dove', 'Pantene'],
    titles: ['Keratin Shampoo', 'Hair Fall Conditioner', 'Hair Serum', 'Dry Shampoo'],
    priceRange: [199, 1299],
    descTemplates: ['sulfate free', 'nutrient rich', 'frizz control', 'colour protection'],
    images: ['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80']
  },
  {
    category: 'Beauty & Personal Care',
    sub: 'Fragrances',
    brands: ['Calvin Klein', 'Gucci', 'Davidoff', 'Versace'],
    titles: ['Eternity Eau de Parfum', 'Bright Crystal', 'Cool Water', 'Dylan Blue'],
    priceRange: [1499, 5999],
    descTemplates: ['long lasting scent', 'luxury packaging', 'fresh and floral', 'evening wear fragrance'],
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80', 'https://images.unsplash.com/photo-1573159720121-8fec8d3927fd?w=500&q=80']
  },
  {
    category: 'Grocery',
    sub: 'Staples',
    brands: ['India Gate', 'Daawat', 'Tata Sampann', '24 Mantra Organic'],
    titles: ['Basmati Rice', 'Multigrain Atta', 'Organic Quinoa', 'Premium Moong Dal'],
    priceRange: [199, 799],
    descTemplates: ['aged for flavour', 'stone ground', 'gluten free', 'source of protein'],
    images: ['https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80', 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500&q=80']
  },
  {
    category: 'Grocery',
    sub: 'Beverages',
    brands: ['Tata', 'Bru', 'Coca-Cola', 'Paper Boat'],
    titles: ['Premium Coffee', 'Green Tea', 'Cold Pressed Juice', 'Sparkling Water'],
    priceRange: [99, 499],
    descTemplates: ['energizing flavour', 'natural ingredients', 'no added sugar', 'premium roast'],
    images: ['https://images.unsplash.com/photo-1510626176961-4b34f54c9de2?w=500&q=80', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&q=80']
  },
  {
    category: 'Lifestyle & Hobbies',
    sub: 'Sports',
    brands: ['Nike', 'Adidas', 'Puma', 'Decathlon'],
    titles: ['Running Shoes', 'Yoga Mat', 'Fitness Tracker', 'Gym Gloves'],
    priceRange: [999, 9999],
    descTemplates: ['breathable material', 'supportive cushion', 'sweat resistant', 'durable grip'],
    images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80', 'https://images.unsplash.com/photo-1517642374464-00c6e553b3c7?w=500&q=80']
  },
  {
    category: 'Lifestyle & Hobbies',
    sub: 'Books & Accessories',
    brands: ['Penguin', 'HarperCollins', 'Bloomsbury', 'Random House'],
    titles: ['Bestselling Novel', 'Modern Cookery Book', 'Photography Guide', 'Startup Playbook'],
    priceRange: [249, 1499],
    descTemplates: ['award winning author', 'inspirational stories', 'easy recipes', 'business strategies'],
    images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=500&q=80']
  }
];

// Helper to find an image that matches a keyword in the product name
function findMatchingImage(name, images, titles) {
  const lowerName = name.toLowerCase();
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i].toLowerCase();
    if (lowerName.includes(title)) {
      // Use a deterministic image for the matching title
      return images[i % images.length];
    }
  }
  // Fallback: try to match by keyword
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (lowerName.includes(lastPart.split('.')[0])) {
      return url;
    }
  }
  // Fallback: random
  return randomFrom(images);
}

categoryBlueprints.forEach((blueprint) => {
  const itemsToCreate = 8;
  for (let i = 0; i < itemsToCreate; i += 1) {
    const brand = randomFrom(blueprint.brands);
    const title = `${brand} ${randomFrom(blueprint.titles)}`;
    const price = randomInt(blueprint.priceRange[0], blueprint.priceRange[1]);
    const rating = parseFloat((randomInt(40, 49) / 10).toFixed(1));
    const image = findMatchingImage(title, blueprint.images, blueprint.titles);
    const desc = `${randomFrom(blueprint.descTemplates)}, crafted for modern living.`;

    additionalProducts.push({
      name: title,
      brand,
      price,
      cat: blueprint.category,
      sub: blueprint.sub,
      rating,
      img: image,
      desc
    });
  }
});

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const catalog = require('./catalog.json');
    const mockProducts = loadMockProducts();
    const combinedCatalog = dedupeProducts([...catalog, ...additionalProducts, ...mockProducts]);

    const products = combinedCatalog.map((p, i) => ({
      id: i + 1,
      name: p.name,
      price: p.price,
      category: p.cat,
      subcategory: p.sub,
      brand: p.brand,
      rating: p.rating,
      description: p.desc,
      image: p.img
    }));

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(products);
    console.log(`Successfully inserted ${products.length} products!`);
    console.log(`Source totals -> catalog: ${catalog.length}, generated: ${additionalProducts.length}, mock: ${mockProducts.length}`);

    mongoose.connection.close();
  } catch (err) {
    console.error('Seeding error:', err);
    mongoose.connection.close();
  }
};

seed();
