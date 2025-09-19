import React from "react";
import {View, Text, Pressable, StyleSheet, TextInput} from "react-native";
import {Image} from "expo-image";
import {useMyDay} from "../../../context/MyDayContext";
import {CheckboxMain} from "../common/CheckboxMain";
import CategoryPicker from "./pickers/category/CategoryPicker";
import ProjectPicker from "./pickers/project/ProjectPicker";
import ImportancePicker from "./pickers/importance/ImportancePicker";
import TaskTypePicker from "./pickers/taskType/TaskTypePicker";
import DatePicker from "./pickers/date/DatePicker";
import StepsEditor from "./steps/StepsEditor";
import { priorityColor } from "../../../theme/tokens";

export default function EditTaskPanel({app}) {
    const { state, patchEdit } = useMyDay(app);
    const task = state.editTask;
    const [note, setNote] = React.useState(task.note ?? "");

    const changeName = React.useCallback((t) => { patchEdit({ name: t }); }, [patchEdit]);
    const importanceColor = React.useMemo(() => priorityColor(task.importance), [task.importance]);
    return (
        <View style={s.win}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Edit Task</Text>
            </View>

            <View style={s.body}>
                <View style={s.left}>
                    <View style={s.titleRow}>
                        <CheckboxMain checked={task.checkState} color={importanceColor} onPress={() => {
                            patchEdit({checkState: !task.checkState})
                        }}/>
                        <TextInput defaultValue={task.name} style={s.title} placeholderTextColor={C.sub} onChangeText={changeName}/>
                    </View>

                    <View style={s.noteWrap}>
                        <Image source={require("../../../../../assets/common/notes.png")} style={s.noteIcon} />
                        <TextInput
                            value={note}
                            onChangeText={(t) => { setNote(t); patchEdit({ note: t }); }}
                            placeholder="Note"
                            placeholderTextColor={C.sub}
                            style={s.noteInput}
                        />
                    </View>

                    {/* steps moved out */}
                    <StepsEditor app={app} color={importanceColor} />
                </View>

                <View style={s.divider} />

                <View style={s.right}>
                    <CategoryPicker app={app} id={task.categoryPublicId}/>
                    <ProjectPicker app={app} id={task.projectPublicId}/>
                    <ImportancePicker app={app} importance={task.importance}/>
                    <TaskTypePicker app={app} taskType={task.dateType}/>
                    <DatePicker app={app} date={task.addDate} />
                </View>
            </View>
        </View>
    );
}

const C = {
    bg: "#000000",
    surface: "#0A0A0A",
    line: "#5E5E5E",
    mid: "#9AA0A6",
    text: "#FFFFFF",
    sub: "#BDBDBD",
};

const s = StyleSheet.create({
    win: { flex: 1, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#2A2A2A" },
    header: { height: 48, borderBottomWidth: 1, borderBottomColor: "#505050", alignItems: "center", justifyContent: "center" },
    headerTitle: { color: C.text, fontSize: 20, fontWeight: "600" },
    body: { flex: 1, flexDirection: "row", paddingHorizontal: 16, paddingVertical: 14, gap: 16 },
    left: { flex: 1, paddingRight: 8, paddingLeft: 6 },
    right: { width: 330, paddingLeft: 8, alignItems: "center", position: "relative" },
    divider: { width: 1, backgroundColor: "#6B6B6B", marginVertical: 4 },
    titleRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 6, position: "relative" },
    title: { flex: 1, color: C.text, fontSize: 24, fontWeight: "500", padding: 0, position: "relative", top: 1 },
    noteWrap: { position: "relative", marginBottom: 3, minHeight: 24, justifyContent: "center", marginLeft: 5, marginTop: 3 },
    noteIcon: { position: "absolute", left: 1, top: 4, width: 16, height: 16 },
    noteInput: { color: C.text, fontSize: 14, marginLeft: 24 },
});
