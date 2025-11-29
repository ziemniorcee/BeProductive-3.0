// StrategyScreen.jsx
import React, {useEffect, useState} from "react";
import StrategyCore from "../components/strategy/StrategyCore";
import * as ScreenOrientation from 'expo-screen-orientation';
import StrategyContent, {ICONS2_CLEAN, NODES_CONST} from "../components/strategy/StrategyContent";
import {Platform} from "react-native";
import {useSharedValue} from "react-native-reanimated";
import {StrategyProvider, useStrategy} from "../context/StrategyContext";

function StrategyViewWrapper({app}) {
    // 1. Get state from the CONTEXT, not props or local state
    const { state } = useStrategy();

    // 2. Load the data (you can also move this into the provider)
    React.useEffect(() => {
        app.services.strategy.load();
    }, [app]);

    // 3. The shared value is now driven by the context state
    const nodesShared = useSharedValue(state.goals);
    useEffect(() => {
        nodesShared.value = state.goals;
    }, [state.goals]);

    return (
        <StrategyCore app={app} state={state} nodesShared={nodesShared}>
            {/* 3. This component no longer needs the `state` prop */}
            <StrategyContent app={app} icons={ICONS2_CLEAN} />
        </StrategyCore>
    );
}

export default function StrategyScreen({app}) {
    const isWeb = Platform.OS === "web";

    React.useEffect(() => {
        if (isWeb) return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    }, []);


    return (
        <StrategyProvider app={app}>
            <StrategyViewWrapper app={app} />
        </StrategyProvider>
    );
}


