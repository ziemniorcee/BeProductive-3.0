// packages/ui/screens/LoginScreen.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import LoginView from "../components/auth/LoginView";
import Vignette from "../components/common/Vignette";

export function LoginScreen({ app }) {
    return (
        <View style={styles.screen}>
            <Image source={require("../../../assets/galaxybg.jpg")} style={StyleSheet.absoluteFillObject} />
            <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                <Vignette window={{ rx: 24 , width: 0.32, height: 0.62, allowClose:false}}>
                    <LoginView app={app} />
                </Vignette>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#000000" },
});
