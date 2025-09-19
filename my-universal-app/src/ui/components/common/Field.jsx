import React from "react";
import { View, Text } from "react-native";

const Field = React.forwardRef(({ label, children, style, ...p }, ref) => (
    <View ref={ref} {...p} style={[{ marginBottom: 18, width: 250 }, style]}>
        <Text style={{ color: "#fff", opacity: 0.9, fontSize: 18, textAlign: "center", marginBottom: 8 }}>{label}</Text>
        {children}
    </View>
));
export default Field;