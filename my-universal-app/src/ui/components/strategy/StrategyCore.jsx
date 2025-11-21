import React, {useEffect, useRef, useState} from "react";
import {Platform, View, StyleSheet, useWindowDimensions} from "react-native";
import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedProps,
    runOnJS,
} from "react-native-reanimated";
import * as RNSVG from "react-native-svg";
import {StrategyProvider, useStrategy} from "../../context/StrategyContext";
import {clampW, ensureFiniteW} from './StrategyUtils';
import {MAX_SCALE, MIN_ZOOM, TILE} from './StrategyConstants';
import {useStrategyGestures} from './StrategyGestures';
import {useWebWheelZoom} from './StrategyWebWheel';
import {GalaxyOverlay} from './StrategyOverlay';

const AnimatedG = Animated.createAnimatedComponent(RNSVG.G);

export default function StrategyCore({app, state, nodesShared, children}) {
    const {updateNodePosition, changePointPosition, projectPositions} = useStrategy();
    const {width, height} = useWindowDimensions();
    const isWeb = Platform.OS === 'web';

    const scale = useSharedValue(1.4);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const activeTapData = useSharedValue(null);
    const projectsShared = useSharedValue(app.services.projects.get()["rawProjects"]);

    useEffect(() => {
        projectsShared.value = app.services.projects.get()["rawProjects"];
    }, [app, projectsShared]);

    // Set initial camera position
    React.useEffect(() => {
        const s = clampW(Math.min(width / TILE, height / TILE) * 0.9, MIN_ZOOM, MAX_SCALE);
        scale.value = s;
        tx.value = width / (2 * s);
        ty.value = height / (2 * s);
    }, [width, height, scale, tx, ty]);

    // 2. JS-thread logic (glue)
    const handleTap_JS = (screenX, screenY, parentPublicId, childPublicId, type) => {
        activeTapData.value = {
            x: screenX,
            y: screenY,
            parentPublicId: parentPublicId,
            childPublicId: childPublicId,
            hitType: type,
            closestNodeCallback: null,
        };
    };

    const shiftCamera = () => {
        'worklet';
        let projectId = state.addNewPoint.projectPublicId;
        const foundPosition = projectPositions.find(pos => pos.id === projectId);
        tx.value = width / (2 * scale.value) - foundPosition.x;
        ty.value = height / (2 * scale.value) - foundPosition.y;
    }

    // 3. Wire up Hooks
    const {
        gesture,
        lineDrawingStartNode,
        lineDrawingEndPosition,
        lineDrawingEndNode,
    } = useStrategyGestures(
        {
            app, scale, tx, ty, width, height, isWeb, nodesShared, projectsShared,
            updateNodePosition, changePointPosition, handleTap_JS,
        });

    const containerRef = useWebWheelZoom(scale, tx, ty, isWeb);

    const camProps = useAnimatedProps(() => {
        'worklet';
        const s = (ensureFiniteW(scale.value, MIN_ZOOM));
        const e = ensureFiniteW(tx.value, 0) * s;
        const f = ensureFiniteW(ty.value, 0) * s;
        if (isWeb) {
            return {transform: `matrix(${s} 0 0 ${s} ${e} ${f})`};
        } else {
            return {matrix: [s, 0, 0, s, e, f]};
        }
    });

    const handlePointerDownCapture = (event) => {
        event.stopPropagation();
    }

    return (
        <GestureHandlerRootView style={styles.fill} collapsable={false} onPointerDownCapture={handlePointerDownCapture}>
            <GestureDetector gesture={gesture}>
                <Animated.View
                    ref={isWeb ? containerRef : null}
                    style={[StyleSheet.absoluteFill, isWeb && {touchAction: 'none', userSelect: 'none'}]}
                >
                    <RNSVG.Svg width={width} height={height} preserveAspectRatio="none" style={StyleSheet.absoluteFill}>
                        <AnimatedG animatedProps={camProps}>
                            {React.Children.map(children, child =>
                                React.cloneElement(child, {
                                    lineDrawingStartNode: lineDrawingStartNode,
                                    lineDrawingEndPosition: lineDrawingEndPosition,
                                    lineDrawingEndNode: lineDrawingEndNode,
                                    scale: scale,
                                })
                            )}
                        </AnimatedG>
                    </RNSVG.Svg>
                </Animated.View>
            </GestureDetector>
            <GalaxyOverlay
                app={app}
                state={state}
                shiftCamera={shiftCamera}
                activeTapData={activeTapData}
                onSaveNewPoint={(pointData) => app.services.strategy.saveNewPoint(pointData)}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    fill: {flex: 1, backgroundColor: "#000"},
    root: {flex: 1, backgroundColor: "#000"},
    layer: {position: "absolute", inset: 0, transformOrigin: "0 0", backfaceVisibility: "hidden"},
    block: {backgroundColor: "red", height: 50, width: 100},
});
