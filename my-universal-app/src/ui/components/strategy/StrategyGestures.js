import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, {useSharedValue, runOnJS} from "react-native-reanimated";
import {clampW, ensureFiniteW, findHitEdge, findHitNode} from './StrategyUtils';
import {MIN_ZOOM, projectsCounter, startAngle} from './StrategyConstants';

export function useStrategyGestures({
                                        app,
                                        scale,
                                        tx,
                                        ty,
                                        width,
                                        height,
                                        isWeb,
                                        nodesShared,
                                        projectsShared,
                                        updateNodePosition,
                                        changePointPosition,
                                        handleTap_JS,
                                    }) {
    const createLink = (startNodeId, endNodeId) => {
        app.services.strategy.createLink(startNodeId, endNodeId);
    };

    // Helper function to reset drawing values after a delay
    const resetDrawingValues = (startNode, endPosition, endNode) => {
        setTimeout(() => {
            startNode.value = null;
            endPosition.value = null;
            endNode.value = null;
        }, 100);
    };
    const pinchInited = useSharedValue(0);
    const s0 = useSharedValue(1);
    const tx0 = useSharedValue(0);
    const ty0 = useSharedValue(0);
    const wx0 = useSharedValue(0);
    const wy0 = useSharedValue(0);
    const dragNodeStartX = useSharedValue(0);
    const dragNodeStartY = useSharedValue(0);
    const dragNodeEndX = useSharedValue(0);
    const dragNodeEndY = useSharedValue(0);
    const draggedNodeInfo = useSharedValue(null);
    const lineDrawingStartNode = useSharedValue(null);
    const lineDrawingEndPosition = useSharedValue(null);
    const lineDrawingEndNode = useSharedValue(null);

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

    const onPanBeginHandler = (e) => {
        'worklet';
        try {
            if (!e) {
                return;
            }

            if ((e.numberOfPointers ?? 0) !== 1) return;

            const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
            const eventX = e.x ?? 0;
            const eventY = e.y ?? 0;
            const txValue = ensureFiniteW(tx.value, 0);
            const tyValue = ensureFiniteW(ty.value, 0);

            const worldX = (eventX / s) - txValue;
            const worldY = (eventY / s) - tyValue;

            const projects = projectsShared?.value ?? [];
            const nodes = nodesShared?.value ?? [];

            const hitNode = findHitNode(worldX, worldY, nodes, projectsCounter, startAngle, projects);

            if (hitNode !== null) {
                const nodeData = nodes.find(n => n.publicId == hitNode.publicId);

                if (!nodeData) {
                    draggedNodeInfo.value = null;
                    panStartX.value = txValue;
                    panStartY.value = tyValue;
                    return;
                }

                draggedNodeInfo.value = {publicId: hitNode.publicId, am: hitNode.am};
                dragNodeStartX.value = nodeData.x;
                dragNodeStartY.value = nodeData.y;

                panStartX.value = null;
            } else {
                draggedNodeInfo.value = null;
                panStartX.value = txValue;
                panStartY.value = tyValue;


            }
        } catch (error) {
            draggedNodeInfo.value = null;
            panStartX.value = ensureFiniteW(tx.value, 0);
            panStartY.value = ensureFiniteW(ty.value, 0);
        }
    };

    const onPanUpdateHandler = (e) => {
        'worklet';
        if (!e) {
            return;
        }

        if ((e.numberOfPointers ?? 0) !== 1 || pinchInited.value) return;

        const s = Math.max(ensureFiniteW(scale.value, MIN_ZOOM), 0.1);

        const translationX = e.translationX ?? 0;
        const translationY = e.translationY ?? 0;

        if (draggedNodeInfo.value !== null) {
            const publicId = draggedNodeInfo.value?.publicId;
            const am = draggedNodeInfo.value?.am ?? 0;

            if (!publicId) {
                return;
            }

            const deltaX = translationX / s;
            const deltaY = translationY / s;

            const t = am + Math.PI / 2;
            const invT = -t;

            const rotDeltaX = deltaX * Math.cos(invT) - deltaY * Math.sin(invT);
            const rotDeltaY = deltaX * Math.sin(invT) + deltaY * Math.cos(invT);

            const startX = ensureFiniteW(dragNodeStartX.value, 0);
            const startY = ensureFiniteW(dragNodeStartY.value, 0);

            dragNodeEndX.value = startX + rotDeltaX;
            dragNodeEndY.value = startY + rotDeltaY;

            const endX = ensureFiniteW(dragNodeEndX.value, startX);
            const endY = ensureFiniteW(dragNodeEndY.value, startY);

            runOnJS(updateNodePosition)(publicId, endX, endY);
        } else if (panStartX.value !== null) {
            const startX = ensureFiniteW(panStartX.value, 0);
            const startY = ensureFiniteW(panStartY.value, 0);

            tx.value = startX + translationX / s;
            ty.value = startY + translationY / s;
        }
    };

    const onPanEndHandler = (e) => {
        'worklet';
        if (draggedNodeInfo.value !== null) {
            const publicId = draggedNodeInfo.value?.publicId;

            if (!publicId) {
                draggedNodeInfo.value = null;
                return;
            }

            const endX = ensureFiniteW(dragNodeEndX.value, 0);
            const endY = ensureFiniteW(dragNodeEndY.value, 0);

            const position = {"x": endX, "y": endY};

            runOnJS(changePointPosition)(publicId, position);
        }

        draggedNodeInfo.value = null;
    };

    let pan;
    if (isWeb) {
        pan = Gesture.Pan()
            .minPointers(1)
            .maxPointers(1)
            .minDistance(1)
            .simultaneousWithExternalGesture(pinch)
            .mouseButton(1) // Only for web
            .onBegin(onPanBeginHandler)
            .onUpdate(onPanUpdateHandler)
            .onEnd(onPanEndHandler);
    } else {
        pan = Gesture.Pan()
            .minPointers(1)
            .maxPointers(1)
            .minDistance(5)
            .simultaneousWithExternalGesture(pinch)
            .onBegin(onPanBeginHandler)
            .onUpdate(onPanUpdateHandler)
            .onEnd(onPanEndHandler);
    }

    const handleTapEvent = (event) => {
        'worklet';
        const eventX = event.x ?? 0;
        const eventY = event.y ?? 0;

        const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
        const worldX = (eventX / s) - ensureFiniteW(tx.value, 0);
        const worldY = (eventY / s) - ensureFiniteW(ty.value, 0);

        const projects = projectsShared?.value ?? [];
        const nodes = nodesShared?.value ?? [];

        const hitNode = findHitNode(worldX, worldY, nodes, projectsCounter, startAngle, projects);

        if (hitNode) {
            const type = "node";
            runOnJS(handleTap_JS)(eventX, eventY, hitNode?.publicId ?? null, null, type);
            return;
        }

        const hitEdge = findHitEdge(worldX, worldY, nodes, projectsCounter, startAngle, projects);

        if (hitEdge) {
            const type = "edge";
            runOnJS(handleTap_JS)(eventX, eventY, hitEdge?.parentPublicId ?? null, hitEdge?.childPublicId ?? null, type);
            return;
        }

        runOnJS(handleTap_JS)(eventX, eventY, null, null, null);
    };

    let tap;
    if (isWeb) {
        tap = Gesture.Tap()
            .maxDuration(250)
            .maxDistance(10) // Allow small movement during tap on web
            .mouseButton(1) // Only for web
            .onBegin(() => {
                'worklet';
                draggedNodeInfo.value = null;
            })
            .onEnd((event, success) => {
                'worklet';
                if (success) {
                    handleTapEvent(event);
                }
            });
    } else {
        tap = Gesture.Tap()
            .maxDuration(500) // Longer duration for mobile
            .maxDistance(20) // Allow more movement during tap on mobile
            .numberOfTaps(1) // Explicitly set to single tap
            .onBegin(() => {
                'worklet';
                draggedNodeInfo.value = null;
            })
            .onEnd((event, success) => {
                'worklet';
                if (success) {
                    handleTapEvent(event);
                }
            });
    }

    const onBeginHandler = (e) => {
        'worklet';
        try {
            const eventX = e.x ?? 0;
            const eventY = e.y ?? 0;

            const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
            const worldX = (eventX / s) - ensureFiniteW(tx.value, 0);
            const worldY = (eventY / s) - ensureFiniteW(ty.value, 0);

            const projects = projectsShared?.value ?? [];
            const nodes = nodesShared?.value ?? [];

            const hitNode = findHitNode(worldX, worldY, nodes, projectsCounter, startAngle, projects);

            if (hitNode !== null) {
                lineDrawingStartNode.value = {
                    publicId: hitNode.publicId,
                    x: hitNode.abs_x,
                    y: hitNode.abs_y,
                };
                lineDrawingEndPosition.value = {x: hitNode.abs_x, y: hitNode.abs_y};
                lineDrawingEndNode.value = null;
            } else {
                lineDrawingStartNode.value = null;
                lineDrawingEndPosition.value = null;
                lineDrawingEndNode.value = null;
            }
        } catch (error) {
            lineDrawingStartNode.value = null;
            lineDrawingEndPosition.value = null;
            lineDrawingEndNode.value = null;
        }
    };

    const onUpdateHandler = (e) => {
        'worklet';
        if (lineDrawingStartNode.value === null) {
            return;
        }

        const eventX = e.x ?? 0;
        const eventY = e.y ?? 0;

        const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
        const worldX = (eventX / s) - ensureFiniteW(tx.value, 0);
        const worldY = (eventY / s) - ensureFiniteW(ty.value, 0);

        lineDrawingEndPosition.value = {x: worldX, y: worldY};

        const projects = projectsShared?.value ?? [];
        const nodes = nodesShared?.value ?? [];

        const hitNode = findHitNode(worldX, worldY, nodes, projectsCounter, startAngle, projects);

        if (hitNode !== null && hitNode.publicId !== lineDrawingStartNode.value.publicId) {
            lineDrawingEndNode.value = {
                publicId: hitNode.publicId,
                x: hitNode.abs_x,
                y: hitNode.abs_y,
            };
        } else {
            lineDrawingEndNode.value = null;
        }
    };

    const onEndHandler = (e) => {
        'worklet';
        try {
            if (lineDrawingStartNode.value !== null && lineDrawingEndNode.value !== null) {
                const startNodeId = lineDrawingStartNode.value.publicId
                const endNodeId = lineDrawingEndNode.value.publicId;
                runOnJS(createLink)(startNodeId, endNodeId);
            }

            runOnJS(resetDrawingValues)(lineDrawingStartNode, lineDrawingEndPosition, lineDrawingEndNode);
        } catch (error) {
            runOnJS(resetDrawingValues)(lineDrawingStartNode, lineDrawingEndPosition, lineDrawingEndNode);
        }
    };

    let rightClickHold;
    if (isWeb) {
        rightClickHold = Gesture.Pan()
            .mouseButton(2) // Listen for the right mouse button on web
            .minDistance(1) // Start tracking after 1 pixel of movement
            .onBegin(onBeginHandler)
            .onUpdate(onUpdateHandler)
            .onEnd(onEndHandler);
    } else {
        rightClickHold = Gesture.LongPress()
            .minDuration(500) // 500ms long press for mobile
            .onBegin((e) => {
                'worklet';
                onBeginHandler(e);

                lineDrawingEndPosition.value = {
                    x: lineDrawingStartNode.value?.x || 0,
                    y: lineDrawingStartNode.value?.y || 0
                };
            })
            .onEnd((e) => {
                'worklet';
                try {
                    onEndHandler(e);
                } catch (error) {
                    runOnJS(resetDrawingValues)(lineDrawingStartNode, lineDrawingEndPosition, lineDrawingEndNode);
                }
            });
    }

    let composedGesture;
    if (isWeb) {
        composedGesture = Gesture.Simultaneous(
            pinch,
            Gesture.Race(tap, pan, rightClickHold)
        );
    } else {
        const touchGestures = Gesture.Exclusive(
            tap,  // Highest priority - recognized first
            pan,  // Medium priority
            rightClickHold  // Lowest priority - only recognized if others fail
        );

        composedGesture = Gesture.Simultaneous(
            pinch,  // Pinch can happen simultaneously (uses two fingers)
            touchGestures  // Single touch gestures are exclusive
        );
    }

    return {
        gesture: composedGesture,
        lineDrawingStartNode,
        lineDrawingEndPosition,
        lineDrawingEndNode,
    };
}