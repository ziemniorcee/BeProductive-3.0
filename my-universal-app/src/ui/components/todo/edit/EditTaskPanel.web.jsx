import React from "react";
import {View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator} from "react-native";
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

    // Loading state for the AI button
    const [isPredicting, setIsPredicting] = React.useState(false);
    // State to hold the predicted IDs
    const [prediction, setPrediction] = React.useState(null);

    React.useEffect(() => {
        setPrediction(null);
    }, [task.categoryPublicId, task.projectPublicId]);

    const changeName = React.useCallback((t) => {
        patchEdit({name: t});
    }, [patchEdit]);

    const importanceColor = React.useMemo(() => priorityColor(task.importance), [task.importance]);
    const LINE_H = 30;
    const MAX_LINES = 12;
    const [h, setH] = React.useState(LINE_H);
    const [w, setW] = React.useState(0);

    const onMeasure = React.useCallback(e => {
        const H = e.nativeEvent.layout.height || LINE_H;
        setH(Math.min(H, LINE_H * MAX_LINES));
    }, []);

    // --- AI PREDICTION LOGIC ---
    const predict = async () => {
        if (!task.name || isPredicting) return;

        setIsPredicting(true);

        try {
            const candidateList = [];
            const categories = app.services.categories.get().byPublicId;
            const projects = app.services.projects.get().byPublicId;

            for (const [id, item] of Object.entries(projects)) {
                // Handle cases where category might be missing
                if (!categories[item.categoryPublicId]) continue;

                const catName = categories[item.categoryPublicId].name;
                candidateList.push(`${catName}: ${item.name}`);
            }

            if (candidateList.length === 0) {
                alert("Please create some projects or categories first!");
                setIsPredicting(false);
                return;
            }

            const response = await fetch("https://goal-classifier-965384144322.europe-west3.run.app/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: task.name,
                    projects: candidateList
                })
            });

            const data = await response.json();
            const predictedString = data.category;
            console.log("AI Chose:", predictedString);

            let foundProjectPublicId = null;
            let foundCategoryPublicId = null;

            // Iterate through projects again to find the matching ID
            for (const [pId, pItem] of Object.entries(projects)) {
                const parentCategory = categories[pItem.categoryPublicId];
                if (!parentCategory) continue;

                // Recreate the string format to match exact output
                const currentCandidate = `${parentCategory.name}: ${pItem.name}`;

                if (currentCandidate === predictedString) {
                    foundProjectPublicId = pId;
                    foundCategoryPublicId = pItem.categoryPublicId;
                    break;
                }
            }

            if (foundProjectPublicId) {
                console.log("Found Project ID:", foundProjectPublicId);

                // 1. Update local state to show prediction immediately
                setPrediction({
                    categoryPublicId: foundCategoryPublicId,
                    projectPublicId: foundProjectPublicId
                });

                // 2. Save the changes to the actual task data
                patchEdit({
                    categoryPublicId: foundCategoryPublicId,
                    projectPublicId: foundProjectPublicId
                });
            } else {
                console.warn("Could not match prediction to a known project.");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsPredicting(false);
        }
    };

    // Determine which IDs to display: Prediction first, fallback to Task
    const displayCategoryId = prediction?.categoryPublicId ?? task.categoryPublicId;
    const displayProjectId = prediction?.projectPublicId ?? task.projectPublicId;

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
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }]}
                            key={`m-${Math.round(w)}-${task.name.length}`}
                        >
                            {task.name || ' '}
                        </Text>

                        <TextInput
                            spellCheck={false}
                            multiline
                            numberOfLines={1}
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

                        <Pressable
                            onPress={predict}
                            style={{position: "relative", left: 10, top: 5, width: 30, height: 30, justifyContent: 'center', alignItems: 'center'}}
                        >
                            {isPredicting ? (
                                <ActivityIndicator size="small" color={C.mid} />
                            ) : (
                                <Image
                                    source={require("../../../../../assets/ai.png")}
                                    style={{width: 30, height: 30}}
                                />
                            )}
                        </Pressable>
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
                </View>

                <View style={s.divider}/>

                <View style={s.right}>
                    {/* UPDATED PICKERS: Prioritize Prediction IDs */}
                    <CategoryPicker app={app} id={displayCategoryId}/>
                    <ProjectPicker app={app} id={displayProjectId}/>

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
        textAlignVertical: 'top',
        position:"relative",
        top:4,
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