import React from "react";
import TodoCore from "../components/todo/common/TodoCore";

export default function MyDayScreen({app}) {
    const [state, setState] = React.useState(() => app.services.myday.get());

    React.useEffect(() => {
        const unsub = app.services.myday.subscribe(next => setState({...next})); // new ref

        const setup = getSettings();
        const pad = n => String(n).padStart(2, '0');
        const d = new Date();
        const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // YYYY-MM-DD

        app.services.myday.load({
            type: "My Day",
            date: iso,
            queue_order: setup.projectQueue,
            deadlines_order: setup.deadlines,
        });

        return () => unsub?.();
    }, [app]);

    const {goals = [], loading = true, error} = state;

    return (
        <TodoCore app={app} type={"My Day"} goals={goals} loading={loading} state={state}/>
    )
}

function getSettings() {
    return {
        projectQueue: ["d0be79e4-6187-11f0-a08e-42010a400011", "3b4e78dd-687e-11f0-8dfc-42010a400014", "808cd8f5-687f-11f0-8dfc-42010a400014", "465921d0-68a5-11f0-8dfc-42010a400014"],
        deadlines: [],
        project_share: 69,
        deadline_share: 31,
    };
}

