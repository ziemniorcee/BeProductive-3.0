export class StrategyService {
    constructor({store, repo}) {
        this.store = store;
        this.repo = repo;
    }

    get = () => this.store.get();
    subscribe = (fn) => this.store.subscribe(fn);
    load = (params) => this.store.load(params);

    patchNewPoint(change) {
        this.store.patchNewPoint(change)
    }

    openAddNewPoint() {
        this.store.openAddNewPoint();
    }

    async closeAddNewPoint() {
        await this.repo.closeNewPoint(this.store.state.addNewPoint);
        this.store.closeAddNewPoint();
    }
}