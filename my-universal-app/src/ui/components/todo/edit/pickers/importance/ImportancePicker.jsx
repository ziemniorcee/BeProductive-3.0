import React from "react";
import EditPicker from "../common/EditPicker";
import {PRIORITY, priorityColor, priorityName} from "../../../../../theme/tokens";
import PickerCore from "../common/PickerCore";

export default function ImportancePicker({ app, importance }) {
    console.log("2",importance)
    let task_importance = 2
    if (importance !== null) task_importance = importance;

    let currentColor = priorityColor(task_importance);
    let currentName = priorityName(task_importance)
    let current = {color: currentColor, name: currentName};
    let src = PRIORITY
    let type = "importance"
    let label = "Importance"

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
    );
}
