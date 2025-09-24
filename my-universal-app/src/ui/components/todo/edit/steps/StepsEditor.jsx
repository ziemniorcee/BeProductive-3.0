import React from "react";
import {View, Text, Pressable, StyleSheet, TextInput, Platform} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import {Ionicons} from "@expo/vector-icons";
import {Image} from "expo-image";
import {useMyDay} from "../../../../context/MyDayContext";
import {CheckboxStep} from "../../common/CheckboxStep";
import * as select from "react-native";
import StepRow from "./StepRow";

const ROW_H = 40;
const C = {
    text: "#FFFFFF",
    sub: "#BDBDBD",
    mid: "#9AA0A6",
};

function newId() {
    return (globalThis.crypto?.randomUUID?.()) ||
        `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}



export default function StepsEditor({app, color}) {
    const {state, patchEdit} = useMyDay(app);
    const task = state.editTask;

    const [steps, setSteps] = React.useState(() => task?.steps ?? []);
    const flushTimer = React.useRef(null);
    const draggingRef = React.useRef(false);

    React.useEffect(() => {
        setSteps(task?.steps ?? []);
    }, [task?.publicId]);


    const keyExtractor = React.useCallback(
        (it) => String(it.publicId ?? it.id),
        []
    );

    const addStep = React.useCallback(() => {
        setSteps(xs => {
            const next = [...xs, { publicId: newId(), name: "", stepCheck: false }];
            queueFlush(next, 0);
            return next;
        });
    }, []);

    const toggleStep = React.useCallback((id) => {
        setSteps(xs => {
            const next = xs.map(s => s.publicId === id ? { ...s, stepCheck: !s.stepCheck } : s);
            queueFlush(next, 150);
            return next;
        });
    }, []);

    const changeStepName = React.useCallback((id, name) => {
        setSteps(xs => {
            const next = xs.map(s => s.publicId === id ? { ...s, name } : s);
            queueFlush(next, 350);            // debounce typing
            return next;
        });
    }, []);

    const onDragBegin = React.useCallback(() => {
        draggingRef.current = true;
        if (flushTimer.current) { clearTimeout(flushTimer.current); flushTimer.current = null; }
    }, []);

    const onDragEnd = React.useCallback(({ data }) => {
        draggingRef.current = false;
        setSteps(data);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => commitFlush(data)); // always pass data
        });
    }, []);

    const animationConfig = React.useMemo(() => ({
        damping: 100,
        stiffness: 60000,
        mass: 0.4,
        overshootClamping: true,
        restDisplacementThreshold: 0.2,
        restSpeedThreshold: 0.2,
    }), []);

    function commitFlush(next) {
        if (flushTimer.current) { clearTimeout(flushTimer.current); flushTimer.current = null; }
        const raw = next ?? latestRef.current ?? [];

        const steps = raw
            .map(s => ({ ...s, name: (s?.name ?? "").trim() }))
            .filter(s => s.name !== "");

        patchEdit({ steps: steps });
    }

    function queueFlush(next, ms = 0) {
        if (flushTimer.current) clearTimeout(flushTimer.current);
        flushTimer.current = setTimeout(() => {
            if (!draggingRef.current) commitFlush(next);
        }, ms);
    }

    const renderItem = React.useCallback(
        ({item, drag, isActive}) => (
            <StepRow
                item={item}
                isActive={isActive}
                onDrag={drag}
                onToggle={toggleStep}
                onText={changeStepName}
                color={color}
            />
        ),
        [toggleStep, changeStepName, color]
    );

    return (
        <View style={{userSelect: "none" /* helps on web during drag */}}>
            <Text style={[styles.sectionLabel, {color}]}>Steps</Text>

            <DraggableFlatList
                scrollEnabled={false}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                data={steps}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                onDragBegin={onDragBegin}
                onDragEnd={({data, from, to}) => {
                    if (from === to) return;           // no-op drop → no state churn
                    onDragEnd({data});
                }}
                activationDistance={1}
                autoscrollSpeed={200}
                autoscrollThreshold={40}
                activationScale={1}
                dragItemOverflow="visible"
                removeClippedSubviews={false}
                renderPlaceholder={() => <View style={{height: ROW_H}}/>}
                animationConfig={animationConfig}
                containerStyle={styles.listContainer}
            />

            <Pressable style={styles.newStepRow} onPress={addStep}>
                <Ionicons name="add" size={22} color={color}/>
                <Text style={[styles.newStep, {color}]}>New Step</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {color: C.text, fontSize: 20, fontWeight: "600", marginBottom: 8,},
    list: {width: "100%", maxWidth: "100%"},
    listContent: {gap: 0},
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: Platform.select({web: 10, default: 3}),
        paddingVertical: Platform.select({web: 6, default: 0}),
        width: "100%",
        paddingRight: 40,
    },
    dragHandle: {width: 20, alignItems: "center", justifyContent: "center"},
    drag: {width: 20, height: 20, pointerEvents: "none"},
    stepText: {
        color: C.text, fontSize: 16, flex: 1, paddingVertical: 0,
        marginVertical: 3,
    },
    stepTextChecked: {
        color: C.text, fontSize: 16, flex: 1, paddingVertical: 0,
        marginVertical: 3,
        marginLeft: select.Platform.select({web: 0, default: 4})
    },
    stepDone: {color: C.mid, textDecorationLine: "line-through"},
    newStepRow: {flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6},
    newStep: {fontSize: 20, fontWeight: "500"},
});
