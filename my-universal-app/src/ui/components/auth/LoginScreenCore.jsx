import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";

/**
 * LoginScreenCore
 * * The internal form component containing the email/password inputs and submission logic.
 * * It manages its own state for input values and loading status.
 *
 * @param {object} props
 * @param {object} props.app - The main app instance containing services (auth, navigation).
 * @param {function} [props.onForgot] - Callback when "Forgot Password" is clicked.
 * @param {function} [props.onSignup] - Callback when "Sign Up" is clicked.
 */
export default function LoginScreenCore({ app, onForgot, onSignup }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * core login logic
     * Validates input, calls the auth service, and starts the app on success.
     * @param {string} targetEmail
     * @param {string} targetPassword
     */
    const login = async (targetEmail, targetPassword) => {
        if (!targetEmail || !targetPassword) {
            setError("Enter email and password");
            return;
        }

        setLoading(true);
        setError("");


        try {
            await app.services.auth.login({ email: targetEmail, password: targetPassword });
            app.start();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const submit = async () => {
        await login(email, password);
    };

    const submitDemo = async () => {
        await login("igor@example.com", "pyrus");
    };

    return (
        <View style={styles.login}>
            <View style={styles.logo}>
                <Image source={require('../../../../assets/phoenix.png')} style={styles.logoIcon} contentFit="cover"/>
                <Text style={styles.logoTitle}>BeProductive</Text>
            </View>

            <Text style={styles.signIn}>Sign in</Text>

            <Text style={styles.emailLabel}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="alice@example.com"
                placeholderTextColor="#A3A3A3"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                style={styles.emailInput}
            />

            <Text style={styles.passwordLabel}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                placeholderTextColor="#A3A3A3"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={submit}
                style={styles.passwordInput}
            />

            {error ? <Text style={styles.inputError}>{error}</Text> : null}

            <TouchableOpacity
                onPress={submit}
                disabled={loading}
                style={styles.loginButton}
            >
                {loading ? (
                    <ActivityIndicator color="#000000"/>
                ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                onPress={submitDemo}
                disabled={loading}
                style={styles.demoLoginButton}
            >
                {loading ? (
                    <ActivityIndicator color="#000000"/>
                ) : (
                    <Text style={styles.demoLoginButtonText}>Demo Login</Text>
                )}
            </TouchableOpacity>

            <View style={styles.bottom}>
                <Text onPress={onForgot} style={styles.bottomLabels}>
                    Forgot password?
                </Text>
                <Text onPress={onSignup} style={styles.bottomLabels}>
                    Sign up
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    login: {
        flex: 1,
        padding: 24,
        gap: 14,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center"
    },
    logo: {
        alignItems: "center",
        marginBottom: 8
    },
    logoIcon: {
        width: 80,
        height: 80,
        borderColor: "#FFFFFF",
        overflow: "hidden",
    },
    logoTitle: {
        color: "#F5A300",
        fontSize: 18,
        marginTop: 6
    },
    signIn: {
        color: "#FFFFFF",
        fontSize: 22,
        justifyContent: "center",
        marginBottom: 8
    },
    emailLabel: {
        color: "#FFFFFF",
        fontSize: 14,
        textAlign: "left",
        width: "70%",
    },
    emailInput: {
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#595959",
        width: "70%",
    },
    passwordLabel: {
        color: "#FFFFFF",
        fontSize: 14,
        marginTop: 6,
        textAlign: "left",
        width: "70%",
    },
    passwordInput: {
        height: 44,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#3A3A3A",
        color: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#595959",
        width: "70%",
    },
    inputError: {
        color: "#FF5A5A",
        fontSize: 12
    },
    loginButton: {
        height: 48,
        borderRadius: 10,
        backgroundColor: "#F5A300",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
        width: "70%",
    },
    demoLoginButton: {
        height: 48,
        borderRadius: 10,
        borderColor: "#F5A300",
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
        width: "70%",
    },
    loginButtonText: {
        color: "#000000",
        fontSize: 18,
        fontWeight: "600"
    },
    demoLoginButtonText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "600"
    },

    bottomLabels: {
        color: "#F5A300",
        fontSize: 13
    },
    bottom: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 24,
        marginTop: 10
    }
});