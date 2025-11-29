import {TextInput, View, StyleSheet} from "react-native";
import {CheckboxMain} from "../common/CheckboxMain";
import React from "react";
import CategoryPicker from "./pickers/category/CategoryPicker";
import ProjectPicker from "./pickers/project/ProjectPicker";
import ImportancePicker from "./pickers/importance/ImportancePicker";
import TaskTypePicker from "./pickers/taskType/TaskTypePicker";
import DatePicker from "./pickers/date/DatePicker";
import StepsEditor from "./steps/StepsEditor";
import {priorityColor} from "../../../theme/tokens";
import {useMyDay} from "../../../context/MyDayContext";
import {Image} from "expo-image";
import VignetteMobile from "../../common/Vignette.mobile";

export default function EditTaskPanelMobile({app}) {
    const {state, patchEdit} = useMyDay(app);
    const task = state.editTask;
    const [note, setNote] = React.useState(task.note ?? "");
    const importanceColor = React.useMemo(() => priorityColor(task.importance), [task.importance]);
    const changeName = React.useCallback((t) => patchEdit({name: t}), [patchEdit]);
    const [title, setTitle] = React.useState(task.name ?? "");
    React.useEffect(() => { setTitle(task.name ?? ""); }, [task.publicId]);

    const onClose = () => {
        app.services.myday.closeEdit();
    };

    return (
        <VignetteMobile app={app} title={"Edit Task"} onClose={onClose}>
            <View style={s.titleRow}>
                <CheckboxMain checked={task.checkState} color={importanceColor} onPress={() => {
                    patchEdit({checkState: !task.checkState})
                }}/>
                <TextInput
                    multiline
                    defaultValue={task.name}
                    onChangeText={changeName}
                    placeholderTextColor={C.sub}
                    style={s.title}
                />
            </View>

            <View style={s.noteWrap}>
                <Image source={require("../../../../../assets/common/notes.png")} style={s.noteIcon}/>
                <TextInput
                    value={note}
                    onChangeText={(t) => {
                        setNote(t);
                        patchEdit({note: t});
                    }}
                    placeholder="Note"
                    placeholderTextColor={C.sub}
                    style={s.noteInput}
                />
            </View>

            <StepsEditor app={app} color={importanceColor}/>

            <View style={s.hr}/>

            <View style={s.pickers}>
                <View style={s.cell}><CategoryPicker app={app} id={task.categoryPublicId}/></View>
                <View style={s.cell}><ProjectPicker app={app} id={task.projectPublicId}/></View>
                <View style={s.cell}><ImportancePicker app={app} importance={task.importance}/></View>
                <View style={s.cell}><TaskTypePicker app={app} taskType={task.dateType}/></View>
                <View style={[s.cell, s.full]}><DatePicker app={app} date={task.addDate}/></View>
            </View>
        </VignetteMobile>
    )
}

const C = {text: "#FFFFFF", sub: "#BDBDBD", line: "#FFFFFF"};


const s = StyleSheet.create({
    titleRow: {flexDirection: "row", alignItems: "flex-start", marginTop: 6, marginBottom: 4, paddingHorizontal: 6},
    title: {flex: 1, color: C.text, fontSize: 20, fontWeight: "400", padding: 0, marginLeft: 8, marginTop: 5},
    noteWrap: {minHeight: 26, justifyContent: "center", marginLeft: 10},
    noteIcon: {position: "absolute", left: 1, top: 5, width: 16, height: 16},
    noteInput: {color: C.text, fontSize: 14, marginLeft: 24, padding: 0},
    hr: {height: 1, backgroundColor: C.line, marginBottom: 10, width: "maxContent"},
    cell: {
        width: '47%',   // two columns
        // optional: minWidth: 160,
    },
    full: {
        width: '100%',
    },
    pickers: {
        width: '100%',              // give container a real width
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
})