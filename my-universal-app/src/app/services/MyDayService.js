export default class MyDayService {
    constructor({ store, repo }) {
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
            await this.repo.setStepChecked({ taskId, stepId, checked });
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
            await this.repo.setMainChecked({ taskId, checked });
        } catch (e) {
            rollback();
            // optional error surfacing if you add setError to the store
            if (typeof this.store.setError === "function") {
                this.store.setError(String(e?.message || e));
            }
        }
    }

    async openEdit(taskId) {
        console.log("CHUJ123")
        const task = this.store.state.goals.find(g => g.publicId === taskId);
        if (!task) return;
        this.store.openEdit(task)
    }

    closeEdit = () => {
        console.log("close")
        this.store.closeEdit()
    }
}