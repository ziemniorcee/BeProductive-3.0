import {View, StyleSheet, Text} from "react-native";
import {Image} from "expo-image";
import React from "react";

const ICONS = [
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
    require("../../../../assets/phoenix.png"),
];

export default function AppBar() {
    return (
        <View style={styles.wrap}>
            <Image source={require("../../../../assets/goal.png")} style={styles.Image} contentFit="contain" transition={300}/>

            <Image source={require("../../../../assets/strategy.png")} style={styles.Image} contentFit="contain" transition={300}/>
            <Image source={require("../../../../assets/phoenix.png")} style={styles.ImageMain} contentFit="contain" transition={300}/>
            <Image source={require("../../../../assets/habit.png")} style={styles.Image} contentFit="contain" transition={300}/>

            <Image source={require("../../../../assets/timeline.png")} style={styles.Image} contentFit="contain" transition={300}/>

        </View>
    )
}

const styles = StyleSheet.create({
    wrap : {
        height: 80,
        width: 500,
        alignItems: "center",
        alignSelf: "center",
        justifyContent: "center",
        position: "absolute",
        flexDirection: "row",
        bottom: 50,
        zIndex: 1000,
        borderRadius: 30,
        borderColor: "#FFFFFF",
        borderWidth: 2,
        gap:40,
    },
    Image : {
        height:50,
        width:50,
    },

    ImageMain: {
        height:60,
        width:60,

    }
})