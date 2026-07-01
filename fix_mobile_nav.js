const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const mobileNavRegex = /<div class="mobile-nav" id="mobileNav">([\s\S]*?)<\/div>/;

const newMobileNav = `<div class="mobile-nav" id="mobileNav">
        <a href="index.html" onclick="toggleMobileNav()"><i class="fa-solid fa-house" style="margin-right: 12px; color: var(--amber);"></i> Home</a>
        <div class="mn-divider"></div>
        <a href="fixtures.html" onclick="toggleMobileNav()"><i class="fa-solid fa-calendar-days" style="margin-right: 12px; color: var(--amber);"></i> Fixtures</a>
        <a href="results.html" onclick="toggleMobileNav()"><i class="fa-solid fa-trophy" style="margin-right: 12px; color: var(--amber);"></i> Results</a>
        <a href="players.html" onclick="toggleMobileNav()"><i class="fa-solid fa-users" style="margin-right: 12px; color: var(--amber);"></i> Players</a>
        <a href="honours.html" onclick="toggleMobileNav()"><i class="fa-solid fa-award" style="margin-right: 12px; color: var(--amber);"></i> Honours Board</a>
        <a href="gallery.html" onclick="toggleMobileNav()"><i class="fa-solid fa-image" style="margin-right: 12px; color: var(--amber);"></i> Gallery</a>
        <a href="sponsors.html" onclick="toggleMobileNav()"><i class="fa-solid fa-handshake" style="margin-right: 12px; color: var(--amber);"></i> Sponsors</a>
        <a href="contact.html" onclick="toggleMobileNav()"><i class="fa-solid fa-envelope" style="margin-right: 12px; color: var(--amber);"></i> Contact</a>
        <div class="mn-divider"></div>
        <a href="join.html" class="btn btn-primary" onclick="toggleMobileNav()">
            <i class="fa-solid fa-user-plus"></i> Join The Club
        </a>
    </div>`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(mobileNavRegex, newMobileNav);
  fs.writeFileSync(file, content);
}

// Fix CSS
const cssFile = path.join(dir, 'styles.css');
let css = fs.readFileSync(cssFile, 'utf8');
css = css.replace(/padding: 0 2rem;/, 'padding: 6rem 2rem 2rem;');

// Also align text left so icons look good?
// Actually flex-direction column with text-align center is okay, but icons look better if text-align is left and max-width is slightly smaller.
// Let's modify `.mobile-nav a` to have display flex, align-items center, justify-content center.
css = css.replace(
  /.mobile-nav a {[\s\S]*?text-align: center;[\s\S]*?}/,
  `.mobile-nav a {
  width: 100%;
  max-width: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.1rem 2rem;
  margin: 0.2rem 0;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  color: var(--text);
  text-transform: uppercase;
  border-radius: var(--radius-sm);
  transition: var(--trans);
  border: 1px solid transparent;
}`
);

fs.writeFileSync(cssFile, css);
console.log('Mobile nav updated in HTML and CSS.');
