export function makeProjectsRepo({ http }) {
    return {
        async goals() {
            const res = await http("/api/get-projects");
            const json = await res.json();
            return Array.isArray(json) ? json : json.projects ?? json.data ?? [];
        }
    };
}