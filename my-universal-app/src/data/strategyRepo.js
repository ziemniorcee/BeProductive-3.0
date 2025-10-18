export function makeStrategyRepo({http}) {
    return {
        async strategyGoals() {
            const res = await http("/api/get-strategy", { method: "GET" });
            if (!res.ok) throw new Error(`strategy.list ${res.status}`);
            return res.json(); // expect { tasks: [...] }
        }
    }
}