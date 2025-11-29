import React from 'react';
import AppBar from "../common/appBar/AppBar";
import GalaxyMenu from "./StrategyMenu";
import AddNewPoint from "./newPoint/AddNewPoint.jsx";
import StrategyOptions from "./StrategyOptions";

export function GalaxyOverlay({ app, state, onSaveNewPoint, shiftCamera, activeTapData }) {

    const handleSave = (pointData) => {
        shiftCamera(); // Shift camera first
        onSaveNewPoint(pointData); // Then save
    };

    return (
        <>
            <AppBar app={app} horizontal={false}/>
            <GalaxyMenu />
            <StrategyOptions app={app} activeTapData={activeTapData} />
            {state.addNewPointOpen && (
                <AddNewPoint
                    app={app}
                    onSave={handleSave}
                />
            )}

        </>
    );
}