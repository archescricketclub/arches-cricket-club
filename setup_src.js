const fs = require('fs');
const path = require('path');

const root = __dirname;
const srcPages = path.join(root, 'src', 'pages');

const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));

for (const file of files) {
    let content = fs.readFileSync(path.join(root, file), 'utf8');

    // Strip everything before <!-- ─── HERO ─── --> or the first unique section
    // Actually, a safer regex: 
    // Replace <head>...</head> with <!-- INCLUDE HEAD -->
    content = content.replace(/<head>[\s\S]*?<\/head>/i, '<!-- INCLUDE HEAD -->');
    
    // Replace <nav>...</nav> and mobile nav with <!-- INCLUDE HEADER -->
    content = content.replace(/<!-- ─── NAVBAR ─── -->[\s\S]*?<\/nav>/i, '<!-- INCLUDE HEADER -->');
    content = content.replace(/<!-- ─── MOBILE NAV ─── -->[\s\S]*?<\/div>/i, '');
    
    // Replace <footer>...</footer> with <!-- INCLUDE FOOTER -->
    content = content.replace(/<!-- ─── FOOTER ─── -->[\s\S]*?<\/footer>/i, '<!-- INCLUDE FOOTER -->');
    
    // Replace inline scripts with app.js include
    content = content.replace(/<!-- ──────────────────────────────────────── -->\s*<!-- SCRIPTS \(GSAP only — no Three\.js\) -->\s*<!-- ──────────────────────────────────────── -->[\s\S]*?<\/body>/i, '<!-- INCLUDE SCRIPTS -->\n</body>');

    fs.writeFileSync(path.join(srcPages, file), content);
    console.log(`Processed and moved ${file} to src/pages/`);
}
