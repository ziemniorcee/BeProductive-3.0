import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Edit, Trash2} from 'lucide-react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    withTiming
} from "react-native-reanimated";

// Define the size of your menu box
const MENU_WIDTH = 110;
const MENU_HEIGHT = 50;

export default function StrategyOptions({app, activeTapData}) {
    const rStyle = useAnimatedStyle(() => {
        if (!activeTapData.value?.parentPublicId) {
            return {
                opacity: withTiming(0),
            };
        }

        const {x, y} = activeTapData.value;

        return {
            opacity: withTiming(1),
            transform: [{scale: withSpring(1)}],
            left: x - (MENU_WIDTH / 2),
            top: y - 60,
        };
    });

    const remove = async () => {
        console.log('Delete Clicked')
        const {parentPublicId, childPublicId, hitType} = activeTapData.value;
        if (hitType === "node"){
            await app.services.strategy.removeNode(parentPublicId)
        }
        else if (hitType === "edge") {
            await app.services.strategy.removeEdge(parentPublicId, childPublicId)
        }

        activeTapData.value = null;
    }

    return (
        <Animated.View style={[styles.container, rStyle]}>
            <View style={styles.row}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => console.log('Edit Clicked')}
                >
                    <Edit size={20} color="#FFFFFF"/>
                </TouchableOpacity>

                <View style={styles.divider}/>

                <TouchableOpacity
                    style={styles.button}
                    onPress={remove}
                >
                    <Trash2 size={20} color="#FF4444"/>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: MENU_WIDTH,
        height: MENU_HEIGHT,
        backgroundColor: '#000000',
        borderColor: '#FFFFFF',
        borderWidth: 2,
        borderRadius: 25,
        zIndex: 9999,

        // Shadow for nice depth
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    button: {
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 1,
        height: '60%',
        backgroundColor: '#EEE',
    }
});