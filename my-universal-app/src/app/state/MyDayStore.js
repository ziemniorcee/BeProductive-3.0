import {buildMyDay} from "../../domain/myday/buildMyDay";

export class MyDayStore {
    #repo;
    #subs = new Set();
    state = {
        goals: [],
        loading: false,
        error: null,
        editTask: null,
        editOpen: false,
        newTask: null,
        newTaskOpen: false,
        editType: null
    };

    constructor({repo}) {
        this.#repo = repo;
    }

    subscribe(f) {
        this.#subs.add(f);
        return () => this.#subs.delete(f);
    }

    get() {
        return this.state;
    }

    #patch = (updater) => {
        this.state = updater(this.state);
        this.#subs.forEach(s => s(this.state));
    };


    #emit() {
        for (const f of this.#subs) f(this.state);
    }

    setError = (msg) => {                 // <-- add
        this.state = {...this.state, error: msg};
        this.#emit();
    };

    _set = patch => {
        this.state = {...this.state, ...patch};
        this.#emit();
    };

    async load(params) {
        this.state = {...this.state, loading: true, error: null};
        this.#emit();
        try {
            let goals = []
            if (params.type === "My Day") {
                const raw = await this.#repo.myDayGoals(params);        // token injected by http
                goals = buildMyDay(raw['tasks'], {
                    today: params.date,
                    projectQueue: params.queue_order,
                    deadlines: params.deadlines_order,
                });
            } else if (params.type === "Now") {
                const raw = await this.#repo.nowGoals(params);
                goals = raw['tasks'];
            } else if (params.type === "Inbox") {
                const raw = await this.#repo.inboxGoals(params);
                goals = raw['tasks'];
            } else if (params.type === "Day") {
                const raw = await this.#repo.dayGoals(params);
                goals = raw['tasks'];
            }

            this.state = {goals, loading: false, error: null};
        } catch (e) {
            this.state = {...this.state, loading: false, error: String(e)};
        }
        this.#emit();
    }

    markStep(taskId, stepId, checked) {
        const prev = this.state;
        const goals = prev.goals.map(g =>
            g.publicId === taskId
                ? {
                    ...g, steps: (g.steps ?? []).map(s =>
                        s.publicId === stepId ? {...s, stepCheck: checked} : s
                    )
                }
                : g
        );
        this.state = {...prev, goals};
        this.#emit();
        return () => {
            this.state = prev;
            this.#emit();
        };
    }

    markMainCheck(taskId, checked) {
        const prev = this.state;
        const goals = prev.goals.map(g =>
            g.publicId === taskId
                ? {...g, checkState: checked} : g
        );
        this.state = {...prev, goals};
        this.#emit();
        return () => {
            this.state = prev;
            this.#emit();
        };
    }

    openEdit(task, type) {
        this._set({editTask: {...task}, editOpen: true, editType: type});
    }

    applyTaskPatch(taskId, patch) {
        const goals = this.state.goals;
        const i = goals.findIndex(t => t.publicId === taskId);
        if (i < 0) return () => {
        };
        const before = goals[i];
        const after = {...before, ...patch};
        const next = goals.slice();
        next[i] = after;
        this._set({goals: next});
        return () => {
            const rb = this.state.goals.slice();
            rb[i] = before;
            this._set({goals: rb});
        };
    }

    closeEdit() {
        this._set({editTask: null, editOriginal: null, editOpen: false});
    }

    patchEdit = (change) => {
        console.log(change)
        const cur = this.state.editTask ?? {};
        const next = {...cur, ...change};          // replace object
        this.state = {...this.state, editTask: next}; // replace state
        this.#emit();
    };

    async createGoal(draft) {
        const tempId = globalThis.crypto?.randomUUID?.() || `tmp_${Date.now()}`;
        const optimistic = {
            ...draft,
            publicId: draft.publicId ?? tempId,
            _pending: true
        };

        this.#patch(s => ({...s, goals: [optimistic, ...s.goals]}));

        try {
            const saved = await this.#repo.addGoal(optimistic)
            const newId = saved.publicId ?? optimistic.publicId;

            this.#patch(s => ({
                ...s,
                goals: s.goals.map(g =>
                    g.publicId === optimistic.publicId
                        ? {...g, ...saved, publicId: newId, _pending: false}
                        : g
                )
            }));
        } catch (err) {
            this.#patch(s => ({
                ...s,
                goals: s.goals.filter(g => g.publicId !== optimistic.publicId),
                error: String(err)
            }));
        }
    }
}
