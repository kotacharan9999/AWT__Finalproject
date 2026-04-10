const fs = require('fs');

const userList = `
### 📱 Electronics & Gadgets
1. iPhone
2. Galaxy Smartphone
3. Gaming Laptop
4. Chromebook
5. Monitor Screen
6. Mechanical Keyboard
7. Wireless Mouse
8. Bluetooth Earbuds
9. Noise Cancelling Headphones
10. Smartwatch
11. Smart TV
12. Tablet Pro
13. E-Reader
14. Action Camera
15. DSLR Camera
16. Drone
17. Webcam
18. USB Microphone
19. Power Bank
20. Wi-Fi Router
21. Graphics Card
22. CPU Processor
23. SSD Drive
24. VR Headset

### 👗 Fashion & Apparel
25. Denim Jacket
26. Leather Boots
27. Running Sneakers
28. Graphic Hoodie
29. Summer Dress
30. Cargo Pants
31. Aviator Sunglasses
32. Wristwatch
33. Crossbody Bag
34. Canvas Backpack
35. Wool Scarf
36. Baseball Cap
37. Trench Coat
38. Yoga Leggings
39. Polo Shirt
40. Formal Suit

### 🏠 Home & Furniture
41. Velvet Sofa
42. Dining Chair
43. Coffee Table
44. Ergonomic Office Chair
45. Bookshelf
46. Memory Foam Mattress
47. Wardrobe
48. Floor Lamp
49. TV Stand
50. Recliner
51. Area Rug
52. Shoe Organizer
53. Nightstand
54. Decorative Mirror

### 🍳 Appliances & Kitchen
55. Microwave Oven
56. Refrigerator
57. Washing Machine
58. Air Conditioner
59. Vacuum Cleaner
60. Coffee Cream Maker
61. Espresso Machine
62. Food Processor
63. Mixer Grinder
64. Toaster
65. Induction Cooktop
66. Air Fryer
67. Dishwasher
68. Water Purifier

### 🧸 Lifestyle & Hobbies
69. Acoustic Guitar
70. Electric Keyboard
71. Art Paint Set
72. Sketchbook
73. Telescope
74. Board Game Set
75. Action Figure
76. Building Blocks
77. Skateboard
78. Roller Skates
79. Yoga Mat
80. Dumbbell Set
81. Treadmill
82. Camping Tent
83. Sleeping Bag
84. Fishing Rod
85. Bicycle
86. Motorcycle Helmet
87. Novel Book
88. Tool Kit
89. Power Drill

### 🧴 Beauty & Personal Care
90. Face Serum
91. Hair Dryer
92. Electric Shaver
93. Shampoo
94. Perfume Cologne
95. Makeup Brush
96. Sunscreen Lotion
97. Vitamin Supplements
98. Whey Protein
99. Essential Oils Set
100. Eye Shadow Palette
`;

// Generate random dummy data
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomPrice = () => (Math.random() * (1200 - 15) + 15).toFixed(2);
const getRandomRating = () => (Math.random() * 1.0 + 4.0).toFixed(1);

const parsedProducts = [];
const lines = userList.trim().split('\n');

let currentCategory = "General";

for (const line of lines) {
  if (line.startsWith('###')) {
    currentCategory = line.replace('###', '').replace(/[^\x20-\x7E]/g, '').trim(); 
    continue;
  }
  
  if (line.trim().match(/^\d+\./)) {
    const rawName = line.replace(/^\d+\.\s*/, '').trim();
    if(!rawName) continue;
    
    const id = parsedProducts.length + 1;
    // Extract precise product keywords for image (e.g. "Gaming Laptop" -> "Laptop" or "Gaming,Laptop")
    const words = rawName.split(' ');
    // use the last word predominantly as the subject noun for best image hits
    // Use Pollinations AI to generate a matching, unique product image based on the exact name and ID.
    const image = `https://image.pollinations.ai/prompt/${encodeURIComponent('clean product photography of a ' + rawName + ' on white background')}?seed=${id}&width=500&height=500&nologo=true`;

    parsedProducts.push({
      id,
      name: rawName,
      price: parseFloat(getRandomPrice()),
      category: currentCategory,
      brand: "PremiumBrand",
      rating: parseFloat(getRandomRating()),
      description: `A high-quality ${rawName.toLowerCase()} perfect for your everyday needs. Exceptional durability and finish.`,
      image
    });
  }
}

// Ensure exactly 2000 items
const brands = ["Samsung", "Apple", "Puma", "Philips", "Lenovo", "Nike", "Adidas", "Sony", "LG", "Zara", "Dell", "HP", "Bose", "JBL", "Logitech", "Gucci", "Google", "Microsoft", "Canon", "Nike", "Xiaomi", "OnePlus"];
const categories = [...new Set(parsedProducts.map(p => p.category))];
let count = parsedProducts.length;

while (count < 2000) {
  const baseProduct = parsedProducts[getRandomInt(0, parsedProducts.length - 1)];
  const brand = brands[getRandomInt(0, brands.length - 1)];
  const variant = ['Pro', 'Max', 'Premium', 'Ultra', 'Plus', 'Edition', 'Set', 'Pack', 'Advanced', 'X', 'Z', 'Signature', 'Lite', 'Mini', 'Nano', 'Genesis'][getRandomInt(0, 15)];
  
  const id = count + 1;
  const fullName = `${brand} ${baseProduct.name} ${variant}`;
  
  // High quality AI generated product image locked to the product ID, virtually 0% repetition.
  const image = `https://image.pollinations.ai/prompt/${encodeURIComponent('clean product photography of a ' + fullName + ' on white background')}?seed=${id}&width=500&height=500&nologo=true`;
  
  parsedProducts.push({
    id,
    name: fullName,
    price: parseFloat((baseProduct.price * (Math.random() * 0.8 + 0.8)).toFixed(2)),
    category: baseProduct.category,
    brand: brand,
    rating: parseFloat(getRandomRating()),
    description: `Experience premium quality with this ${variant.toLowerCase()} ${baseProduct.name} by ${brand}. Ships worldwide with expedited delivery options.`,
    image
  });
  count++;
}

// Generate the JS file content
const mockDataContent = `
export const products = ${JSON.stringify(parsedProducts, null, 2)};

export const featuredCategories = ${JSON.stringify(categories)};
`;

fs.writeFileSync('src/data/mockData.js', mockDataContent);
console.log("Successfully generated all 2000 diverse products!");
