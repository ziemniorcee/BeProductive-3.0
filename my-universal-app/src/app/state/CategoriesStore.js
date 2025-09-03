import {normalizeCategories} from "../../domain/categories/normalize";

export class CategoriesStore {
    #repo; #listeners = new Set();
    state = { byPublicId: {}, accentById: {} };
    constructor({ repo }) { this.#repo = repo; }

    async reload() {
        try {
            const raw = await this.#repo.goals();          // uses http with token
            this.state = normalizeCategories(raw);
        } catch {
            this.state = { byPublicId: {}, accentById: {} };
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
}
