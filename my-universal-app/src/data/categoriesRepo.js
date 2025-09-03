export function makeCategoriesRepo({ http }) {
    return {
        async goals() {
            const res = await http("/api/get-categories");
            return res.json(); // [{id, publicId, name, r,g,b}, ...]
        }
    };
}
