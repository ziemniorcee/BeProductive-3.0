import {NODE_HIT_WIDTH} from "./StrategyConstants";

export function clampW(v, lo = 0.1, hi = 6) {
    'worklet';
    return Math.min(hi, Math.max(lo, v));
}

export function ensureFiniteW(v, d = 0) {
    'worklet';
    return Number.isFinite(v) ? v : d;
}

export function wasHitW(nodePosition, tapPosition) {
    'worklet';
    if (!tapPosition) {
        return false;
    }
    const halfWidth = NODE_HIT_WIDTH / 2;
    const dx = tapPosition.x - nodePosition.x;
    const dy = tapPosition.y - nodePosition.y;

    return Math.abs(dx) <= halfWidth && Math.abs(dy) <= halfWidth;
}

export function rotTopW(p, am) {
    'worklet';
    const t = am + Math.PI / 2;
    return {
        x: p.x * Math.cos(t) - p.y * Math.sin(t),
        y: p.x * Math.sin(t) + p.y * Math.cos(t)
    };
}

function getAbsoluteNodePositions(nodes, projectsCounter, startAngle, projects) {
    'worklet';
    // 1. Guard Clause: Ensure data exists to prevent undefined access
    if (!nodes || !projects) return [];

    const positions = [];
    const totalNodes = nodes.length;
    const totalProjects = projects.length;

    const safeLoopLimit = Math.min(projectsCounter, totalProjects);

    for (let i = 0; i < safeLoopLimit; i++) {
        const project = projects[i];

        if (!project) continue;

        const currentProjectId = project.publicId;

        const a0 = startAngle + i * (2 * Math.PI / projectsCounter);
        const a1 = a0 + (2 * Math.PI / projectsCounter);
        const am = (a0 + a1) / 2;

        for (let j = 0; j < totalNodes; j++) {
            const n = nodes[j];

            if (n.projectPublicId === currentProjectId) {

                const absPos = rotTopW({x: n.x, y: n.y}, am);

                positions.push({
                    publicId: n.publicId,
                    abs_x: absPos.x,
                    abs_y: absPos.y,
                    am: am,
                });
            }
        }
    }

    return positions;
}

export function findHitNode(worldX, worldY, nodes, projectsCounter, startAngle, projects) {
    'worklet';
    const nodePositions = getAbsoluteNodePositions(nodes, projectsCounter, startAngle, projects);
    let hitNode = null;
    for (let i = nodePositions.length - 1; i >= 0; i--) {
        const nodeCopy = nodePositions[i];
        const pos = {x: nodeCopy.abs_x, y: nodeCopy.abs_y};
        if (wasHitW(pos, {x: worldX, y: worldY})) {
            hitNode = nodeCopy;
            break;
        }
    }
    return hitNode;
}


const isPointNearSegment = (px, py, ax, ay, bx, by, threshold) => {
    'worklet';

    // Calculate vectors using raw numbers
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;

    const l2 = vx * vx + vy * vy; // Squared length of segment
    const thresholdSq = threshold * threshold;

    if (l2 === 0) {
        const distSq = wx * wx + wy * wy;
        return distSq < thresholdSq;
    }

    let t = (wx * vx + wy * vy) / l2;

    // Clamp t to segment [0, 1] without calling Math.max/min functions to save overhead
    if (t < 0) t = 0;
    else if (t > 1) t = 1;

    const closestX = ax + t * vx;
    const closestY = ay + t * vy;

    const dx = px - closestX;
    const dy = py - closestY;

    return (dx * dx + dy * dy) < thresholdSq;
};

export function findHitEdge(worldX, worldY, nodes, projectsCounter, startAngle, projects, isWeb) {
    'worklet';

    if (typeof worldX !== 'number' || typeof worldY !== 'number') return null;


    // Primitives
    const px = worldX;
    const py = worldY;
    const HIT_THRESHOLD = isWeb ? 10 : 35;

    const nodePositions = getAbsoluteNodePositions(nodes, projectsCounter, startAngle, projects);

    // Fast Lookups (Objects)
    const posMap = {};
    const nodeDataMap = {};

    for (let i = 0; i < nodePositions.length; i++) {
        const item = nodePositions[i];
        if (item?.publicId) posMap[item.publicId] = item;
    }

    for (let i = 0; i < nodes.length; i++) {
        const item = nodes[i];
        if (item?.publicId) nodeDataMap[item.publicId] = item;
    }

    // Main Loop
    for (let i = nodePositions.length - 1; i >= 0; i--) {
        const parentPosNode = nodePositions[i];
        const parentDataNode = nodeDataMap[parentPosNode.publicId];

        // Validate Parent
        if (!parentDataNode || !Array.isArray(parentDataNode.children) || parentDataNode.children.length === 0) {
            continue;
        }

        const ax = parentPosNode.abs_x;
        const ay = parentPosNode.abs_y;

        if (typeof ax !== 'number' || typeof ay !== 'number') continue;

        const childrenIds = parentDataNode.children;

        for (let j = 0; j < childrenIds.length; j++) {
            const childId = childrenIds[j];
            if (!childId) continue;

            const childPosNode = posMap[childId];
            if (!childPosNode) continue;

            // Validate Child
            const bx = childPosNode.abs_x;
            const by = childPosNode.abs_y;

            if (typeof bx !== 'number' || typeof by !== 'number') continue;

            // Call the local helper function
            if (isPointNearSegment(px, py, ax, ay, bx, by, HIT_THRESHOLD)) {
                return {
                    "parentPublicId": parentPosNode.publicId,
                    "childPublicId": childPosNode.publicId
                };
            }
        }
    }

    return null;
}