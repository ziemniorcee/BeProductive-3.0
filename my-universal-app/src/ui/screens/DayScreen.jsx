import React from "react";
import ScreenCore from "../components/todo/common/ScreenCore";

export default function DayScreen({app}) {
    const [state, setState] = React.useState(() => app.services.myday.get());

    React.useEffect(() => {
        const unsub = app.services.myday.subscribe(next => setState({...next})); // new ref

        const pad = n => String(n).padStart(2, '0');
        const d = new Date();
        const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // YYYY-MM-DD

        app.services.myday.load({
            type: "Day",
            date: iso,
        });

        return () => unsub?.();
    }, [app]);
    const {goals = [], loading = true, error} = state;

    return (
        <ScreenCore app={app} type={"Day"} goals={goals} loading={loading} state={state}/>
    )
}
