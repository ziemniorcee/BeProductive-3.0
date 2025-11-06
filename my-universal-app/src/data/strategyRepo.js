export function makeStrategyRepo({http}) {
    return {
        async strategyGoals() {
            console.log("repo")
            const res = await http("/api/get-strategy", { method: "GET" });
            if (!res.ok) throw new Error(`strategy.list ${res.status}`);
            let end = res.json()
            console.log("XDD")
            console.log(end)
            return end; // expect { tasks: [...] }
        },

        async closeNewPoint(change) {
            const qs = new URLSearchParams({
                changes: JSON.stringify(change)
            }).toString();

            const res = await http(`/api/patch-new-point?${qs}`, { method: 'POST' });
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(`strategy.patch-new-point ${res.status} ${errText}`);
            }
            return await res.json();
        }
    }
}