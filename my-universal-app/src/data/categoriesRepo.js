export function makeCategoriesRepo({ http }) {
    return {
        async goals() {
            const res = await http("/api/get-categories");
            return res.json(); // [{id, publicId, name, r,g,b}, ...]
        },

        async add(id ,name, color) {
            console.log("final",id, name, color);
            const qs = new URLSearchParams({
                id: id,
                name: name,
                color: JSON.stringify(color)
            }).toString();
            const res = await http(`/api/add-category?${qs}`, { method: 'POST',  });

            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(`category.add-category ${res.status} ${errText}`);
            }
            return await res.json();
        }
    };
}
