export function makeMyDayRepo({ http }) {
    return {
        // GET /api/get-my-day?date=YYYY-MM-DD&queue_order=a,b&deadlines_order=x,y
        async myDayGoals({ date, queue_order = [], deadlines_order = [] }) {
            const qs = new URLSearchParams({
                date,
                queue_order: queue_order.join(","),
                deadlines_order: deadlines_order.join(","),
            }).toString();

            const res = await http(`/api/get-my-day?${qs}`, { method: "GET" });
            if (!res.ok) throw new Error(`myday.list ${res.status}`);
            return res.json(); // expect { tasks: [...] }
        },

        async nowGoals() {
            const res = await http(`/api/get-asap?`, { method: "GET" });

            if (!res.ok) throw new Error(`asap.list ${res.status}`);
            return res.json(); // expect { tasks: [...] }
        },

        async inboxGoals() {
            const res = await http(`/api/get-inbox?`, { method: "GET" });

            if (!res.ok) throw new Error(`inbox.list ${res.status}`);
            return res.json(); // expect { tasks: [...] }
        },

        async dayGoals({date}) {
            const qs = new URLSearchParams({
                date,
            }).toString();

            const res = await http(`/api/get-day-view?${qs}`, { method: "GET" });

            if (!res.ok) throw new Error(`day.list ${res.status}`);
            return res.json(); // expect { tasks: [...] }
        },

        async monthGoals({dates}) {
            const qs = new URLSearchParams({
                dates,
            }).toString();

            const res = await http(`/api/get-month-view?${qs}`, { method: "GET" });

            if (!res.ok) throw new Error(`month.list ${res.status}`);
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
            const qs = new URLSearchParams({
                id: taskId,
                state: checked ? "1" : "0"
            }).toString();

            const res = await http(`/api/change-checks-goal/?${qs}`, { method: "PATCH" });
            const text = await res.text();
            if (!res.ok) throw new Error(`myday.setStepChecked ${res.status} ${text}`);
            return text ? JSON.parse(text) : null; // handle 204/empty
        },

        async updateTask({ taskId, changes }) {
            const toISO = (d) => {
                const dt = d instanceof Date ? d : new Date(d);
                const y = dt.getFullYear();
                const m = String(dt.getMonth() + 1).padStart(2, "0");
                const dd = String(dt.getDate()).padStart(2, "0");
                return `${y}-${m}-${dd}`;
            };

            const payload = {
                categoryPublicId: changes.categoryPublicId ?? null,
                projectPublicId:  changes.projectPublicId  ?? null,
                checkState:       Number(changes.checkState ?? 0),
                name:             String(changes.name ?? ""),
                importance:       Number(changes.importance ?? 0),
                note:             changes.note == null ? "" : String(changes.note),
                addDate:          changes.addDate ? (typeof changes.addDate === "string"
                    ? changes.addDate.slice(0, 10)
                    : toISO(changes.addDate)) : null,
                dateType:         Number(changes.dateType ?? 0),
                steps: Array.isArray(changes.steps)
                    ? changes.steps.map(s => ({
                        name: String(s?.name ?? ""),
                        stepCheck: s?.stepCheck ? 1 : 0
                    }))
                    : []
            };

            const qs = new URLSearchParams({
                id: taskId,
                changes: JSON.stringify(payload)
            }).toString();

            const res = await http(`/api/edit-goal/?${qs}`, { method: "PATCH" });
            const text = await res.text();
            if (!res.ok) throw new Error(`myday.edit-goal ${res.status} ${text}`);
            return text ? JSON.parse(text) : null;
        },

        async addGoal( editTask){
            const qs = new URLSearchParams({
                changes: JSON.stringify(editTask)
            }).toString();
            const res = await http(`/api/add-goal?${qs}`, { method: 'POST' });

            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(`myday.add-goal ${res.status} ${errText}`);
            }
            return await res.json();
        }
    };
}