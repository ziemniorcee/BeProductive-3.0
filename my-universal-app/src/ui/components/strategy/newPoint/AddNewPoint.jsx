import {Platform} from "react-native";
import Vignette from "../../common/Vignette";
import AddNewPointWeb from "./AddNewPoint";
import {useStrategy} from "../../../context/StrategyContext";
import {useEffect, useState} from "react";

export default function AddNewPoint({app, onSave}) {
    let isWeb = Platform.OS === "web";
    const { state, patchNewPoint, projectPositions } = useStrategy();
    const [draftPoint, setDraftPoint] = useState(state.addNewPoint);

    const handleSave = () => {
        const allKeys = new Set([
            ...Object.keys(state.addNewPoint),
            ...Object.keys(draftPoint)
        ]);
        const combinedPoint = Array.from(allKeys).reduce((acc, key) => {
            acc[key] = state.addNewPoint[key] ?? draftPoint[key];
            return acc;
        }, {});

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

        if (combinedPoint.taskType === 0) combinedPoint.taskType = 0;
        onSave(combinedPoint)
    };

    return isWeb ? (
        <Vignette window={{rx: 24, width: 0.32, height: 0.62}} pointerEvents="box-none" app={app} onClose={handleSave}>
            <AddNewPointWeb
                app={app}
                draftPoint={draftPoint}
                onDraftChange={setDraftPoint}
                onSave={handleSave}
            />
        </Vignette>
    ) : null;
}