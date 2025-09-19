import React from "react";
import EditPicker from "../common/EditPicker";
import PickerCore from "../common/PickerCore";

export default function CategoryPicker({ app, id }) {
    const noneCategory = { id: null, name: "No category", color: "#FFFFFF" }

    let currentColor = app.services.categories.colorByPublicId(id);
    let currentName = app.services.categories.nameByPublicId(id)
    let current = {color: currentColor, name: currentName};
    let src = app.services.categories.get().byPublicId
    let type = "categoryPublicId"
    let label = "Category"

    let allCategories = {noneCategory, ...src}

    return (
        <EditPicker label={label} current={current}>
            {({ closeMenu }) => (
                <PickerCore
                    app={app}
                    src={allCategories}
                    type={type}
                    onPick={closeMenu}
                />
            )}
        </EditPicker>
    );
}
