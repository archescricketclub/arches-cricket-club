const { Jimp } = require('jimp');
const fs = require('fs');

async function resizeImage(filePath) {
  try {
    const image = await Jimp.read(filePath);
    console.log(`Original size of ${filePath}: ${image.bitmap.width}x${image.bitmap.height}`);
    
    image.scale(0.2); // scale down to 20%
    
    await image.write(filePath);
    console.log(`Successfully resized and compressed ${filePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function main() {
  await resizeImage('banjo-tech.png');
  await resizeImage('ANDHRA1.png');
  console.log("Done!");
}

main();
