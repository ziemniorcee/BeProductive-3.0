import {useEffect, useRef, useState} from "react";
import {Text, View, StyleSheet, Image, Pressable, Platform} from "react-native";
import {useStrategy} from "../../context/StrategyContext";

export default function GalaxyMenu({app}) {
    const {openAddNewPoint} = useStrategy();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    return (
        <Pressable
            // Mobile: Toggle on press
            onPress={toggleMenu}
            // Web: Hover states
            onHoverIn={()=>setIsMenuOpen(true)}
            onHoverOut={()=>setIsMenuOpen(false)}
            // FIX: The style now contains the positioning and dimensions
            style={styles.menuContainer}
        >
            {/* 1. The main button is now just a visual wrapper, no absolute positioning needed here */}
            <View style={styles.menuMainButton}>
                <Image source={require("../../../../assets/more.png")} style={styles.menuIcon} />
            </View>

            {/* 2. The list renders absolutely relative to the container */}
            {isMenuOpen && (
                <View
                    style={styles.menuList}
                    // Web: Hovering the LIST also keeps it open (cancels the close timer)
                >
                    <View style={styles.menuListButton} onPress={() => console.log("Delete")}>
                        <Image source={require("../../../../assets/delete.png")} style={styles.menuIcon} />
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Delete</Text>
                        </View>
                    </View>
                    <View style={styles.menuListButton} onPress={() => console.log("Add connection")}>
                        <Image source={require("../../../../assets/nodes.png")} style={styles.menuIcon} />
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Add connection</Text>
                        </View>
                    </View>
                    <View style={styles.menuListButton} onPress={() => openAddNewPoint()}>
                        <Image source={require("../../../../assets/plus.png")} style={styles.menuIcon} />
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Add point</Text>
                        </View>
                    </View>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    // FIX: Move absolute positioning here.
    // This ensures the Pressable has an actual hit-box area on the screen.
    menuContainer: {
        position: "absolute",
        bottom: Platform.select({"web": 30, "default": 15}),
        left: Platform.select({"web": 30, "default": 15}),
        // Ensure zIndex is high so it sits on top of maps/content
        flexDirection: 'column-reverse',
        alignItems: "flex-start",
    },
    menuMainButton: {
        // Removed: position: "absolute", bottom, left (Parent handles this now)
        height: Platform.select({"web": 80, "default": 50}),
        width: Platform.select({"web": 80, "default": 50}),
        backgroundColor: "#000000",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        borderRadius: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    menuIcon : {
        height: Platform.select({"web": 40, "default": 25}),
        width: Platform.select({"web": 40, "default": 25}),
    },
    menuList: {
        // Position relative to the Container (bottom: 0 is the bottom of the button)
        paddingBottom: Platform.select({"web": 0, "default": 0}),

        // We can remove background color unless you want the whole box colored
        // backgroundColor: "red",

        minWidth: 250,
        alignItems: 'flex-start',
    },
    menuListButton:{
        ...(Platform.OS === 'web' ? { cursor: "pointer" } : {}),
        height: Platform.select({"web": 80, "default": 50}), // Slightly reduced for cleaner mobile look, adjust as needed
        paddingHorizontal: Platform.select({"web": 20, "default": 10}),
        borderRadius: 90,
        backgroundColor: "#000000",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        flexDirection:"row",
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