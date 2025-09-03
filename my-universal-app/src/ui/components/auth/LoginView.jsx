import React, {PureComponent} from "react";
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet} from "react-native";
import {Image} from "expo-image";

export default class LoginView extends PureComponent {
    state = { email: '', password: '', loading: false, error: null };
    submit = async () => {
        const { app } = this.props;
        const {email, password} = this.state;
        if (!email || !password) return this.setState({error: "Enter email and password"});
        this.setState({loading: true, error: ""});
        let [is_logged, error] = await app.services.auth.login({email: email, password: password})
        if (is_logged){
            app.view.go("myday")
        } else {
            this.setState({error: error, loading: false});
        }
    };

    render() {
        const {email, password, loading, error} = this.state;

        return (
            <View style={styles.login}>
                {/* Logo + brand */}
                <View style={styles.logo}>
                    <Image source={require('../../../../assets/phoenix.png')} style={styles.logoIcon} contentFit="cover"/>
                    <Text style={styles.logoTitle}>BeProductive</Text>
                </View>

                <Text style={styles.signIn}>Sign in</Text>

                <Text style={styles.emailLabel}>Email</Text>
                <TextInput
                    value={email}
                    onChangeText={(t) => this.setState({email: t})}
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
                    onChangeText={(t) => this.setState({password: t})}
                    placeholder="********"
                    placeholderTextColor="#A3A3A3"
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={this.submit}
                    style={styles.passwordInput}
                />

                {error ? <Text style={styles.inputError}>{error}</Text> : null}

                <TouchableOpacity
                    onPress={this.submit}
                    disabled={loading}
                    style={styles.loginButton}
                >
                    {loading ? (
                        <ActivityIndicator color="#000000"/>
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottom}>
                    <Text onPress={this.props.onForgot} style={styles.bottomLabels}>
                        Forgot password?
                    </Text>
                    <Text onPress={this.props.onSignup} style={styles.bottomLabels}>
                        Sign up
                    </Text>
                </View>
            </View>
        );
    }
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
    loginButtonText: {
        color: "#000000",
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
})