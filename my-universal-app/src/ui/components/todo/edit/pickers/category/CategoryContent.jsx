import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import PickerCore from "../common/PickerCore";
import CategoryCreator from "./CategoryCreator";


/**
 * CategoryContent Component
 * * Acts as a "Router" or "Switch" within the Category Picker modal.
 * It manages the state between two views:
 * 1. **Selection View:** Shows the list of existing categories (`PickerCore`) and a FAB to create a new one.
 * 2. **Creation View:** Shows the form to create a new category (`CategoryCreator`).
 * * @param {Object} props
 * @param {Object} props.app - The main application instance.
 * @param {Object} props.allCategories - The list of categories to display.
 * @param {string} props.type - The entity type identifier (e.g., "categoryPublicId").
 * @param {function} props.closeMenu - Callback to close the parent modal/popover.
 */
export default function CategoryContent({ app, allCategories, type, closeMenu }) {
    const [isCreating, setIsCreating] = React.useState(false);

    if (isCreating) {
        return (
            <CategoryCreator
                onBack={() => setIsCreating(false)}
                onSuccess={async (id, name, colorRGB) => {
                    setIsCreating(false);
                    await app.services.categories.add(id, name, colorRGB);
                    closeMenu();
                }}
            />
        );
    }

    return (
        <View style={styles.container}>
            <PickerCore
                app={app}
                src={allCategories}
                type={type}
                onPick={closeMenu}
            />
            <Pressable
                testID="CreateCategoryFAB"
                style={({ pressed }) => [styles.fab, pressed && styles.fabPressed, noSelect]}
                onPress={() => setIsCreating(true)}
            >
                <Text style={[styles.plusIcon, noSelect]}>+</Text>
            </Pressable>
        </View>
    );
}

/**
 * Platform-specific style to prevent text selection.
 * Used on the FAB to ensure clicking it doesn't highlight the "+" text on Web.
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


const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    fab: {
        position: "absolute",
        top: -45,
        right: 15,
        width: 30,
        height: 30,
        borderRadius: 10,
        backgroundColor: "#2A2A2A",
        justifyContent: "center",
        borderColor: "#FFFFFF",
        borderWidth: 2,
        alignItems: "center",
        ...Platform.select({
            web: { boxShadow: "0px 4px 6px rgba(0,0,0,0.2)" },
            default: { elevation: 5 },
        }),
    },
    fabPressed: { opacity: 0.7 },
    plusIcon: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold", marginTop: -2 },
});