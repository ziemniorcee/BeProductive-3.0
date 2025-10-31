import {View, StyleSheet, Text, TouchableOpacity} from "react-native";

export function StrategyTopBanner({ onAccept, onCancel }) { // Added props for press handlers

    return (
        <View style={styles.container}>
            <View style={styles.banner}>
                <Text style={styles.text}>Select point position</Text>

                {/* Container for the buttons */}
                <View style={styles.buttonsContainer}>
                    {/* Cancel Button (X) */}
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onCancel} // Attach handler
                    >
                        <Text style={styles.buttonText}>X</Text>
                    </TouchableOpacity>

                    {/* Accept Button */}
                    <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={onAccept} // Attach handler
                    >
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 30,
        left: 0,
        right: 0,
        height: 70,
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10, // Ensure banner is on top
    },
    banner: {
        height: 70,
        width: "40%", // Widened to fit buttons
        backgroundColor: "#000000",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        alignItems: "center",
        flexDirection: "row", // Arrange text and buttons horizontally
        paddingHorizontal: 20, // Add horizontal padding
        justifyContent: "center"
    },
    text: {
        fontSize: 18, // Slightly smaller text to fit
        color: "#FFFFFF",
        fontWeight: "bold",
        marginRight: 10,
    },
    buttonsContainer: {
        flexDirection: "row", // Arrange buttons horizontally
    },
    button: {
        marginLeft: 10, // Space between buttons
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#FF6347", // Tomato red for cancel
        paddingHorizontal: 12, // Make 'X' button more square-like
    },
    acceptButton: {
        backgroundColor: "#32CD32", // Lime green for accept
    },
    buttonText: {
        color: "#FFFFFF", // White text for better contrast
        fontSize: 16,
        fontWeight: "bold",
    }
})