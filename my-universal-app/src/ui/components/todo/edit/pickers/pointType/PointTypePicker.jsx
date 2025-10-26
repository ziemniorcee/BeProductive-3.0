import EditPicker from "../common/EditPicker";
import PickerCore from "../common/PickerCore";
import React from "react";
import {POINT_TYPES, pointTypeName, TASK_TYPES} from "../../../../../theme/tokens";

export default function PointTypePicker({app, pointType}) {
    let currentType = pointTypeName(pointType ?? 0);
    let current = {name: currentType}
    let src = POINT_TYPES
    let type ="pointType"
    let label = "Point Type";

    return (
        <EditPicker label={label} current={current}>
            {({ closeMenu }) => (
                <PickerCore
                    app={app}
                    src={src}
                    type={type}
                    onPick={closeMenu}
                />
            )}
        </EditPicker>
    )
}