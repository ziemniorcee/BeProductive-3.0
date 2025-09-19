import {Platform, Pressable, StyleSheet} from "react-native";
import Svg, {Path} from "react-native-svg";

export function CheckboxMain({ checked, color = "#FFD500", onPress, style }) {
    const size = Platform.select({ web: 28, default: 20 });   // match box
    return (
        <Pressable onPress={onPress} hitSlop={8} style={[style, styles.box, { borderColor: color }]}>
            {checked ? (
                <Svg width={size - 6} height={size - 6} viewBox="0 0 24 24">
                    <Path
                        d="M20 6L9 17l-5-5"
                        stroke={color}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </Svg>
            ) : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    box: {

        width: Platform.select({ web: 28, default: 20 }),
        height: Platform.select({ web: 28, default: 20 }),
        borderRadius: 90,
        borderWidth: Platform.select({ web: 3, default: 2 }),
        marginRight: Platform.select({ web: 12, default: 6 }),
        backgroundColor: "transparent",
        marginTop: Platform.select({ web: 6, default: 7 }),
        alignItems: "center",
        justifyContent: "center",   // centers the checkmark
    },
});
