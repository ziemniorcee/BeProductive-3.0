// electron/scripts/export-web.js
const { execSync } = require('node:child_process');
const fs = require('fs');
const path = require('path');

const EXPO_MARKERS = [
    'old_app.json',
    'old_app.config.js', 'old_app.config.ts',
    'old_app.config.mjs', 'old_app.config.cjs',
];

function hasExpoMarkers(dir) {
    if (EXPO_MARKERS.some(f => fs.existsSync(path.join(dir, f)))) return true;
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
            if (deps.expo) return true;
        } catch {}
    }
    return false;
}

function findExpoRoot(startDir) {
    let dir = startDir;
    for (let i = 0; i < 8; i++) {
        if (hasExpoMarkers(dir)) return dir;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    throw new Error('Expo project root not found. Make sure electron/ is inside or below your Expo old_app.');
}

const electronDir = path.resolve(__dirname, '..');
const expoRoot = findExpoRoot(electronDir);
const outDir = path.resolve(electronDir, 'web-dist');

console.log(`> Expo root: ${expoRoot}`);
console.log(`> Output dir: ${outDir}\n`);

const cmd = `npx expo export --platform web --output-dir "${outDir}" --clear --non-interactive`;
execSync(cmd, { cwd: expoRoot, stdio: 'inherit', shell: true }); // <- shell:true fixes Windows
console.log('\n✓ Expo web export complete.');
