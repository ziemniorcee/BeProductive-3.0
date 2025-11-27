import { AppServices } from "./services/AppServices";
import { ViewBus } from "./view/ViewBus"; // your React-free bus
import { config } from "./config";
import {makeHttpClient} from "../data/http/makeHttpClient";
import {tokenStorage} from "../data/storage/tokenStorage";

export function createApp(opts = {}) {
    const app = {};
    app.view = new ViewBus();

    app.http = makeHttpClient({
        baseUrl: opts.apiUrl ?? config.apiUrl,
        getToken: () => tokenStorage.get("jwt"),
        onUnauthorized: () => app.view.set({ screen: "Login", props: {} }),
    });

    app.services = new AppServices({ http: app.http, storage: tokenStorage });

    app.start = async () => {
        const authed = await app.services.auth.is_token_valid();
        if (!authed) { app.view.go("login"); return; }

        await app.services.categories.reload();
        await app.services.projects.reload();

        app.view.go("myday");
        // app.view.go("strategy");

    };

    return app;
}
