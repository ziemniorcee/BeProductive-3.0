import {normalizeCategories} from "../../domain/categories/normalize";

export class CategoriesStore {
    #repo; #listeners = new Set();
    state = { byPublicId: {}, accentById: {}, newCategoryId: null };
    constructor({ repo }) { this.#repo = repo; }

    async reload() {
        const preservedNewId = this.state.newCategoryId;

        try {
            const raw = await this.#repo.goals();
            const normalized = normalizeCategories(raw);

            this.state = {
                ...normalized,
                newCategoryId: preservedNewId
            };
        } catch {
            this.state = {
                byPublicId: {},
                accentById: {},
                newCategoryId: null
            };
        }
        this.#listeners.forEach(l => l(this.state));
    }

    subscribe(cb) { this.#listeners.add(cb); return () => this.#listeners.delete(cb); }
    get() { return this.state; }

    colorByPublicId(pid, fallback = "#FFFFFF") {
        if (!pid) return fallback;
        return this.state?.byPublicId?.[pid]?.color ?? fallback;
    }
    nameByPublicId(pid, fallback = "No category") {
        return this.state.byPublicId[pid]?.name ?? fallback;
    }

    async add(id, name, colorRGB) {
        await this.#repo.add(id, name, colorRGB);
        this.state.newCategoryId = id;
        await this.reload();
    }

    clearNewCategory() {
        this.state = { ...this.state, newCategoryId: null };
        this.#listeners.forEach(l => l(this.state));
    }
}
