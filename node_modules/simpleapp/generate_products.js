const fs = require('fs');

const categories = ["Electronics", "Apparel", "Home", "Accessories", "Sports"];
const brands = {
  "Electronics": ["SAMSUNG", "APPLE", "ASUS", "SONY", "Logitech", "Dell", "HP"],
  "Apparel": ["PUMA", "US Polo Assn", "LEVI'S", "ONLY", "NIKE", "Adidas", "Zara"],
  "Home": ["PHILIPS", "Pigeon", "Wakefit", "MILTON", "Dyson", "LG", "Bosch"],
  "Accessories": ["Fastrack", "American Tourister", "Ray-Ban", "CASIO", "Tommy Hilfiger", "Fossil"],
  "Sports": ["NIVIA", "YONEX", "Kobo", "Strauss", "MRF", "Spalding", "Wilson"]
};

const nouns = {
  "Electronics": ["Smartphone", "Laptop", "Wireless Mouse", "Bluetooth Headphones", "Smart TV", "Tablet", "Monitor", "Keyboard", "Earbuds", "Speaker"],
  "Apparel": ["Running Shoes", "Casual Shirt", "Slim Fit Jeans", "Round Neck T-Shirt", "Jacket", "Sweater", "Track Pants", "Sneakers", "Shorts", "Hoodie"],
  "Home": ["Mixer Grinder", "Electric Kettle", "Memory Foam Mattress", "Thermosteel Flask", "Air Purifier", "Microwave Oven", "Vacuum Cleaner", "Blender", "Coffee Maker", "Toaster"],
  "Accessories": ["Smartwatch", "Backpack", "Aviator Sunglasses", "Digital Watch", "Leather Wallet", "Travel Bag", "Belt", "Cap", "Beanie", "Duffel Bag"],
  "Sports": ["Football", "Badminton Racquet", "Dumbbell Set", "Yoga Mat", "Cricket Bat", "Tennis Racquet", "Basketball", "Jump Rope", "Treadmill", "Resistance Bands"]
};

const images = {
  "Electronics": ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=500&q=80", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80", "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80"],
  "Apparel": ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80", "https://images.unsplash.com/photo-1596755094514-f87e32f85e23?w=500&q=80", "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&q=80", "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&q=80", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"],
  "Home": ["https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&q=80", "https://images.unsplash.com/photo-1585659722983-38ca867e0e7a?w=500&q=80", "https://images.unsplash.com/photo-1585252817293-1ca4e2f9d51e?w=500&q=80", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80"],
  "Accessories": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80", "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80", "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&q=80", "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80"],
  "Sports": ["https://images.unsplash.com/photo-1614632537190-23e4146777bd?w=500&q=80", "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&q=80", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80", "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500&q=80", "https://images.unsplash.com/photo-1531415074963-8339c6563821?w=500&q=80"]
};

function generateProducts(count) {
  const products = [];
  
  for(let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brandList = brands[category];
    const brand = brandList[Math.floor(Math.random() * brandList.length)];
    const nounList = nouns[category];
    const noun = nounList[Math.floor(Math.random() * nounList.length)];
    
    const name = `${brand} ${noun} ${category === 'Electronics' ? 'Pro Max' : ''}`.trim();
    const price = Math.floor(Math.random() * (1000 - 15) + 15) + 0.99;
    
    const ratingDec = (Math.random() * 1.5) + 3.5;
    const rating = parseFloat(ratingDec.toFixed(1));
    
    const imageList = images[category];
    const image = imageList[Math.floor(Math.random() * imageList.length)];
    
    const description = `High quality ${noun.toLowerCase()} by ${brand}. Perfect for your daily needs in the ${category} category. Features excellent durability and modern design.`;

    products.push({
      id: i,
      name,
      price,
      category,
      brand,
      rating,
      description,
      image
    });
  }
  return products;
}

const mockDataContent = `
export const products = ${JSON.stringify(generateProducts(125), null, 2)};

export const featuredCategories = ${JSON.stringify(categories)};
`;

fs.writeFileSync('src/data/mockData.js', mockDataContent);
console.log("Successfully generated 125 standard products!");
