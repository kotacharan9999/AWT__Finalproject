const fs = require('fs');
const path = require('path');

const files = [
  'simpleapp/src/Pages/Wishlist.js', 
  'simpleapp/src/Pages/Products.js', 
  'simpleapp/src/Pages/ProductDetails.js', 
  'simpleapp/src/Pages/Home.js', 
  'simpleapp/src/Pages/Checkout.js', 
  'simpleapp/src/Pages/Cart.js', 
  'simpleapp/src/Pages/Account.js', 
  'simpleapp/src/Components/Navbar.js', 
  'simpleapp/src/Components/CartDrawer.js'
];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace ${something.toFixed(...)} with ₹{something.toFixed(...)}
  // ensuring we don't accidentally replace template literals that aren't prices (those usually don't have .toFixed)
  content = content.replace(/\$\{([^}]+\.toFixed\([^}]+\))\}/g, '₹{$1}');
  
  // Replace ${totalAmount} with ₹{totalAmount} in CartDrawer.js
  content = content.replace(/<span>\$\{totalAmount\}<\/span>/g, '<span>₹{totalAmount}</span>');
  
  // Replace Checkout.js static shipping cost
  content = content.replace(/\$15\.00/g, '₹15.00');
  
  // Replace Checkout.js delivery string literal interpolation inside backticks
  content = content.replace(/`\$\$\{deliveryCost\.toFixed\(([^)]+)\)\}`/g, '`₹${deliveryCost.toFixed($1)}`');
  
  fs.writeFileSync(filePath, content);
});

console.log('Currency replacement completed.');
