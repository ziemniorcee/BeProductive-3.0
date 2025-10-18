// util/svgClean.js
export const cleanSvgXml = (xml) =>
    xml
        // drop <metadata>…</metadata>
        .replace(/<metadata[\s\S]*?<\/metadata>/g, '')
        // drop all xmlns:* declarations
        .replace(/\s+xmlns(?::\w+)?="[^"]*"/g, '')
        // drop data-* (React turns them into invalid camelCase props)
        .replace(/\s+data-[\w:-]+="[^"]*"/g, '')
        // optional: drop id/class to avoid DOM id collisions
        .replace(/\s+(id|class|xml:space)="[^"]*"/g, '')
        // keep viewBox; let RN size control width/height
        .replace(/\s+(width|height)="[^"]*"/g, '')
        // ensure viewBox exists
        .replace(/<svg\b([^>]*)>/, (m, attrs) =>
            /viewBox=/.test(attrs) ? `<svg${attrs}>` : `<svg${attrs} viewBox="0 0 24 24">`
        );
