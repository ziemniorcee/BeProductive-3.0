export function makeHttpClient({ baseUrl, getToken, onUnauthorized }) {
    return async function http(path, { method = "GET", headers = {}, body } = {}) {
        const token = await getToken?.();
        const h = { "Content-Type": "application/json", ...headers };
        if (token) h.Authorization = `Bearer ${token}`;
        const res = await fetch(baseUrl + path, { method, headers: h, body });
        if (res.status === 401) onUnauthorized?.();
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res;
    };
}