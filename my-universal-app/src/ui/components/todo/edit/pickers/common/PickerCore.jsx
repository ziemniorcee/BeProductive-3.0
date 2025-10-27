import {FlatList, Platform, StyleSheet, View} from "react-native";
import Pill from "../../../../common/Pill";
import React from "react";
import {useMyDay} from "../../../../../context/MyDayContext";
import {useStrategy} from "../../../../../context/StrategyContext";

export default function PickerCore({app, src, type, onPick}){
    const [open, setOpen] = React.useState(false);
    const currentScreen = app.view.current().screen

    let pickerChangeFunction = null
    console.log(currentScreen, "currentScreen")
    if (currentScreen === "myday"){
        const {patchEdit} = useMyDay();

        pickerChangeFunction = patchEdit
    }
    else if (currentScreen === "strategy"){
        const {patchNewPoint} = useStrategy();

        pickerChangeFunction = patchNewPoint
    }


    const select = React.useCallback((change) => {
        const id = change.publicId ?? change.id ?? change.level ?? change.type ?? null;
        console.log(change)
        pickerChangeFunction({[type]: id});
        onPick?.(change);
    }, [pickerChangeFunction, type, onPick]);

    const items = React.useMemo(() => {
        return Array.isArray(src) ? src : Object.values(src ?? {});
    }, [app]);


    return (
        <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={items}
            keyExtractor={(it, i) => String(it.publicId ?? it.id ?? it.level ?? it.type ?? i)}
            ItemSeparatorComponent={() => <View style={styles.sep}/>}
            renderItem={({item}) => {
                let color = item.color
                let icon = null
                let name = item.name

                if (type === "projectPublicId") {
                    color = app.services.categories.colorByPublicId(item.categoryPublicId)
                    icon = app.services.projects.iconByPublicId(item.publicId)
                } else if (type === "dateType" ) {
                    icon = item.icon
                }

                return (
                    <Pill
                        style={{ width: Platform.select({web: '100%', default:'90%'}) }}
                        text={name}
                        border={color ?? "#FFFFFF"}
                        onPress={() => select(item)}
                        icon={icon}
                    />
                )
            }}
        />
    )
}

const styles = StyleSheet.create({
    wrap: {width: 250},
    popup: {position: "absolute"},
    card: {position: "relative"},
    list: {
        width: "100%",
        maxHeight: 500,
        ...(Platform.OS === "web" ? {
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#2A2A2A #000000",
            scrollbarGutter: "stable",
        } : null),
    },
    listContent: {paddingRight: 5},
    sep: {height: 15},
    selected: {borderWidth: 3, opacity: 0.9},
});
