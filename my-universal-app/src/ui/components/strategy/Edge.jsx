import * as RNSVG from "react-native-svg";
import React from "react";

function Edge({start, end}) {
    return (
        <RNSVG.Line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke="#717171" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke"/>

    )
}


export default React.memo(Edge);