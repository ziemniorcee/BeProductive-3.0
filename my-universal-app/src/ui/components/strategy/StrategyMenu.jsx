import {useState} from "react";
import {Text, View, StyleSheet, Image, Pressable} from "react-native";
import {useStrategy} from "../../context/StrategyContext";

export default function GalaxyMenu({app}) {
    const {openAddNewPoint} = useStrategy();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        // 1. Create a single wrapper View to handle the hover state.
        <View
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
            style={styles.overlay}
        >
            {/* The button no longer needs its own event handlers. */}
            <View style={styles.menuMainButton}>
                <Image source={require("../../../../assets/more.png")} style={styles.menuMore} />
            </View>

            {/* 2. Use simple conditional rendering. It's cleaner and avoids pointerEvents issues. */}
            {isMenuOpen && (
                <View style={styles.menuList}>
                    <View style={styles.menuListButton}>
                        <Image source={require("../../../../assets/delete.png")} style={styles.menuMore} />
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Delete</Text>
                        </View>
                    </View>
                    <Pressable style={styles.menuListButton} onPress={() => console.log("Add connection")}>
                        <Image source={require("../../../../assets/nodes.png")} style={styles.menuMore} />
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Add connection</Text>
                        </View>
                    </Pressable>
                    <Pressable style={styles.menuListButton} onPress={() => openAddNewPoint()}>
                        <Image source={require("../../../../assets/plus.png")} style={styles.menuMore} />
                        <View style={styles.menuListButtonName}>
                            <Text style={styles.text}>Add point</Text>
                        </View>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    menuMainButton: {
        position: "absolute",
        bottom: 30,
        left: 30,
        height: 80,
        width: 80,
        backgroundColor: "#000000",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        borderRadius: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    menuMore : {
        height: 40,
        width: 40,
    },
    menuList: {
        position: "absolute",
        bottom: 100,
        left: 30,
        height: 330,
        gap: 15,
        justifyContent: "center",
        alignItems: 'flex-start',
    },
    menuListButton:{
        cursor: "pointer",
        height:80,
        paddingLeft:20,
        borderRadius: 90,
        backgroundColor: "#000000",
        borderWidth: 2,
        borderColor: "#FFFFFF",
        justifyContent: "left",
        alignItems: "center",
        display:"flex",
        flexDirection:"row",
        gap: 15,
        paddingRight:20,
    },
    text: {color: "#FFFFFF", fontSize: 20, fontWeight: "bold"},
    overlay: {
        position: "absolute",
        left: 0,
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    }
})