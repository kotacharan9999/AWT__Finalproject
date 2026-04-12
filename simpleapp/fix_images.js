const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src', 'data', 'mockData.js');

try {
  let content = fs.readFileSync(targetFile, 'utf8');
  
  // Replace the image URLs using regex
  // From: "https://image.pollinations.ai/prompt/... ?seed=123&width=500&height=500&nologo=true"
  // To: "https://picsum.photos/seed/123/500/500"
  
  content = content.replace(/"image":\s*"https:\/\/image\.pollinations\.ai\/prompt\/[^?]+\?seed=(\d+)&width=500&height=500&nologo=true"/g, 
    '"image": "https://picsum.photos/seed/$1/500/500"');
    
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log("Images converted successfully!");
} catch(err) {
  console.error("Error migrating images:", err);
}
