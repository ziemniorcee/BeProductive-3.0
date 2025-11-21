import * as RNSVG from "react-native-svg";
import React, {useEffect} from "react"; // 1. Import useEffect

const rectWidth = 30;
const touchablePadding = 25;
const touchableWidth = rectWidth + touchablePadding * 2; // Total width: 80

/**
 * Checks if a tap was inside the node's tappable area (a square).
 */
const wasHit = (nodePosition, tapPosition, width) => {
    if (!tapPosition) {
        return {hit: false, dx: 0, dy: 0};
    }

    const halfWidth = width / 2;
    const dx = tapPosition.x - nodePosition.x;
    const dy = tapPosition.y - nodePosition.y;

    // Check if the tap is inside the square bounds
    const hit =
        Math.abs(dx) <= halfWidth &&
        Math.abs(dy) <= halfWidth;

    return {hit, dx, dy};
};

function Node({start, color, title, type}) {
    return (
        <RNSVG.G>
            {/*<RNSVG.Rect*/}
            {/*    x={start.x - touchableWidth / 2}*/}
            {/*    y={start.y - touchableWidth / 2}*/}
            {/*    width={touchableWidth}*/}
            {/*    height={touchableWidth}*/}
            {/*    fill="rgba(0, 255, 0, 0.3)"*/}
            {/*    pointerEvents="none"*/}
            {/*/>*/}
            {!type ? (
                <RNSVG.Rect
                    x={start.x - rectWidth / 2}
                    y={start.y - rectWidth / 2}
                    width={rectWidth}
                    height={rectWidth}
                    fill={color}
                    vectorEffect="non-scaling-stroke"
                />
            ) : (
                <RNSVG.Circle
                    cx={start.x}
                    cy={start.y}
                    r={rectWidth / 2}
                    fill={color}
                    vectorEffect="non-scaling-stroke"
                />
            )

            }

            <RNSVG.Text
                x={start.x}
                y={start.y + rectWidth}
                fill="#FFF"
                fontSize={20}
                textAnchor="middle"
                fontFamily="sans-serif"
                alignmentBaseline="middle"
                pointerEvents="none"
            >
                {title}
            </RNSVG.Text>
        </RNSVG.G>
    )
}

export default React.memo(Node);