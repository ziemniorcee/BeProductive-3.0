import {View, StyleSheet, Text, Platform, Pressable} from "react-native";
import {Image} from "expo-image";
import React from "react";

const ICONS = [
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
];

export default function AppBar({app}) {
    return (
        <View style={styles.wrap}>
            <Pressable onPress={() => app.view.go("myday")}>
                <Image source={require("../../../../assets/goal.png")} style={styles.Image} contentFit="contain"
                       transition={300}/>
            </Pressable>
            <Pressable onPress={() => app.view.go("strategy")}>
                <Image source={require("../../../../assets/strategy.png")} style={styles.Image} contentFit="contain"
                       transition={300}/>
            </Pressable>
            <Image source={require("../../../../assets/phoenix.png")} style={styles.ImageMain} contentFit="contain"
                   transition={300}/>
            <Image source={require("../../../../assets/habit.png")} style={styles.Image} contentFit="contain"
                   transition={300}/>

            <Image source={require("../../../../assets/timeline.png")} style={styles.Image} contentFit="contain"
                   transition={300}/>

        </View>
    )
}

const styles = StyleSheet.create({
    wrap: {
        height: Platform.select({web: 80, default: 60}),
        width: Platform.select({web: 500, default: 350}),
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        position: "absolute",
        flexDirection: "row",
        bottom: Platform.select({web: 30, default: 10}),
        zIndex: 1000,
        borderRadius: Platform.select({web: 30, default: 20}),
        borderColor: "#FFFFFF",
        borderWidth: 2,
        gap: Platform.select({web: 40, default: 25}),
    },
    Image: {
        height: Platform.select({web: 50, default: 30}),
        width: Platform.select({web: 50, default: 30}),
    },

    ImageMain: {
        height: Platform.select({web: 60, default: 40}),
        width: Platform.select({web: 60, default: 40}),

    }
})