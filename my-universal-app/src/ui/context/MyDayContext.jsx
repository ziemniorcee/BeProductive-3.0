import React from "react";
const Ctx = React.createContext(null);

export function MyDayProvider({ app, children }) {
    const [state, setState] = React.useState(app.services.myday.get());
    React.useEffect(() => app.services.myday.subscribe(s => setState({ ...s })), [app]);

    const onToggleMain = React.useCallback((taskId, checked) =>
        app.services.myday.toggleMainCheck(taskId, checked), [app]);

    const onToggleStep = React.useCallback((taskId, stepId, checked) =>
        app.services.myday.toggleStep(taskId, stepId, checked), [app]);

    const openEdit = React.useCallback((taskId) =>
        app.services.myday.openEdit(taskId), [app]);

    return (
        <Ctx.Provider value={{ state, onToggleMain, onToggleStep, openEdit }}>
            {children}
        </Ctx.Provider>
    );
}

export function useMyDay() {
    const ctx = React.useContext(Ctx);
    if (!ctx) throw new Error("useMyDay must be used inside MyDayProvider");
    return ctx;
}