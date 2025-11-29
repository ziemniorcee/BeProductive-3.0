import {Text, StyleSheet, View} from "react-native";
import React, {useState} from "react";
import ProjectPicker from "../../todo/edit/pickers/project/ProjectPicker";
import {useStrategy} from "../../../context/StrategyContext";
import PointTypePicker from "../../todo/edit/pickers/pointType/PointTypePicker";
import PointNameInput from "./PointNameInput";

export default function AddNewPointMobile({app, draftPoint, onDraftChange}) {
    const {state,  patchNewPoint} = useStrategy();
    const newPoint = state.addNewPoint;
    const handleNameChange = (name) => {
        onDraftChange(prev => ({ ...prev, name }));
    };
    return (
        <>
        <ProjectPicker app={app} id={newPoint.projectPublicId} />
        <PointTypePicker app={app} pointType={newPoint.taskType}/>
        <PointNameInput initialName={draftPoint.name} onNameChange={handleNameChange}/>
        </>
    )
}
