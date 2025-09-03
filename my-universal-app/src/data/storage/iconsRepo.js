export function makeIconsRepo({ http }) {
    return {
        async goals() {
            const res = await http("/api/get-icons");
            const json = await res.json();
            return Array.isArray(json) ? json : json.icons ?? json.data ?? [];
        }
    };
}