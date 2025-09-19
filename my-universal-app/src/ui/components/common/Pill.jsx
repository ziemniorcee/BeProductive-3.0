// src/ui/components/common/Pill.jsx
import React from "react";
import { View, Pressable, Text, StyleSheet, Platform } from "react-native";
import { SvgXml } from "react-native-svg";
import * as select from "react-native";

const darken = (hex, k = 0.22) => {
    if (!hex || hex[0] !== "#" || (hex.length !== 7 && hex.length !== 4)) return hex;
    const expand = (h) => (h.length === 4 ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}` : h);
    const c = expand(hex);
    const n = parseInt(c.slice(1), 16);
    const r = Math.floor(((n >> 16) & 255) * k);
    const g = Math.floor(((n >> 8) & 255) * k);
    const b = Math.floor((n & 255) * k);
    const h2 = (v) => v.toString(16).padStart(2, "0");
    return `#${h2(r)}${h2(g)}${h2(b)}`;
};

export default function Pill({ text, border="#FFFFFF", icon=null, onPress, style, textStyle }) {
    const bg = darken(border, 0.1);
    const Comp = onPress ? Pressable : View;

    const cleanIcon = React.useMemo(() => {
        if (!icon) return null;
        return icon
            .replace(/\sclass(Name)?=(["']).*?\2/g, '')
            .replace(/\sstyle=(["']).*?\1/g, '');
    }, [icon]);

    return (
        <Comp onPress={onPress} style={[styles.root, { borderColor: border, backgroundColor: bg }, style]}>
            {cleanIcon ? <SvgXml xml={cleanIcon} width={25} height={25} style={{ marginRight: 10 }} color="#FFFFFF" /> : null}
            <Text selectable={false} style={[styles.label, textStyle]}>{text}</Text>
        </Comp>
    );
}

const styles = StyleSheet.create({
    root: {
        flexDirection: "row",
        width: select.Platform.select({web: "100%", default: "60%"}),
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 2,
        cursor: Platform.OS === "web" ? "pointer" : undefined,
        ...(Platform.OS === "web" ? { userSelect: "none", WebkitUserSelect: "none", msUserSelect: "none" } : null),

    },
    label: { color: "#FFFFFF", fontSize: Platform.select({web:20, default:16}), position: "relative", top: -2 },
});
