import {Platform, Pressable, View, StyleSheet} from "react-native";
import {Image} from "expo-image";
import React from "react";
import AppBarCore from "./AppBarCore";

export default function AppBar({app}) {
    const isWeb = Platform.OS === 'web';

    if (isWeb) {
        return (<AppBarCore app={app} horizontal/>);
    }
    else {
        return ( // only for vertical mobile
            <View style={styles.overlay} pointerEvents="box-none">
                <AppBarCore app={app} horizontal={horizontal}/>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    overlay: {
        height: '100%',
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: Platform.select({web: 30, default: 0}),
        justifyContent: 'center',   // vertical center
        alignItems: 'flex-end',     // to the right
        zIndex: 1000,
    }
})
