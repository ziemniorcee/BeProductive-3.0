import React from "react";
import {View, Text, Pressable, StyleSheet, TextInput, useWindowDimensions} from "react-native";
import {Image} from "expo-image";
import {useMyDay} from "../../../context/MyDayContext";
import {CheckboxMain} from "../common/CheckboxMain";
import CategoryPicker from "./pickers/category/CategoryPicker";
import ProjectPicker from "./pickers/project/ProjectPicker";
import ImportancePicker from "./pickers/importance/ImportancePicker";
import TaskTypePicker from "./pickers/taskType/TaskTypePicker";
import DatePicker from "./pickers/date/DatePicker";
import StepsEditor from "./steps/StepsEditor";
import {priorityColor} from "../../../theme/tokens";

export default function EditTaskPanelWeb({app}) {
    const {state, patchEdit} = useMyDay(app);
    const task = state.editTask;
    const [note, setNote] = React.useState(task.note ?? "");

    const changeName = React.useCallback((t) => {
        patchEdit({name: t});
    }, [patchEdit]);
    const importanceColor = React.useMemo(() => priorityColor(task.importance), [task.importance]);
    const LINE_H = 30;
    const MAX_LINES = 12;
    const [h, setH] = React.useState(LINE_H);
    const [w, setW] = React.useState(0);

// measure fn
    const onMeasure = React.useCallback(e => {
        const H = e.nativeEvent.layout.height || LINE_H;
        setH(Math.min(H, LINE_H * MAX_LINES));
    }, []);


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
                        <Text
                            onLayout={onMeasure}
                            style={[s.title, {
                                position: 'absolute',
                                opacity: 0,
                                pointerEvents: 'none',
                                width: w || '100%',
                                lineHeight: LINE_H,
                                whiteSpace: 'pre-wrap',   // RN Web
                                wordBreak: 'break-word',
                            }]}
                            // re-measure when width or text changes
                            key={`m-${Math.round(w)}-${task.name.length}`}
                        >
                            {task.name || ' '}
                        </Text>

                        <TextInput
                            spellCheck={false}
                            multiline
                            numberOfLines={1} // rows=1 on web
                            value={task.name}
                            onChangeText={changeName}
                            scrollEnabled={false}
                            style={[s.title, {
                                height: h,
                                minHeight: LINE_H,
                                maxHeight: LINE_H * MAX_LINES,
                                lineHeight: LINE_H,
                                textAlignVertical: 'top',
                                flexGrow: 1, flexShrink: 1,
                                paddingVertical: 0,
                                wordBreak: 'break-word',
                                includeFontPadding: false,
                                overflow: 'hidden',
                            }]}
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

                    {/* steps moved out */}
                    <StepsEditor app={app} color={importanceColor}/>
                </View>

                <View style={s.divider}/>

                <View style={s.right}>
                    <CategoryPicker app={app} id={task.categoryPublicId}/>
                    <ProjectPicker app={app} id={task.projectPublicId}/>
                    <ImportancePicker app={app} importance={task.importance}/>
                    <TaskTypePicker app={app} taskType={task.dateType}/>
                    <DatePicker app={app} date={task.addDate}/>
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
    win: {flex: 1, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#2A2A2A"},
    header: {
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: "#505050",
        alignItems: "center",
        justifyContent: "center"
    },
    headerTitle: {color: C.text, fontSize: 20, fontWeight: "600"},
    body: {flex: 1, flexDirection: "row", paddingHorizontal: 16, paddingVertical: 14, gap: 16},
    left: {flex: 1, paddingRight: 8, paddingLeft: 6},
    right: {width: 330, paddingLeft: 8, alignItems: "center", position: "relative"},
    divider: {width: 1, backgroundColor: "#6B6B6B", marginVertical: 4},
    titleRow: {flexDirection: "row", minHeight: 0, alignItems: "flex-start", marginTop: 10, marginBottom: 6, position: "relative",},
    title: {
        flex: 1,
        flexShrink: 1,
        color: C.text,
        fontSize: 24,
        fontWeight: '500',
        paddingVertical: 0,
        paddingHorizontal: 0,
        textAlignVertical: 'top',   // Android
        position:"relative",
        top:4,
        // RN Web:
        wordBreak: 'break-word'
    },
    noteWrap: {
        position: "relative",
        marginBottom: 3,
        minHeight: 24,
        justifyContent: "center",
        marginLeft: 5,
        marginTop: 3
    },
    noteIcon: {position: "absolute", left: 1, top: 4, width: 16, height: 16},
    noteInput: {color: C.text, fontSize: 14, marginLeft: 24},
});
