import {Platform} from "react-native";
import Vignette from "../../common/Vignette";
import AddNewPointWeb from "./AddNewPoint";
import {useStrategy} from "../../../context/StrategyContext";
import {useState} from "react";

export default function AddNewPoint({app, close}) {
    let isWeb = Platform.OS === "web";
    const { state, patchNewPoint } = useStrategy();
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