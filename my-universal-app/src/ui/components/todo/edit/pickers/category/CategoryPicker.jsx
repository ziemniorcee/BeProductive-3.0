import React from "react";
import EditPicker from "../common/EditPicker";
import CategoryContent from "./CategoryContent";

/**
 * CategoryPicker Component
 * * Serves as the entry point for the category selection feature.
 * It acts as a "Smart Container" that prepares data from the app services
 * and wraps the selection UI in a standardized picker modal/popover (`EditPicker`).
 * * @param {Object} props
 * @param {Object} props.app - The main application instance containing service layers (e.g., `app.services`).
 * @param {string|null} props.id - The public ID of the currently selected category.
 */
export default function CategoryPicker({ app, id }) {
    const noneCategory = { id: null, name: "No category", color: "#FFFFFF" }

    let currentColor = app.services.categories.colorByPublicId(id);
    let currentName = app.services.categories.nameByPublicId(id);
    let current = { color: currentColor, name: currentName };
    let src = app.services.categories.get().byPublicId;
    let type = "categoryPublicId";
    let label = "Category";

    let allCategories = { noneCategory, ...src };

    return (
        <EditPicker label={label} current={current}>
            {({ closeMenu }) => (
                <CategoryContent
                    app={app}
                    allCategories={allCategories}
                    type={type}
                    closeMenu={closeMenu}
                />
            )}
        </EditPicker>
    );
}