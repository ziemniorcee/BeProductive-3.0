// StrategyScreen.jsx
import React from "react";
import StrategyCore from "../components/strategy/StrategyCore";
import * as ScreenOrientation from 'expo-screen-orientation';
import StrategyContent from "../components/strategy/StrategyContent";
import {Platform} from "react-native";

export default function StrategyScreen({app}) {
    const isWeb = Platform.OS === "web";

    React.useEffect(() => {
        if (isWeb) return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return () =>
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, []);

    return (
        <StrategyCore app={app}>
            <StrategyContent app={app}/>
        </StrategyCore>
    );
}


