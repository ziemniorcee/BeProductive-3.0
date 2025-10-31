import * as RNSVG from "react-native-svg";
import React from "react";
import {SvgXml} from 'react-native-svg';
import Node from "./Node";
import {cleanSvgXml} from "../../../util/svgClean";
import Edge from "./Edge";
import {StyleSheet, Text, View} from "react-native";

const sep = 15;
const CIRCLE_CENTER = {R: 140, D: 200};
const CIRCLE_OUTER = {R: 4000,};
const COLS = ['#050500', '#070004', '#02050B', '#010700', '#050500', '#050500'];
const COLS_LIGHT = ['#FFEE00', '#AD085F', '#2979FF', '#42FF29', '#FFEE00', '#FFEE00'];
const PROJECT_COLORS = ["#2C2900", "#3B0221", "#0D2854", "#10380B", "#2C2900", "#2C2900"]
const PROJECT_TITLES = ["Productivity", "BeProductive", "University", "Government", "Japanese", "Japanese"]
const ICONS2 = [`<svg fill="currentColor" width="800px" height="800px" viewBox="0 0 16 16" id="chart-grow-16px" xmlns="http://www.w3.org/2000/svg">
  <path id="Path_151" data-name="Path 151" d="M38.5,15H38V5.5a.5.5,0,0,0-.5-.5h-3a.5.5,0,0,0-.5.5V8H31.5a.5.5,0,0,0-.5.5V11H28.5a.5.5,0,0,0-.5.5V13H25.5a.5.5,0,0,0-.5.5V15H24V.5a.5.5,0,0,0-1,0v15a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,0-1ZM26,14h2v1H26Zm3-.5V12h2v3H29Zm3-2V9h2v6H32ZM35,15V6h2v9Zm-9.854-3.146a.5.5,0,0,1,0-.708L35.293,1H33.5a.5.5,0,0,1,0-1h3a.5.5,0,0,1,.5.5v3a.5.5,0,0,1-1,0V1.707L25.854,11.854a.5.5,0,0,1-.708,0Z" transform="translate(-23)"/>
</svg>`,
    `<svg fill="currentColor" width="800px" height="800px" viewBox="0 0 33.867 33.867" version="1.1" xmlns="http://www.w3.org/2000/svg">
 <g>
  <path d="m16.455 1.4094c0-2e-7 -2.9253-0.034011-5.5115 1.058-2.5005 1.0558-4.2537 4.3297-5.3449 3.8415-1.0578-0.47323-0.36169-1.2806 1.3085-3.1179-4.1199 2.0599-5.9689 5.6845-3.948 11.599 1.578 4.6186 7.3341 8.6681 12.994 10.673 1.4744 0.52228 1.8379 2.8369 1.8379 2.8369s-0.77041-1.5676-1.9329-2.2898c-1.4203-0.88243-2.5006-0.88661-5.6386-2.3313-2.7426-1.2627-4.4739-3.5597-4.4739-3.5597 4e-7 0 0.49163 1.1659-0.17647 1.3886-0.66809 0.2227-1.7329-0.23446-2.9049-3.5631 0.32449 3.4642 1.3601 4.1443 3.101 5.8456 2.2076 2.1574 10.913 3.9605 9.9795 6.0261-0.97502 2.1577-7.7392-0.75329-7.7392-0.75329 5.8647 3.7948 8.3663 3.5276 10.059 3.252 1.6928-0.27557 4.7245-1.1218 5.0789-4.9798 0.35431-3.858-3.806-4.803-6.1809-7.1452-1.8735-1.8476-1.9351-2.7295-1.9699-4.1498-0.03944-1.611 1.0663-2.9211 2.687-2.8559 2.1724 0.08749 2.4163 1.3579 2.5708 2.0999 0.16408 0.78767-0.01233 2.029-0.82998 2.5885 0.52273 0.57305 1.2295 0.63124 1.9289 0.34343 0.79819-0.3285 1.1463-1.051 1.2019-1.8583 0.78002-0.58598 1.4578-2.0571 0.81176-4.2153-0.69471-2.321-2.6211-3.5193-2.816-5.8619-0.06884-0.8276-0.29828-2.9523 2.4298-4.6782-4.4919 0.87028-4.8798 4.7617-4.8798 4.7617s-0.41746-0.36191-0.27828-1.6981c-0.86295 1.0021-0.61222 2.9509-0.61222 2.9509s-1.3659-0.12343-3.039 1.156c3.11-0.45273 4.5576 0.30068 5.5704 1.2798 1.8696 1.8075 2.0671 4.1136 2.0671 4.1136s-0.25619 0.06902-0.39398-0.11797c-0.15747-0.31494-0.52165-0.03923-0.71849-0.33449-0.15747-0.21652-0.08467-1.1006-0.32088-1.8873-0.09606-0.31994-0.38997-0.94404-1.0122-1.4934-0.8804-0.77732-2.2361-1.4634-4.5188-1.352-2.2826 0.11135-4.3708 3.396-4.0646 7.3489 0.3616 4.6679 4.7468 6.4911 4.7468 6.4911s1.5181 0.71327 0.17543-0.85487c1.3233 0.42233 2.9838 2.2137 3.0952 5.4984-1.0021-3.7302-3.1165-3.9064-4.8954-5.1214-1.464-0.99994-5.7746-3.1484-6.1842-10.153-0.46924-8.0243 8.7409-10.782 8.7409-10.782zm8.8539 3.2304s-1.3583 2.8937 0.92498 6.8698c-1.181-0.98419-2.185-0.86614-2.185-0.86614s3.5641 3.3598 2.5592 6.7514c-1.371 4.6277-4.8229 5.4133-4.8229 5.4133s5.6689 4.724-1.2992 9.3496c3.7596-0.86609 8.1098-2.2831 10.059-7.9914-1.1023 1.5353-3.7299 4.335-4.409 3.5428-0.78996-0.92153 3.7742-3.2316 4.8223-5.2258 1.2935-2.4611 1.1812-7.8245-2.0272-11.072 0.96451 3.051 0.96474 5.5377 0.23624 7.4802-0.58371 1.5564-1.2834 3.0954-2.2637 4.1336-1.0891 1.1534-1.9685 2.4208-2.1653 3.1688 0.07873-1.5747 0.60106-2.5384 1.516-3.6413 2.0778-2.5049 3.1922-6.2049 2.6373-8.2477-0.55115-2.0471-1.5671-3.7259-2.972-5.7473-0.69756-1.0037-0.61028-3.9175-0.61028-3.9175z" fill-opacity=".99048"/>
 </g>
</svg>`,
    `<svg fill="currentColor" width="800px" height="800px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M16 6.28a1.23 1.23 0 0 0-.62-1.07l-6.74-4a1.27 1.27 0 0 0-1.28 0l-6.75 4a1.25 1.25 0 0 0 0 2.15l1.92 1.12v2.81a1.28 1.28 0 0 0 .62 1.09l4.25 2.45a1.28 1.28 0 0 0 1.24 0l4.25-2.45a1.28 1.28 0 0 0 .62-1.09V8.45l1.24-.73v2.72H16V6.28zm-3.73 5L8 13.74l-4.22-2.45V9.22l3.58 2.13a1.29 1.29 0 0 0 1.28 0l3.62-2.16zM8 10.27l-6.75-4L8 2.26l6.75 4z"/></svg>`
    , `<svg 
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   version="1.1"
   width="100%"
   height="100%"
   viewBox="0 0 14 14"
   id="svg2">
  <metadata
     id="metadata8">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title></dc:title>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <defs
     id="defs6" />
  <rect
     width="14"
     height="14"
     x="0"
     y="0"
     id="canvas"
     style="stroke:none;visibility:hidden" />
  <path
     d="M 7,0 C 6.75,0.0032 6.5,0.1644239 6.5,0.5 l 0,4.03125 C 3.906144,4.6951647 3,6.060613 3,7 l 8,0 C 11,6.060613 10.093856,4.6951647 7.5,4.53125 L 7.5,0.5 C 7.5,0.1516409 7.25,-0.0031957 7,0 z M 8,0 8,3 12,3 10,1.5 12,0 8,0 z m -7,8 0,1 1,0 0,4 -1,0 -1,1 14,0 -1,-1 -1,0 0,-4 1,0 0,-1 -12,0 z m 3,1 1,0 0,4 -1,0 0,-4 z m 2,0 2,0 0,4 -2,0 0,-4 z m 3,0 1,0 0,4 -1,0 0,-4 z"
     id="government"
     style="fill:currentColor;fill-opacity:1;stroke:none" />
</svg> `, `<svg height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 38.427 38.427" xml:space="preserve"> <g> <g> <path style="fill:currentColor;" d="M36.501,32.204c-1.564-1.324-3.673-1.896-5.43-2.887c-2.982-1.691-6.375-3.368-9.061-5.492 c-6.664-5.27-6.313-11.534-5.379-19.234c0.187-1.542-0.278-2.926-1.583-3.861c-1.786-1.28-4.05-0.93-4.512,1.483 c-0.619,3.24,1.31,7.409,1.536,10.708c0.261,3.819-0.133,7.697-1.485,11.289c-0.959,2.547-2.575,5.114-4.321,7.203 c-1.05,1.258-6.88,4.613-4.839,6.575c2.09,2.009,7.67-3.442,9.003-4.79c0.599-0.605,3.845-5.631,5.302-8.421 c0.529-1.014,0.823-1.733,0.666-1.837c0.103,0.068,0.183,0.126,0.242,0.2c2.873,3.598,5.354,7.825,8.822,10.881 c2.332,2.054,5.276,1.676,8.112,1.265C35.38,35.023,39.187,34.477,36.501,32.204z"/> <path style="fill:currentColor;" d="M19.749,18.387c0.57-0.052,1.096-0.284,1.584-0.618c2.598-1.779,5.195-3.573,7.354-5.902 c0.506-0.548,0.971-1.162,1.332-1.815c0.648-1.175,0.445-2.074-0.574-2.959c-0.875-0.759-1.937-1.033-3.062-1.142 c-1.818-0.178-3.195,0.716-3.715,2.452c-0.126,0.422-0.215,0.859-0.286,1.294c-0.256,1.559-0.83,2.986-1.722,4.289 c-0.675,0.988-1.358,1.971-2.017,2.97c-0.108,0.164-0.198,0.341-0.289,0.529C18.209,17.786,18.803,18.473,19.749,18.387z"/> <path style="fill:currentColor;" d="M3.011,15.781c1.296,0.81,1.983,1.954,2.452,3.341c0.177,0.524,0.479,1.113,0.905,1.423 c0.795,0.576,1.719,0.591,2.642,0.127c0.482-0.242,0.879-0.531,1.164-0.908c0.496-0.656,0.387-1.723,0.265-2.138 c-0.075-0.253-0.158-0.502-0.277-0.732c-1.358-2.636-4.129-3.154-6.506-4.246c-0.194-0.089-0.625,0.084-0.807,0.27 C2.143,13.643,2.168,15.254,3.011,15.781z"/> </g> </g> </svg>`,
    `<svg height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 38.427 38.427" xml:space="preserve"> <g> <g> <path style="fill:currentColor;" d="M36.501,32.204c-1.564-1.324-3.673-1.896-5.43-2.887c-2.982-1.691-6.375-3.368-9.061-5.492 c-6.664-5.27-6.313-11.534-5.379-19.234c0.187-1.542-0.278-2.926-1.583-3.861c-1.786-1.28-4.05-0.93-4.512,1.483 c-0.619,3.24,1.31,7.409,1.536,10.708c0.261,3.819-0.133,7.697-1.485,11.289c-0.959,2.547-2.575,5.114-4.321,7.203 c-1.05,1.258-6.88,4.613-4.839,6.575c2.09,2.009,7.67-3.442,9.003-4.79c0.599-0.605,3.845-5.631,5.302-8.421 c0.529-1.014,0.823-1.733,0.666-1.837c0.103,0.068,0.183,0.126,0.242,0.2c2.873,3.598,5.354,7.825,8.822,10.881 c2.332,2.054,5.276,1.676,8.112,1.265C35.38,35.023,39.187,34.477,36.501,32.204z"/> <path style="fill:currentColor;" d="M19.749,18.387c0.57-0.052,1.096-0.284,1.584-0.618c2.598-1.779,5.195-3.573,7.354-5.902 c0.506-0.548,0.971-1.162,1.332-1.815c0.648-1.175,0.445-2.074-0.574-2.959c-0.875-0.759-1.937-1.033-3.062-1.142 c-1.818-0.178-3.195,0.716-3.715,2.452c-0.126,0.422-0.215,0.859-0.286,1.294c-0.256,1.559-0.83,2.986-1.722,4.289 c-0.675,0.988-1.358,1.971-2.017,2.97c-0.108,0.164-0.198,0.341-0.289,0.529C18.209,17.786,18.803,18.473,19.749,18.387z"/> <path style="fill:currentColor;" d="M3.011,15.781c1.296,0.81,1.983,1.954,2.452,3.341c0.177,0.524,0.479,1.113,0.905,1.423 c0.795,0.576,1.719,0.591,2.642,0.127c0.482-0.242,0.879-0.531,1.164-0.908c0.496-0.656,0.387-1.723,0.265-2.138 c-0.075-0.253-0.158-0.502-0.277-0.732c-1.358-2.636-4.129-3.154-6.506-4.246c-0.194-0.089-0.625,0.084-0.807,0.27 C2.143,13.643,2.168,15.254,3.011,15.781z"/> </g> </g> </svg>`,
]

const ICONS2_CLEAN = ICONS2.map(cleanSvgXml);

const NODES = [
    {
        id: 0,
        rel_x: 0,
        rel_y: 0,
        title: 'Core',
        color: '#000',
        type: 'core',
        children: [
            1
        ]
    },
    {
        id: 1,
        rel_x: 0,
        rel_y: -300,
        title: 'Japanese Beginner',
        color: '#000',
        type: 'stage',
        children: [
            2, 7
        ]
    },
    {
        id: 2,
        rel_x: -50,
        rel_y: -400,
        title: 'hiragana',
        color: '#000',
        type: 'star',
        children: [
            3
        ]
    },
    {
        id: 3,
        rel_x: -50,
        rel_y: -600,
        title: 'katakana',
        color: '#000',
        type: 'star',
        children: [
            4, 5, 6
        ]
    },
    {
        id: 4,
        rel_x: -250,
        rel_y: -800,
        title: 'satori',
        color: '#000',
        type: 'star',
        children: [
            8
        ]
    },
    {
        id: 5,
        rel_x: -50,
        rel_y: -800,
        title: 'kanji',
        color: '#000',
        type: 'star',
        children: [
            8
        ]
    },
    {
        id: 6,
        rel_x: 150,
        rel_y: -800,
        title: 'vocab',
        color: '#000',
        type: 'star',
        children: [
            8
        ]
    },
    {
        id: 7,
        rel_x: 450,
        rel_y: -800,
        title: 'Genki',
        color: '#000',
        type: 'star',
        children: [
            8
        ]
    },
    {
        id: 8,
        rel_x: 0,
        rel_y: -1000,
        title: 'N5 Japanese',
        color: '#000',
        type: 'star',
        children: []
    },
]


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


const midRadial = (a0, a1, i, color, tapCoordinates, tapHandledRef) => {
    const am = (a0 + a1) / 2;
    return (
        <RNSVG.G key={`midRadial-${i}`}>
            {generate(color, am, tapCoordinates, tapHandledRef)}
        </RNSVG.G>
    );
};

const rot = ({x, y}, t) => ({
    x: x * Math.cos(t) - y * Math.sin(t),
    y: x * Math.sin(t) + y * Math.cos(t)
});

const rotTop = (p, am) => rot(p, am + Math.PI / 2);

const generate = (color, am, tapCoordinates, tapHandledRef) => {
    const out = [];
    for (const n of NODES) {
        const start0 = {x: n.rel_x, y: n.rel_y};
        const start = rotTop(start0, am);

        for (const c of (n.children ?? [])) {
            const childId = typeof c === 'object' ? c.id : c;
            const child = NODES.find(x => x.id === childId) ?? NODES[childId];
            if (!child) continue;
            const end0 = {x: child.rel_x, y: child.rel_y};
            const end = rotTop(end0, am);
            out.push(
                <Edge key={`edge-${n.id}-${childId}`} start={start} end={end}/>
            );
        }

        out.push(
            <Node
                key={`node-${n.id}`}
                start={start}
                color={color}
                title={n.title}
                press={() => console.log(`Tapped node ${n.id}: ${n.title}`)}
                tapCoordinates={tapCoordinates}
                tapHandledRef={tapHandledRef}
            />
        );
    }
    return out;
};

const projectImage = (a0, a1, i, color, title, icon) => {
    const am = (a0 + a1) / 2;
    const L = 1000;
    const rC = CIRCLE_CENTER.R;

    const W = 512;
    const FS = 100;
    const cx = (rC + L) * Math.cos(am);
    const cy = (rC + L) * Math.sin(am);

    return (
        <RNSVG.G key={`projectImage-${i}`} transform={`translate(${cx - W / 2}, ${cy - W / 2})`} >
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
                    {title}
                </RNSVG.Text>
            </RNSVG.G>
            <SvgXml
                xml={icon}
                width={W}
                height={W}
                color={color}
                preserveAspectRatio="xMidYMid meet"
            />
        </RNSVG.G>
    );
};

function StrategyContent({ tapCoordinates, tapHandledRef }) {
    const projectsCounter = 5;
    const start = Math.PI / 2 + Math.PI * 2 / projectsCounter * 3;
    return (
        <RNSVG.G>
            {Array.from({length: projectsCounter}, (_, i) => {
                const a0 = start + i * (2 * Math.PI / projectsCounter);
                const a1 = a0 + (2 * Math.PI / projectsCounter);
                return <RNSVG.Path key={`w-${i}`} d={wedgeD(R, a0, a1)} fill={COLS[i]}/>;
            })}

            {Array.from({length: projectsCounter}, (_, i) => {
                const a = start + i * (2 * Math.PI / projectsCounter);
                const prev = (i - 1 + projectsCounter) % projectsCounter;
                return pair(a, COLS_LIGHT[prev], COLS_LIGHT[i], `b-${i}`);
            })}

            {Array.from({length: projectsCounter}, (_, i) => {
                const a0 = start + i * (2 * Math.PI / projectsCounter);
                const a1 = a0 + (2 * Math.PI / projectsCounter);
                return projectImage(a0, a1, `img-${i}`, PROJECT_COLORS[i], PROJECT_TITLES[i], ICONS2_CLEAN[i]);
            })}

            {Array.from({length: projectsCounter}, (_, i) => {
                const a0 = start + i * (2 * Math.PI / projectsCounter);
                const a1 = a0 + (2 * Math.PI / projectsCounter);
                return midRadial(a0, a1, `mid-${i}`, COLS_LIGHT[i], tapCoordinates, tapHandledRef);
            })}

            <Node
                key={`node-custom`}
                start={{x:0, y:-700}}
                color={"red"}
                title={"new"}
                press={() => console.log("xdd")}
                tapCoordinates={tapCoordinates}
                tapHandledRef={tapHandledRef}
            />

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