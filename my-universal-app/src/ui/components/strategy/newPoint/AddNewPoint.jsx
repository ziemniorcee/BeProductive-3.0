import {Platform} from "react-native";
import Vignette from "../../common/Vignette";
import AddNewPointWeb from "./AddNewPoint.web";
import {useStrategy} from "../../../context/StrategyContext";
import {useEffect, useState} from "react";
import VignetteMobile from "../../common/Vignette.mobile";
import AddNewPointMobile from "./AddNewPointMobile";
import * as ScreenOrientation from "expo-screen-orientation";

export default function AddNewPoint({app, onSave}) {
    let isWeb = Platform.OS === "web";
    const {state, patchNewPoint, projectPositions} = useStrategy();
    const [draftPoint, setDraftPoint] = useState(state.addNewPoint);

    const handleSave = () => {
        const combinedPoint = {...draftPoint, ...state.addNewPoint};

        const projectId = combinedPoint.projectPublicId;
        const matchingProject = projectPositions[projectPositions.length - 1]; // only god knows if it's correct

        if (matchingProject) {
            combinedPoint["x"] = matchingProject.x;
            combinedPoint["y"] = matchingProject.y;
        } else {
            console.warn(`Could not find project position for ID: ${projectId}`);
            combinedPoint["x"] = 0;
            combinedPoint["y"] = 0;
        }

        if (combinedPoint.taskType === null) combinedPoint.taskType = 0;
        onSave(combinedPoint)
    };

    return isWeb ? (
        <Vignette window={{rx: 24, width: 0.32, height: 0.62}} pointerEvents="box-none" app={app} onClose={handleSave}>
            <AddNewPointWeb
                app={app}
                draftPoint={draftPoint}
                onDraftChange={setDraftPoint}
            />
        </Vignette>
    ) : (
        <VignetteMobile app={app} pointerEvents="box-none" onClose={handleSave} title={"Add New Point"}>
            <AddNewPointMobile app={app} draftPoint={draftPoint}
                               onDraftChange={setDraftPoint}/>
        </VignetteMobile>
    );
}