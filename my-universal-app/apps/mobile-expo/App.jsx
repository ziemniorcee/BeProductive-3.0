import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {createApp} from "../../src/app/container";
import {ScreenRouter} from "../../src/ui/ScreenRouter";

const app = createApp();

export default function App() {
    const [view, setView] = React.useState(app.view.current());
    React.useEffect(() => {
        const off = app.view.subscribe(setView);
        app.start();
        return off;
    }, []);
    return (
        <SafeAreaProvider>
            <ScreenRouter view={view} app={app} />
        </SafeAreaProvider>
    );
}