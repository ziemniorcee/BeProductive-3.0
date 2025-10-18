import * as RNSVG from "react-native-svg";
import React from "react";

const rectWidth = 30;
function Node({start, color, title}) {
    return (
        <RNSVG.G >
            <RNSVG.Rect x={start.x - rectWidth / 2} y={start.y - rectWidth / 2}
                        width={rectWidth} height={rectWidth} fill={color} vectorEffect="non-scaling-stroke"/>
            <RNSVG.Text
                x={start.x} y={start.y + rectWidth}
                fill="#FFF"
                fontSize={20}
                textAnchor="middle"
                fontFamily="sans-serif"
                alignmentBaseline="middle"
            >
                {title}
            </RNSVG.Text>
        </RNSVG.G>
    )
}

export default React.memo(Node);