const mongoose = require('mongoose');
const Product = require('../models/Product');

const URI = 'mongodb://127.0.0.1:27017/shopdb';

// ─── IMAGE POOLS (curated Unsplash) ──────────────────────────
const IMG = {
  // Electronics
  phone: [
    'photo-1592899677977-9c10ca588bbd','photo-1610945415295-d9bbf067e59c','photo-1598327105666-5b89351aff97',
    'photo-1601784551446-20c9e07cdbdb','photo-1511707171634-5f897ff02aa9','photo-1605236453806-6ff36851218e',
    'photo-1556656793-08538906a9f8','photo-1580910051074-3eb694886f47','photo-1512054502232-10a0a035d672'
  ],
  laptop: [
    'photo-1517336714731-489689fd1ca8','photo-1496181133206-80ce9b88a853','photo-1593642632559-0c6d3fc62b89',
    'photo-1525547719571-a2d4ac8945e2','photo-1588872657578-7efd1f1555ed','photo-1541807084-5c52b6b49c75',
    'photo-1531297484001-80022131f5a1','photo-1498050108023-c5249f4df085','photo-1603302576837-37561b2e2302'
  ],
  headphone: [
    'photo-1505740420928-5e560c06d30e','photo-1546435770-a3e426bf472b','photo-1583394838336-acd977736f90',
    'photo-1484704849700-f032a568e944','photo-1524678606370-a47ad25cb82a','photo-1613040809024-b4ef7ba99bc3'
  ],
  speaker: [
    'photo-1608043152269-423dbba4e7e1','photo-1589003077984-894e133dabab','photo-1558537348-c0f8e733989d'
  ],
  tv: [
    'photo-1593359677879-a4bb92f829e1','photo-1461151304267-38535e780c79','photo-1593784991095-a205069470b6'
  ],
  tablet: [
    'photo-1544244015-0df4b3ffc6b0','photo-1585790050230-5dd28404ccb9','photo-1561154464-82e6e0bee670'
  ],
  camera: [
    'photo-1516035069371-29a1b244cc32','photo-1495745966610-2a67f2297e5e','photo-1502920917128-1aa500764cbd'
  ],
  watch: [
    'photo-1523275335684-37898b6baf30','photo-1579586337278-3befd40fd17a','photo-1524805444758-089113d48a6d',
    'photo-1539874754764-5a96559165b0','photo-1522312346375-d1a52e2b99b3'
  ],
  mouse: ['photo-1527864550417-7fd91fc51a46','photo-1615663245857-ac93bb7c39e7'],
  keyboard: ['photo-1618384887929-16ec33fab9ef','photo-1587829741301-dc798b83add3'],
  gaming: ['photo-1612287230202-1ff1d85d1bdf','photo-1593305841991-05c297ba4575','photo-1542751371-adc38448a05e'],
  drone: ['photo-1473968512647-3e447244af8f','photo-1507582020474-9a35b7d455d9'],
  monitor: ['photo-1527443224154-c4a3942d3acf','photo-1585792180666-f7347c490ee2'],
  earbuds: ['photo-1606741965326-cb990ae01bb2','photo-1590658268037-6bf12f032f55'],
  router: ['photo-1606904825846-647eb07f5be2'],
  powerbank: ['photo-1609091839311-d5365f9ff1c5'],
  ssd: ['photo-1597872200969-2b65d56bd16b'],

  // Fashion - Ladies
  saree: ['photo-1610030469983-98e550d6193c','photo-1583391733981-7e6491a1aa91'],
  dress: ['photo-1496747611176-843222e1e57c','photo-1572804013309-59a88b7e92f1','photo-1515372039744-b8f02a3ae446'],
  kurti: ['photo-1583391733981-7e6491a1aa91','photo-1610030469983-98e550d6193c'],
  handbag: ['photo-1548036328-c9fa89d128fa','photo-1584917865442-de89df76afd3','photo-1566150905458-1bf1fc113f0d'],
  heels: ['photo-1543163521-1bf539c55dd2','photo-1515347619252-60a4bf4fff4f'],
  jwellery: ['photo-1535632066927-ab7c9ab60908','photo-1515562141589-67f0d89a2e1c','photo-1611591437281-460bfbe1220a'],
  lehenga: ['photo-1583391733981-7e6491a1aa91'],
  womenjeans: ['photo-1542272604-787c3835535d','photo-1541099649105-f69ad21f3246'],
  womenactive: ['photo-1571945153237-4929e783af4a','photo-1506629082955-511b1aa562c8'],

  // Fashion - Mens
  shirt: ['photo-1596755094514-f87e34085b2c','photo-1602810318383-e386cc2a3ccf','photo-1563389234808-d4e9e4b671e3'],
  tshirt: ['photo-1586363104862-3a5e2ab60d99','photo-1521572163474-6864f9cf17ab','photo-1576566588028-4147f3842f27'],
  chinos: ['photo-1473966968600-fa801b869a1a','photo-1624378439575-d8705ad7ae80'],
  jacket: ['photo-1576993537667-c6d2386f90a2','photo-1551028719-00167b16eac5'],
  mensshoes: ['photo-1542291026-7eec264c27ff','photo-1549298916-b41d501d3772','photo-1460353581641-37baddab0fa2'],
  formalshoes: ['photo-1614252235316-8c857d38b5f4','photo-1533867617858-e7b97e060509'],
  suit: ['photo-1594938298603-c8148c4b4c7f','photo-1507679799987-c73779587ccf'],
  menwatch: ['photo-1524805444758-089113d48a6d','photo-1539874754764-5a96559165b0'],
  backpack: ['photo-1553062407-98eeb64c6a62','photo-1581605405669-fcdf81165afa'],
  sunglasses: ['photo-1572635196237-14b3f281503f','photo-1511499767150-a48a237f0083'],
  sneaker: ['photo-1549298916-b41d501d3772','photo-1542291026-7eec264c27ff','photo-1595950653106-6c9ebd614d3a'],
  perfume: ['photo-1541643600914-78b084683702','photo-1523293182086-7651a899d37f','photo-1594035910387-fea081728d72'],
  kurta: ['photo-1604176354204-9268737828e4'],

  // Home & Furniture
  sofa: ['photo-1555041469-a586c61ea9bc','photo-1493663284031-b7e3aefcae8e','photo-1540574163026-643ea20ade25'],
  bed: ['photo-1505693416388-ac5ce068fe85','photo-1616594039964-ae9021a400a0'],
  mattress: ['photo-1631049307264-da0ec9d70304'],
  lamp: ['photo-1507473885765-e6ed057ab3fe','photo-1513506003901-1e6a229e2d15'],
  wardrobe: ['photo-1558997519-83ea9252edf8'],
  dining: ['photo-1617806118233-18e1de247200','photo-1615066390971-03e4e1c36ddf'],
  bookshelf: ['photo-1594620302200-9a762244a156'],
  curtain: ['photo-1513694203232-719a280e022f'],
  cushion: ['photo-1584100936595-c0654b55a2e2'],
  rug: ['photo-1600166898405-da9535204843'],
  chair: ['photo-1592078615290-033ee584e267','photo-1503602642458-232111445657'],
  desk: ['photo-1518455027359-f3f8164ba6bd','photo-1611269154421-4e27233ac5c7'],
  mirror: ['photo-1618220179428-22790b461013'],
  nightstand: ['photo-1532372576444-dda954194ad0'],
  vase: ['photo-1581783898377-1c85bf937427'],

  // Appliances
  airfryer: ['photo-1648455250413-44c04e8e4a1c'],
  mixer: ['photo-1585515320310-259814833e62'],
  oven: ['photo-1574269909862-7e1d70bb8078'],
  fridge: ['photo-1571175443880-49e1d25b2bc5'],
  washer: ['photo-1626806819282-2c1dc01a5e0c'],
  vacuum: ['photo-1558618666-fcd25c85f82e'],
  iron: ['photo-1585771724684-38269d6639fd'],
  coffee: ['photo-1517668808822-9ebb02f2a0e6','photo-1495474472287-4d71bcdd2085'],
  kettle: ['photo-1556228578-0d85b1a4d571'],
  induction: ['photo-1556909114-f6e7ad7d3136'],
  waterpurifier: ['photo-1548839140-29a749e1cf4d'],

  // Beauty
  serum: ['photo-1620916566398-39f1143ab7be','photo-1571781926291-c477ebfd024b'],
  moisturizer: ['photo-1556228724-4e7f5fb6e2e9'],
  sunscreen: ['photo-1556228578-0d85b1a4d571'],
  shampoo: ['photo-1631729371254-42c2892f0e6e'],
  lipstick: ['photo-1586495777744-4413f21062fa'],
  foundation: ['photo-1596462502278-27bfdc403348'],
  skincare: ['photo-1556228578-0d85b1a4d571','photo-1570194065650-d99fb4b38b17'],
  hairdryer: ['photo-1522337360788-8b13dee7a37e'],
  nailpolish: ['photo-1604654894610-df63bc536371'],
  vitamin: ['photo-1550572017-edd951aa8f72'],
  essentialoil: ['photo-1608571423902-eed4a5ad8108'],

  // Grocery
  rice: ['photo-1586201375761-83865001e31c'],
  oil: ['photo-1474979266404-7eaacbcd87c5'],
  tea: ['photo-1564890369478-c89ca6d9cde9'],
  honey: ['photo-1587049352846-4a222e784d38'],
  chocolate: ['photo-1481391319762-47dff72954d9','photo-1606312619070-d48b4c652a52'],
  snack: ['photo-1621939514649-280e2ee25f60'],
  juice: ['photo-1534353473418-4cfa6c56fd38'],
  protein: ['photo-1593095948071-474c5cc2c673'],
  spice: ['photo-1596040033222-09e0d80e9136'],
  pasta: ['photo-1551462147-ff29053bfc14'],
  cereal: ['photo-1517456793572-1d8efd6dc135'],

  // Lifestyle
  yogamat: ['photo-1601925260368-ae2f83cf8b7f'],
  dumbbell: ['photo-1534438327276-14e5300c3a48','photo-1517963879433-6ad2b056d712'],
  tent: ['photo-1504280390367-361c6d9f38f4'],
  bicycle: ['photo-1485965120184-e220f721d03e'],
  cricketbat: ['photo-1531415074968-036ba1b575da'],
  football: ['photo-1575361204480-aadea25e6e68'],
  novel: ['photo-1544947950-fa07a98d237f','photo-1512820790803-83ca734da794'],
  boardgame: ['photo-1610890716171-6b1bb98ffd09'],
  guitar: ['photo-1510915361894-db8b60106cb1'],
  artsupply: ['photo-1513364776144-60967b0f800f'],
  telescope: ['photo-1532968961962-8a0cb3a2d4f5'],
};

function unsplash(key, idx) {
  const pool = IMG[key];
  if (!pool || pool.length === 0) return `https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80`;
  return `https://images.unsplash.com/${pool[idx % pool.length]}?w=600&q=80`;
}

// ─── PRODUCT TEMPLATES ──────────────────────────────────────
const TEMPLATES = [
  // ══════ ELECTRONICS (750 products) ══════
  // Smartphones (150)
  ...(() => {
    const brands = ['Apple','Samsung','OnePlus','Xiaomi','Realme','Google','Vivo','Oppo','Nothing','Motorola'];
    const models = ['Pro Max','Ultra','5G','Lite','Plus','SE','Neo','GT','FE','Standard'];
    const series = ['15','14','13','24','23','12','11','S24','A55','Z Flip'];
    const items = [];
    for (let i = 0; i < 150; i++) {
      const brand = brands[i % brands.length];
      const model = models[i % models.length];
      const s = series[i % series.length];
      items.push({ name: `${brand} ${s} ${model}`, brand, category: 'Electronics & Gadgets', subcategory: 'Smartphones', imgKey: 'phone', price: 12999 + (i * 731 % 140000), rating: 4 + (i % 10) / 10 });
    }
    return items;
  })(),
  // Laptops (120)
  ...(() => {
    const brands = ['Apple','Dell','HP','ASUS','Lenovo','Acer','MSI','Microsoft','Huawei','Samsung'];
    const models = ['MacBook Air M3','XPS 15','Spectre x360','ROG Strix G16','IdeaPad Slim 5','Swift Go 14','Stealth 16','Surface Laptop 5','MateBook X Pro','Galaxy Book3 Pro'];
    const items = [];
    for (let i = 0; i < 120; i++) {
      items.push({ name: `${brands[i%brands.length]} ${models[i%models.length]} ${['i5','i7','i9','Ryzen 5','Ryzen 7','M2','M3','i5 13th','Ryzen 9','Core Ultra'][i%10]}`, brand: brands[i%brands.length], category: 'Electronics & Gadgets', subcategory: 'Laptops', imgKey: 'laptop', price: 42999 + (i * 1200 % 180000), rating: 4.2 + (i%8)/10 });
    }
    return items;
  })(),
  // Headphones (80)
  ...(() => {
    const items = [];
    const brands = ['Sony','Bose','JBL','Sennheiser','Audio-Technica','Beats','Marshall','Skullcandy','AKG','Jabra'];
    const types = ['WH-1000XM5','QuietComfort 45','Tune 770NC','HD 660S','ATH-M50x','Studio Pro','Major IV','Crusher ANC','N700NC','Elite 85t'];
    for (let i = 0; i < 80; i++) {
      items.push({ name: `${brands[i%brands.length]} ${types[i%types.length]}`, brand: brands[i%brands.length], category: 'Electronics & Gadgets', subcategory: 'Audio', imgKey: 'headphone', price: 1999 + (i*500%28000), rating: 4.3+(i%7)/10 });
    }
    return items;
  })(),
  // Speakers (40)
  ...(() => {
    const items = [];
    const brands = ['JBL','Sony','Bose','Marshall','Ultimate Ears','Harman Kardon','Bang & Olufsen','Sonos'];
    const models = ['Flip 6','SRS-XB43','SoundLink Flex','Stanmore III','Boom 3','Aura Studio 3','Beosound A1','Roam 2'];
    for (let i = 0; i < 40; i++) {
      items.push({ name: `${brands[i%brands.length]} ${models[i%models.length]}`, brand: brands[i%brands.length], category: 'Electronics & Gadgets', subcategory: 'Audio', imgKey: 'speaker', price: 2499+(i*800%35000), rating: 4.2+(i%8)/10 });
    }
    return items;
  })(),
  // TVs (50)
  ...(() => {
    const brands = ['Samsung','LG','Sony','TCL','Xiaomi','OnePlus','Hisense','Vu','Toshiba','Panasonic'];
    const sizes = ['43"','50"','55"','65"','75"'];
    const types = ['4K QLED','4K OLED','4K UHD','Smart LED','Crystal UHD'];
    const items = [];
    for (let i = 0; i < 50; i++) {
      items.push({ name: `${brands[i%brands.length]} ${sizes[i%sizes.length]} ${types[i%types.length]} Smart TV`, brand: brands[i%brands.length], category: 'Electronics & Gadgets', subcategory: 'Televisions', imgKey: 'tv', price: 24999+(i*2000%200000), rating: 4.1+(i%9)/10 });
    }
    return items;
  })(),
  // Tablets (40)
  ...(() => {
    const combos = [
      ['Apple','iPad Pro 12.9"'],['Apple','iPad Air M2'],['Samsung','Galaxy Tab S9 Ultra'],['Samsung','Galaxy Tab A9'],
      ['Lenovo','Tab P12 Pro'],['Xiaomi','Pad 6'],['OnePlus','Pad Go'],['Huawei','MatePad Pro'],['Microsoft','Surface Go 4'],['Realme','Pad X']
    ];
    const items = [];
    for (let i = 0; i < 40; i++) {
      const [b,m] = combos[i%combos.length];
      items.push({ name: `${b} ${m} ${['Wi-Fi','5G','128GB','256GB'][i%4]}`, brand: b, category: 'Electronics & Gadgets', subcategory: 'Tablets', imgKey: 'tablet', price: 15999+(i*1500%100000), rating: 4.2+(i%8)/10 });
    }
    return items;
  })(),
  // Cameras (30)
  ...(() => {
    const combos = [['Canon','EOS R8'],['Sony','Alpha A7 IV'],['Nikon','Z8'],['Fujifilm','X-T5'],['Canon','EOS R50'],['Sony','ZV-E10'],['Nikon','Z fc'],['GoPro','Hero 12'],['DJI','Osmo Pocket 3'],['Panasonic','Lumix S5 II']];
    const items = [];
    for (let i = 0; i < 30; i++) {
      const [b,m] = combos[i%combos.length];
      items.push({ name: `${b} ${m}`, brand: b, category: 'Electronics & Gadgets', subcategory: 'Cameras', imgKey: 'camera', price: 29999+(i*3000%200000), rating: 4.4+(i%6)/10 });
    }
    return items;
  })(),
  // Smartwatches (50)
  ...(() => {
    const combos = [['Apple','Watch Series 9'],['Samsung','Galaxy Watch 6'],['Garmin','Forerunner 265'],['Fitbit','Charge 6'],['Amazfit','GTR 4'],['Noise','ColorFit Ultra 3'],['boAt','Wave Sigma'],['Fire-Boltt','Phoenix Ultra'],['OnePlus','Watch 2'],['Titan','Smart 2']];
    const items = [];
    for (let i = 0; i < 50; i++) {
      const [b,m] = combos[i%combos.length];
      items.push({ name: `${b} ${m} ${['GPS','LTE','Titanium','Sport','Classic'][i%5]}`, brand: b, category: 'Electronics & Gadgets', subcategory: 'Smartwatches', imgKey: 'watch', price: 2999+(i*800%80000), rating: 4.1+(i%9)/10 });
    }
    return items;
  })(),
  // Gaming & Peripherals (60)
  ...(() => {
    const items = [];
    const prods = [
      ['Logitech','MX Master 3S Mouse','mouse'],['Razer','DeathAdder V3 Mouse','mouse'],['Corsair','K70 RGB Keyboard','keyboard'],['HyperX','Alloy Origins Keyboard','keyboard'],
      ['ASUS','ROG Swift Monitor','monitor'],['LG','UltraGear 27" Monitor','monitor'],['SteelSeries','Arctis Nova Pro','headphone'],['Razer','Barracuda X Headset','headphone'],
      ['PlayStation','DualSense Controller','gaming'],['Xbox','Elite Controller','gaming'],['Logitech','G Pro X Superlight','mouse'],['Razer','Viper Ultimate','mouse'],
      ['Samsung','T7 Shield SSD 2TB','ssd'],['WD','My Passport SSD 1TB','ssd'],['DJI','Mini 4 Pro Drone','drone'],['DJI','Avata 2','drone'],
      ['Anker','PowerCore 26800','powerbank'],['Xiaomi','20000mAh Power Bank','powerbank'],['TP-Link','Archer AX73 Router','router'],['ASUS','RT-AX86U Router','router']
    ];
    for (let i = 0; i < 60; i++) {
      const [b,n,k] = prods[i%prods.length];
      items.push({ name: `${b} ${n} ${['Pro','Elite','Max','Ultra','V2'][i%5]}`, brand: b, category: 'Electronics & Gadgets', subcategory: 'Peripherals', imgKey: k, price: 1499+(i*700%25000), rating: 4.3+(i%7)/10 });
    }
    return items;
  })(),
  // Earbuds (30)
  ...(() => {
    const items = [];
    const combos = [['Apple','AirPods Pro 2'],['Samsung','Galaxy Buds FE'],['Sony','WF-1000XM5'],['JBL','Tune Buds'],['Jabra','Elite 85t'],['Nothing','Ear 2'],['OnePlus','Buds Pro 2'],['Bose','QuietComfort Earbuds II'],['Google','Pixel Buds Pro'],['boAt','Airdopes 500 ANC']];
    for (let i = 0; i < 30; i++) {
      const [b,m] = combos[i%combos.length];
      items.push({ name: `${b} ${m}`, brand: b, category: 'Electronics & Gadgets', subcategory: 'Audio', imgKey: 'earbuds', price: 1599+(i*600%30000), rating: 4.2+(i%8)/10 });
    }
    return items;
  })(),

  // ══════ LADIES CORNER (400 products) ══════
  ...(() => {
    const items = [];
    const cats = [
      { sub: 'Sarees', names: ['Silk Banarasi Saree','Kanjivaram Silk Saree','Chiffon Printed Saree','Georgette Saree','Cotton Handloom Saree','Art Silk Saree','Organza Saree','Linen Saree'], brands: ['Nalli','SareeMandir','Kalyan','FabIndia','BIBA','Soch','W','Aurelia'], key: 'saree' },
      { sub: 'Dresses', names: ['Floral Maxi Dress','Bodycon Midi Dress','A-Line Dress','Wrap Dress','Shirt Dress','Cocktail Dress','Sundress','Off-Shoulder Dress'], brands: ['Zara','H&M','ONLY','Vero Moda','Forever 21','Mango','AND','FabAlley'], key: 'dress' },
      { sub: 'Kurtis', names: ['Embroidered Anarkali','Cotton A-Line Kurti','Block Print Kurti','Palazzo Kurti Set','Straight Fit Kurti','Rayon Printed Kurti','Silk Blend Kurti','Asymmetric Kurti'], brands: ['BIBA','W','Global Desi','Aurelia','Libas','Anouk','Jaipur Kurti','Rangmanch'], key: 'kurti' },
      { sub: 'Handbags', names: ['Leather Tote Bag','Crossbody Sling','Clutch Evening Bag','Bucket Bag','Hobo Bag','Satchel Handbag','Wristlet Pouch','Quilted Chain Bag'], brands: ['Caprese','Lavie','Hidesign','Baggit','Lino Perros','Da Milano','Michael Kors','Coach'], key: 'handbag' },
      { sub: 'Footwear', names: ['Strappy Heeled Sandals','Block Heel Pumps','Flat Ballerinas','Wedge Sandals','Ankle Boots','Kolhapuri Chappals','Sneakers','Loafers'], brands: ['Inc.5','Catwalk','Metro','Mochi','Clarks','Aldo','Steve Madden','Charles & Keith'], key: 'heels' },
      { sub: 'Jewellery', names: ['Gold Stud Earrings','Diamond Pendant Set','Kundan Necklace','Silver Anklet','Pearl Bracelet','Temple Jewellery Set','Bangles Set','Chandbali Earrings'], brands: ['Tanishq','Malabar Gold','CaratLane','GIVA','Zaveri Pearls','Rubans','Voylla','BlueStone'], key: 'jwellery' },
      { sub: 'Jeans', names: ['Skinny Fit Jeans','Mom Jeans','Bootcut Jeans','Wide Leg Jeans','Boyfriend Jeans','High Rise Jeans','Ripped Jeans','Straight Fit Jeans'], brands: ['Levis','Pepe','Wrangler','Lee','Roadster','H&M','Mango','ONLY'], key: 'womenjeans' },
      { sub: 'Activewear', names: ['High Waist Yoga Pants','Sports Bra','Gym Tank Top','Running Shorts','Track Jacket','Leggings','Hoodie Sweatshirt','Oversized Windbreaker'], brands: ['Nike','Adidas','Puma','Reebok','Under Armour','Decathlon','H&M','Jockey'], key: 'womenactive' },
    ];
    let idx = 0;
    for (const cat of cats) {
      for (let i = 0; i < 50; i++) {
        items.push({ name: `${cat.brands[i%cat.brands.length]} ${cat.names[i%cat.names.length]}`, brand: cat.brands[i%cat.brands.length], category: 'Ladies Corner', subcategory: cat.sub, imgKey: cat.key, price: 499+(i*300%15000), rating: 4.0+(i%10)/10 });
        idx++;
      }
    }
    return items;
  })(),

  // ══════ MENS CORNER (400 products) ══════
  ...(() => {
    const items = [];
    const cats = [
      { sub: 'Formal Shirts', names: ['Slim Fit White Shirt','Checked Formal Shirt','Solid Blue Shirt','French Cuff Shirt','Dobby Texture Shirt','Oxford Button Down','Linen Formal Shirt','Pinstripe Shirt'], brands: ['Van Heusen','Arrow','Louis Philippe','Peter England','Raymond','Blackberrys','Park Avenue','Allen Solly'], key: 'shirt' },
      { sub: 'T-Shirts', names: ['Polo T-Shirt','Round Neck Graphic Tee','V-Neck Solid Tee','Henley T-Shirt','Oversized Drop Shoulder','Striped Polo','Printed Band Tee','Slim Fit Crew Neck'], brands: ['US Polo','Tommy Hilfiger','Jack & Jones','Levis','United Colors of Benetton','Pepe Jeans','Flying Machine','Roadster'], key: 'tshirt' },
      { sub: 'Trousers', names: ['Slim Fit Chinos','Formal Pleated Trouser','Cargo Pants','Linen Trouser','Jogger Pants','Slim Stretchable Jeans','Regular Fit Jeans','Corduroy Trouser'], brands: ['Allen Solly','Peter England','U.S. Polo','Dockers','Gap','Wrangler','Levis','Breakbounce'], key: 'chinos' },
      { sub: 'Jackets', names: ['Denim Jacket','Leather Biker Jacket','Bomber Jacket','Puffer Jacket','Windcheater','Quilted Jacket','Suede Jacket','Varsity Jacket'], brands: ['Levis','Pepe Jeans','H&M','Zara','Jack & Jones','Wildcraft','Columbia','The North Face'], key: 'jacket' },
      { sub: 'Footwear', names: ['Running Shoes','Leather Formal Shoes','Canvas Sneakers','Loafers','Sports Sandals','High Top Sneakers','Derby Shoes','Monk Strap Shoes'], brands: ['Nike','Adidas','Puma','Red Tape','Clarks','Woodland','Skechers','New Balance'], key: 'mensshoes' },
      { sub: 'Suits', names: ['Slim Fit Suit Navy','Two-Piece Checkered Suit','Three-Piece Black Suit','Linen Summer Suit','Tuxedo Set','Double Breasted Suit','Blazer & Trouser Set','Nehru Jacket Set'], brands: ['Raymond','Louis Philippe','Van Heusen','Blackberrys','Park Avenue','Manyavar','Arrow','Brooks Brothers'], key: 'suit' },
      { sub: 'Ethnic Wear', names: ['Kurta Pyjama Set','Sherwani','Nehru Jacket','Dhoti Kurta set','Bandhgala Suit','Pathani Suit','Jodhpuri Suit','Angrakha Kurta'], brands: ['Manyavar','FabIndia','Peter England','Sojanya','Vastramay','Kisah','Rohit Bal','Manish Malhotra'], key: 'kurta' },
      { sub: 'Accessories', names: ['Chronograph Watch','Classic Aviator Sunglasses','Leather Belt','Laptop Backpack','Wallet Genuine Leather','Tie & Pocket Square Set','Cap Snapback','Perfume EDT'], brands: ['Titan','Fossil','Ray-Ban','Fastrack','Tommy Hilfiger','Wildcraft','American Tourister','Dior'], key: 'backpack' },
    ];
    for (const cat of cats) {
      for (let i = 0; i < 50; i++) {
        items.push({ name: `${cat.brands[i%cat.brands.length]} ${cat.names[i%cat.names.length]}`, brand: cat.brands[i%cat.brands.length], category: 'Mens Corner', subcategory: cat.sub, imgKey: cat.key, price: 699+(i*400%25000), rating: 4.1+(i%9)/10 });
      }
    }
    return items;
  })(),

  // ══════ HOME & FURNITURE (400 products) ══════
  ...(() => {
    const items = [];
    const cats = [
      { sub: 'Sofas', names: ['3-Seater Fabric Sofa','L-Shape Corner Sofa','Recliner Sofa','Chesterfield Sofa','Futon Sofa Cum Bed','Velvet Loveseat','Modular Sectional','Sleeper Sofa'], brands: ['IKEA','Urban Ladder','Godrej Interio','HomeTown','Durian','Wakefit','Pepperfry','Nilkamal'], key: 'sofa' },
      { sub: 'Beds', names: ['King Size Bed','Queen Hydraulic Storage Bed','Bunk Bed','Platform Bed','Poster Bed','Upholstered Panel Bed','Day Bed','Trundle Bed'], brands: ['Wakefit','Sleepwell','IKEA','Urban Ladder','HomeTown','Godrej Interio','Durian','Nilkamal'], key: 'bed' },
      { sub: 'Dining', names: ['6-Seater Dining Table Set','4-Seater Round Table','Extendable Dining Table','Marble Top Dining Set','Bench Dining Set','Glass Top Table','Breakfast Bar Set','Folding Dining Table'], brands: ['Urban Ladder','IKEA','HomeTown','Godrej Interio','Pepperfry','RoyalOak','Durian','Nilkamal'], key: 'dining' },
      { sub: 'Lighting', names: ['Pendant Ceiling Lamp','Floor Standing Lamp','Table Study Lamp','LED Strip Lights','Chandelier','Wall Sconce','Desk Lamp','Fairy String Lights'], brands: ['Philips','Syska','Wipro','IKEA','Havells','Orient','Crompton','Bajaj'], key: 'lamp' },
      { sub: 'Storage', names: ['3-Door Wardrobe','Sliding Door Wardrobe','Open Bookshelf','Shoe Rack','TV Entertainment Unit','Chest of Drawers','Corner Shelf','Hall Console Table'], brands: ['IKEA','Urban Ladder','HomeTown','Godrej Interio','Nilkamal','Solimo','Amazon Basics','Pepperfry'], key: 'wardrobe' },
      { sub: 'Decor', names: ['Handwoven Area Rug','Velvet Cushion Cover Set','Blackout Curtains Pair','Wall Art Canvas Print','Decorative Vase','Table Runner','Photo Frame Set','Scented Candle Set'], brands: ['IKEA','H&M Home','Fabindia','Chumbak','Urban Ladder','Good Earth','Ellementry','D\'Decor'], key: 'cushion' },
      { sub: 'Seating', names: ['Ergonomic Office Chair','Gaming Chair','Bean Bag XXL','Accent Arm Chair','Rocking Chair','Bar Stool Set','Study Chair','Papasan Chair'], brands: ['Green Soul','IKEA','Featherlite','Nilkamal','Urban Ladder','Wakefit','Amazon Basics','HNI'], key: 'chair' },
      { sub: 'Tables', names: ['Computer Desk','Coffee Table','Bedside Nightstand','Standing Desk','Nesting Tables Set','Console Table','Folding Table','Writing Desk'], brands: ['IKEA','Urban Ladder','Nilkamal','Wakefit','Amazon Basics','Pepperfry','Godrej Interio','HomeTown'], key: 'desk' },
    ];
    for (const cat of cats) {
      for (let i = 0; i < 50; i++) {
        items.push({ name: `${cat.brands[i%cat.brands.length]} ${cat.names[i%cat.names.length]}`, brand: cat.brands[i%cat.brands.length], category: 'Home & Furniture', subcategory: cat.sub, imgKey: cat.key, price: 1999+(i*800%80000), rating: 4.0+(i%10)/10 });
      }
    }
    return items;
  })(),

  // ══════ APPLIANCES & KITCHEN (300 products) ══════
  ...(() => {
    const items = [];
    const cats = [
      { sub: 'Kitchen', names: ['Digital Air Fryer','Stand Mixer','Juicer Mixer Grinder','Induction Cooktop','Electric Kettle','Coffee Maker','Food Processor','Hand Blender','Toaster Oven','Sandwich Maker'], brands: ['Philips','Prestige','Bajaj','Butterfly','Morphy Richards','Hamilton Beach','KitchenAid','Bosch','Havells','Usha'], key: 'airfryer' },
      { sub: 'Large Appliances', names: ['Double Door Refrigerator','Front Load Washing Machine','Split AC 1.5 Ton','Dishwasher','Top Load Washer','Side by Side Fridge','Window AC','Semi Auto Washer','Chest Freezer','Geyser 15L'], brands: ['Samsung','LG','Whirlpool','Bosch','IFB','Haier','Voltas','Daikin','Godrej','Carrier'], key: 'fridge' },
      { sub: 'Cleaning', names: ['Robot Vacuum Cleaner','Cordless Stick Vacuum','Steam Mop','Handheld Vacuum','Wet & Dry Vacuum','Steam Iron','Garment Steamer','Water Purifier RO','Air Purifier HEPA','Dehumidifier'], brands: ['Dyson','iRobot','Philips','Eureka Forbes','Kent','Mi','Samsung','Honeywell','Livpure','Sharp'], key: 'vacuum' },
    ];
    for (const cat of cats) {
      for (let i = 0; i < 100; i++) {
        items.push({ name: `${cat.brands[i%cat.brands.length]} ${cat.names[i%cat.names.length]} ${['Pro','Plus','Max','Smart','Eco'][i%5]}`, brand: cat.brands[i%cat.brands.length], category: 'Appliances & Kitchen', subcategory: cat.sub, imgKey: cat.key, price: 2999+(i*1500%80000), rating: 4.0+(i%10)/10 });
      }
    }
    return items;
  })(),

  // ══════ BEAUTY & PERSONAL CARE (300 products) ══════
  ...(() => {
    const items = [];
    const cats = [
      { sub: 'Skincare', names: ['Vitamin C Serum','Hyaluronic Acid Moisturizer','Retinol Night Cream','Sunscreen SPF 50','Niacinamide Face Wash','Clay Face Mask','Eye Cream','Facial Toner','AHA BHA Exfoliant','Lip Balm SPF'], brands: ['The Ordinary','Minimalist','CeraVe','Neutrogena','Mamaearth','Plum','Dot & Key','La Roche-Posay','Olay','Biotique'], key: 'serum' },
      { sub: 'Makeup', names: ['Matte Liquid Lipstick','Foundation Full Coverage','Mascara Waterproof','Eyeshadow Palette','Compact Powder','Blush Palette','Kajal Pencil','Lip Gloss','Setting Spray','Bronzer'], brands: ['Maybelline','MAC','Lakme','Nykaa','Sugar','Colorbar','L\'Oreal','NYX','Huda Beauty','Charlotte Tilbury'], key: 'lipstick' },
      { sub: 'Hair Care', names: ['Anti-Dandruff Shampoo','Hair Growth Serum','Keratin Conditioner','Hair Mask Deep Repair','Argan Oil Treatment','Heat Protectant Spray','Dry Shampoo','Hair Straightener','Curling Iron','Hair Dryer 2200W'], brands: ['L\'Oreal','TRESemme','Pantene','Head & Shoulders','Dove','Wow','Mamaearth','Philips','Dyson','Vega'], key: 'shampoo' },
      { sub: 'Fragrances', names: ['Eau de Parfum','Eau de Toilette','Body Mist','Deodorant Spray','Attar Perfume Oil','Cologne','Roll-On Perfume','Gift Set Fragrance','Travel Size EDT','Solid Perfume'], brands: ['Dior','Chanel','Armani','Versace','Hugo Boss','Calvin Klein','Davidoff','Forest Essentials','Ajmal','Wild Stone'], key: 'perfume' },
      { sub: 'Wellness', names: ['Multivitamin Tablets','Omega 3 Fish Oil','Biotin Hair Gummies','Protein Powder Whey','Collagen Supplements','Probiotics Capsules','Melatonin Sleep Aid','Vitamin D3 Drops','Iron Supplement','Calcium Tablets'], brands: ['HealthKart','Muscleblaze','WOW','Himalaya','GNC','Amway','Carbamide Forte','TrueBasics','Fast&Up','Oziva'], key: 'vitamin' },
    ];
    for (const cat of cats) {
      for (let i = 0; i < 60; i++) {
        items.push({ name: `${cat.brands[i%cat.brands.length]} ${cat.names[i%cat.names.length]}`, brand: cat.brands[i%cat.brands.length], category: 'Beauty & Personal Care', subcategory: cat.sub, imgKey: cat.key, price: 199+(i*200%8000), rating: 4.0+(i%10)/10 });
      }
    }
    return items;
  })(),

  // ══════ GROCERY (200 products) ══════
  ...(() => {
    const items = [];
    const cats = [
      { sub: 'Staples', names: ['Basmati Rice 5kg','Whole Wheat Atta 10kg','Toor Dal 2kg','Moong Dal 1kg','Brown Rice 2kg','Quinoa 500g','Oats 1kg','Poha 1kg','Semolina (Suji) 1kg','Besan 1kg'], brands: ['Fortune','Aashirvaad','Tata Sampann','India Gate','Daawat','24 Mantra','Organic Tattva','Sri Sri','Saffola','Patanjali'], key: 'rice' },
      { sub: 'Beverages', names: ['Green Tea 100 Bags','Filter Coffee 500g','Orange Juice 1L','Almond Milk 1L','Protein Shake','Coconut Water Pack','Cold Brew Coffee','Masala Chai Mix','Herbal Tea Sampler','Electrolyte Drink'], brands: ['Tata Tea','Nescafe','Tropicana','Epigamia','MuscleBlaze','Raw Pressery','Sleepy Owl','Chaayos','Organic India','Fast&Up'], key: 'tea' },
      { sub: 'Snacks', names: ['Mixed Nuts Trail Mix','Protein Bar Box','Baked Chips Multipack','Makhana Roasted','Granola Clusters','Dark Chocolate 70%','Dried Fruit Mix','Peanut Butter Crunchy','Popcorn Gourmet','Cookies Assorted'], brands: ['Happilo','RiteBite','Too Yumm','Farmley','Yoga Bar','Cadbury','Nutraj','MyFitness','ACT II','Britannia'], key: 'snack' },
      { sub: 'Cooking', names: ['Extra Virgin Olive Oil 1L','Mustard Oil 5L','Sunflower Oil 5L','Coconut Oil 1L','Ghee 1kg','Honey Raw 500g','Vinegar Apple Cider','Soy Sauce 500ml','Pasta Penne 500g','Noodles Pack of 8'], brands: ['Figaro','Fortune','Saffola','Parachute','Amul','Dabur','Bragg','Ching\'s','Barilla','Maggi'], key: 'oil' },
    ];
    for (const cat of cats) {
      for (let i = 0; i < 50; i++) {
        items.push({ name: `${cat.brands[i%cat.brands.length]} ${cat.names[i%cat.names.length]}`, brand: cat.brands[i%cat.brands.length], category: 'Grocery', subcategory: cat.sub, imgKey: cat.key, price: 99+(i*60%3000), rating: 4.1+(i%9)/10 });
      }
    }
    return items;
  })(),

  // ══════ LIFESTYLE & HOBBIES (200 products) ══════
  ...(() => {
    const items = [];
    const cats = [
      { sub: 'Sports & Fitness', names: ['Premium Yoga Mat','Adjustable Dumbbell Set','Resistance Bands Set','Treadmill Foldable','Exercise Bike','Skipping Rope Speed','Foam Roller','Pull Up Bar','Kettlebell 12kg','Ab Roller Wheel'], brands: ['Decathlon','Nike','Adidas','PowerMax','Boldfit','Strauss','Fitkit','Cultsport','Amazon Basics','Solara'], key: 'dumbbell' },
      { sub: 'Outdoor & Adventure', names: ['2-Person Camping Tent','Trekking Backpack 60L','Sleeping Bag','Hiking Boots','Fishing Rod Set','Binoculars 10x42','Headlamp Rechargeable','Camping Chair Foldable','Water Bottle Insulated','Swiss Knife Multi-tool'], brands: ['Wildcraft','Quechua','Decathlon','Columbia','Mammut','Vango','Merrell','Bushnell','Stanley','Victorinox'], key: 'tent' },
      { sub: 'Books & Media', names: ['Bestseller Fiction Novel','Self-Help Motivational','UPSC Preparation Guide','Programming Handbook','Biography Autobiography','Children Story Collection','Art of War Classic','Cookbook Indian Cuisine','Science Fiction Anthology','Poetry Collection'], brands: ['Penguin','Harper Collins','Arihant','O\'Reilly','Bloomsbury','Scholastic','Pan Macmillan','Westland','Simon & Schuster','Rupa'], key: 'novel' },
      { sub: 'Musical Instruments', names: ['Acoustic Guitar','Digital Piano 88-Key','Ukulele Soprano','Tabla Set','Electronic Drum Kit','Violin Full Size','Flute Bamboo','Mouth Organ Harmonica','Cajon Drum Box','Guitar Amplifier 20W'], brands: ['Yamaha','Casio','Kadence','SG Musical','Roland','Ibanez','Fender','Kala','Meinl','Marshall'], key: 'guitar' },
    ];
    for (const cat of cats) {
      for (let i = 0; i < 50; i++) {
        items.push({ name: `${cat.brands[i%cat.brands.length]} ${cat.names[i%cat.names.length]}`, brand: cat.brands[i%cat.brands.length], category: 'Lifestyle & Hobbies', subcategory: cat.sub, imgKey: cat.key, price: 499+(i*500%30000), rating: 4.0+(i%10)/10 });
      }
    }
    return items;
  })(),
];

async function seed() {
  try {
    await mongoose.connect(URI);
    console.log('Connected to MongoDB. Starting product seed...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    const total = TEMPLATES.length;
    console.log(`Preparing ${total} products...`);

    const products = TEMPLATES.map((t, i) => ({
      id: i + 1,
      name: t.name,
      brand: t.brand,
      category: t.category,
      subcategory: t.subcategory || '',
      price: Math.round(t.price),
      rating: Math.round(t.rating * 10) / 10,
      description: `Premium ${t.name} by ${t.brand}. High quality ${t.subcategory || t.category} product with excellent features and durability.`,
      image: unsplash(t.imgKey, i),
      stock: 10 + (i % 90),
    }));

    // Insert in batches of 500
    for (let i = 0; i < products.length; i += 500) {
      const batch = products.slice(i, i + 500);
      await Product.insertMany(batch);
      console.log(`Inserted ${Math.min(i + 500, products.length)} / ${products.length}`);
    }

    console.log(`\n🎉 Successfully seeded ${products.length} products with real Unsplash images!`);

    // Summary
    const cats = {};
    products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
    console.log('\nCategory breakdown:');
    Object.entries(cats).sort((a,b) => b[1]-a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
