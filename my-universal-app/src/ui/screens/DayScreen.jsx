import React from "react";
import TodoCore from "../components/todo/common/TodoCore";
import * as ScreenOrientation from "expo-screen-orientation";
import {Platform} from "react-native";

export default function DayScreen({app, date}) {
    const [state, setState] = React.useState(() => app.services.myday.get());

    React.useEffect(() => {

        const unsub = app.services.myday.subscribe(next => setState({...next})); // new ref

        const pad = n => String(n).padStart(2, '0');
        const d = new Date();
        const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // YYYY-MM-DD

        app.services.myday.load({
            type: "Day",
            date: date ?? iso,
        });

        return () => unsub?.();
    }, [app]);

    React.useEffect(() => {
        const isWeb = Platform.OS === "web";

        if (isWeb) return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, []);

    const {goals = [], loading = true, error} = state;
    return (
        <TodoCore app={app} type={"Day"} date={date ?? iso} goals={goals} loading={loading} state={state}/>
    )
}
