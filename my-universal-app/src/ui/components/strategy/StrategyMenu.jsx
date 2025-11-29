import {useEffect, useRef, useState} from "react";
import {Text, View, StyleSheet, Image, Pressable, Platform, TouchableOpacity} from "react-native";
import {useStrategy} from "../../context/StrategyContext";
import * as ScreenOrientation from "expo-screen-orientation";

export default function GalaxyMenu({app}) {
    const {openAddNewPoint} = useStrategy();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    return (
        <Pressable
            onPress={toggleMenu}
            onHoverIn={() => setIsMenuOpen(true)}
            onHoverOut={() => setIsMenuOpen(false)}
            style={styles.menuContainer}
        >
            <View style={styles.menuMainButton}>
                <Image source={require("../../../../assets/more.png")} style={styles.menuIcon}/>
            </View>

            {isMenuOpen && (
                <View
                    style={styles.menuList}
                >
                    <TouchableOpacity style={styles.menuListButton} onPress={() => console.log("Delete")}>
                        <Image source={require("../../../../assets/delete.png")} style={styles.menuIcon}/>
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Delete</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuListButton} onPress={() => console.log("Add connection")}>
                        <Image source={require("../../../../assets/nodes.png")} style={styles.menuIcon}/>
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Add connection</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuListButton} onPress={() => {
                        openAddNewPoint()
                    }}>
                        <Image source={require("../../../../assets/plus.png")} style={styles.menuIcon}/>
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Add point</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        position: "absolute",
        bottom: Platform.select({"web": 30, "default": 15}),
        left: Platform.select({"web": 30, "default": 15}),
        flexDirection: 'column-reverse',
        alignItems: "flex-start",
    },
    menuMainButton: {
        height: Platform.select({"web": 80, "default": 50}),
        width: Platform.select({"web": 80, "default": 50}),
        backgroundColor: "#000000",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        borderRadius: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    menuIcon: {
        height: Platform.select({"web": 40, "default": 25}),
        width: Platform.select({"web": 40, "default": 25}),
    },
    menuList: {
        paddingBottom: Platform.select({"web": 0, "default": 0}),
        minWidth: 250,
        alignItems: 'flex-start',
    },
    menuListButton: {
        ...(Platform.OS === 'web' ? {cursor: "pointer"} : {}),
        height: Platform.select({"web": 80, "default": 50}), // Slightly reduced for cleaner mobile look, adjust as needed
        paddingHorizontal: Platform.select({"web": 20, "default": 10}),
        borderRadius: 90,
        backgroundColor: "#000000",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        marginBottom: 10,
    },
    menuListButtonName: {
        flexShrink: 1,
    },
    text: {
        color: "#FFFFFF",
        fontSize: Platform.select({"web": 20, "default": 14}),
        fontWeight: "bold"
    },
})