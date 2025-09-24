import {Platform, Pressable, Text, View, StyleSheet} from "react-native";
import React from "react";
import {Image} from "expo-image";

function getMonthNameFromISO(iso) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[parseInt(iso.slice(5, 7), 10) - 1];
}

function getTitle(type, date = null) {
    if (type === "Day") return date;
    else if (type === "Month") return getMonthNameFromISO(date);
    else return type;
}

export default function TodoHeader({type, app, date = null}) {
    const ICONS = {
        "My Day": require("../../../../../assets/sun.png"),
        "Inbox": require("../../../../../assets/inbox.png"),
        "Now": require("../../../../../assets/fire.png"),
        "Day": require("../../../../../assets/today.png"),
        "Month": require("../../../../../assets/today.png"),
    }

    const isWeb = Platform.OS === "web";
    const [mobileHeaderOpen, setMobileHeaderOpen] = React.useState(false);

    React.useEffect(() => {
        if (!mobileHeaderOpen) return;
        const t = setTimeout(() => setMobileHeaderOpen(false), 3000);
        return () => clearTimeout(t); // reset if reopened or unmounted
    }, [mobileHeaderOpen]);


    return (
        <View style={styles.header}>
            {!isWeb && mobileHeaderOpen && (<View style={styles.headerMobile}>
                <Pressable onPress={() => app.view.go("myday")}>
                    <Image source={ICONS["My Day"]} style={styles.headerMobileImage} contentFit="contain"
                           transition={300}/>
                </Pressable>

                <Pressable onPress={() => app.view.go("inbox")}>
                    <Image source={ICONS["Inbox"]} style={styles.headerMobileImage} contentFit="contain"
                           transition={300}/>
                </Pressable>
                <Pressable onPress={() => app.view.go("now")}>
                    <Image source={ICONS["Now"]} style={styles.headerMobileImage} contentFit="contain"
                           transition={300}/>
                </Pressable>
                <Pressable onPress={() => app.view.go("month")}>
                    <Image source={ICONS["Day"]} style={styles.headerMobileImage} contentFit="contain"
                           transition={300}/>
                </Pressable>

            </View>)}


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

            <Pressable onPress={() => setMobileHeaderOpen(v => !v)}>

                <View style={styles.headerMain}>
                    <Image source={ICONS[type]} style={styles.headerImage} contentFit="contain" transition={300}/>
                    <Text style={styles.headerTitle}>{getTitle(type, date)}</Text>
                </View>
            </Pressable>
            {isWeb && (
                <>
                    <Pressable onPress={() => app.view.go("now")}>
                        <Image source={ICONS["Now"]} style={styles.headerOptionImageRight} contentFit="contain"
                               transition={300}/>
                    </Pressable>
                    <Pressable onPress={() => app.view.go("month")}>
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
        width: "100%",
        backgroundColor: "transparent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
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
    headerMobile: {
        width: "100%",
        backgroundColor: "#000000",
        height: 60,
        position: "absolute",
        zIndex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        top: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#FFFFFF",
    },

    headerMobileImage: {
        width: 30,
        height: 30,
        marginLeft: 15,
        marginRight: 15,

    },
})