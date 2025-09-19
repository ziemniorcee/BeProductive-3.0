import {Platform, Pressable, Text, StyleSheet, TextInput, View} from "react-native";
import {CheckboxStep} from "../../common/CheckboxStep";
import {Image} from "expo-image";
import React from "react";

export default function StepRow({ item, onDrag, onToggle, onText, color, isActive }) {
    return (
        <View style={[styles.stepRow, isActive && styles.activeRow]}>
            <Pressable onPressIn={onDrag} style={styles.dragHandle} hitSlop={8}>
                <Image source={require("../../../../../../assets/common/drag.png")} style={styles.drag}/>
            </Pressable>
            <CheckboxStep color={color} checked={item.stepCheck} onPress={() => onToggle(item.publicId)}/>
            {item.stepCheck ? (
                <Text style={[styles.stepTextChecked, styles.stepDone]}>{item.name}</Text>
            ) :(
                <TextInput
                    multiline={Platform.select({ web: false, default: true })}
                    value={item.name ?? ""}
                    onChangeText={(t) => onText(item.publicId, t)}
                    style={[styles.stepText, item.stepCheck && styles.stepDone]}
                    blurOnSubmit={false}/>)
            }
        </View>
    );
}

const ROW_H = 36;
const C = {
    text: "#FFFFFF",
    sub: "#BDBDBD",
    mid: "#9AA0A6",
};
const styles = StyleSheet.create({
    stepRow: {
        flexDirection: "row",
        alignItems: "center",
        minHeight: ROW_H,
        gap: Platform.select({ web: 10, default: 6 }),
        paddingVertical: Platform.select({ web: 6, default: 0 }),
        paddingRight: 40,
        width: "100%",
    },
    activeRow: {
        backgroundColor: "#151515",
        borderRadius: 8,
        paddingHorizontal: 6,
    },
    dragHandle: {
        width: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    drag: {
        width: 18,
        height: 18,
        pointerEvents: "none",
    },
    stepText: {
        flex: 1,
        color: C.text,
        fontSize: 16,
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginVertical: 3,
        ...Platform.select({ android: { textAlignVertical: "center" } }),
    },
    stepTextChecked: {
        flex: 1,
        color: C.text,
        fontSize: 16,
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginVertical: 3,
        marginLeft: Platform.select({ web: 0, default: 4 }),
    },
    stepDone: {
        color: C.mid,
        textDecorationLine: "line-through",
    },
});
