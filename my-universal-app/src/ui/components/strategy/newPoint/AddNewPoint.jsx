import {Platform} from "react-native";
import Vignette from "../../common/Vignette";
import AddNewPointWeb from "./AddNewPoint";
import {useStrategy} from "../../../context/StrategyContext";
import {useState} from "react";

export default function AddNewPoint({app, close}) {
    let isWeb = Platform.OS === "web";
    const { state, patchNewPoint, projectPositions } = useStrategy();
    const [draftPoint, setDraftPoint] = useState(state.addNewPoint);


    const handleSave = () => {
        const allKeys = new Set([
            ...Object.keys(state.addNewPoint),
            ...Object.keys(draftPoint)
        ]);

        const combinedPoint = Array.from(allKeys).reduce((acc, key) => {
            acc[key] = draftPoint[key] ?? state.addNewPoint[key];
            return acc;
        }, {});

        const projectId = combinedPoint.projectPublicId;
        const matchingProject = projectPositions.find(project => project.id === projectId);

        if (matchingProject) {
            combinedPoint["x"] = matchingProject.x;
            combinedPoint["y"] = matchingProject.y;
        } else {
            console.warn(`Could not find project position for ID: ${projectId}`);
            combinedPoint["x"] = 0; // Set a default
            combinedPoint["y"] = 0;
        }
        patchNewPoint(combinedPoint);
        close(); // Call original close prop
    };

    const handleCancel = () => {
        close();
    };

    return isWeb ? (
        <Vignette window={{rx: 24, width: 0.32, height: 0.62}} pointerEvents="box-none" app={app} onClose={handleSave}>
            <AddNewPointWeb
                app={app}
                draftPoint={draftPoint}
                onDraftChange={setDraftPoint}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        </Vignette>
    ) : null;
}