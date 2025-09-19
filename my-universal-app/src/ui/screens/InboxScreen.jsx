import React from "react";
import ScreenCore from "../components/todo/common/ScreenCore";

export default function InboxScreen({app}) {
    const [state, setState] = React.useState(() => app.services.myday.get());

    React.useEffect(() => {
        const unsub = app.services.myday.subscribe(next => setState({...next})); // new ref

        app.services.myday.load({
            type: "Inbox"
        });

        return () => unsub?.();
    }, [app]);
    const {goals = [], loading = true} = state;

    return (
        <ScreenCore app={app} type={"Inbox"} goals={goals} loading={loading} state={state}/>
    )
}

