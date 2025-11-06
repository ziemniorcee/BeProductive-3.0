// StrategyScreen.jsx
import React, {useEffect, useState} from "react";
import StrategyCore from "../components/strategy/StrategyCore";
import * as ScreenOrientation from 'expo-screen-orientation';
import StrategyContent, {ICONS2_CLEAN, NODES_CONST} from "../components/strategy/StrategyContent";
import {Platform} from "react-native";
import {useSharedValue} from "react-native-reanimated";

export default function StrategyScreen({app}) {
    const [state, setState] = React.useState(() => app.services.strategy.get());

    const isWeb = Platform.OS === "web";

    React.useEffect(() => {
        if (isWeb) return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return () =>
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, []);

    React.useEffect(() => {
        const unsub = app.services.strategy.subscribe(nextState => {
            setState({...nextState});
        });

        app.services.strategy.load();
        return () => unsub?.();
    }, [app]);

    const nodesShared = useSharedValue(state.goals);
    useEffect(() => {
        nodesShared.value = state.goals;
    }, [state.goals]);

    // 3. The state *update logic* lives here, in the same place as the state.
    const updateNodePosition = (nodeId, newX, newY) => {
        setState(currentState => ({
            ...currentState,
            goals: currentState.goals.map(goal =>
                goal.publicId === nodeId
                    ? { ...goal, x: newX, y: newY }
                    : goal
            )
        }));
    };

    return (
        <StrategyCore app={app} state={state} nodesShared={nodesShared} updateNodePosition={updateNodePosition}>
            <StrategyContent app={app} state={state} icons={ICONS2_CLEAN}/>
        </StrategyCore>
    );
}


