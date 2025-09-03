export function makeMyDayRepo({ http }) {
    return {
        // GET /api/get-my-day?date=YYYY-MM-DD&queue_order=a,b&deadlines_order=x,y
        async goals({ date, queue_order = [], deadlines_order = [] }) {
            const qs = new URLSearchParams({
                date,
                queue_order: queue_order.join(","),
                deadlines_order: deadlines_order.join(","),
            }).toString();

            const res = await http(`/api/get-my-day?${qs}`, { method: "GET" });
            if (!res.ok) throw new Error(`myday.list ${res.status}`);
            return res.json(); // expect { tasks: [...] }
        },

        // PATCH /api/steps/:stepId  body: { taskId, checked }
        async setStepChecked({ stepId, checked }) {
            const qs = new URLSearchParams({
                id: stepId,                // must be the step PUBLIC id (your SQL uses publicId)
                state: checked ? "1" : "0" // server casts Number(req.query.state)
            }).toString();

            const res = await http(`/api/change-checks-step/?${qs}`, { method: "PATCH" });
            const text = await res.text();
            if (!res.ok) throw new Error(`myday.setStepChecked ${res.status} ${text}`);
            return text ? JSON.parse(text) : null; // handle 204/empty
        },

        async setMainChecked({ taskId, checked }) {
            console.log("CHUJ")
            console.log(taskId, checked)
            const qs = new URLSearchParams({
                id: taskId,
                state: checked ? "1" : "0"
            }).toString();

            const res = await http(`/api/change-checks-goal/?${qs}`, { method: "PATCH" });
            const text = await res.text();
            if (!res.ok) throw new Error(`myday.setStepChecked ${res.status} ${text}`);
            return text ? JSON.parse(text) : null; // handle 204/empty
        },
    };
}