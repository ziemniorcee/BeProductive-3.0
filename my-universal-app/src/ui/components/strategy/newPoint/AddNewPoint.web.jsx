import {Text, StyleSheet, View} from "react-native";
import React, {useState} from "react";
import ProjectPicker from "../../todo/edit/pickers/project/ProjectPicker";
import {useStrategy} from "../../../context/StrategyContext";
import PointTypePicker from "../../todo/edit/pickers/pointType/PointTypePicker";
import PointNameInput from "./PointNameInput";

export default function AddNewPointWeb({draftPoint, onDraftChange, onSave, onCancel}) {

    const handleNameChange = (name) => {
        onDraftChange(prev => ({ ...prev, name }));
    };

    return (
        <View style={styles.win}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Add New Point</Text>
            </View>
            <View style={styles.body}>
                {/*<ProjectPicker app={app} id={newPoint.projectPublicId}/>*/}
                {/*<PointTypePicker app={app} pointType={newPoint.pointType}/>*/}
                <PointNameInput initialName={draftPoint.name} onNameChange={handleNameChange}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    win: {flex: 1, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#2A2A2A"},
    header: {
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: "#505050",
        alignItems: "center",
        justifyContent: "center"
    },
    headerTitle: {color: "#FFFFFF", fontSize: 20, fontWeight: "600"},
    body: {flex: 1,  paddingHorizontal: 16, paddingVertical: 14, gap: 16, alignItems: "center"},
})