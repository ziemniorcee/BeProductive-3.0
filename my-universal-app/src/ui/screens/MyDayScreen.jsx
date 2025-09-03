import React from "react";
import {Platform, StyleSheet, Text, View, Pressable, Modal, FlatList} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Image} from "expo-image";
import Vignette from "../components/common/Vignette";
import {Ionicons} from "@expo/vector-icons";
import {TodoItem} from "../components/todo/TodoItem";
import {MyDayProvider} from "../context/MyDayContext";
import EditTaskPanel from "../components/todo/EditTask";

export default function MyDayScreen({app}) {
    const [state, setState] = React.useState(() => app.services.myday.get());

    React.useEffect(() => {
        const unsub = app.services.myday.subscribe(next => setState({...next})); // new ref

        const setup = getSettings();
        const pad = n => String(n).padStart(2, '0');
        const d = new Date();
        const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // YYYY-MM-DD

        app.services.myday.load({
            date: iso,
            queue_order: setup.projectQueue,
            deadlines_order: setup.deadlines,
        });

        return () => unsub?.();
    }, [app]);
    const {goals = [], loading = true, error} = state;

    return (
        <MyDayProvider app={app}>
            <View style={styles.root}>
                <View style={styles.bgLayer} pointerEvents="none">
                    <Image source={require("../../../assets/galaxybg.jpg")} style={styles.bg} contentFit="cover"
                           transition={300}/>
                </View>

                <SafeAreaView style={styles.safe} edges={["top"]}>
                    <View style={styles.header}>
                        <Image source={require("../../../assets/sun.png")} style={styles.headerImage}
                               contentFit="contain"
                               transition={300}/>
                        <Text style={styles.headerTitle}>My Day</Text>
                    </View>

                    <FlatList style={styles.container}
                              data={loading ? [] : goals}
                              keyExtractor={(g) => g.publicId}
                              renderItem={({item}) => <TodoItem goal={item} app={app} style={styles.task}/>}
                              ListEmptyComponent={<Text style={{color: "#fff"}}>Loading…</Text>}
                              ItemSeparatorComponent={() => <View/>}
                              ListFooterComponent={
                                  <View style={styles.inlineActions}>
                                      <Pressable style={[styles.btn]}
                                                 onPress={() => app.view.go("settings")}>
                                          <Ionicons name="settings-sharp" size={25} color="#fff"/>
                                          <Text style={styles.btnText}>Configure</Text>
                                      </Pressable>

                                      <Pressable style={[styles.btn, styles.right]}
                                                 onPress={() => app.services.myday.newTask?.()}>
                                          <Ionicons name="add" size={34} color="#fff"/>
                                          <Text style={styles.btnText}>New task</Text>
                                      </Pressable>
                                  </View>
                              }
                              contentContainerStyle={styles.listContent}
                    />
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
                </SafeAreaView>
                {state.editOpen && (
                    <Vignette window={{rx: 24, width: 0.7, height: 0.8}} pointerEvents="box-none" app={app}>
                        <EditTaskPanel app={app}/>
                    </Vignette>
                )}
            </View>
        </MyDayProvider>
    );
}

function getSettings() {
    return {
        projectQueue: ["d0be79e4-6187-11f0-a08e-42010a400011", "3b4e78dd-687e-11f0-8dfc-42010a400014", "808cd8f5-687f-11f0-8dfc-42010a400014", "465921d0-68a5-11f0-8dfc-42010a400014"],
        deadlines: [],
        project_share: 69,
        deadline_share: 31,
    };
}


const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#000",
        userSelect: "none",

    },
    bgLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
    },
    safe: {
        flex: 1,
    },
    header: {
        top: Platform.select({web: 20, default: -10}),
        marginBottom: Platform.select({web: 20, default: -10}),
        gap: 20,
        height: 56,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: "600",
        color: "#fff",
    },
    container: {
        flex: 1,
        padding: 24,
    },
    headerImage: {
        width: 40,
        height: 40,
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
