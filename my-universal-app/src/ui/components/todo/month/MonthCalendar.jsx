// MonthCalendar.js
import React from "react";
import {View, Text, StyleSheet, Pressable, Platform} from "react-native";
import Svg, {Defs, LinearGradient as SvgLinearGradient, Stop, Rect, SvgXml} from "react-native-svg";
import {PRIORITY, priorityColor, taskTypeIcon} from "../../../theme/tokens";
import {useMyDay} from "../../../context/MyDayContext";

function EventPill({app, task}) {
    const [size, setSize] = React.useState({w: 0, h: 0});
    const gradId = React.useRef(`g${Math.random().toString(36).slice(2)}`).current;
    const STROKE = 1.5;
    const R = 6;
    const {openEdit} = useMyDay();

    const gradFrom = priorityColor(task.importance);
    const gradTo = app.services.categories?.colorByPublicId?.(task.categoryPublicId, "#3C3C3C") ?? "#3C3C3C";

    const xml = taskTypeIcon(task.dateType);
    const isWeb = Platform.OS === "web";

    return (
        <Pressable onPress={() => openEdit(task.publicId)}>
            <View
                style={styles.eventPill}
                onLayout={(e) => {
                    const {width, height} = e.nativeEvent.layout;
                    if (width !== size.w || height !== size.h) setSize({w: width, h: height});
                }}
            >
                <Text
                    style={styles.eventText}
                    numberOfLines={Platform.select({"web":1, "default":2})}
                    ellipsizeMode="tail"
                >
                    {task.name}
                </Text>

                {isWeb && (
                    <View style={styles.iconWrap}>
                        <SvgXml xml={xml} width={14} height={14} color={"#FFFFFF"}/>
                    </View>
                )}


                {size.w > STROKE && size.h > STROKE && (
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        <Svg width={size.w} height={size.h} pointerEvents="none">
                            <Defs>
                                <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                                    <Stop offset="0%" stopColor={gradFrom || "#ff2d55"}/>
                                    <Stop offset="25%" stopColor="transparent"/>
                                    <Stop offset="60%" stopColor="transparent"/>
                                    <Stop offset="100%" stopColor={gradTo || "#7b7b7b"}/>
                                </SvgLinearGradient>
                            </Defs>
                            <Rect
                                x={STROKE / 2}
                                y={STROKE / 2}
                                width={size.w - STROKE}
                                height={size.h - STROKE}
                                rx={R - STROKE / 2}
                                fill="none"
                                stroke={`url(#${gradId})`}
                                strokeWidth={STROKE}
                                vectorEffect="non-scaling-stroke"
                            />
                        </Svg>
                    </View>
                )}
            </View>
        </Pressable>

    );
}

const HEX = {
    bg: "#0f0f10",
    bgEmpty: "#0b0b0c",
    grid: "#262626",
    text: "#d6d6d6",
    sub: "#8a8a8a",
    today: "#FFFFFF",
    pillBg: "#141414",
};

const WDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function buildCells(year, month) {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const mondayIdx = (first.getDay() + 6) % 7; // 0=Mon
    const cells = [];
    for (let i = 0; i < mondayIdx; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    if (cells.length < 35) while (cells.length < 35) cells.push(null);
    return cells;
}

export default function MonthCalendar({
                                          app, year, month, tasks = [], onDayPress = () => {
    }, style
                                      }) {
    const cells = React.useMemo(() => buildCells(year, month), [year, month]);

    const eventMap = React.useMemo(() => {
        const m = new Map();
        for (const e of tasks) {
            const [y, mm, dd] = String(e.addDate || "").slice(0, 10).split("-").map(n => parseInt(n, 10));
            if (y === year && mm - 1 === month) {
                if (!m.has(dd)) m.set(dd, []);
                m.get(dd).push(e);
            }
        }
        return m;
    }, [tasks, year, month]);

    const today = new Date();
    const isToday = (d) =>
        d &&
        today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === d;

    // rows = 5 or 6
    const rows = Math.ceil(cells.length / 7);

    return (
        <View style={[styles.wrap, style]}>
            {/* weekday header */}
            <View style={styles.headerRow}>
                {WDAYS.map((w) => (
                    <View key={w} style={styles.headerCell}>
                        <Text style={styles.headerText}>{Platform.select({"web":w, "default":w[0]})}</Text>
                    </View>
                ))}
            </View>

            {/* grid fills remaining height */}
            <View style={styles.grid}>
                {Array.from({length: rows}, (_, r) => {
                    const slice = cells.slice(r * 7, r * 7 + 7);
                    return (
                        <View key={r} style={styles.row}>
                            {slice.map((d, i) => {
                                const dayEvents = d ? eventMap.get(d) || [] : [];
                                return (
                                    <Pressable
                                        key={i}
                                        disabled={!d}
                                        onPress={() => d && onDayPress(d)}
                                        style={[
                                            styles.cell,
                                            !d && styles.empty,
                                            isToday(d) && styles.today,
                                        ]}
                                    >
                                        <View style={styles.dayRow}>
                                            <Text style={[styles.dayNum, !d && styles.dayNumDim]}>
                                                {d ? String(d).padStart(2, "0") : ""}
                                            </Text>
                                            {isToday(d) && <Text style={styles.todayBadge}>Today</Text>}
                                        </View>

                                        <View style={styles.eventsCol}>
                                            {dayEvents.map((e) => (
                                                <EventPill
                                                    key={e.publicId}
                                                    task={e}
                                                    app={app}
                                                />
                                            ))}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {flex: 1, paddingHorizontal: 12, paddingBottom: 12, minHeight: 0},
    headerRow: {flexDirection: "row", marginBottom: 6},
    headerCell: {flexBasis: "14.2857%", padding: 6, },
    headerText: {color: HEX.sub, fontSize: 12, textAlign: Platform.select({web:"left", default: "center"})},

    grid: {flex: 1, minHeight: 0},
    row: {flexDirection: "row", flex: 1, minHeight: 0},

    cell: {
        flex: 1,
        borderWidth: 1,
        borderColor: HEX.grid,
        backgroundColor: "transparent",
    },
    empty: {backgroundColor: HEX.bgEmpty, visibility: "hidden"},
    today: {borderColor: HEX.today, borderWidth: 2},

    dayRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: Platform.select({web:"space-between", default: "center"}),
    },
    dayNum: {color: HEX.text, fontSize: Platform.select({web: 12, default: 12})},
    dayNumDim: {color: "#555555"},
    todayBadge: {color: HEX.today, fontSize: 11},

    eventsCol: {marginTop: 6, gap: 6},
    eventPill: {
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#141414",
        borderRadius: 6,
        paddingVertical: 2,
        paddingHorizontal: 6,
        gap: 6,
    },
    eventText: {
        color: "#d6d6d6",
        fontSize: 12,
        flexGrow: 1,
        flexShrink: 1,
        minWidth: 0,        // critical on web for ellipsis
    },
    iconWrap: {
        flexShrink: 0,      // icon never shrinks away
        alignItems: "center",
        justifyContent: "center",
    },
    eventBar: {width: 3, height: 12, borderRadius: 2},

});
