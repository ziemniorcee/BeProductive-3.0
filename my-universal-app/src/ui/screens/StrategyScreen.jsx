// StrategyScreen.jsx
import React from "react";
import InfiniteGalaxySVG from "../components/strategy/InfiniteGalaxy";
import * as ScreenOrientation from 'expo-screen-orientation';

export default function StrategyScreen({app}) {
    React.useEffect(() => {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        return () =>
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, []);
    return <InfiniteGalaxySVG app={app}/>;
}


