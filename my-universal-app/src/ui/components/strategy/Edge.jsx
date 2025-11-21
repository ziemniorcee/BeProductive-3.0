import * as RNSVG from "react-native-svg";
import React, { useEffect } from "react"; // Import useEffect

const touchableWidth = 30;



function Edge({ start, end }) { // Add new props

    // This component only *renders* the line.
    // The tap logic is handled entirely by the useEffect.
    return (
        <RNSVG.Line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke="#717171" strokeWidth={2} strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"/>
    )
}

export default React.memo(Edge);