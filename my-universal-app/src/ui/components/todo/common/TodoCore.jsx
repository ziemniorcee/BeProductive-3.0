import {MyDayProvider} from "../../../context/MyDayContext";
import {FlatList, Pressable, Text, View, StyleSheet, Platform, useWindowDimensions} from "react-native";
import {Image} from "expo-image";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import TodoHeader from "./TodoHeader";
import {TodoItem} from "../list/TodoItem";
import {Ionicons} from "@expo/vector-icons";
import AppBar from "../../common/appBar/AppBar";
import EditTask from "../edit/EditTask";
import React from "react";
import MyDaySetup from "../myDaySetup/MyDaySetup";

export default function TodoCore({app, type, date, goals, loading, state}) {
    const {height} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const nativeMaxH = Math.max(0, height - 130 - insets.top - insets.bottom);

    return (
        <MyDayProvider app={app}>
            <View style={styles.root}>
                <View style={styles.bgLayer} pointerEvents="none">
                    <Image source={require("../../../../../assets/galaxybg.jpg")} style={styles.bg} contentFit="cover"
                           transition={300}/>
                </View>

                <SafeAreaView style={styles.safe} edges={["top"]}>
                    <TodoHeader type={type} app={app} date={date}/>

                    <View style={styles.body}>
                    <FlatList style={[
                        styles.container,
                        Platform.OS !== "web" && {maxHeight: nativeMaxH},
                    ]}
                              data={loading ? [] : goals}
                              keyExtractor={(g) => g.publicId}
                              renderItem={({item}) => <TodoItem goal={item} app={app} style={styles.task}/>}
                              ListEmptyComponent={<Text style={{color: "#fff"}}>Loading…</Text>}
                              ItemSeparatorComponent={() => <View/>}
                              ListFooterComponent={
                                  <View style={styles.inlineActions}>
                                      <Pressable style={[styles.btn]}
                                                 onPress={() => app.services.myday.openMyDaySetup()}>
                                          <Ionicons name="settings-sharp" size={25} color="#fff"/>
                                          <Text style={styles.btnText}>Configure</Text>
                                      </Pressable>

                                      <Pressable style={[styles.btn, styles.right]}
                                                 onPress={() => app.services.myday.openEdit()}>
                                          <Ionicons name="add" size={34} color="#fff"/>
                                          <Text style={styles.btnText}>New task</Text>
                                      </Pressable>
                                  </View>
                              }
                              contentContainerStyle={styles.listContent}
                    />
                    </View>
                    <AppBar app={app} horizontal={true}/>
                    <Pressable
                        style={styles.test}
                        hitSlop={10}
                        onPress={async () => {
                            await app.services.auth.clear_token?.();
                            app.view.go("login");
                        }}
                    >
                        <Text>T</Text>
                    </Pressable>
                    {state.editOpen && (
                        <EditTask state={state} app={app} closeEdit={() => app.services.myday.closeEdit()}/>
                    )}

                    {state.myDaySetupOpen && (
                        <MyDaySetup state={state} app={app} closeSetup={() => app.services.myday.closeMydaySetup()}/>
                    )}
                </SafeAreaView>

            </View>
        </MyDayProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#000",
        userSelect: "none",
        minHeight: 0,
    },
    bgLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
    },
    safe: {
        flex: 1,
        minHeight: 0,
    },
    body: { flex: 1, minHeight: 0 },
    container: {
        flex: 1,
        padding: 24,
        minHeight:"80%",
        overflowY: 'hidden',
        overscrollBehavior: 'contain',
        scrollBehavior: 'smooth',
        scrollbarWidth: "thin",
        scrollbarColor: "#2A2A2A #000000",
        scrollbarGutter: "stable",

    },

    wrap: {
        position: "relative",
        width: Platform.select({web: "60%", default: "120%"}),
        alignSelf: "center",
        marginBottom: Platform.select({web: 12, default: 8}),
    },
    inner: {
        minHeight: Platform.select({web: "50", default: "30px"}),
        paddingVertical: Platform.select({web: 4, default: 4}),
        width: "100%",
        borderRadius: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 8,
        alignItems: "flex-start",
        flexDirection: "row",
    },
    circle: {
        width: Platform.select({web: "28px", default: "20"}),
        height: Platform.select({web: "28px", default: "20"}),
        borderRadius: 90,
        borderWidth: Platform.select({web: 3, default: 2}),
        marginRight: Platform.select({web: 12, default: 6}),
        backgroundColor: "transparent",
        marginLeft: 6,
        marginTop: Platform.select({web: 6, default: 7}),
    },
    test: {
        position: "absolute",
        bottom: 0,
        width: 15,
        height: 15,
        backgroundColor: "red",
        cursor: "pointer",
    },
    subText: {
        marginLeft: 10,
        color: "#fff",
        fontSize: 16,
    },
    subDone: {
        color: "#8E8E8E",
        textDecorationLine: "line-through",
    },
    subRow: {
        marginTop: Platform.select({web: 8, default: 0}),
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        marginLeft: 3,
        color: "#fff",
        fontSize: Platform.select({web: 20, default: 15}),
        fontWeight: "500",
        marginTop: 6,
    },
    iconTopCenter: {
        position: "absolute",
        right: 8,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    stepsContainer: {
        marginBottom: 10,
        marginLeft: 4,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",

    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,

    },
    inlineActions: {
        flexDirection: "row",
        width: Platform.select({web: "60%", default: "120%"}),
        alignSelf: "center",
        gap: Platform.select({web: 30, default: 20}),

    },
    btn: {
        maxWidth: Platform.select({web: 300}),
        minWidth: Platform.select({web: 200}),
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 2,
        backgroundColor: "rgba(0,0,0,0.5)",
        borderColor: "#FFFFFF",
    },
    btnText: {
        color: "#fff",
        fontSize: Platform.select({web: 20, default: 14}),
        fontWeight: "700",
        marginLeft: 8,
    },
    right: {
        marginLeft: "auto",
    },
    cardBg: {...StyleSheet.absoluteFillObject},
});
