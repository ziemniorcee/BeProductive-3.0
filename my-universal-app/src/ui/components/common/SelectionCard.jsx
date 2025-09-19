// src/ui/components/common/SelectionCard.jsx
import React from "react";
import {View, Text, StyleSheet, Platform} from "react-native";

export default function SelectionCard({ label, children, style }) {
    return (
        <View style={[styles.card, style]}>
            <View style={styles.header}>
                <Text style={styles.headerText}>{label}</Text>
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        position: "relative",
        maxHeight: 500,
        width: Platform.select({ web: 300, default:250 }),
        alignItems: "stretch",
        backgroundColor: "#000000",
        borderRadius: 12,
        padding: 12,
        borderColor: "#2A2A2A",
        borderWidth: 1,
    },
    header: {
        height: 40,
        borderBottomWidth: 1,
        borderBottomColor: "#2A2A2A",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    headerText: { color: "#FFFFFF", fontSize: 20 },
});
