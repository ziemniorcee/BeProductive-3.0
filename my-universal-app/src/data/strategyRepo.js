export function makeStrategyRepo({http}) {
    return {
        async strategyGoals() {
            const res = await http("/api/get-strategy", { method: "GET" });
            if (!res.ok) throw new Error(`strategy.list ${res.status}`);
            return res.json(); // expect { tasks: [...] }
        },

        async closeNewPoint(change) {
            console.log(change);
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