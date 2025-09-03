import {buildMyDay} from "../../domain/myday/buildMyDay";

export class MyDayStore {
    #repo;
    #subs = new Set();
    state = {goals: [], loading: false, error: null, editTask: null, editOpen: false};

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
            const raw = await this.#repo.goals(params);        // token injected by http
            const goals = buildMyDay(raw['tasks'], {
                today: params.date,
                projectQueue: params.queue_order,
                deadlines: params.deadlines_order,
            });
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

    openEdit(task) {
        console.log(task)
        this._set({editTask: {...task}, editOpen: true});
    }
    closeEdit()   { this._set({ editTask: null, editOpen: false }); }


}
