import {buildMyDay} from "../../domain/myday/buildMyDay";

export class StrategyStore {
    #repo;
    #subs = new Set()
    state = {
        goals: [],
        loading: false,
        error: null,
        addNewPointOpen: false,
        addNewPoint: {projectPublicId: null, pointType: null},
    }

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

    async load(params) { // do zmiany
        this.state = {...this.state, loading: true, error: null};
        this.#emit();
        try {
            let goals = []
            const raw = await this.#repo.strategyGoals(params);
            goals = raw['tasks'];

            this.state = {goals, loading: false, error: null};
        } catch (e) {
            this.state = {...this.state, loading: false, error: String(e)};
        }
        this.#emit();
    }

    patchNewPoint = (change) => {
        const cur = this.state.addNewPoint ?? {};
        const next = {...cur, ...change};          // replace object
        this.state = {...this.state, addNewPoint: next}; // replace state
        console.log("EMIIT")
        this.#emit();
    };

    openAddNewPoint = () => {
        this._set({addNewPointOpen: true});
    }

    closeAddNewPoint = () => {
        this._set({addNewPointOpen: false, addNewPoint: {projectPublicId: null, pointType: null}});
    }
}