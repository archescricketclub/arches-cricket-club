const { Jimp } = require('jimp');
const fs = require('fs');

async function resizeImage(filePath) {
  try {
    const image = await Jimp.read(filePath);
    console.log(`Original size of ${filePath}: ${image.bitmap.width}x${image.bitmap.height}`);
    
    // Scale the image down to 20%
    image.scale(0.2);
    
    await image.write(filePath);
    console.log(`Successfully resized and compressed ${filePath}`);
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err);
  }
}

async function main() {
  await resizeImage('logo.png');
  await resizeImage('assets/images/gallery/team.png');
  console.log("Done!");
}

main();
