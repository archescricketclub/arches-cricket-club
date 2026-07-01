const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newMobileNavContent = `        <a href="index.html" onclick="toggleMobileNav()"><i class="fa-solid fa-house" style="margin-right: 12px; color: var(--amber);"></i> Home</a>
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
        </a>`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Safe replacement: find the bounds of the mobile-nav div
  const startMarker = '<div class="mobile-nav" id="mobileNav">';
  const endMarker = '    </div>';
  
  const startIndex = content.indexOf(startMarker);
  if (startIndex !== -1) {
    // Find the NEXT exact '    </div>' which corresponds to the outer div end
    // since the inner div is '        <div class="mn-divider"></div>' with more indentation.
    const endIndex = content.indexOf(endMarker, startIndex + startMarker.length);
    if (endIndex !== -1) {
      const newNav = `${startMarker}\n${newMobileNavContent}\n${endMarker}`;
      content = content.substring(0, startIndex) + newNav + content.substring(endIndex + endMarker.length);
    }
  }

  // Fix toggleMobileNav in data_policy.html and any other file that uses 'active' instead of 'open'
  content = content.replace(/classList\.toggle\('active'\)/g, "classList.toggle('open')");
  
  // Also ensure the toggleMobileNav function is standardized across files if needed
  if(content.includes('function toggleMobileNav() {') && content.includes("classList.toggle('open')") && !content.includes('document.body.style.overflow')) {
    // If the function exists but doesn't have the overflow fix, let's just make sure it toggles properly.
    content = content.replace(
      /function toggleMobileNav\(\) \{[\s\S]*?\}/,
      `function toggleMobileNav() { const n = document.getElementById('mobileNav'), h = document.getElementById('hamburger'); n.classList.toggle('open'); h.classList.toggle('open'); document.body.style.overflow = n.classList.contains('open') ? 'hidden' : ''; }`
    );
  }
  
  fs.writeFileSync(file, content);
}

// Fix CSS
const cssFile = path.join(dir, 'styles.css');
let css = fs.readFileSync(cssFile, 'utf8');

css = css.replace(
  /.mobile-nav {[\s\S]*?}/,
  `.mobile-nav {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(3, 7, 18, 0.97);
  backdrop-filter: blur(36px);
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
  padding: 6rem 2rem 2rem;
  overflow-y: auto;
}`
);

css = css.replace(
  /.mobile-nav a {[\s\S]*?text-align: center;[\s\S]*?}/,
  `.mobile-nav a {
  width: 100%;
  max-width: 340px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
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

console.log('Mobile nav safely updated with exact bounds!');
