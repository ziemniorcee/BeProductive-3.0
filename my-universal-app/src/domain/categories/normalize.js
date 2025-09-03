const toHex = n => n.toString(16).padStart(2, "0");
const rgbHex = (r,g,b) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

export function normalizeCategories(raw) {
    const byPublicId = {};
    const accentById = {};
    const arr = Array.isArray(raw) ? raw : raw?.categories ?? [];

    for (const c of arr) {
        byPublicId[c.publicId] = { id: c.publicId, name: c.name, color: rgbHex(c.r,c.g,c.b) };
        const r = Math.min(Math.floor(c.r*1.5), 255);
        const g = Math.min(Math.floor(c.g*1.5), 255);
        const b = Math.min(Math.floor(c.b*1.5), 255);
        accentById[c.publicId] = rgbHex(r,g,b);
    }
    return { byPublicId, accentById };
}
