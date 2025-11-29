import React from "react";
import TodoCore from "../components/todo/common/TodoCore";
import {Platform} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";

export default function InboxScreen({app}) {
    const [state, setState] = React.useState(() => app.services.myday.get());

    React.useEffect(() => {
        const unsub = app.services.myday.subscribe(next => setState({...next})); // new ref

        app.services.myday.load({
            type: "Now"
        });

        return () => unsub?.();
    }, [app]);
    const {goals = [], loading = true} = state;

    React.useEffect(() => {
        const isWeb = Platform.OS === "web";

        if (isWeb) return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, []);

    return (
        <TodoCore app={app} type={"Now"} goals={goals} loading={loading} state={state}/>
    )
}

