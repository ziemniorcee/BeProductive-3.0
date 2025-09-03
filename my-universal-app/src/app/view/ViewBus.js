export class ViewBus {
    #listeners = new Set();
    #view = { screen: "login", props: {} };

    current() { return this.#view; }
    subscribe(fn) { this.#listeners.add(fn); return () => this.#listeners.delete(fn); }
    set(view) { this.#view = view; this.#listeners.forEach(l => l(view)); }

    go(screen, props = {}) { this.set({ screen, props }); }
}
