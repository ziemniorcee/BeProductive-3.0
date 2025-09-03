export const tokenStorage = {
    async get(k) { return localStorage.getItem(k); },
    async set(k, v) { localStorage.setItem(k, v); },
    async remove(k) { localStorage.removeItem(k); },
};