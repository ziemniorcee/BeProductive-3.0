import React from "react";
import EditPicker from "../common/EditPicker";
import {PRIORITY, priorityColor, priorityName} from "../../../../../theme/tokens";
import PickerCore from "../common/PickerCore";

export default function ImportancePicker({ app, importance }) {
    let currentColor = priorityColor(importance ?? 2);
    let currentName = priorityName(importance ?? 2)
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
