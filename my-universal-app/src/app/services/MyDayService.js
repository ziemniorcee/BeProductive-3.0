export default class MyDayService {
    constructor({store, repo}) {
        this.store = store;   // instance of MyDayStore
        this.repo = repo;     // data source (http/db)
    }

    // state passthroughs
    get = () => this.store.get();
    subscribe = (fn) => this.store.subscribe(fn);

    load = (params) => this.store.load(params);

    // optimistic step toggle with rollback
    async toggleStep(taskId, stepId, checked) {
        const rollback = this.store.markStep(taskId, stepId, checked);
        try {
            await this.repo.setStepChecked({taskId, stepId, checked});
        } catch (e) {
            rollback();
            // optional error surfacing if you add setError to the store
            if (typeof this.store.setError === "function") {
                this.store.setError(String(e?.message || e));
            }
        }
    }

    async toggleMainCheck(taskId, checked) {
        const rollback = this.store.markMainCheck(taskId, checked);
        try {
            await this.repo.setMainChecked({taskId, checked});
        } catch (e) {
            rollback();
            // optional error surfacing if you add setError to the store
            if (typeof this.store.setError === "function") {
                this.store.setError(String(e?.message || e));
            }
        }
    }

    async openEdit(taskId = null) {
        const newTask = {
            addDate: null,
            categoryPublicId: null,
            checkState: 0,
            dateType: 3,
            goalPos: 0,
            importance: 2,
            name: "",
            note: null,
            projectPublicId: null,
            publicId: null,
            steps: []
        }

        if (taskId === null) {
            this.store.openEdit(newTask, "new")
        } else {
            const task = this.store.state.goals.find(g => g.publicId === taskId);
            this.store.openEdit(task, "edit")
        }
    }

    patchEdit = (change) => {
        console.log("patch2")
        this.store.patchEdit(change)
    }

    closeEdit = async (commit = true) => {
        const {editTask, editOriginal, editType} = this.store.state;
        if (!editTask) return this.store.closeEdit();
        if (!commit) return this.store.closeEdit();

        if (editType === "edit") {
            const diff = (a, b) => {
                a = a && typeof a === "object" ? a : {};
                b = b && typeof b === "object" ? b : {};
                const out = {};
                for (const k of Object.keys(b)) {
                    if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out[k] = b[k];
                }
                return out;
            };

            const changes = diff(editOriginal, editTask);

            if (Object.keys(changes).length === 0) return this.store.closeEdit();

            const taskId = editTask.publicId;
            const rollback = this.store.applyTaskPatch(taskId, changes); // optimistic

            try {
                await this.repo.updateTask({taskId, changes}); // implement in repo
            } catch (e) {
                rollback();
                this.store.setError?.(String(e?.message || e));
            }
        } else if (editType === "new") {
            await this.store.createGoal(editTask)
        }

        this.store.closeEdit();
    };
}