const fs = require('fs');
const content = fs.readFileSync('C:/Users/sonyk/.gemini/antigravity/brain/dd758f51-0e43-4095-9071-e9b764ef18d3/.system_generated/steps/8/content.md', 'utf8');

const iframeRegex = /<iframe[^>]*src="([^"]*)"[^>]*>/gi;
const scriptRegex = /<script[^>]*src="([^"]*)"[^>]*>/gi;

console.log("IFRAMES:");
let match;
while ((match = iframeRegex.exec(content)) !== null) {
  console.log(match[1]);
}

console.log("\nSCRIPTS:");
while ((match = scriptRegex.exec(content)) !== null) {
  if (match[1].includes('nv') || match[1].includes('play')) {
    console.log(match[1]);
  }
}
