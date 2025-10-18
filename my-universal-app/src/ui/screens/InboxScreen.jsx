import React from "react";
import TodoCore from "../components/todo/common/TodoCore";

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
        <TodoCore app={app} type={"Inbox"} goals={goals} loading={loading} state={state}/>
    )
}

