import React, {useEffect, useState} from "react";
import EditPicker from "../common/EditPicker";
import CategoryContent from "./CategoryContent";
import {useMyDay} from "../../../../../context/MyDayContext";
import {useStrategy} from "../../../../../context/StrategyContext";

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
    const [selectedId, setSelectedId] = useState(id);
    const [categories, setCategories] = useState(app.services.categories.get());
    const currentScreen = app.view.current().screen;
    let saveToBackend = null;

    if (currentScreen === "myday") {
        const { patchEdit } = useMyDay();
        saveToBackend = patchEdit;
    } else if (currentScreen === "strategy") {
        const { patchNewPoint } = useStrategy();
        saveToBackend = patchNewPoint;
    }

    const handleSelect = (newId) => {
        setSelectedId(newId);

        if (saveToBackend) {
            saveToBackend({ "categoryPublicId": newId });
        }
    };

    useEffect(() => {
        setSelectedId(id);
    }, [id]);

    useEffect(() => {
        return app.services.categories.subscribe((newState) => {
            setCategories(newState);

            if (newState.newCategoryId) {
                handleSelect(newState.newCategoryId);

                if (app.services.categories.clearNewCategory) {
                    app.services.categories.clearNewCategory();
                }
            }
        });
    }, [app.services.categories]);

    let src = categories.byPublicId;
    let type = "categoryPublicId";
    let label = "Category";
    let currentColor = app.services.categories.colorByPublicId(selectedId);
    let currentName = app.services.categories.nameByPublicId(selectedId);
    let current = { color: currentColor, name: currentName };
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