import React from "react";
import EditPicker from "../common/EditPicker";
import {
    PRIORITY,
    priorityColor,
    priorityName,
    TASK_TYPES,
    taskTypeColor,
    taskTypeIcon,
    taskTypeName
} from "../../../../../theme/tokens";
import PickerCore from "../common/PickerCore";

export default function TaskTypePicker({ app, taskType }) {
    let currentColor = taskTypeColor(taskType);
    let currentName = taskTypeName(taskType)
    let currentIcon = taskTypeIcon(taskType);
    let current = {color: currentColor, name: currentName, icon: currentIcon};
    let src = TASK_TYPES
    let type = "dateType"
    let label = "Task Type"

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
