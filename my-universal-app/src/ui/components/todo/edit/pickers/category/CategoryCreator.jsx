import React from "react";
import {Platform, Pressable, StyleSheet, Text, View, TextInput, PanResponder} from "react-native";

/**
 * CategoryCreator Component
 * * Displays a form to create a new category with a Name and a Color.
 * Includes a custom gesture-based slider for color selection.
 * * @param {Object} props
 * @param {function} props.onBack - Callback to return to the previous menu.
 * @param {function} props.onSuccess - Callback triggered when the category is successfully saved.
 */
export default function CategoryCreator({onBack, onSuccess}) {
    const [name, setName] = React.useState("");
    const [selectedColor, setSelectedColor] = React.useState(spectrum[0]);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const trackRef = React.useRef(null);
    const layoutRef = React.useRef({x: 0, width: 1});

    /**
     * Calculates the color based on the horizontal gesture position.
     * Maps the X coordinate to an index in the `spectrum` array.
     * * @param {number} globalX - The absolute X coordinate of the user's touch/mouse.
     */
    const calculateColor = (globalX) => {
        const {x, width} = layoutRef.current;
        if (!width || width <= 0) return;

        const relativeX = globalX - x;
        const ratio = Math.max(0, Math.min(1, relativeX / width));
        const index = Math.floor(ratio * (spectrum.length - 1));

        setSelectedIndex(index);
        setSelectedColor(spectrum[index]);
    };

    /**
     * PanResponder handles touch/mouse gestures for the slider.
     */
    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onStartShouldSetPanResponderCapture: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderTerminationRequest: () => false,

            onPanResponderGrant: (evt, gestureState) => {
                trackRef.current?.measure((x, y, width, height, pageX, pageY) => {
                    layoutRef.current = {x: pageX, width: width};
                    calculateColor(gestureState.x0);
                });
            },

            onPanResponderMove: (evt, gestureState) => {
                calculateColor(gestureState.moveX);
            },
        })
    ).current;

    /**
     * Validates input and triggers the success callback.
     */
    const handleCreate = () => {
        if (!name.trim()) return;
        onSuccess();
    };

    return (
        <View style={[styles.creatorContainer, noSelect]} {...preventDrag}>
            <View style={styles.creatorHeader}>
                <Pressable onPress={onBack} style={({pressed}) => [styles.backBtn, pressed && styles.fabPressed]}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Create Category</Text>
            </View>

            <Text style={styles.label}>Name</Text>

            <TextInput
                style={[
                    styles.input,
                    Platform.select({web: {userSelect: 'text'}})
                ]}
                placeholder="Category Name..."
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoFocus={Platform.OS === 'web'}
            />

            <View style={styles.colorSection}>
                <Text style={styles.label}>Color</Text>
                <View style={styles.previewDotWrapper}>
                    <Text style={styles.hexText}>{selectedColor}</Text>
                </View>
            </View>

            <View style={styles.sliderWrapper}>
                <View ref={trackRef} style={styles.sliderTrack} pointerEvents="none">
                    {spectrum.map((c, i) => (
                        <View key={i} style={{flex: 1, backgroundColor: c, height: "100%"}}/>
                    ))}
                </View>

                <View
                    pointerEvents="none"
                    style={[
                        styles.sliderThumb,
                        {
                            left: `${(selectedIndex / (spectrum.length - 1)) * 100}%`,
                            backgroundColor: selectedColor,
                            marginLeft: -19
                        }
                    ]}
                />

                <View
                    style={styles.gestureOverlay}
                    {...panResponder.panHandlers}
                />
            </View>

            <Pressable
                style={[styles.saveBtn, !name.trim() && styles.disabled]}
                onPress={handleCreate}
            >
                <Text style={styles.saveText}>Save Category</Text>
            </Pressable>
        </View>
    );
}

/**
 * Platform-specific style to prevent text selection.
 * Crucial for Web to prevent blue highlighting when clicking buttons/sliders.
 */
const noSelect = Platform.select({
    web: {
        userSelect: "none",
        WebkitUserSelect: "none",
        outlineStyle: "none",
        cursor: "default"
    },
    default: {}
});

/**
 * Platform-specific props to prevent the "Ghost Image" drag effect on Web.
 * Applied to the root container.
 */
const preventDrag = Platform.select({
    web: {
        onDragStart: (e) => {
            e.preventDefault();
            return false;
        },
        draggable: false
    },
    default: {}
});

/**
 * Converts HSL (Hue, Saturation, Lightness) color values to a Hex string.
 * Used to generate the color spectrum array.
 * * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color string (e.g., "#FF0000")
 */
const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * A static array representing the color spectrum (Red -> Green -> Blue -> Red).
 * Pre-calculated to avoid performance hits during rendering.
 */
const spectrum = Array.from({length: 360}, (_, i) => hslToHex(i, 100, 50));


const styles = StyleSheet.create({
    fabPressed: {opacity: 0.7},
    creatorContainer: {
        flex: 1,
        paddingHorizontal: 5,
        paddingBottom: 10,
        backgroundColor: "transparent",
    },
    creatorHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 5,
    },
    backBtn: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#2A2A2A",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#444",
        marginRight: 10,
    },
    backText: {color: "#FFF", fontSize: 16, fontWeight: "bold", marginTop: -2},
    headerTitle: {color: "#FFF", fontSize: 16, fontWeight: "600"},

    label: {color: "#CCC", fontSize: 12, marginBottom: 8, marginLeft: 2},
    input: {
        backgroundColor: "#222",
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#444",
        borderRadius: 8,
        padding: 10,
        marginBottom: 30,
    },
    colorSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        marginTop: 10,
    },
    previewDotWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    hexText: {
        color: "#888",
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? "Courier" : "monospace",
    },

    sliderWrapper: {
        position: "relative",
        height: 50,
        justifyContent: "center",
        marginBottom: 30,
        ...Platform.select({
            web: {touchAction: "none"}
        }),
    },
    sliderTrack: {
        width: "100%",
        height: 36,
        borderRadius: 18,
        flexDirection: "row",
        overflow: "hidden",
    },
    sliderThumb: {
        position: "absolute",
        top: 3,
        width: 38,
        height: 44,
        borderRadius: 19,
        borderWidth: 3,
        borderColor: "#FFF",
        ...Platform.select({
            web: {boxShadow: "0px 2px 4px rgba(0,0,0,0.5)"},
            default: {elevation: 5},
        }),
    },
    gestureOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: "transparent",
        cursor: "pointer",
    },

    saveBtn: {
        marginTop: "auto",
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    disabled: {backgroundColor: "#333", opacity: 0.5},
    saveText: {color: "#FFF", fontWeight: "bold", fontSize: 16}
});