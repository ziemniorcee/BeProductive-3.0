import React from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    ImageBackground,
    Dimensions,
    Pressable,
    Platform, Keyboard
} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Image} from "expo-image";
import {useMyDay} from "../../../context/MyDayContext";
import {CheckboxMain} from "../common/CheckboxMain";
import StepsEditor from "./steps/StepsEditor";
import CategoryPicker from "./pickers/category/CategoryPicker";
import ProjectPicker from "./pickers/project/ProjectPicker";
import ImportancePicker from "./pickers/importance/ImportancePicker";
import TaskTypePicker from "./pickers/taskType/TaskTypePicker";
import DatePicker from "./pickers/date/DatePicker";
import {priorityColor} from "../../../theme/tokens";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {GestureHandlerRootView,  GestureDetector} from "react-native-gesture-handler";
import {runOnJS, useAnimatedKeyboard, useAnimatedScrollHandler} from "react-native-reanimated";
import Animated, {useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate} from 'react-native-reanimated';
import {Gesture} from 'react-native-gesture-handler';

const SHEET_H = 600;
const HANDLE_H = 56;
const {height: SCREEN_H} = Dimensions.get('window');
const isAndroid = Platform.OS === "android";

export default function EditTaskPanelMobile({app}) {
    const insets = useSafeAreaInsets();
    const MAX_H = Math.min(SHEET_H, SCREEN_H - insets.top - 24);

    const {state, patchEdit} = useMyDay(app);
    const task = state.editTask;
    console.log(task)
    const [note, setNote] = React.useState(task.note ?? "");
    const importanceColor = React.useMemo(() => priorityColor(task.importance), [task.importance]);
    const changeName = React.useCallback((t) => patchEdit({name: t}), [patchEdit]);

    const closes = () => {
        app.services.myday.closeEdit();
    };

    const y = useSharedValue(0);       // sheet offset
    const dim = useSharedValue(1);     // backdrop opacity 0..1
    const panRef = React.useRef(null);

    const pan = React.useMemo(() =>
            Gesture.Pan()
                .withRef(panRef)
                .failOffsetX([-16, 16])
                .activeOffsetY([10, 99999]) // downward only
                .onChange(e => {
                    const v = Math.max(0, e.translationY);
                    y.value = v;
                    dim.value = 1 - Math.min(1, v / SHEET_H);
                })
                .onEnd(e => {
                    const shouldClose = e.translationY > SHEET_H * 0.25 || e.velocityY > 1200;
                    if (shouldClose) {
                        y.value = withTiming(SHEET_H + insets.bottom + 24, { duration: 220 }, () => runOnJS(closes)());
                        dim.value = withTiming(0, { duration: 200 });
                    } else {
                        y.value = withSpring(0, { damping: 18, stiffness: 180 });
                        dim.value = withTiming(1, { duration: 160 });
                    }
                })
        , [closes, insets.bottom]);

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: y.value }],
    }));

    const dimStyle = useAnimatedStyle(() => ({
        opacity: dim.value * 0.55,
    }));

    const barStyle = useAnimatedStyle(() => {
        const w = 48 + Math.min(16, y.value * 0.2);          // widen a bit while pulling
        const o = 1 - Math.min(0.3, y.value * 0.0025);       // fade slightly
        return { width: w, opacity: o };
    });
    const kbH = useSharedValue(0);
    const [kbHjs, setKbHjs] = React.useState(0);
    const keyboardStyle = useAnimatedStyle(() => {
        const kbh = Platform.OS === "android" ? kbH.value : 0;
        const avail = SCREEN_H - insets.top - 12 - kbh;        // visible height
        const h = Math.min(SHEET_H, Math.max(280, avail));     // clamp
        return {
            height: h + insets.bottom,                           // dynamic height
            transform: [{ translateY: y.value }],
        };
    });

    React.useEffect(() => {
        const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const s = Keyboard.addListener(showEvt, e => {
            const h = e?.endCoordinates?.height ?? 0;
            kbH.value = withTiming(h, { duration: 120 }); // use in Reanimated styles
            setKbHjs(h);                                  // use/inspect in JS
        });
        const h = Keyboard.addListener(hideEvt, () => {
            kbH.value = withTiming(0, { duration: 120 });
        });

        return () => { s.remove(); h.remove(); };
    }, []);

    const [title, setTitle] = React.useState(task.name ?? "");
    React.useEffect(() => { setTitle(task.name ?? ""); }, [task.publicId]);

    const deb = React.useRef();
    const onTitleChange = (t) => {
        setTitle(t);                      // local only -> no big re-render
        clearTimeout(deb.current);
        deb.current = setTimeout(() => {  // debounce store/update
            patchEdit({ name: t });
        }, 250);
    };

    const [titleH, setTitleH] = React.useState(36);
    const onSize = (e) => {
        const h = Math.min(120, Math.max(36, e.nativeEvent.contentSize.height));
        if (h !== titleH) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTitleH(h);
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
            {/* Backdrop */}
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, dimStyle]} />

            {/* Sheet */}
            <Animated.View
                style={[
                    s.container,
                    keyboardStyle,
                    {
                        position: 'absolute',
                        left: 0, right: 0, bottom: 0,
                        height: MAX_H + insets.bottom,
                        paddingTop: 8,
                        paddingBottom: insets.bottom
                    }
                ]}
            >

                {/* Drag handle ONLY area captures pan */}
                <GestureDetector gesture={pan}>
                    <View style={s.handleArea} hitSlop={{ top: 10, bottom: 10, left: 0, right: 0 }} accessible accessibilityLabel="Drag handle">
                        <Animated.View style={[s.handleBar, barStyle]} />
                        {/* optional dotted grip */}

                        <Text style={s.headerTitle}>Edit Task</Text>
                    </View>
                </GestureDetector>

                <View style={s.hr} />

                {/* Content scroll has priority */}
                <Animated.ScrollView
                    keyboardDismissMode={isAndroid ? "on-drag" : "interactive"}
                    scrollEventThrottle={16}
                    nestedScrollEnabled
                    simultaneousHandlers={panRef}
                    contentContainerStyle={s.content}
                >
                    {/* your content: CheckboxMain, inputs, StepsEditor, pickers, etc. */}
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
                </Animated.ScrollView>
            </Animated.View>
        </View>
        </GestureHandlerRootView>
    );
}

const C = {text: "#FFFFFF", sub: "#BDBDBD", line: "#FFFFFF"};

const s = StyleSheet.create({
    container: { backgroundColor: "#000000D8", paddingHorizontal: 12, },
    headerTitle: {
        lineHeight: 50,
        textAlign: "center",
        color: C.text,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 6,
        height: 50
    },
    hr: {height: 1, backgroundColor: C.line, marginBottom: 10, width: "maxContent"},
    content: {paddingBottom: 28, gap: 12},
    titleRow: {flexDirection: "row", alignItems: "flex-start", marginTop: 6, marginBottom: 4, paddingHorizontal: 6},
    title: {flex: 1, color: C.text, fontSize: 20, fontWeight: "400", padding: 0, marginLeft: 8, marginTop: 5},
    noteWrap: {minHeight: 26, justifyContent: "center", marginLeft: 10},
    noteIcon: {position: "absolute", left: 1, top: 5, width: 16, height: 16},
    noteInput: {color: C.text, fontSize: 14, marginLeft: 24, padding: 0},
    saveBtn: {
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
        borderWidth: 1,
        borderColor: "#FFFFFF",
        position: "absolute",
        right: 0,
        width: 100
    },
    saveTxt: {color: "#FFFFFF", fontSize: 16, fontWeight: "700"},
    headerBar: { position: "relative" },
    handleArea: { height: 56, justifyContent: 'center', alignItems: 'center' },
    handleBar: {
        height: 5, borderRadius: 3,
        backgroundColor: '#6B7280',        // gray-500
        marginTop: 8, marginBottom: 6,
    },
    gripRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF' }, // gray-400
    pickers: {
        width: '100%',              // give container a real width
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    cell: {
        width: '47%',   // two columns
        // optional: minWidth: 160,
    },
    full: {
        width: '100%',
    },
});
