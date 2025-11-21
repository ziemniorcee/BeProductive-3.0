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

export function getAbsoluteNodePositions(nodes, projectsCounter, startAngle, projects) {
    'worklet';
    const positions = []; // An array of all node copies

    for (let i = 0; i < projectsCounter; i++) {
        const currentProjectId = projects[i].publicId;
        const goalsForThisProject = nodes.filter(
            goal => goal.projectPublicId === currentProjectId
        );

        const a0 = startAngle + i * (2 * Math.PI / projectsCounter);
        const a1 = a0 + (2 * Math.PI / projectsCounter);
        const am = (a0 + a1) / 2; // The angle of this group

        for (const n of goalsForThisProject) {
            const start0 = {x: n.x, y: n.y};
            const absPos = rotTopW(start0, am);

            positions.push({
                publicId: n.publicId,
                abs_x: absPos.x,
                abs_y: absPos.y,
                am: am,
            });
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


export function findHitEdge(worldX, worldY, nodes, projectsCounter, startAngle, projects) {
    const nodePositions = getAbsoluteNodePositions(nodes, projectsCounter, startAngle, projects);
    const hitPoint = {x: worldX, y: worldY};

    const posMap = new Map(nodePositions.map(n => [n.publicId, n]));

    const nodeDataMap = new Map(nodes.map(n => [n.publicId, n]));

    for (let i = nodePositions.length - 1; i >= 0; i--) {
        const parentPosNode = nodePositions[i];

        const parentDataNode = nodeDataMap.get(parentPosNode.publicId);

        if (!parentDataNode || !parentDataNode.children) continue;

        const childrenIds = parentDataNode.children;
        const parentPos = {x: parentPosNode.abs_x, y: parentPosNode.abs_y};

        for (let j = 0; j < childrenIds.length; j++) {
            const childId = childrenIds[j];

            const childPosNode = posMap.get(childId);

            if (!childPosNode) continue;

            const childPos = {x: childPosNode.abs_x, y: childPosNode.abs_y};

            if (wasHitLineSegment(hitPoint, parentPos, childPos, 10)) {

                return {
                    "parentPublicId": parentPosNode.publicId,
                    "childPublicId": childPosNode.publicId
                };
            }
        }
    }

    return null;
}

/**
 * Checks if a point 'p' is within 'threshold' distance of a line segment 'a'-'b'.
 * All arguments are 'worklet' compatible objects {x, y}.
 */
function wasHitLineSegment(p, a, b, threshold) {
    'worklet';

    const v = { x: b.x - a.x, y: b.y - a.y }; // Vector from a to b
    const w = { x: p.x - a.x, y: p.y - a.y }; // Vector from a to p

    const l2 = v.x * v.x + v.y * v.y; // Squared length of the segment

    // Handle degenerate case (segment is a single point)
    if (l2 === 0) {
        const distSq = w.x * w.x + w.y * w.y; // Squared distance from p to a
        return distSq < threshold * threshold;
    }

    // Find the projection of p onto the line, clamped to the segment
    // t is the scalar projection parameter, clamped to [0, 1]
    let t = (w.x * v.x + w.y * v.y) / l2;
    t = Math.max(0, Math.min(1, t)); // Clamp to segment

    // Find the closest point on the segment
    const closestPoint = {
        x: a.x + t * v.x,
        y: a.y + t * v.y,
    };

    // Calculate squared distance from p to the closest point
    const dx = p.x - closestPoint.x;
    const dy = p.y - closestPoint.y;
    const distSq = dx * dx + dy * dy;

    // Return true if within the squared threshold
    return distSq < threshold * threshold;
}