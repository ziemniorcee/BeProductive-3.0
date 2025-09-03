export class AuthService {
    constructor({ http, storage, tokenKey = "jwt" }) {
        this.http = http;
        this.storage = storage;
        this.tokenKey = tokenKey;
    }

    // legacy-compatible names
    async get_token() { return this.storage.get(this.tokenKey); }
    async set_token(token) { await this.storage.set(this.tokenKey, token); return token; }
    async clear_token() { await this.storage.remove(this.tokenKey); }

    async is_token_valid() {
        const t = await this.get_token();
        if (!t) return false;
        try { await this.http("/api/get-categories"); return true; }
        catch (e) { if (String(e).startsWith("Error 401")) return false; return false; }
    }

    async login(data) {
        try {
            const res = await this.http("/api/login", {
                method: "POST",
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (json?.success && json?.token) {
                await this.set_token(json.token);
                return [true, "Logged in"];
            }
            return [false, "Invalid credentials"];
        } catch (e) {
            if (String(e).startsWith("Error: 401")) return [false, "❌ Wrong e-mail or password"];
            return [false, "Network or server error"];
        }
    }
}
