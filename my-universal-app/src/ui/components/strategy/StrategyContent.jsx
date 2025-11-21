import * as RNSVG from "react-native-svg";
import React, {useEffect, useMemo} from "react";
import {SvgXml} from 'react-native-svg';
import Node from "./Node";
import {cleanSvgXml} from "../../../util/svgClean";
import Edge from "./Edge";
import {StyleSheet, Text, View} from "react-native";
import {useStrategy} from "../../context/StrategyContext";
import Animated, {useAnimatedProps} from "react-native-reanimated";

const sep = 15;
const CIRCLE_CENTER = {R: 140, D: 200};
const CIRCLE_OUTER = {R: 4000,};
const AnimatedLine = Animated.createAnimatedComponent(RNSVG.Line);

const lineWidth = 2;
const R = CIRCLE_OUTER.R;

const wedgeD = (r, a0, a1) => {
    const x0 = r * Math.cos(a0), y0 = r * Math.sin(a0);
    const x1 = r * Math.cos(a1), y1 = r * Math.sin(a1);
    return `M0,0 L${x0},${y0} A ${r} ${r} 0 0 1 ${x1},${y1} Z`;
};

const pair = (a, colPrev, colCurr, keyBase) => {
    const ca = Math.cos(a), sa = Math.sin(a);
    const nx = -Math.sin(a), ny = Math.cos(a);
    const o = sep / 2;

    const x0 = 0, y0 = 0;
    const x1 = R * ca, y1 = R * sa;

    return (
        <RNSVG.G key={keyBase}>
            <RNSVG.Line
                x1={x0 - o * nx} y1={y0 - o * ny}
                x2={x1 - o * nx} y2={y1 - o * ny}
                stroke={colPrev} strokeWidth={lineWidth}
                strokeLinecap="round" vectorEffect="non-scaling-stroke"
            />
            <RNSVG.Line
                x1={x0 + o * nx} y1={y0 + o * ny}
                x2={x1 + o * nx} y2={y1 + o * ny}
                stroke={colCurr} strokeWidth={lineWidth}
                strokeLinecap="round" vectorEffect="non-scaling-stroke"
            />
        </RNSVG.G>
    );
};

const midRadial = (app, a0, a1, i, nodes) => {
    const am = (a0 + a1) / 2;
    return (
        <RNSVG.G key={`midRadial-${i}`}>
            {generate(app, am, nodes)}
        </RNSVG.G>
    );
};

const rot = ({x, y}, t) => ({
    x: x * Math.cos(t) - y * Math.sin(t),
    y: x * Math.sin(t) + y * Math.cos(t)
});

const rotTop = (p, am) => rot(p, am + Math.PI / 2);

const generate = (app, am, nodes) => {
    const edges = [];
    const nodesOut = [];

    for (const n of nodes) {
        const start0 = {x: n.x, y: n.y};
        const start = rotTop(start0, am);

        for (const c of (n.children ?? [])) {
            const childId = typeof c === 'object' ? c.publicId : c;
            const child = nodes.find(x => x.publicId === childId);

            if (!child) continue;

            const end0 = {x: child.x, y: child.y};
            const end = rotTop(end0, am);

            edges.push(
                <Edge key={`edge-${n.publicId}-${childId}`} start={start} end={end}/>
            );
        }

        let nodeColor = "#FFF";
        if (n.taskType === 0) {
            const project = app.services.projects.getByPublicId(n.projectPublicId);
            if (project) {
                nodeColor = app.services.categories.colorByPublicId(project.categoryPublicId);
            }
        }

        nodesOut.push(
            <Node
                key={`node-${n.publicId}`}
                start={start}
                color={nodeColor}
                title={n.name}
                type={n.taskType}
            />
        );
    }

    // Return the combined array, with all edges first, then all nodes
    return [...edges, ...nodesOut];
};


const projectImage = (a0, a1, i, color, project) => {
    const am = (a0 + a1) / 2;
    const L = 1000;
    const rC = CIRCLE_CENTER.R;

    const W = 512;
    const FS = 100;
    const cx = (rC + L) * Math.cos(am);
    const cy = (rC + L) * Math.sin(am);

    return (
        <RNSVG.G key={`projectImage-${i}`} transform={`translate(${cx - W / 2}, ${cy - W / 2})`}>
            {/* icon */}
            <RNSVG.G transform={`translate(${W / 2}, ${-FS * 0.35})`}>
                <RNSVG.Text
                    // negative y = above the box
                    fill={color}
                    fontSize={FS}
                    fontFamily="sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    alignmentBaseline="baseline"
                >
                    {project.name}
                </RNSVG.Text>
            </RNSVG.G>
            <SvgXml
                xml={project.svgIcon}
                width={W}
                height={W}
                color={color}
                preserveAspectRatio="xMidYMid meet"
            />
        </RNSVG.G>
    );
};

function darkenHexColor(hex, percent = 60) {
    let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(char => char + char).join('');
    }

    const hexValue = parseInt(cleanHex, 16) || 0;

    const factor = Math.max(0, Math.min(1, (100 - percent) / 100));

    const r = (hexValue >> 16) & 0xFF;
    const g = (hexValue >> 8) & 0xFF;
    const b = hexValue & 0xFF;

    const rHex = Math.round(r * factor).toString(16).padStart(2, '0');
    const gHex = Math.round(g * factor).toString(16).padStart(2, '0');
    const bHex = Math.round(b * factor).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

function StrategyContent({
                             app,
                             lineDrawingStartNode,
                             lineDrawingEndPosition,
                             lineDrawingEndNode,
                             scale
                         }) {
    const {state, setProjectPositions} = useStrategy();
    const projectsCounter = 5;
    const start = Math.PI / 2 + Math.PI * 2 / projectsCounter * 3;
    const projects = app.services.projects.get()["rawProjects"];

    const animatedLineProps = useAnimatedProps(() => {
        'worklet';
        if (!lineDrawingStartNode || !lineDrawingStartNode.value ||
            !lineDrawingEndPosition || !lineDrawingEndPosition.value ||
            !scale || !scale.value) {

            return {
                x1: 0, y1: 0, x2: 0, y2: 0,
                strokeWidth: 2 / scale.value,
                stroke: '#717171',
            };
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

        return {
            x1: startX,
            y1: startY,
            x2: endX,
            y2: endY,
        };
    });


    const calculatedPositions = useMemo(() => {
        return Array.from({length: projectsCounter}, (_, i) => {
            const a0 = start + i * (2 * Math.PI / projectsCounter);
            const a1 = a0 + (2 * Math.PI / projectsCounter);
            const am = (a0 + a1) / 2;
            const L = 1000;
            const rC = CIRCLE_CENTER.R; // Make sure CIRCLE_CENTER is defined

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
        setProjectPositions(calculatedPositions); // <-- 2. Here is the "save"

    }, [calculatedPositions, setProjectPositions]);

    return (
        <RNSVG.G>
            {Array.from({length: projectsCounter}, (_, i) => {
                const a0 = start + i * (2 * Math.PI / projectsCounter);
                const a1 = a0 + (2 * Math.PI / projectsCounter);
                let color = app.services.categories.colorByPublicId(app.services.projects.getByPublicId(projects[i].publicId).categoryPublicId)

                return <RNSVG.Path key={`w-${i}`} d={wedgeD(R, a0, a1)} fill={darkenHexColor(color, 98)}/>;
            })}

            {Array.from({length: projectsCounter}, (_, i) => {
                const a = start + i * (2 * Math.PI / projectsCounter);
                const prev = (i - 1 + projectsCounter) % projectsCounter;
                let color_prev = app.services.categories.colorByPublicId(app.services.projects.getByPublicId(projects[prev].publicId).categoryPublicId)
                let color = app.services.categories.colorByPublicId(app.services.projects.getByPublicId(projects[i].publicId).categoryPublicId)
                return pair(a, color_prev, color, `b-${i}`);
            })}

            {calculatedPositions.map((pos, i) => {
                const a0 = start + i * (2 * Math.PI / projectsCounter);
                const a1 = a0 + (2 * Math.PI / projectsCounter);
                let color = app.services.categories.colorByPublicId(app.services.projects.getByPublicId(projects[i].publicId).categoryPublicId)

                return projectImage(
                    a0, a1, `img-${i}`,
                    darkenHexColor(color, 60),
                    projects[i]
                );
            })}
            <AnimatedLine animatedProps={animatedLineProps}/>


            {Array.from({length: projectsCounter}, (_, i) => {
                const a0 = start + i * (2 * Math.PI / projectsCounter);
                const a1 = a0 + (2 * Math.PI / projectsCounter);

                const currentProjectId = projects[i].publicId;
                const goalsForThisProject = state.goals.filter(
                    goal => goal.projectPublicId === currentProjectId
                );
                return midRadial(app, a0, a1, `mid-${i}`, goalsForThisProject);
            })}

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