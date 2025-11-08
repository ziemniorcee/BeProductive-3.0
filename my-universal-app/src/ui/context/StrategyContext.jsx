import React, {useCallback, useMemo, useState} from "react";

const Ctx = React.createContext(null);

export function StrategyProvider({app, children}) {
    const [state, setState] = React.useState(app.services.strategy.get());
    const [projectPositions, setProjectPositions] = useState([]);

    React.useEffect(() => {
        const unsub = app.services.strategy.subscribe(s => setState({...s}));
        return unsub;
    }, [app]);


    const updateNodePosition = useCallback((publicId, newRelX, newRelY) => {
        setState(currentState => {
            const newGoals = currentState.goals.map(goal => {
                if (goal.publicId !== publicId) {
                    return goal;
                }
                return {
                    ...goal,
                    x: newRelX,
                    y: newRelY,
                };
            });
            return {
                ...currentState,
                goals: newGoals,
            };
        });
    }, []);

    const patchNewPoint = React.useCallback(
        (change) => app.services.strategy.patchNewPoint(change),
        [app]
    )

    const openAddNewPoint = React.useCallback(() => app.services.strategy.openAddNewPoint(), [app])

    const saveNewPoint = React.useCallback(
        () => app.store.strategy.saveNewPoint(),
        [app]
    );

    const changePointPosition = React.useCallback(
        (id, newPosition) => app.services.strategy.changePointPosition(id, newPosition),
        [app]
    )

    const value = useMemo(() => ({
        state,
        updateNodePosition, // <-- Expose the update function
        patchNewPoint,
        openAddNewPoint,
        saveNewPoint,
        projectPositions,
        changePointPosition,
        setProjectPositions,
    }), [state, updateNodePosition, patchNewPoint, openAddNewPoint, saveNewPoint, projectPositions, changePointPosition]);

    return (
        <Ctx.Provider value={value}>
            {children}
        </Ctx.Provider>
    );
}

export function useStrategy() {
    const ctx = React.useContext(Ctx);
    if (!ctx) throw new Error("useStrategy must be used inside StrategyProvider");
    return ctx;
}