import AsyncStorage from '@react-native-async-storage/async-storage';


export class AppServices {
    constructor(app) {
        this.app = app
        this.login_token_name = 'jwt'
        this.is_logged = false
        this.token = null

        // this.host = 'http://localhost:8080'
        this.host = 'https://todo-api-965384144322.europe-west3.run.app'
    }

    async get_token() {
        if (typeof window !== 'undefined' && window.localStorage) {
            //web
            return localStorage.getItem(this.login_token_name);
        } else {
            // mobile
            return await AsyncStorage.getItem(this.login_token_name)
        }
    }

    async set_token(token) {
        if (typeof window !== 'undefined' && window.localStorage) {
            //web
            await localStorage.setItem(this.login_token_name, token);
        } else {
            //mobile
            await AsyncStorage.setItem(this.login_token_name, token)
            const check = await AsyncStorage.getItem(this.login_token_name);
        }
        this.token = token
    }

    async clear_token() {
        if (typeof window !== 'undefined' && window.localStorage) {
            //web
            localStorage.removeItem(this.login_token_name)
        } else {
            //mobile
            await AsyncStorage.removeItem(this.login_token_name)
        }
    }

    async is_token_valid() {
        this.token = await this.get_token()
        if (this.token === null || this.token === undefined || this.token === "") {
            return false
        } else {
            try {
                let server_response = await this.token_test()
                if (server_response.status === 200) {
                    this.is_logged = true
                    return true
                } else {
                    if (server_response.status !== 401) {
                        throw new Error(`Error ${server_response.status}: ${server_response.statusText}`);
                    }
                    return false
                }
            } catch (e) {
                return false
            }
        }
    }

    async token_test() {
        const res = await fetch(`${this.host}/api/get-categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
        });
        if (!res.ok) {
            if (res.status === 401) {
                // token expired or invalid → redirect to login
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        return res
    }

    async login(data) {
        try {
            const res = await fetch(`${this.host}/api/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            });
            if (res.status === 401) {
                this.is_logged = false
                return [false, '❌ Wrong e-mail or password'];
            }

            if (!res.ok) {                // 4xx/5xx other than 401
                // You might want to read the body to show the API message:
                const msg = await res.text();
                throw new Error(`${res.status} – ${msg || res.statusText}`);
            }

            const json = await res.json();

            if (json.success && json.token) {
                await this.set_token(json.token)
                this.is_logged = true
                return [true, "Logged in"]
            }
            this.is_logged = false
            return false
        } catch (err) {
            console.error(err);
            this.is_logged = false
            return [false, 'Something went wrong – try again later']
        }
    }

    async data_getter(url, params) {

        const params_url = new URLSearchParams(params);
        const res = await fetch(`${this.host}/api/${url}?${params_url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
        });
        if (!res.ok) {
            if (res.status === 401) {
                // token expired or invalid → redirect to login
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const {success, tasks, error} = await res.json();
        if (!success) throw new Error(error);

        return tasks;
    }

    async data_getter2(url, params) {
        const params_url = new URLSearchParams(params);
        const res = await fetch(`${this.host}/api/${url}?${params_url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
        });
        if (!res.ok) {
            if (res.status === 401) {
                // token expired or invalid → redirect to login
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const {success, error, ...rest} = await res.json();
        const data = rest[Object.keys(rest)[0]]
        if (!success) throw new Error(error);
        return data;
    }

    async data_deleter(url, params) {
        const params_url = new URLSearchParams(params);
        const res = await fetch(`${this.host}/api/${url}?${params_url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                // token expired or invalid → redirect to login, etc.
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const {success, error, ...rest} = await res.json();
        if (!success) throw new Error(error);

        // server for DELETE usually returns something like { deleted: 1 }
        return rest[Object.keys(rest)[0]];
    }

    async data_updater(url, params, type = 'PUT') {
        const params_url = new URLSearchParams(params);
        const res = await fetch(`${this.host}/api/${url}?${params_url}`, {
            method: type,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                // token expired or invalid → redirect to login, etc.
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const {success, error, ...rest} = await res.json();
        if (!success) throw new Error(error);

        // server for DELETE usually returns something like { deleted: 1 }
        return rest[Object.keys(rest)[0]];
    }

    async data_poster(url, params) {
        const params_url = new URLSearchParams(params);
        const res = await fetch(`${this.host}/api/${url}?${params_url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
        });

        if (!res.ok) {
            if (res.status === 401) {
                // token expired or invalid → redirect to login, etc.
            }
            throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const {success, error, ...rest} = await res.json();
        if (!success) throw new Error(error);

        // server for DELETE usually returns something like { deleted: 1 }
        return rest[Object.keys(rest)[0]];
    }
}
