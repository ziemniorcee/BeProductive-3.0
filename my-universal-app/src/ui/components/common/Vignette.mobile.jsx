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


import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {GestureHandlerRootView,  GestureDetector} from "react-native-gesture-handler";
import {runOnJS, useAnimatedKeyboard, useAnimatedScrollHandler} from "react-native-reanimated";
import Animated, {useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate} from 'react-native-reanimated';
import {Gesture} from 'react-native-gesture-handler';

const SHEET_H = 600;
const {height: SCREEN_H, width:SCREEN_W} = Dimensions.get('window');

const isAndroid = Platform.OS === "android";

export default function VignetteMobile({app, title, onClose, children}) {
    const insets = useSafeAreaInsets();
    const MAX_H = Math.min(SHEET_H, SCREEN_H - insets.top - 24);



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
                        y.value = withTiming(SHEET_H + insets.bottom + 24, { duration: 220 }, () => runOnJS(onClose)());
                        dim.value = withTiming(0, { duration: 200 });
                    } else {
                        y.value = withSpring(0, { damping: 18, stiffness: 180 });
                        dim.value = withTiming(1, { duration: 160 });
                    }
                })
        , [onClose, insets.bottom]);

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




    return (
        <GestureHandlerRootView style={{ flex: 1, zIndex:10, }}>
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

                            <Text style={s.headerTitle}>{title ?? "no title"}</Text>
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
                        {children}
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
    handleArea: { height: 56, justifyContent: 'center', alignItems: 'center' },
    handleBar: {
        height: 5, borderRadius: 3,
        backgroundColor: '#6B7280',        // gray-500
        marginTop: 8, marginBottom: 6,
    },


});