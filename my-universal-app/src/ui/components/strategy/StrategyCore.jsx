// InfiniteGalaxy/InfiniteGalaxySVG.jsx
import React, {useEffect, useRef, useState} from "react";
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
import {StrategyTopBanner} from "./StrategyTopBanner";

const TILE = 1024;
const MAX_SCALE = 6;
const MIN_ZOOM = 0.1;
const AnimatedG = Animated.createAnimatedComponent(RNSVG.G);
const NODE_HIT_WIDTH = 80;
const projectsCounter = 5;
const startAngle = Math.PI / 2 + Math.PI * 2 / projectsCounter * 3;



export function clampW(v, lo = 0.1, hi = 6) {
    'worklet';
    return Math.min(hi, Math.max(lo, v));
}

export function ensureFiniteW(v, d = 0) {
    'worklet';
    return Number.isFinite(v) ? v : d;
}

function wasHitW(nodePosition, tapPosition) {
    'worklet';
    if (!tapPosition) {
        return false;
    }
    const halfWidth = NODE_HIT_WIDTH / 2;
    const dx = tapPosition.x - nodePosition.x;
    const dy = tapPosition.y - nodePosition.y;

    return Math.abs(dx) <= halfWidth && Math.abs(dy) <= halfWidth;
}

function rotTopW(p, am) {
    'worklet';
    const t = am + Math.PI / 2;
    return {
        x: p.x * Math.cos(t) - p.y * Math.sin(t),
        y: p.x * Math.sin(t) + p.y * Math.cos(t)
    };
}

function getAbsoluteNodePositions(nodes, projectsCounter, startAngle) {
    'worklet';
    const positions = []; // An array of all node copies

    for (let i = 0; i < projectsCounter; i++) {
        const a0 = startAngle + i * (2 * Math.PI / projectsCounter);
        const a1 = a0 + (2 * Math.PI / projectsCounter);
        const am = (a0 + a1) / 2; // The angle of this group

        for (const n of nodes) {
            // We skip the custom node, it's not in the rotated groups
            if (n.publicId === 99) continue;

            const start0 = {x: n.x, y: n.y};
            const absPos = rotTopW(start0, am);

            positions.push({
                publicId: n.publicId,         // The node's base ID (e.g., 5)
                abs_x: absPos.x,
                abs_y: absPos.y,
                am: am,           // The rotation of this copy
            });
        }
    }

    // Add the custom "new" node (which has no rotation)
    const customNode = nodes.find(n => n.id === 99);
    if (customNode) {
        positions.push({
            id: 99,
            abs_x: customNode.rel_x, // 0
            abs_y: customNode.rel_y, // -700
            am: -Math.PI / 2, // The 'am' that results in a 0 rotation for rotTopW
        });
    }

    return positions;
}

export default function StrategyCore({app, state, nodesShared, updateNodePosition,children}) {
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
    const [tapCoordinates, setTapCoordinates] = useState(null);
    const tapHandledRef = useRef(null);
    const draggedNodeId = useSharedValue(null);
    const dragNodeStartX = useSharedValue(0); // Node's original rel_x
    const dragNodeStartY = useSharedValue(0); // Node's original rel_y
    const dragOffsetX = useSharedValue(0);   // Offset from tap to node center
    const dragOffsetY = useSharedValue(0);
    const draggedNodeInfo = useSharedValue(null); // Stores { id, am }


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
        const s = clampW(Math.min(width / TILE, height / TILE) * 0.9);
        scale.value = s;
        tx.value = width / (2 * s);
        ty.value = height / (2 * s);
    }, [width, height]);

    const handleTap_JS = (worldX, worldY) => {
        // Reset the ref. A new tap is starting.
        // All nodes will compete to fill `closestNodeCallback`.
        tapHandledRef.current = {
            x: worldX,
            y: worldY,
            closestDist: Infinity,       // Start with infinite distance
            closestNodeCallback: null, // No winner yet
        };

        // Set state to trigger re-render, passing coords to children
        setTapCoordinates({ x: worldX, y: worldY });
    };

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
        .minDistance(4)
        .simultaneousWithExternalGesture(pinch)
        .onBegin(e => {
            'worklet';
            if ((e.numberOfPointers ?? 0) !== 1) return;

            // 1. Get tap in world coordinates
            const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
            const worldX = (e.x / s) - ensureFiniteW(tx.value, 0);
            const worldY = (e.y / s) - ensureFiniteW(ty.value, 0);

            // 2. Get all absolute node positions
            const nodePositions = getAbsoluteNodePositions(nodesShared.value, projectsCounter, startAngle);

            // 3. Check for a hit (loop backwards to hit top-most)
            let hitNode = null;
            for (let i = nodePositions.length - 1; i >= 0; i--) {
                const nodeCopy = nodePositions[i];
                const pos = { x: nodeCopy.abs_x, y: nodeCopy.abs_y };
                if (wasHitW(pos, { x: worldX, y: worldY })) {
                    hitNode = nodeCopy;
                    break;
                }
            }

            if (hitNode !== null) {
                // --- WE ARE DRAGGING A NODE ---

                // Find the original node data (use == to compare string/number)
                const nodeData = nodesShared.value.find(n => n.publicId == hitNode.publicId);

                if (!nodeData) {
                    // Failsafe: if node not found, just pan map
                    draggedNodeInfo.value = null;
                    panStartX.value = tx.value;
                    panStartY.value = ty.value;
                    return;
                }

                // Store all drag info
                draggedNodeInfo.value = { publicId: hitNode.publicId, am: hitNode.am };
                dragNodeStartX.value = nodeData.x;
                dragNodeStartY.value = nodeData.y;

                // Stop the map from panning
                panStartX.value = null;

            } else {
                // --- WE ARE PANNING THE MAP ---
                draggedNodeInfo.value = null;
                panStartX.value = tx.value;
                panStartY.value = ty.value;
            }
        })
        .onUpdate(e => {
            'worklet';
            if ((e.numberOfPointers ?? 0) !== 1 || pinchInited.value) return;
            const s = Math.max(scale.value, 0.1);

            if (draggedNodeInfo.value !== null) {
                // --- DRAG NODE LOGIC ---
                const { publicId, am } = draggedNodeInfo.value;

                // 1. Get gesture translation in world space
                const deltaX = e.translationX / s;
                const deltaY = e.translationY / s;

                // 2. Get inverse rotation angle
                const t = am + Math.PI / 2; // Original rotation
                const invT = -t;           // Inverse rotation

                // 3. Rotate the translation vector
                const rotDeltaX = deltaX * Math.cos(invT) - deltaY * Math.sin(invT);
                const rotDeltaY = deltaX * Math.sin(invT) + deltaY * Math.cos(invT);

                // 4. Calculate new relative position
                const newRelX = dragNodeStartX.value + rotDeltaX;
                const newRelY = dragNodeStartY.value + rotDeltaY;

                // 5. Update the state on the JS thread
                runOnJS(updateNodePosition)(publicId, newRelX, newRelY);

            } else if (panStartX.value !== null) {
                // --- PAN MAP LOGIC (your original logic) ---
                tx.value = panStartX.value + e.translationX / s;
                ty.value = panStartY.value + e.translationY / s;
            }
        })
        .onEnd(() => {
            'worklet';
            // "Let go" of the node
            draggedNodeInfo.value = null;
        });

    const tap = Gesture.Tap()
        .maxDuration(250)
        .onEnd((event, success) => {
            'worklet';
            if (success) {
                // Convert screen coordinates to world (SVG) coordinates
                const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
                const worldX = (event.x / s) - ensureFiniteW(tx.value, 0);
                const worldY = (event.y / s) - ensureFiniteW(ty.value, 0);

                // Call your JS-thread function
                runOnJS(handleTap_JS)(worldX, worldY);
            }
        });

    useEffect(() => {
        if (tapCoordinates) {
            setTimeout(() => {
                const tapData = tapHandledRef.current;
                if (tapData && tapData.closestNodeCallback) {
                    console.log('Closest node won, firing callback.');
                    // Fire the winner's callback
                    tapData.closestNodeCallback();
                }

                // Clear the ref data, the tap is fully handled
                tapHandledRef.current = null;
            }, 0);
        }
    }, [tapCoordinates]);

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
                <GestureDetector gesture={Gesture.Simultaneous(pan, pinch, tap)}>
                    <Animated.View
                        ref={isWeb ? containerRef : null}
                        style={[StyleSheet.absoluteFill, isWeb && {touchAction: 'none', userSelect: 'none'}]}
                    >
                        <RNSVG.Svg width={width} height={height} preserveAspectRatio="none" style={StyleSheet.absoluteFill} >
                            <AnimatedG animatedProps={camProps}>
                                {React.Children.map(children, child =>
                                    React.cloneElement(child, {
                                        tapCoordinates: tapCoordinates,
                                        tapHandledRef: tapHandledRef,
                                    })
                                )}
                            </AnimatedG>
                        </RNSVG.Svg>

                        <GalaxyMenu/>
                        <AppBar app={app} horizontal={isWeb}/>
                        {/*<StrategyTopBanner/>*/}
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
