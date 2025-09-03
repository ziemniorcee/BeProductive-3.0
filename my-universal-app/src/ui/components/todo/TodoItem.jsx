import {Platform, Pressable, StyleSheet, Text, View} from "react-native";
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient, Path } from "react-native-svg";
import { LinearGradient as BgGradient } from "expo-linear-gradient";
import { SvgXml } from "react-native-svg";
import {Image} from "expo-image";
import React from "react";
import {CheckboxStep} from "./CheckboxStep";
import {BlurView} from "expo-blur";
import {CheckboxMain} from "./CheckboxMain";
import {useMyDay} from "../../context/MyDayContext";
import {priorityColor} from "../../theme/tokens";

const STROKE = 3
const R = 12

const ICONS = {
    date: require("../../../../assets/todo/dateWarning.png"),
    deadline1: require("../../../../assets/todo/hourglass.png"),
    deadline2: require("../../../../assets/todo/hourglass2.png"),
    asap: require("../../../../assets/todo/fire1.png"),
};


const pad2 = n => String(n).padStart(2, "0");
const todayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const pickLabel = (dateType, addDate, iso) => {
    if (dateType === 0 && addDate) return ICONS.date;
    if (dateType === 1) return addDate === iso ? ICONS.deadline1 : ICONS.deadline2;
    if (dateType === 2) return ICONS.asap;
    return null;
};

export function TodoItem({ goal, app }) {
    const { onToggleMain , onToggleStep, openEdit} = useMyDay();

    const [size, setSize] = React.useState({ w: 0, h: 0 });

    const importanceColor = React.useMemo(
        () => (goal.dateType === 2 ? priorityColor(4) : priorityColor(goal.importance)),
        [goal.dateType, goal.importance]
    );

    const categoryColor = React.useMemo(
        () =>
            goal.categoryPublicId
                ? app.services.categories?.colorByPublicId?.(goal.categoryPublicId, "#3C3C3C") ?? "#3C3C3C"
                : "#3C3C3C",
        [goal.categoryPublicId, app.services.categories]
    );

    const project = React.useMemo(
        () => (goal.projectPublicId ? app.services.projects?.getByPublicId?.(goal.projectPublicId) ?? null : null),
        [goal.projectPublicId, app.services.projects]
    );

    const xml = React.useMemo(() => {
        const icon = project?.svgIcon;
        return typeof icon === "string" ? icon.trim() : null;
    }, [project]);

    const gradId = `grad-${goal.publicId}`;

    const label = React.useMemo(() => pickLabel(goal.dateType, goal.addDate, todayIso()), [goal.dateType, goal.addDate]);

    return (
        <Pressable
            style={styles.wrap}
            onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                setSize(s => (s.w === width && s.h === height ? s : { w: width, h: height }));
            }}
            onPress={() => openEdit(goal.publicId)}
        >
            <View style={styles.cardBgClip} pointerEvents="none">
                <BlurView intensity={10} tint="dark" style={styles.cardBg} pointerEvents="none" />
                <BgGradient
                    colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.35)"]}
                    style={styles.cardBg}
                    pointerEvents="none"
                />
            </View>
            <View style={styles.inner}>
                <CheckboxMain checked={goal.checkState} color={importanceColor}
                              onPress={() => onToggleMain(goal.publicId, !goal.checkState)}></CheckboxMain>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.titleText, goal.checkState && styles.titleDone]}>
                        {goal.name}
                        {label ? <Image source={label} contentFit="cover"
                                style={styles.label}></Image>: null}
                    </Text>

                    <View style={styles.stepsContainer}>
                        {goal.steps?.map(s => (
                            <View key={s.publicId} style={styles.subRow} selectable={false}>
                                <CheckboxStep checked={s.stepCheck} color={importanceColor}
                                              onPress={() => onToggleStep(goal.publicId, s.publicId, !s.stepCheck)} />
                                <Text style={[styles.subText, s.stepCheck && styles.subDone]}
                                      numberOfLines={1}>{s.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                {xml ? (
                    <View style={styles.iconTopCenter} pointerEvents="none">
                        <SvgXml xml={xml} width={Platform.select({ web: 30, default: 20 })} height={Platform.select({ web: 30, default: 20 })} color={categoryColor} />
                    </View>
                ) : null}
            </View>

            {size.w > STROKE && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Svg width={size.w} height={size.h} pointerEvents="none">
                        <Defs>
                            <SvgLinearGradient  id={gradId} x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0%" stopColor={importanceColor} />
                                <Stop offset="25%" stopColor="transparent" />
                                <Stop offset="60%" stopColor="transparent" />
                                <Stop offset="100%" stopColor={categoryColor} />
                            </SvgLinearGradient >
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
        </Pressable>
    );
}


const styles = StyleSheet.create({
    wrap: {
        position: "relative",
        width: Platform.select({ web: "60%", default: "120%" }),
        alignSelf: "center",
        marginBottom: Platform.select({ web: 12, default: 8 }),
        overflow: "hidden",

    },
    inner: {
        minHeight: Platform.select({ web: 50, default: 30 }),
        paddingVertical: Platform.select({ web: 4, default: 4 }),
        width: "100%",
        borderRadius: 10,
        paddingHorizontal: 8,
        alignItems: "flex-start",
        flexDirection: "row",
        backgroundColor: "transparent",
    },
    circle: {
        width: Platform.select({ web: 28, default: 20 }),
        height: Platform.select({ web: 28, default: 20 }),
        borderRadius: 90,
        borderWidth: Platform.select({ web: 3, default: 2 }),
        marginRight: Platform.select({ web: 12, default: 6 }),
        backgroundColor: "transparent",
        marginLeft: 6,
        marginTop: Platform.select({ web: 6, default: 7 }),
    },
    titleText: {
        marginLeft: 3,
        color: "#fff",
        fontSize: Platform.select({ web: 20, default: 15 }),
        fontWeight: "500",
        marginTop: 6,
    },
    title: {
        flexDirection: "row",
        alignItems: "center",
    },
    titleDone: {
        textDecorationLine: "line-through",
        color: "#888",
    },
    stepsContainer: {
        marginBottom: 10,
        marginLeft: 4,
    },
    subRow: {
        marginTop: Platform.select({ web: 8, default: 0 }),
        flexDirection: "row",
        alignItems: "center",
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
    iconTopCenter: {
        position: "absolute",
        right: 8,
        top: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
    },
    cardBg: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 10,
    },
    // used by Checkbox inside TodoItem
    box: {
        width: Platform.select({ web: 20, default: 16 }),
        height: Platform.select({ web: 20, default: 16 }),
        borderWidth: 2,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        height:Platform.select({ web: 20, default: 15 }),
        width:Platform.select({ web: 20, default: 15 }),
        marginLeft:6,
        verticalAlign: "middle",
        position:"relative",
        transform: [
            { translateY: Platform.select({ web: -2, default: 3 }) },
            { translateX: Platform.select({ web: 0,  default: 10 }) },
        ],
    },
    cardBgClip: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
        overflow: "hidden"
    },
});
