import React from "react";
const Ctx = React.createContext(null);

export function StrategyProvider({app, children}) {
    const [state, setState] = React.useState(app.services.strategy.get());

    React.useEffect(() => {
        const unsub = app.services.strategy.subscribe(s => setState({ ...s }));
        return unsub;
    }, [app]);

    const patchNewPoint = React.useCallback(
        (change) => app.services.strategy.patchNewPoint(change),
        [app]
    )

    const openAddNewPoint = React.useCallback(() => app.services.strategy.openAddNewPoint(), [app])


    return (
        <Ctx.Provider value={{state, patchNewPoint, openAddNewPoint}}>
            {children}
        </Ctx.Provider>
    );
}

export function useStrategy() {
    const ctx = React.useContext(Ctx);
    if (!ctx) throw new Error("useStrategy must be used inside StrategyProvider");
    return ctx;
}