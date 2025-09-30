import React from "react";
import ScreenCore from "../components/todo/common/ScreenCore";
import {MyDayProvider} from "../context/MyDayContext";
import {FlatList, Platform, Pressable, StyleSheet, Text, View} from "react-native";
import {Image} from "expo-image";
import TodoHeader from "../components/todo/common/TodoHeader";
import {TodoItem} from "../components/todo/list/TodoItem";
import {Ionicons} from "@expo/vector-icons";
import AppBar from "../components/common/appBar/AppBar";
import EditTask from "../components/todo/edit/EditTask";
import {SafeAreaView} from "react-native-safe-area-context";
import MonthCalendar from "../components/todo/month/MonthCalendar";

export default function MonthScreen({app}) {
    const [state, setState] = React.useState(() => app.services.myday.get());
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');

    React.useEffect(() => {
        const unsub = app.services.myday.subscribe(next => setState({...next})); // new ref

        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

        app.services.myday.load({
            type: "Month",
            dates: [toISO(firstDay), toISO(lastDay)],
        });

        return () => unsub?.();
    }, [app]);
    const {goals = [], loading = true, error} = state;

    const y = now.getFullYear();
    const m = now.getMonth();

    const toISODate = (y, m0, d) => `${y}-${pad(m0 + 1)}-${pad(d)}`;

    return (
        <MyDayProvider app={app}>
            <View style={styles.root}>
                <View style={styles.bgLayer} pointerEvents="none">
                    <Image source={require("../../../assets/galaxybg.jpg")} style={styles.bg} contentFit="cover"
                           transition={300}/>
                </View>
                <SafeAreaView style={styles.safe} edges={["top"]}>
                    <TodoHeader type="Month" app={app} date={toISODate(y, m, 1)}/>
                    <AppBar/>
                    <View style={{ flex: 1, minHeight: 0 }}>
                        <MonthCalendar
                            app={app}
                            year={y}
                            month={m}
                            tasks={goals}
                            onDayPress={(day) => app.view.go("day", { date: toISODate(y, m, day) })}
                        />
                    </View>
                    {state.editOpen && (
                        <EditTask state={state} app={app} closeEdit={() => patchEdit({editOpen: false})}/>
                    )}
                </SafeAreaView>
            </View>
        </MyDayProvider>
    )
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
})