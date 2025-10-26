import React from "react";
import EditPicker from "../common/EditPicker";
import PickerCore from "../common/PickerCore";

export default function ProjectPicker({ app, id }) {
    const noneProject = { publicId: null, name: "No project", categoryPublicId: null, svgIcon: null, x: null, y: null }

    const selectedProjectCategoryId = app.services.projects.categoryIdByPublicId(id);

    let currentColor = app.services.categories.colorByPublicId(selectedProjectCategoryId);
    let currentIcon = app.services.projects.iconByPublicId(id);
    let currentName = app.services.projects.nameByPublicId(id);

    let current = {color: currentColor, name: currentName, icon: currentIcon };
    let src = app.services.projects.get().rawProjects;
    let type = "projectPublicId"
    let label = "Project"

    const allProjects = [noneProject, ...src ];
    return (
        <EditPicker label={label} current={current}>
            {({ closeMenu }) => (
                <PickerCore
                    app={app}
                    src={allProjects}
                    type={type}
                    onPick={closeMenu}
                />
            )}
        </EditPicker>
    );
}
