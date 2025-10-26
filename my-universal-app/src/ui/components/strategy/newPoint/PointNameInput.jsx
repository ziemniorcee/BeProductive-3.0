import {TextInput, View, StyleSheet, Platform} from "react-native";
import Pill from "../../common/Pill";
import Field from "../../common/Field";
import React, {useEffect, useState} from "react";
import * as select from "react-native";
import {useStrategy} from "../../../context/StrategyContext";

export default function PointNameInput({ initialName, onNameChange }) {
    const [localName, setLocalName] = useState(initialName || "");

    const handleChange = (text) => {
        setLocalName(text);  // Update local state (fast)
        onNameChange(text);  // Pass text up to parent (AddNewPointWeb)
    };

    return ( // necessary to save on add New Point exit
        <View style={styles.wrap}>
            <Field label={"New Point Name"}>
                <View collapsable={false}>
                    <TextInput style={styles.root} placeholder={"Enter point name"} onChangeText={handleChange}
                               value={localName}/>
                </View>
            </Field>
        </View>
    )
}

const styles = StyleSheet.create({
    wrap: Platform.select({
        web: {width: 250},
        default: {width: 230, alignSelf: "center"},
    }),
    root: {
        width: select.Platform.select({web: "100%", default: "60%"}),
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
        borderWidth: 2,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        fontSize: 20,
        color: "#000000",
    }

})