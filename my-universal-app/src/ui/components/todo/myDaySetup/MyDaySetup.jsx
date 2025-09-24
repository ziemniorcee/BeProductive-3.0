import React from "react";
import {Modal, Platform, Text, useWindowDimensions} from "react-native";
import Vignette from "../../common/Vignette";
// import EditTaskPanel (desktop) and EditTaskPanelMobile (mobile)

export default function MyDaySetup({ state, app, closeSetup }) {
    const { width, height } = useWindowDimensions();
    const isNative = Platform.OS !== "web";
    const isNarrowWeb = Math.min(width, height) <= 480;
    const useMobileUI = isNative || isNarrowWeb;

    if (!state.myDaySetupOpen) return null;
    return useMobileUI ? (
        <Modal
            visible
            animationType="slide"
            transparent
            statusBarTranslucent
            presentationStyle="overFullScreen"
            onRequestClose={closeSetup}
        >
        </Modal>
    ) : (
        <Vignette window={{ rx: 24, width: 0.7, height: 0.8 }} pointerEvents="box-none" app={app} onClose={closeSetup}>
            <Text>MyDay Setup</Text>
        </Vignette>
    );
} // here continue,  build vignette for my day setup
