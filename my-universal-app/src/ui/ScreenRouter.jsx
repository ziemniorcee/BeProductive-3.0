import React from "react";
import { LoginScreen } from "./screens/LoginScreen";
import MyDayScreen from "./screens/MyDayScreen";
// import { TodoScreen } from "./screens/TodoScreen";

const registry = {
    login: LoginScreen,
    myday: MyDayScreen,
};

export function ScreenRouter({ view, app }) {
    const Cmp = registry[view.screen] ?? LoginScreen;
    return <Cmp app={app} {...view.props} />;
}
