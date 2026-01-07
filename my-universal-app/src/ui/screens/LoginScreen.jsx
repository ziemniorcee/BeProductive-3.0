// packages/ui/screens/LoginScreen.jsx
import React from "react";
import {View, StyleSheet, Platform} from "react-native";
import { Image } from "expo-image";
import Vignette from "../components/common/Vignette";
import * as ScreenOrientation from "expo-screen-orientation";
import LoginScreenCore from "../components/auth/LoginScreenCore";

/**
 * LoginScreen
 * * The main entry point for the authentication UI.
 * - **Web: ** Renders the login form inside a floating "Vignette" window over a galaxy background.
 * - **Mobile: ** Renders the login form full-screen with a semi-transparent dark overlay, locked to Portrait mode.
 * * @param {object} props - Component props
 * @param {object} props.app - The central application instance (Dependency Injection container).
 */
export function LoginScreen({ app }) {
    const isWeb = Platform.OS === "web";

    /**
     * Effect: Lock Screen Orientation
     * On mobile devices, we force the screen to remain in Portrait mode
     * to ensure the login UI does not appear in Landscape mode.
     */
    React.useEffect(() => {
        if (isWeb) return;
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }, [isWeb]);

    return (
        <View style={styles.screen}>
            <Image
                source={require("../../../assets/galaxybg.jpg")}
                style={StyleSheet.absoluteFillObject}
            />

            {isWeb ? (
                <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                    <Vignette window={{ rx: 24, width: 0.32, height: 0.62, allowClose: false }}>
                        <LoginScreenCore app={app} />
                    </Vignette>
                </View>
            ) : (
                <View style={[StyleSheet.absoluteFillObject,styles.containerMobile]}>
                    <LoginScreenCore app={app} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#000000"
    },

    containerMobile: {
        backgroundColor: "rgba(0,0,0,0.5)"
    }
});