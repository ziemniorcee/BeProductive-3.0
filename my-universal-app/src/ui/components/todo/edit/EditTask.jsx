import React from "react";
import { Modal, Platform, useWindowDimensions } from "react-native";
import EditTaskPanelMobile from "./EditTaskPanel.mobile";
import Vignette from "../../common/Vignette";
import EditTaskPanelWeb from "./EditTaskPanel.web";
// import EditTaskPanel (desktop) and EditTaskPanelMobile (mobile)

export default function EditTask({ state, app, closeEdit }) {
    const { width, height } = useWindowDimensions();
    const isNative = Platform.OS !== "web";
    const isNarrowWeb = Math.min(width, height) <= 480;
    const useMobileUI = isNative || isNarrowWeb;

    if (!state.editOpen) return null;
    return useMobileUI ? (
        <Modal
            visible
            animationType="slide"
            transparent
            statusBarTranslucent
            presentationStyle="overFullScreen"
            onRequestClose={closeEdit}
        >
            <EditTaskPanelMobile app={app} />
        </Modal>
    ) : (
        <Vignette window={{ rx: 24, width: 0.7, height: 0.8 }} pointerEvents="box-none" app={app} onClose={closeEdit}>
            <EditTaskPanelWeb app={app} />
        </Vignette>
    );
}
