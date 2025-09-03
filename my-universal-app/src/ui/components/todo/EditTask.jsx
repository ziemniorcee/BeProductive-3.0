import React from "react";
import {View, Text, Pressable, StyleSheet, TextInput, Platform, FlatList} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {CheckboxMain} from "./CheckboxMain";
import DraggableFlatList from "react-native-draggable-flatlist";
import {Image} from "expo-image";
import {priorityColor, priorityName, taskTypeColor, taskTypeName} from "../../theme/tokens";
import {CheckboxStep} from "./CheckboxStep";
import {SvgXml} from "react-native-svg";

export default function EditTaskPanel({app}) {
    let task = app.services.myday.get().editTask


    const [note, setNote] = React.useState(task.note ?? "");

    const [steps, setSteps] = React.useState(task.steps);
    const [editingId, setEditingId] = React.useState(null);

    const newId = () => `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const addStep = React.useCallback(() => {
        const id = newId();
        setSteps((xs) => [...xs, {id, text: "", done: false}]);
        setEditingId(id);
    }, []);


    const toggle = React.useCallback(
        (id) => setSteps((xs) => xs.map((s) => (s.id === id ? {...s, done: !s.done} : s))),
        []
    );

    const renderStep = React.useCallback(
        ({item, drag, isActive}) => (
            <StepRow item={item} isActive={isActive} onToggle={toggle} onDrag={drag}/>
        ),
        [toggle]
    );

    let importance_color = priorityColor(task.importance)

    let project_category_id = app.services.projects.categoryIdByPublicId(task.projectPublicId)
    let project_color = app.services.categories.colorByPublicId(project_category_id)

    const StepRow = React.memo(function StepRow({item, isActive, onToggle, onDrag}) {
        return (
            <View style={[s.stepRow, isActive && {backgroundColor: "#151515", borderRadius: 8, paddingHorizontal: 6}]}>
                <Pressable onPressIn={onDrag} style={s.dragHandle} hitSlop={8}>
                    <Image source={require("../../../../assets/common/drag.png")} style={s.drag} draggable={false}/>
                </Pressable>
                <CheckboxStep color={importance_color}>
                </CheckboxStep>
                <TextInput defaultValue={item.name} style={[s.stepText, item.done && s.stepDone]}/>
            </View>
        );
    });

    return (
        <View style={s.win}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Edit Task</Text>
            </View>

            <View style={s.body}>
                {/* LEFT */}
                <View style={s.left}>
                    <View style={s.titleRow}>
                        <CheckboxMain color={importance_color}></CheckboxMain>
                        <TextInput defaultValue={task.name} style={s.title} placeholderTextColor={C.sub}/>
                    </View>

                    <View style={s.noteWrap}>
                        <Image source={require("../../../../assets/common/notes.png")} style={s.noteIcon}></Image>
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder="Note"
                            placeholderTextColor={C.sub}
                            style={s.noteInput}
                        />
                    </View>


                    <View style={s.stepBlock}>
                        <Text style={[s.sectionLabel, {color: importance_color}]}>Steps</Text>

                        <DraggableFlatList
                            scrollEnabled={false}
                            style={s.list}
                            contentContainerStyle={s.listContent}
                            data={steps ?? []}
                            keyExtractor={(it) => it.publicId}
                            renderItem={renderStep}
                            onDragEnd={({data}) => setSteps(data)}
                            activationDistance={1}
                            autoscrollSpeed={200}
                            autoscrollThreshold={40}
                            activationScale={1}
                            renderPlaceholder={() => null}
                            animationConfig={{
                                damping: 100,
                                stiffness: 60000,
                                mass: 0.4,
                                overshootClamping: true,
                                restDisplacementThreshold: 0.2,
                                restSpeedThreshold: 0.2,
                            }}
                        />

                        <Pressable style={s.newStepRow} onPress={addStep}>
                            <Ionicons name="add" size={22} color={importance_color}/>
                            <Text style={[s.newStep, {color: importance_color}]}>New Step</Text>
                        </Pressable>
                    </View>
                </View>
                <View style={s.divider}/>

                {/* RIGHT */}
                <View style={s.right}>
                    <Field label="Category">
                        <Pill text={app.services.categories.nameByPublicId(task.categoryPublicId)}
                              border={app.services.categories.colorByPublicId(task.categoryPublicId)}/>
                    </Field>
                    <SelectionCard label="Category">

                        <SelectionCategories data={app.services.categories.get().byPublicId}/>
                    </SelectionCard>

                    <Field label="Project">
                        <Pill text={`${app.services.projects.nameByPublicId(task.projectPublicId)}`}
                              border={project_color} icon={app.services.projects.iconByPublicId(task.projectPublicId)}/>
                    </Field>
                    <Field label="Importance">
                        <Pill text={priorityName(task.importance)} border={priorityColor(task.importance)}/>
                    </Field>

                    <Field label="Task Type">
                        <Pill text={taskTypeName(task.dateType)} border={taskTypeColor(task.dateType)}/>
                    </Field>

                    <Field label="When">
                        <Pill text={task.addDate ?? "None"} border={"#FFFFFF"}/>
                    </Field>
                </View>
            </View>
        </View>
    );
}

const darken = (hex, k = 0.22) => {
    if (!hex || hex[0] !== "#" || (hex.length !== 7 && hex.length !== 4)) return hex;
    const expand = (h) => (h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h);
    const c = expand(hex);
    const n = parseInt(c.slice(1), 16);
    const r = Math.floor(((n >> 16) & 255) * k);
    const g = Math.floor(((n >> 8) & 255) * k);
    const b = Math.floor((n & 255) * k);
    const h2 = (v) => v.toString(16).padStart(2, "0");
    return `#${h2(r)}${h2(g)}${h2(b)}`;
};

function Field({label, children}) {
    return (
        <View style={{marginBottom: 18, width: 250}}>
            <Text style={s.fieldLabel}>{label}</Text>
            {children}
        </View>
    );
}

function Pill({text, border, icon = null}) {
    const bg = darken(border, 0.1);
    const size = 25;
    return (
        <View style={[s.pill, {borderColor: border, backgroundColor: bg}]}>
            {icon ? (
                <SvgXml
                    xml={icon}
                    width={size}
                    height={size}
                    style={{marginRight: 10}}
                    color={"#FFFFFF"}
                />
            ) : null}
            <Text style={s.pillText}>{text}</Text>
        </View>
    );
}
//

function SelectionCard({label ,children}) {
    return (
        <View style={s.selectionCard}>
            <View style={s.selectionCardHeader}>
                <Text style={s.selectionCardHeaderText}>{label}</Text>
            </View>
            {children}
        </View>
    )
}

function SelectionCategories({data}) {
    const items = React.useMemo(
        () => (Array.isArray(data) ? data : Object.values(data ?? {})),
        [data]
    );

    console.log(items)
    return (
        <FlatList
            style={s.selectionCardMain}
            data={items}
            keyExtractor={(it, i) => String(it.id ?? i)}
            renderItem={({ item }) => (
                <Pill text={item.name} border={item.color ?? "#FFFFFF"} />
            )}
        />
    );
}

const C = {
    bg: "#000000",
    surface: "#0A0A0A",
    line: "#5E5E5E",
    mid: "#9AA0A6",
    text: "#FFFFFF",
    sub: "#BDBDBD",
    yellow: "#FFD400",
    blue: "#1E88E5",
    red: "#C62828",
};

const s = StyleSheet.create({
    win: {
        flex: 1,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#2A2A2A",
    },
    header: {
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: "#505050",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {color: C.text, fontSize: 20, fontWeight: "600"},

    body: {
        flex: 1,
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 16,
    },

    left: {flex: 1, paddingRight: 8, paddingLeft: 6},
    right: {width: 330, paddingLeft: 8, alignItems: "center", position: "relative",},

    divider: {width: 1, backgroundColor: "#6B6B6B", marginVertical: 4},

    titleRow: {flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 6, position: "relative"},
    circle: {width: 18, height: 18, borderRadius: 18, borderWidth: 2},
    title: {flex: 1, color: C.text, fontSize: 24, fontWeight: "500", padding: 0, position: "relative", top: 1},

    noteRow: {flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12},
    note: {color: C.sub, fontSize: 14},

    sectionLabel: {color: C.yellow, fontSize: 20, fontWeight: "600", marginBottom: 8},

    drag: {width: 20, height: 20, pointerEvents: "none"},


    newStepRow: {flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6},
    newStep: {color: C.yellow, fontSize: 20, fontWeight: "500"},

    fieldLabel: {color: C.text, opacity: 0.9, fontSize: 18, textAlign: "center", marginBottom: 8},
    pill: {
        flexDirection: "row",
        width: "100%",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: C.bg,
        cursor: "pointer",
    },
    pillText: {color: C.text, fontSize: 20, position: "relative", top: -2},
    noteWrap: {
        position: "relative",
        marginBottom: 3,
        minHeight: 24,
        justifyContent: "center",
        marginLeft: 10,
        marginTop: 3
    },
    noteIcon: {position: "absolute", left: 1, top: 4, width: 16, height: 16},
    noteInput: {
        color: C.text,
        fontSize: 14,
        marginLeft: 24,
    },
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 6,
        width: "100%",
        paddingRight: 40,

    },
    dragHandle: {width: 20, alignItems: "center", justifyContent: "center"},
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: C.yellow,
        alignItems: "center",
        justifyContent: "center",
    },
    stepText: {color: C.text, fontSize: 16, width: "100%"},
    stepDone: {color: C.mid, textDecorationLine: "line-through"},
    list: {
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        backfaceVisibility: "hidden",
        overflowStyle: "none",
        scrollEnabled: false,
    },
    listContent: {
        paddingRight: 0,
    },
    stepBlock: {
        marginLeft: 12,
    },
    selectionCard: {
        backgroundColor: "#000000",
        borderRadius: 12,
        padding: 12,
        margin: 12,
        borderColor: "#2A2A2A",
        borderWidth: 1,
        position: "absolute",
        zIndex: 2,
        top: 100,
        color: "#FFFFFF",
        width: '90%',
        alignItems: "center",
    },
    selectionCardHeader: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: "#2A2A2A",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    selectionCardMain: {
        width: 250,
        flex: 1,
        flexDirection: "column",
        maxHeight: 500,
    },
    selectionCardHeaderText: {
        color: "#FFFFFF",
        fontSize: 20,
    },
});

