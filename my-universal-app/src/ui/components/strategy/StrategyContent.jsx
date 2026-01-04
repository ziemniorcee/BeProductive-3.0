import * as RNSVG from "react-native-svg";
import React, {useEffect, useMemo} from "react";
import Animated, {useAnimatedProps} from "react-native-reanimated";
import { Delaunay } from "d3-delaunay";

import Node from "./Node";
import Edge from "./Edge";
import {useStrategy} from "../../context/StrategyContext";

// --- CONFIGURATION ---
const CIRCLE_CENTER = {R: 140, D: 200};
const CIRCLE_OUTER = {R: 4000};
const AnimatedLine = Animated.createAnimatedComponent(RNSVG.Line);

// Helper to darken a hex or rgb color
const darkenColor = (color, percent) => {
    let r, g, b;

    if (color.startsWith('#')) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
    } else if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        if (matches && matches.length >= 3) {
            [r, g, b] = matches.map(Number);
        } else {
            return color;
        }
    } else {
        return color;
    }

    r = Math.max(0, Math.floor(r * (1 - percent)));
    g = Math.max(0, Math.floor(g * (1 - percent)));
    b = Math.max(0, Math.floor(b * (1 - percent)));

    return `rgb(${r}, ${g}, ${b})`;
};

const getAngleDiff = (a1, a2) => {
    let diff = a1 - a2;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
};

// --- VORONOI COMPONENT ---
const VoronoiBackground = React.memo(({ app, nodes }) => {

    const { projectGroups, borderPath } = useMemo(() => {
        if (!nodes || nodes.length === 0) return { projectGroups: [], borderPath: "" };

        // 1. Prepare Node Metadata
        const nodeMeta = nodes.map((n, i) => ({
            index: i,
            x: n.x,
            y: n.y,
            r: Math.hypot(n.x, n.y),
            angle: Math.atan2(n.y, n.x),
            projectId: n.projectPublicId || 'unknown'
        }));

        const points = [];
        const pointMeta = [];

        const addPoint = (x, y, projectId) => {
            points.push([x, y]);
            pointMeta.push({ projectId });
        };

        // 2. Generate Points (Territory Logic)
        nodeMeta.forEach(current => {
            addPoint(current.x, current.y, current.projectId);

            let rayStart = CIRCLE_CENTER.R;
            let rayEnd = CIRCLE_OUTER.R;

            nodeMeta.forEach(other => {
                if (current.index === other.index) return;

                const angleDiff = Math.abs(getAngleDiff(current.angle, other.angle));
                const distBetween = Math.abs(current.r - other.r);
                const baseRadius = Math.min(current.r, other.r);
                const centerDist = Math.max(0, baseRadius - CIRCLE_CENTER.R);
                const decayFactor = Math.max(0, 1 - (centerDist / 1000));
                const DOMINANCE = 0.5 + (0.4 * decayFactor);

                if (other.r < current.r) {
                    const shyAngle = 0.25 + (0.35 * decayFactor);
                    if (angleDiff < shyAngle) {
                        const idealStart = other.r + (distBetween * DOMINANCE);
                        const safeStart = idealStart + 10;
                        if (safeStart > rayStart) rayStart = safeStart;
                    }
                }
                else {
                    const BOLD_THRESHOLD = 0.25;
                    if (angleDiff < BOLD_THRESHOLD) {
                        const idealLimit = current.r + (distBetween * DOMINANCE);
                        const safeLimit = idealLimit - 10;
                        if (safeLimit < rayEnd) rayEnd = safeLimit;
                    }
                }
            });

            if (rayEnd > rayStart + 15) {
                const length = rayEnd - rayStart;
                const density = (rayStart < CIRCLE_CENTER.R + 250) ? 20 : 60;
                const steps = Math.max(5, Math.floor(length / density));

                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const r = rayStart + (length * t);
                    if (Math.abs(r - current.r) < 15) continue;
                    const gx = Math.cos(current.angle) * r;
                    const gy = Math.sin(current.angle) * r;
                    addPoint(gx, gy, current.projectId);
                }
            }
        });

        // 3. Compute Voronoi & Delaunay
        const R = CIRCLE_OUTER.R;
        const bounds = [-R, -R, R, R];
        const delaunay = Delaunay.from(points);
        const voronoi = delaunay.voronoi(bounds);

        // --- GROUPING FOR FILLS ---
        const groups = {};
        for (let i = 0; i < points.length; i++) {
            const pId = pointMeta[i].projectId;
            const pathD = voronoi.renderCell(i);

            if (!groups[pId]) {
                let color = "rgb(180, 180, 180)";
                if (pId !== 'unknown') {
                    const project = app.services.projects.getByPublicId(pId);
                    if (project) {
                        color = app.services.categories.colorByPublicId(project.categoryPublicId);
                    }
                }
                const darkColor = darkenColor(color, 0.9 );
                groups[pId] = { color: darkColor, paths: [] };
            }
            groups[pId].paths.push(pathD);
        }

        // --- CALCULATING BORDERS ---
        // We iterate Delaunay edges. If an edge connects two points of DIFFERENT projects,
        // we draw the corresponding Voronoi boundary.
        const borderSegments = [];
        const { halfedges, triangles } = delaunay;
        const { circumcenters } = voronoi;

        for (let i = 0; i < halfedges.length; i++) {
            const j = halfedges[i];
            // Check each pair only once (i < j) and ignore hull edges (j = -1)
            if (j > i) {
                const pIndex = triangles[i];
                const qIndex = triangles[j];

                // Are they different projects?
                if (pointMeta[pIndex].projectId !== pointMeta[qIndex].projectId) {
                    // Identify the two triangles sharing this edge
                    const t1 = Math.floor(i / 3);
                    const t2 = Math.floor(j / 3);

                    // Get their circumcenters (the vertices of the Voronoi edge)
                    const x1 = circumcenters[t1 * 2];
                    const y1 = circumcenters[t1 * 2 + 1];
                    const x2 = circumcenters[t2 * 2];
                    const y2 = circumcenters[t2 * 2 + 1];

                    borderSegments.push(`M${x1},${y1}L${x2},${y2}`);
                }
            }
        }

        return {
            projectGroups: Object.values(groups),
            borderPath: borderSegments.join(" ")
        };
    }, [nodes, app]);

    return (
        <RNSVG.G clipPath="url(#map-clip)">
            {/* 1. RENDER FILLS (No Strokes) */}
            {projectGroups.map((group, index) => (
                <RNSVG.Path
                    key={`group-${index}`}
                    d={group.paths.join(" ")}
                    fill={group.color}
                    fillOpacity={0.6}
                    stroke="none"
                />
            ))}

            {/* 2. RENDER BORDERS (Overlay for different projects only) */}
            <RNSVG.Path
                d={borderPath}
                fill="none"
                stroke="#FFF"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </RNSVG.G>
    );
});

// --- MAIN CONTENT ---

const generate = (app, nodes) => {
    const edges = [];
    const nodesOut = [];

    for (const n of nodes) {
        const start0 = {x: n.x, y: n.y};
        for (const c of (n.children ?? []).filter(Boolean)) {
            const childId = typeof c === 'object' ? c.publicId : c;
            const child = nodes.find(x => x.publicId === childId);
            if (!child) continue;
            edges.push(<Edge key={`edge-${n.publicId}-${childId}`} start={start0} end={{x: child.x, y: child.y}}/>);
        }

        let nodeColor = "#FFF";
        if (n.taskType === 0) {
            const project = app.services.projects.getByPublicId(n.projectPublicId);
            if (project) nodeColor = app.services.categories.colorByPublicId(project.categoryPublicId);
        }

        nodesOut.push(
            <Node key={`node-${n.publicId}`} start={start0} color={nodeColor} title={n.name} type={n.taskType} />
        );
    }
    return [...edges, ...nodesOut];
};

function StrategyContent({ app, lineDrawingStartNode, lineDrawingEndPosition, lineDrawingEndNode, scale }) {
    const {state, setProjectPositions} = useStrategy();
    const projectsCounter = 5;
    const start = Math.PI / 2 + Math.PI * 2 / projectsCounter * 3;
    const projects = app.services.projects.get()["rawProjects"];

    const animatedLineProps = useAnimatedProps(() => {
        'worklet';
        if (!lineDrawingStartNode || !lineDrawingStartNode.value ||
            !lineDrawingEndPosition || !lineDrawingEndPosition.value ||
            !scale || !scale.value) {
            return { x1: 0, y1: 0, x2: 0, y2: 0, strokeWidth: 2 / scale.value, stroke: '#717171' };
        }
        const startX = lineDrawingStartNode.value.x;
        const startY = lineDrawingStartNode.value.y;
        let endX, endY;
        if (lineDrawingEndNode && lineDrawingEndNode.value) {
            endX = lineDrawingEndNode.value.x;
            endY = lineDrawingEndNode.value.y;
        } else {
            endX = lineDrawingEndPosition.value.x;
            endY = lineDrawingEndPosition.value.y;
        }
        return { x1: startX, y1: startY, x2: endX, y2: endY };
    });

    const calculatedPositions = useMemo(() => {
        return Array.from({length: projectsCounter}, (_, i) => {
            const a0 = start + i * (2 * Math.PI / projectsCounter);
            const a1 = a0 + (2 * Math.PI / projectsCounter);
            const am = (a0 + a1) / 2;
            const L = 1000;
            const rC = CIRCLE_CENTER.R;

            const cx = (rC + L) * Math.cos(am);
            const cy = (rC + L) * Math.sin(am);
            return {
                id: projects[i].publicId,
                name: projects[i].name,
                x: cx,
                y: cy,
            };
        });
    }, [projects, projectsCounter, start]);

    useEffect(() => {
        setProjectPositions(calculatedPositions);
    }, [calculatedPositions, setProjectPositions]);

    return (
        <RNSVG.G>
            <RNSVG.Defs>
                <RNSVG.ClipPath id="map-clip">
                    <RNSVG.Circle cx={0} cy={0} r={CIRCLE_OUTER.R} />
                </RNSVG.ClipPath>
            </RNSVG.Defs>

            <AnimatedLine animatedProps={animatedLineProps}/>

            <VoronoiBackground app={app} nodes={state.goals} />

            { generate(app, state.goals) }

            <RNSVG.Circle cx={0} cy={0} r={CIRCLE_CENTER.R} fill="#000" stroke="#FFF" strokeWidth={4}/>
            <RNSVG.Image
                x={-CIRCLE_CENTER.D / 2} y={-CIRCLE_CENTER.D / 2}
                width={CIRCLE_CENTER.D} height={CIRCLE_CENTER.D}
                href={require("../../../../assets/phoenix2.png")}
                preserveAspectRatio="xMidYMid slice"
            />
        </RNSVG.G>
    )
}

export default React.memo(StrategyContent);