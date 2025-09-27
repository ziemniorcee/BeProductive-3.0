// InfiniteGalaxy/InfiniteGalaxySVG.jsx
import React from "react";
import {Platform, View, StyleSheet, useWindowDimensions, Text} from "react-native";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {useSharedValue, useAnimatedStyle, useAnimatedReaction} from "react-native-reanimated";
import * as RNSVG from "react-native-svg";
import AppBar from "../common/AppBar";

const TILE = 1024;
const MAX_SCALE = 6;
const MIN_ZOOM = 0.1;

export function clampW(v, lo = 0.1, hi = 6) { 'worklet'; return Math.min(hi, Math.max(lo, v)); }
export function finiteW(v, d = 0) { 'worklet'; return Number.isFinite(v) ? v : d; }

export function ensureFiniteW(v, d = 0) {
    'worklet';
    return Number.isFinite(v) ? v : d;
}
export default function InfiniteGalaxySVG({app}) {
    const isWeb = Platform.OS === 'web';
    const {width, height} = useWindowDimensions();
    const galaxy_cx = width / 2;
    const galaxy_cy = height / 2;
    const scale = useSharedValue(1.4);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const pinching = useSharedValue(0);
    const lastScale = useSharedValue(1);
    const pinchInited = useSharedValue(0);
    const s0 = useSharedValue(1);
    const tx0 = useSharedValue(0);
    const ty0 = useSharedValue(0);
    const wx0 = useSharedValue(0);
    const wy0 = useSharedValue(0);

    const BLOCK = {wx: width / 2, wy: height / 2, w: 120, h: 60};

    const clampScale = s => Math.min(MAX_SCALE, Math.max(MIN_ZOOM, s));
    const clamp = v => Math.min(MAX_SCALE, Math.max(MIN_ZOOM, v));
    const ensureFinite = (v, d = 0) => (Number.isFinite(v) ? v : d);

    const centerOnPoint = (wx, wy, s) => {
        // wx,wy in world units you want at screen center
        tx.value = width / (2 * s) - wx;
        ty.value = height / (2 * s) - wy;
    };

    React.useEffect(() => {
        // choose initial scale
        const s0 = clampScale(Math.min(width / TILE, height / TILE) * 0.9); // fit 1 tile with margin
        scale.value = s0;
        centerOnPoint(galaxy_cx, galaxy_cy, s0);

    }, [width, height]);

    const aStyle = useAnimatedStyle(() => {
        const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
        const txv = ensureFiniteW(tx.value, 0);
        const tyv = ensureFiniteW(ty.value, 0);
        return { transform: [{ translateX: txv * s }, { translateY: tyv * s }, { scale: s }] };
    });

    // pan in world units
    const panStartX = useSharedValue(0);
    const panStartY = useSharedValue(0);
    const EPS = 1e-3;
    const pinch = Gesture.Pinch()
        .onBegin(() => { 'worklet'; pinchInited.value = 0; })
        .onUpdate(e => {
            'worklet';
            if ((e.numberOfPointers ?? 0) < 2) return;

            // pivot: web uses finger focal, native uses screen center
            const px = isWeb ? Math.min(Math.max(e.focalX, 0), width)  : width  * 0.5;
            const py = isWeb ? Math.min(Math.max(e.focalY, 0), height) : height * 0.5;

            if (!pinchInited.value) {
                pinchInited.value = 1;
                s0.value  = clampW(finiteW(scale.value, 1));
                tx0.value = finiteW(tx.value, 0);
                ty0.value = finiteW(ty.value, 0);
                // world point under the chosen pivot
                wx0.value = px / s0.value - tx0.value;
                wy0.value = py / s0.value - ty0.value;
            }

            const s1 = clampW(s0.value * finiteW(e.scale, 1));
            scale.value = s1;
            // keep the chosen pivot fixed on screen
            tx.value = px / s1 - wx0.value;
            ty.value = py / s1 - wy0.value;
        })
        .onFinalize(() => { 'worklet'; pinchInited.value = 0; });


// pan second; allow simultaneous, but ignore when 2 fingers
    const pan = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .simultaneousWithExternalGesture(pinch)
        .onBegin(e => { 'worklet'; if ((e.numberOfPointers ?? 0) !== 1) return; panStartX.value = tx.value; panStartY.value = ty.value; })
        .onUpdate(e => { 'worklet'; if ((e.numberOfPointers ?? 0) !== 1 || pinchInited.value) return;
            const s = Math.max(scale.value, 0.1);
            tx.value = panStartX.value + e.translationX / s;
            ty.value = panStartY.value + e.translationY / s;
        });

    // precise wheel zoom to cursor (web)
    const containerRef = React.useRef(null);

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
        <GestureHandlerRootView style={styles.fill}>
            <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
                <Animated.View
                    ref={isWeb ? containerRef : null}
                    style={[StyleSheet.absoluteFill, isWeb && {touchAction: 'none', userSelect: 'none'}]}
                >
                    <Animated.View style={[styles.layer, aStyle]}>
                        <RNSVG.Svg width={width} height={height} {...(isWeb ? {style: {overflow: 'visible'}} : {})}>
                            <RNSVG.G transform={`translate(${BLOCK.wx}, ${BLOCK.wy})`}>
                                <RNSVG.Rect x={-BLOCK.w / 2} y={-BLOCK.h / 2} width={BLOCK.w} height={BLOCK.h}
                                            fill="#FFFFFF"/>
                                <RNSVG.Text
                                    x={0}
                                    y={0}
                                    fontSize={18}
                                    fontWeight="600"
                                    fill="red"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    xpp
                                </RNSVG.Text>
                            </RNSVG.G>
                        </RNSVG.Svg>

                    </Animated.View>
                    {isWeb && <AppBar app={app} horizontal={isWeb}/>

                    }
                    {!isWeb &&
                        <View style={styles.overlay}>
                            <AppBar app={app} horizontal={isWeb}/>
                        </View>
                    }

                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    fill: {flex: 1, backgroundColor: "#000"},
    root: {flex: 1, backgroundColor: "#000"},
    layer: {position: "absolute", inset: 0, transformOrigin: "0 0", backfaceVisibility: "hidden"},
    block: {backgroundColor: "red", height: 50, width: 100},
    text: {color: "red"},
    overlay: {
        height:'100%',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: Platform.select({ web: 30, default: 50 }),
        justifyContent: 'center',   // vertical center
        alignItems: 'flex-end',     // to the right
        zIndex: 1000,
    }
});
