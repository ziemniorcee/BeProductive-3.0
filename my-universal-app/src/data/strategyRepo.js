export function makeStrategyRepo({http}) {
    return {
        async strategyGoals() {
            const res = await http("/api/get-strategy", { method: "GET" });
            if (!res.ok) throw new Error(`strategy.list ${res.status}`);
            let end = res.json()
            return end; // expect { tasks: [...] }
        },

        async saveNewPoint(change) {
            const qs = new URLSearchParams({
                changes: JSON.stringify(change)
            }).toString();

            const res = await http(`/api/save-new-point?${qs}`, { method: 'POST' });
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(`strategy.patch-new-point ${res.status} ${errText}`);
            }
            return await res.json();
        },

        async changePointPosition(id, position) {
            const qs = new URLSearchParams({
                id: id,
                newPosition: JSON.stringify(position)
            }).toString();

            const res = await http(`/api/change-point-position?${qs}`, { method: 'PATCH' });
            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(`strategy.patch-new-point ${res.status} ${errText}`);
            }
            return await res.json();
        }
    }
}