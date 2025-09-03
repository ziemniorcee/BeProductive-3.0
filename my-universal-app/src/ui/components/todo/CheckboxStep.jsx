import {Platform, Pressable, StyleSheet} from "react-native";
import Svg, {Path} from "react-native-svg";

export function CheckboxStep({ checked, color = "#FFD500", onPress }) {
    return (
        <Pressable onPress={onPress} hitSlop={8} style={[styles.box, { borderColor: color }]}>
            {checked ? (
                <Svg width={18} height={18} viewBox="0 0 24 24">
                    <Path d="M20 6L9 17l-5-5" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
            ) : null}
        </Pressable>
    );
}


const styles = StyleSheet.create({
    box: {
        width: Platform.select({ web: 20, default: 16 }),
        height: Platform.select({ web: 20, default: 16 }),
        borderWidth: 2,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
})