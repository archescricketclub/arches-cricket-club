const chokidar = require('chokidar');
const { execSync } = require('child_process');
const liveServer = require('live-server');

// Run initial build
console.log("Running initial build...");
execSync('node build.js', { stdio: 'inherit' });

// Watch for changes in src/
console.log("Watching for changes in src/...");
chokidar.watch('src/').on('change', (event, path) => {
    console.log(`Changes detected. Rebuilding...`);
    try {
        execSync('node build.js', { stdio: 'inherit' });
    } catch (e) {
        console.error("Build failed.");
    }
});

// Start live-server
liveServer.start({
    port: 8080,
    host: "0.0.0.0",
    root: ".",
    open: false,
    ignore: 'src,node_modules,dev.js,build.js,package.json,*.md', 
    file: "index.html",
    wait: 500,
});
console.log("Live server running on http://localhost:8080");
