import {Platform, Pressable, Text, View, StyleSheet} from "react-native";
import React from "react";
import {Image} from "expo-image";


export default function TodoHeader({type, app}) {
    const ICONS = {
        "My Day": require("../../../../../assets/sun.png"),
        "Inbox": require("../../../../../assets/inbox.png"),
        "Now": require("../../../../../assets/fire.png"),
        "Day": require("../../../../../assets/today.png"),
    }

    const isWeb = Platform.OS === "web";

    return (
        <View style={styles.header}>
            {isWeb && (
                <>
                    <Pressable onPress={() => app.view.go("myday")}>
                        <Image source={ICONS["My Day"]} style={styles.headerOptionImageLeft} contentFit="contain"
                               transition={300}/>
                    </Pressable>
                    <Pressable onPress={() => app.view.go("inbox")}>
                        <Image source={ICONS["Inbox"]} style={styles.headerOptionImageLeft} contentFit="contain"
                               transition={300}/>
                    </Pressable>
                </>
            )}

            <View style={styles.headerMain}>
                <Image source={ICONS[type]} style={styles.headerImage} contentFit="contain" transition={300}/>
                <Text style={styles.headerTitle}>{type}</Text>
            </View>

            {isWeb && (
                <>
                    <Pressable onPress={() => app.view.go("now")}>
                        <Image source={ICONS["Now"]} style={styles.headerOptionImageRight} contentFit="contain"
                               transition={300}/>
                    </Pressable>
                    <Pressable onPress={() => app.view.go("day")}>
                        <Image source={ICONS["Day"]} style={styles.headerOptionImageRight} contentFit="contain"
                               transition={300}/>
                    </Pressable>
                </>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        top: Platform.select({web: 20, default: -10}),
        marginBottom: Platform.select({web: 20, default: -10}),
        gap: 20,
        height: 56,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    headerImage: {
        width: 40,
        height: 40,
    },

    headerMain: {
        marginLeft: 16,
        marginRight: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: "600",
        color: "#fff",
    },
    headerOptionImageLeft: {
        width: 30,
        height: 30,
        marginRight: 30,
    },

    headerOptionImageRight: {
        width: 30,
        height: 30,
        marginLeft: 30,
    },
})