// WhenPickerContent.jsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import {useMyDay} from "../../../../../context/MyDayContext";

const toISO = d =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const toLocalISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`; // "YYYY-MM-DD"
};

const parseInputDate = (v) => {
    if (v instanceof Date && !isNaN(v)) return v;
    if (typeof v === "number") { const d = new Date(v); return isNaN(d) ? null : d; }
    if (typeof v === "string") {
        // accept 'YYYY-MM-DD' or any parsable ISO
        const s = v.length === 10 ? `${v}T00:00:00` : v;
        const d = new Date(s);
        return isNaN(d) ? null : d;
    }
    return null;
};

export default function DatePickerContent({ current, onPick = () => {} }) {
    const {patchEdit} = useMyDay();
    const today = new Date();
    const base = parseInputDate(current) ?? today;
    const selectedISO = toISO(base);

    const select = React.useCallback((change) => {
        console.log(change)
        const iso = typeof change === "string" ? change.slice(0, 10) : toLocalISO(change);
        console.log(iso)
        patchEdit({ addDate: iso });
        onPick?.(iso);
    }, [patchEdit, "addDate", onPick]);

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                <Pressable style={styles.btn} onPress={() => select(today)}>
                    <Text style={styles.btnTxt}>Today</Text>
                </Pressable>
                <Pressable style={styles.btn} onPress={() => {
                    const t = new Date(); t.setDate(t.getDate()+1); select(t);
                }}><Text style={styles.btnTxt}>Tomorrow</Text></Pressable>
            </View>

            <Calendar
                initialDate={selectedISO}
                firstDay={1}
                onDayPress={d => select(new Date(d.dateString))}
                markedDates={{ [selectedISO]: { selected: true } }}
                style={styles.cal}
                theme={{
                    calendarBackground: "transparent",
                    dayTextColor: "#fff",
                    todayTextColor: "#ffcc00",
                    monthTextColor: "#fff",
                    selectedDayBackgroundColor: "#2979FF",
                    selectedDayTextColor: "#fff",
                    arrowColor: "#fff"
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { gap: 12 },
    row: { flexDirection: "row", gap: 12, justifyContent: "center" },
    btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#444" },
    btnTxt: { color: "#fff", fontSize: 16 },
    cal: { borderRadius: 12, overflow: "hidden" }
});
