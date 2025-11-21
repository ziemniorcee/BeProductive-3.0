import {Gesture, GestureDetector, GestureHandlerRootView} from "react-native-gesture-handler";
import Animated, { useSharedValue, runOnJS } from "react-native-reanimated";
import {clampW, ensureFiniteW, findHitEdge, findHitNode} from './StrategyUtils';
import { MIN_ZOOM, projectsCounter, startAngle } from './StrategyConstants';

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
    // All gesture-related shared values move here
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

    // All gesture definitions move here
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
        .minDistance(1)
        .simultaneousWithExternalGesture(pinch)
        .mouseButton(1)
        .onBegin(e => {
            'worklet';
            runOnJS(handleTap_JS)(null, null,  null,  null , null)
            if ((e.numberOfPointers ?? 0) !== 1) return;

            const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
            const worldX = (e.x / s) - ensureFiniteW(tx.value, 0);
            const worldY = (e.y / s) - ensureFiniteW(ty.value, 0);

            const projects = projectsShared.value;
            const hitNode = findHitNode(worldX, worldY, nodesShared.value, projectsCounter, startAngle, projects);

            if (hitNode !== null) {
                const nodeData = nodesShared.value.find(n => n.publicId == hitNode.publicId);

                if (!nodeData) {
                    draggedNodeInfo.value = null;
                    panStartX.value = tx.value;
                    panStartY.value = ty.value;
                    return;
                }

                draggedNodeInfo.value = {publicId: hitNode.publicId, am: hitNode.am};
                dragNodeStartX.value = nodeData.x;
                dragNodeStartY.value = nodeData.y;

                panStartX.value = null;
            } else {
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
                const {publicId, am} = draggedNodeInfo.value;

                const deltaX = e.translationX / s;
                const deltaY = e.translationY / s;

                const t = am + Math.PI / 2;
                const invT = -t;

                const rotDeltaX = deltaX * Math.cos(invT) - deltaY * Math.sin(invT);
                const rotDeltaY = deltaX * Math.sin(invT) + deltaY * Math.cos(invT);

                dragNodeEndX.value = dragNodeStartX.value + rotDeltaX;
                dragNodeEndY.value = dragNodeStartY.value + rotDeltaY;

                runOnJS(updateNodePosition)(publicId, dragNodeEndX.value, dragNodeEndY.value);
            } else if (panStartX.value !== null) {
                tx.value = panStartX.value + e.translationX / s;
                ty.value = panStartY.value + e.translationY / s;
            }
        })
        .onEnd(() => {
            'worklet';
            // "Let go" of the node
            if (draggedNodeInfo.value !== null) {
                const publicId = draggedNodeInfo.value.publicId;
                const position = {"x": dragNodeEndX.value, "y": dragNodeEndY.value}

                changePointPosition(publicId, position);
            }
            draggedNodeInfo.value = null;
        });

    const tap = Gesture.Tap()
        .maxDuration(250)
        .mouseButton(1)
        .onEnd((event, success) => {
            'worklet';
            if (success) {
                // Convert screen coordinates to world (SVG) coordinates
                const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
                const worldX = (event.x / s) - ensureFiniteW(tx.value, 0);
                const worldY = (event.y / s) - ensureFiniteW(ty.value, 0);
                const projects = projectsShared.value;
                const hitNode = findHitNode(worldX, worldY, nodesShared.value, projectsCounter, startAngle, projects);

                if (hitNode) {
                    const type = "node"

                    runOnJS(handleTap_JS)(event.x, event.y, hitNode?.publicId ?? null, null, type);
                    return
                }

                const hitEdge = findHitEdge(worldX, worldY, nodesShared.value, projectsCounter, startAngle, projects);

                if (hitEdge) {
                    const type = "edge"
                    runOnJS(handleTap_JS)(event.x, event.y, hitEdge.parentPublicId ?? null, hitEdge.childPublicId  ?? null , type)
                    return
                }

                runOnJS(handleTap_JS)(event.x, event.y,  null,  null , null)
                // Call your JS-thread function
            }
        });

    const rightClickHold = Gesture.Pan()
        .mouseButton(2) // Listen for the right mouse button
        .minDistance(1) // Start tracking after 1 pixel of movement
        .onBegin((e) => {
            'worklet';
            const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
            const worldX = (e.x / s) - ensureFiniteW(tx.value, 0);
            const worldY = (e.y / s) - ensureFiniteW(ty.value, 0);

            const projects = projectsShared.value;
            const hitNode = findHitNode(worldX, worldY, nodesShared.value, projectsCounter, startAngle, projects);

            if (hitNode !== null) {
                // Start drawing a line
                lineDrawingStartNode.value = {
                    publicId: hitNode.publicId,
                    x: hitNode.abs_x,
                    y: hitNode.abs_y,
                };
                // Set end position to start position initially
                lineDrawingEndPosition.value = { x: hitNode.abs_x, y: hitNode.abs_y };
                lineDrawingEndNode.value = null;
            } else {
                lineDrawingStartNode.value = null;
                lineDrawingEndPosition.value = null;
                lineDrawingEndNode.value = null;
            }
        })
        .onUpdate((e) => {
            'worklet';
            if (lineDrawingStartNode.value === null) {
                return;
            }

            const s = clampW(ensureFiniteW(scale.value, MIN_ZOOM));
            const worldX = (e.x / s) - ensureFiniteW(tx.value, 0);
            const worldY = (e.y / s) - ensureFiniteW(ty.value, 0);

            lineDrawingEndPosition.value = { x: worldX, y: worldY };

            const projects = projectsShared.value;
            const hitNode = findHitNode(worldX, worldY, nodesShared.value, projectsCounter, startAngle, projects);

            if (hitNode !== null && hitNode.publicId !== lineDrawingStartNode.value.publicId) {
                lineDrawingEndNode.value = {
                    publicId: hitNode.publicId,
                    x: hitNode.abs_x,
                    y: hitNode.abs_y,
                };
            } else {
                lineDrawingEndNode.value = null;
            }
        })
        .onEnd((e) => {
            'worklet';
            // Check if we ended on a valid node
            if (lineDrawingStartNode.value !== null && lineDrawingEndNode.value !== null) {
                const startNodeId = lineDrawingStartNode.value.publicId
                const endNodeId = lineDrawingEndNode.value.publicId;
                app.services.strategy.createLink(startNodeId, endNodeId);

            }

            setTimeout(() => {
                lineDrawingStartNode.value = null;
                lineDrawingEndPosition.value = null;
                lineDrawingEndNode.value = null;
            }, 100);
        });

    // Return the combined gesture and the values needed for rendering
    return {
        gesture: Gesture.Simultaneous(pan, pinch, tap, rightClickHold),
        lineDrawingStartNode,
        lineDrawingEndPosition,
        lineDrawingEndNode,
    };
}