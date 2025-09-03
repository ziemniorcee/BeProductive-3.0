export function normalizeProjects(rawProjects = [], rawIcons = []) {
    const byPublicId = Object.fromEntries(rawProjects.map(p => [p.publicId, p]));
    return { rawProjects, byPublicId, rawIcons };
}