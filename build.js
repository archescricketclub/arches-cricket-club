const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcPages = path.join(root, 'src', 'pages');
const srcComponents = path.join(root, 'src', 'components');

const headTpl = fs.readFileSync(path.join(srcComponents, 'head.html'), 'utf8');
const headerTpl = fs.readFileSync(path.join(srcComponents, 'header.html'), 'utf8');
const footerTpl = fs.readFileSync(path.join(srcComponents, 'footer.html'), 'utf8');

const files = fs.readdirSync(srcPages).filter(f => f.endsWith('.html'));

for (const file of files) {
    let content = fs.readFileSync(path.join(srcPages, file), 'utf8');
    
    // Inject Head
    content = content.replace(/<!-- INCLUDE HEAD -->/g, `<head>\n${headTpl}\n</head>`);
    
    // Inject Header
    let pageHeader = headerTpl.replace(new RegExp(`class="nav-link-${file.replace('.html','')}"`), `class="active"`);
    if (file === 'index.html') {
        pageHeader = headerTpl.replace(`class="nav-link-home"`, `class="active"`);
    }

    content = content.replace(/<!-- INCLUDE HEADER -->/g, pageHeader);
    
    // Inject Footer
    content = content.replace(/<!-- INCLUDE FOOTER -->/g, footerTpl);

    fs.writeFileSync(path.join(root, file), content);
    console.log(`Built ${file}`);
}
console.log("Build complete.");
