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
        pointToSave["publicId"] = this.generateUUID()
        await this.repo.saveNewPoint(pointToSave);
        this.store.saveNewPoint(pointToSave);
    }

    generateUUID() {
        // Fallback if crypto is completely missing
        if (typeof crypto === 'undefined') {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        // Modern fallback using getRandomValues (supported on 99% of mobile devices)
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    async changePointPosition(id, newPosition) {
        await this.repo.changePointPosition(id, newPosition);
        this.store.changePointPosition(id, newPosition);
    }

    async createLink(startNodeId, endNodeId) {
        await this.repo.createLink(startNodeId, endNodeId);
        this.store.createLink(startNodeId, endNodeId);
    }

    async removeNode(nodeId) {
        await this.repo.removeNode(nodeId);
        this.store.removeNode(nodeId);
    }

    async removeEdge(parentPublicId, childPublicId) {
        await this.repo.removeEdge(parentPublicId, childPublicId);
        this.store.removeEdge(parentPublicId, childPublicId);
    }

}