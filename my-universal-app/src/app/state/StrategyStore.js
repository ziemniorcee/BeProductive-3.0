import {buildMyDay} from "../../domain/myday/buildMyDay";

export class StrategyStore {
    #repo;
    #subs = new Set()
    state = {
        goals: [],
        nodes: [],
        loading: false,
        error: null,
        addNewPointOpen: false,
        addNewPoint: {projectPublicId: null, taskType: 0},
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
            this.state = {
                ...this.state,  // <-- THIS IS THE FIX. It preserves existing state.
                goals,          // Overwrite the goals
                loading: false,  // Overwrite loading
                error: null,     // Overwrite error
                addNewPoint: {projectPublicId: null, taskType: 0} // Overwrite addNewPoint
            };
        } catch (e) {
            this.state = {...this.state, loading: false, error: String(e)};
        }
        this.#emit();
    }

    patchNewPoint = (change) => {
        const cur = this.state.addNewPoint ?? {};
        const next = {...cur, ...change};          // replace object
        this.state = {...this.state, addNewPoint: next}; // replace state
        this._set({ addNewPoint: next });
    };

    saveNewPoint = (pointDataToSave) => {
        if (!pointDataToSave || !pointDataToSave.projectPublicId) {
            console.warn("Cannot save point, data is incomplete.");
            return;
        }


        const currentGoals = this.state.goals ?? [];

        this._set({
            goals: [...currentGoals, pointDataToSave],
            addNewPointOpen: false,
            addNewPoint: {projectPublicId: null, taskType: null}
        });
    };

    openAddNewPoint = () => {
        this._set({addNewPointOpen: true});
    }

    changePointPosition = (pointId, newPosition) => {
        const currentGoals = this.state.goals ?? [];

        const newGoals = currentGoals.map(goal => {
            if (goal.publicId !== pointId) {
                return goal;
            }
            return {
                ...goal,
                x: newPosition.x,
                y: newPosition.y,
            };
        });

        // 3. Set the new array to state
        this._set({ goals: newGoals });
    }

    createLink = (startNodeId, endNodeId) => {
        const currentGoals = this.state.goals ?? [];
        const newGoals = currentGoals.map(goal => {

            if (goal.publicId !== startNodeId) {
                return goal;
            }
            return {
                ...goal,
                children: [...goal.children, endNodeId]
            };
        });

        this._set({ goals: newGoals });
    }
}