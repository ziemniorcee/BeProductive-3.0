// InfiniteGalaxy/InfiniteGalaxySVG.jsx
import React, {useState} from "react";
import {Platform, View, StyleSheet, useWindowDimensions, Text, Image} from "react-native";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedReaction,
    useAnimatedProps, runOnJS,
} from "react-native-reanimated";
import * as RNSVG from "react-native-svg";
import AppBar from "../common/appBar/AppBar";
import GalaxyMenu from "./StrategyMenu";
import AddNewPoint from "./newPoint/AddNewPoint.jsx";
import {StrategyProvider} from "../../context/StrategyContext";

const TILE = 1024;
const MAX_SCALE = 6;
const MIN_ZOOM = 0.1;
const AnimatedG = Animated.createAnimatedComponent(RNSVG.G);

export function clampW(v, lo = 0.1, hi = 6) {
    'worklet';
    return Math.min(hi, Math.max(lo, v));
}

export function ensureFiniteW(v, d = 0) {
    'worklet';
    return Number.isFinite(v) ? v : d;
}

export default function StrategyCore({app, state,children}) {
    const {width, height} = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
    const scale = useSharedValue(1.4);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const pinchInited = useSharedValue(0);
    const s0 = useSharedValue(1);
    const tx0 = useSharedValue(0);
    const ty0 = useSharedValue(0);
    const wx0 = useSharedValue(0);
    const wy0 = useSharedValue(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const camProps = useAnimatedProps(() => {
        'worklet';
        const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
        const e = ensureFiniteW(tx.value, 0) * s;
        const f = ensureFiniteW(ty.value, 0) * s;
        if (isWeb) {
            return {transform: `matrix(${s} 0 0 ${s} ${e} ${f})`};
        } else {
            return {matrix: [s, 0, 0, s, e, f]};
        }

    });

    const clampScale = s => Math.min(MAX_SCALE, Math.max(MIN_ZOOM, s));

    React.useEffect(() => {
        console.log("XDDD")
        const s = clampW(Math.min(width / TILE, height / TILE) * 0.9);
        scale.value = s;
        tx.value = width / (2 * s);
        ty.value = height / (2 * s);
    }, [width, height]);



    const panStartX = useSharedValue(0);
    const panStartY = useSharedValue(0);
    const pinch = Gesture.Pinch()
        .onBegin(() => {
            'worklet';
            pinchInited.value = 0;
        })
        .onUpdate(e => {
            'worklet';
            if ((e.numberOfPointers ?? 0) < 2) return;
            const px = isWeb ? Math.min(Math.max(e.focalX, 0), width) : width * 0.5;
            const py = isWeb ? Math.min(Math.max(e.focalY, 0), height) : height * 0.5;

            if (!pinchInited.value) {
                pinchInited.value = 1;
                s0.value = clampW(ensureFiniteW(scale.value, 1));
                tx0.value = ensureFiniteW(tx.value, 0);
                ty0.value = ensureFiniteW(ty.value, 0);
                wx0.value = px / s0.value - tx0.value;
                wy0.value = py / s0.value - ty0.value;
            }

            const s1 = clampW(s0.value * ensureFiniteW(e.scale, 1));
            scale.value = s1;

            tx.value = px / s1 - wx0.value;
            ty.value = py / s1 - wy0.value;
        })
        .onFinalize(() => {
            'worklet';
            pinchInited.value = 0;
        });

    const pan = Gesture.Pan().minPointers(1).maxPointers(1)
        .simultaneousWithExternalGesture(pinch)
        .onBegin(e => {
            'worklet';
            if ((e.numberOfPointers ?? 0) !== 1) return;
            panStartX.value = tx.value;
            panStartY.value = ty.value;
        })
        .onUpdate(e => {
            'worklet';
            if ((e.numberOfPointers ?? 0) !== 1 || pinchInited.value) return;
            const s = Math.max(scale.value, 0.1);
            tx.value = panStartX.value + e.translationX / s;
            ty.value = panStartY.value + e.translationY / s;
        });

    const onWheelCore = React.useCallback((ev) => {
        const rect = ev.currentTarget.getBoundingClientRect();
        const px = ev.clientX - rect.left;
        const py = ev.clientY - rect.top;
        const s0 = scale.value;
        const s1 = clampScale(s0 * Math.exp(-(ev.deltaY || 0) * 0.0015));
        tx.value = tx.value + (px / s1) - (px / s0);
        ty.value = ty.value + (py / s1) - (py / s0);
        scale.value = s1;
    }, []);

    const containerRef = React.useRef(null);

    React.useEffect(() => {
        if (!isWeb) return;
        const el = containerRef.current;
        if (!el) return;
        const h = (e) => {
            e.preventDefault();
            onWheelCore(e);
        };
        el.addEventListener('wheel', h, {passive: false});
        return () => el.removeEventListener('wheel', h);
    }, [isWeb, onWheelCore]);

    return (
        <StrategyProvider app={app}>
            <GestureHandlerRootView style={styles.fill} collapsable={false}>
                <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
                    <Animated.View
                        ref={isWeb ? containerRef : null}
                        style={[StyleSheet.absoluteFill, isWeb && {touchAction: 'none', userSelect: 'none'}]}
                    >
                        <RNSVG.Svg width={width} height={height} preserveAspectRatio="none">
                            <AnimatedG animatedProps={camProps}>
                                {children}
                            </AnimatedG>
                        </RNSVG.Svg>

                        <GalaxyMenu/>
                        <AppBar app={app} horizontal={isWeb}/>
                        {state.addNewPointOpen && (
                            <AddNewPoint app={app} close={() => app.services.strategy.closeAddNewPoint()}/>
                        )}
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>
        </StrategyProvider>
    );
}

const styles = StyleSheet.create({
    fill: {flex: 1, backgroundColor: "#000"},
    root: {flex: 1, backgroundColor: "#000"},
    layer: {position: "absolute", inset: 0, transformOrigin: "0 0", backfaceVisibility: "hidden"},
    block: {backgroundColor: "red", height: 50, width: 100},


    menuListButtonName: {}
});
