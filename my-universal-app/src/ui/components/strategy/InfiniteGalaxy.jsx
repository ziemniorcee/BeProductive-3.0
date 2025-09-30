// InfiniteGalaxy/InfiniteGalaxySVG.jsx
import React from "react";
import {Platform, View, StyleSheet, useWindowDimensions, Text} from "react-native";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedReaction,
    useAnimatedProps, runOnJS,
} from "react-native-reanimated";
import * as RNSVG from "react-native-svg";
import AppBar from "../common/appBar/AppBar";

const TILE = 1024;
const MAX_SCALE = 6;
const MIN_ZOOM = 0.1;


export function clampW(v, lo = 0.1, hi = 6) {
    'worklet';
    return Math.min(hi, Math.max(lo, v));
}

export function ensureFiniteW(v, d = 0) {
    'worklet';
    return Number.isFinite(v) ? v : d;
}

export default function InfiniteGalaxySVG({app}) {
    const isWeb = Platform.OS === 'web';
    const CIRCLE_CENTER = {R:100, D:150};
    const CIRCLE_OUTER = {R:2000, };
    const R = CIRCLE_OUTER.R;

    const projectsCounter = 5;
    const start = -Math.PI/2;
    const sep = 15;
    const COLS = ['#12120C', '#1A0012', '#0A1520', '#08190C', '#12120C'];
    const COLS_LIGHT = ['#C7CC33','#E23A87','#2A94FF','#23D36A','#C7CC33'];
    const lineWidth  = 2;

    const {width, height} = useWindowDimensions();
    const scale = useSharedValue(1.4);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const pinchInited = useSharedValue(0);
    const s0 = useSharedValue(1);
    const tx0 = useSharedValue(0);
    const ty0 = useSharedValue(0);
    const wx0 = useSharedValue(0);
    const wy0 = useSharedValue(0);
    const AnimatedG   = Animated.createAnimatedComponent(RNSVG.G);

    const camProps = useAnimatedProps(() => {
        'worklet';
        const s  = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
        const e  = ensureFiniteW(tx.value, 0) * s; // screen px
        const f  = ensureFiniteW(ty.value, 0) * s; // screen px
        return { transform: `matrix(${s} 0 0 ${s} ${e} ${f})` };
    });

    const [nativeMatrix, setNativeMatrix] = React.useState('matrix(1 0 0 1 0 0)');
    useAnimatedReaction(
        () => {
            'worklet';
            const s   = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
            const txv = ensureFiniteW(tx.value, 0);
            const tyv = ensureFiniteW(ty.value, 0);
            return `matrix(${s} 0 0 ${s} ${txv*s} ${tyv*s})`;
        },
        m => { if (!isWeb) runOnJS(setNativeMatrix)(m); },
        []
    );

    const clampScale = s => Math.min(MAX_SCALE, Math.max(MIN_ZOOM, s));

    React.useEffect(() => {
        const s = clampW(Math.min(width / TILE, height / TILE) * 0.9);
        scale.value = s;
        tx.value = width  / (2 * s);   // center world (0,0)
        ty.value = height / (2 * s);
    }, [width, height]);

    // pan in world units
    const panStartX = useSharedValue(0);
    const panStartY = useSharedValue(0);
    const pinch = Gesture.Pinch()
        .onBegin(() => { 'worklet'; pinchInited.value = 0; })
        .onUpdate(e => {
            'worklet';
            if ((e.numberOfPointers ?? 0) < 2) return;

            // WEB: zoom to fingers. MOBILE: zoom to screen center.
            const px = isWeb ? Math.min(Math.max(e.focalX, 0), width)  : width  * 0.5;
            const py = isWeb ? Math.min(Math.max(e.focalY, 0), height) : height * 0.5;

            if (!pinchInited.value) {
                pinchInited.value = 1;
                s0.value  = clampW(ensureFiniteW(scale.value, 1));
                tx0.value = ensureFiniteW(tx.value, 0);
                ty0.value = ensureFiniteW(ty.value, 0);
                // world point under the chosen pivot
                wx0.value = px / s0.value - tx0.value;
                wy0.value = py / s0.value - ty0.value;
            }

            const s1 = clampW(s0.value * ensureFiniteW(e.scale, 1));
            scale.value = s1;

            // keep the chosen pivot fixed
            tx.value = px / s1 - wx0.value;
            ty.value = py / s1 - wy0.value;
        })
        .onFinalize(() => { 'worklet'; pinchInited.value = 0; });




    const pan = Gesture.Pan().minPointers(1).maxPointers(1)
        .simultaneousWithExternalGesture(pinch)
        .onBegin(e => { 'worklet'; if ((e.numberOfPointers ?? 0) !== 1) return;
            panStartX.value = tx.value; panStartY.value = ty.value; })
        .onUpdate(e => { 'worklet'; if ((e.numberOfPointers ?? 0) !== 1 || pinchInited.value) return;
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




    const pair = (a, colPrev, colCurr, keyBase) => {
        const ca = Math.cos(a), sa = Math.sin(a);
        const nx = -Math.sin(a), ny = Math.cos(a);
        const o = sep / 2;

        const x0 = 0, y0 =0;
        const x1 = R  * ca, y1 = R  * sa;

        return (
            <RNSVG.G key={keyBase}>
                <RNSVG.Line
                    x1={x0 - o*nx} y1={y0 - o*ny}
                    x2={x1 - o*nx} y2={y1 - o*ny}
                    stroke={colPrev} strokeWidth={lineWidth}
                    strokeLinecap="round" vectorEffect="non-scaling-stroke"
                />
                <RNSVG.Line
                    x1={x0 + o*nx} y1={y0 + o*ny}
                    x2={x1 + o*nx} y2={y1 + o*ny}
                    stroke={colCurr} strokeWidth={lineWidth}
                    strokeLinecap="round" vectorEffect="non-scaling-stroke"
                />
            </RNSVG.G>
        );
    };

    const wedgeD = (r, a0, a1) => {
        const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
        const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
        // arc < 180° ⇒ largeArcFlag=0, sweep=1
        return `M0,0 L${x0},${y0} A ${r} ${r} 0 0 1 ${x1},${y1} Z`;
    };

    return (
        <GestureHandlerRootView style={styles.fill} collapsable={false}>
            <GestureDetector gesture={Gesture.Simultaneous(pan, pinch)}>
                <Animated.View
                    ref={isWeb ? containerRef : null}
                    style={[StyleSheet.absoluteFill, isWeb && { touchAction:'none', userSelect:'none' }]}
                >
                    <RNSVG.Svg width={width} height={height} preserveAspectRatio="none">
                        {isWeb ? (
                            <AnimatedG animatedProps={camProps}>
                                {Array.from({ length: projectsCounter }, (_, i) => {
                                    const a0 = start + i * (2*Math.PI/projectsCounter);
                                    const a1 = a0 + (2*Math.PI/projectsCounter);
                                    return <RNSVG.Path key={`w-${i}`} d={wedgeD(R, a0, a1)} fill={COLS[i]} />;
                                })}
                                {Array.from({ length: projectsCounter }, (_, i) => {
                                    const a = start + i * (2*Math.PI/projectsCounter);
                                    const prev = (i - 1 + projectsCounter) % projectsCounter;
                                    return pair(a, COLS_LIGHT[prev], COLS_LIGHT[i], `b-${i}`);
                                })}
                                <RNSVG.Circle cx={0} cy={0} r={CIRCLE_CENTER.R} fill="#000" stroke="#FFF" strokeWidth={4}/>
                                <RNSVG.Image
                                    x={-CIRCLE_CENTER.D/2} y={-CIRCLE_CENTER.D/2}
                                    width={CIRCLE_CENTER.D} height={CIRCLE_CENTER.D}
                                    href={require("../../../../assets/phoenix2.png")}
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </AnimatedG>
                        ) : (
                            <RNSVG.G transform={nativeMatrix}>
                                    {Array.from({ length: projectsCounter }, (_, i) => {
                                        const a0 = start + i * (2*Math.PI/projectsCounter);
                                        const a1 = a0 + (2*Math.PI/projectsCounter);
                                        return <RNSVG.Path key={`w-${i}`} d={wedgeD(R, a0, a1)} fill={COLS[i]} />;
                                    })}
                                    {Array.from({ length: projectsCounter }, (_, i) => {
                                        const a = start + i * (2*Math.PI/projectsCounter);
                                        const prev = (i - 1 + projectsCounter) % projectsCounter;
                                        return pair(a, COLS_LIGHT[prev], COLS_LIGHT[i], `b-${i}`);
                                    })}
                                    <RNSVG.Circle cx={0} cy={0} r={CIRCLE_CENTER.R} fill="#000" stroke="#FFF" strokeWidth={4}/>
                                    <RNSVG.Image
                                        x={-CIRCLE_CENTER.D/2} y={-CIRCLE_CENTER.D/2}
                                        width={CIRCLE_CENTER.D} height={CIRCLE_CENTER.D}
                                        href={require("../../../../assets/phoenix2.png")}
                                        preserveAspectRatio="xMidYMid slice"
                                    />
                            </RNSVG.G>
                        )}

                    </RNSVG.Svg>

                    <AppBar app={app} horizontal={isWeb}/>
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
});
