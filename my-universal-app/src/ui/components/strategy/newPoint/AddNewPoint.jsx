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
        patchNewPoint(draftPoint);
        close(); // Call original close prop
    };

    const handleCancel = () => {
        // Just close without saving
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