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

    async saveNewPoint(pointToSave) {
        pointToSave["publicId"] = crypto.randomUUID()
        await this.repo.saveNewPoint(pointToSave);
        this.store.saveNewPoint(pointToSave);
    }

    async changePointPosition(id, newPosition) {
        await this.repo.changePointPosition(id, newPosition);
        this.store.changePointPosition(id, newPosition);
    }

    async createLink(startNodeId, endNodeId) {
        await this.repo.createLink(startNodeId, endNodeId);
        this.store.createLink(startNodeId, endNodeId);
    }
}