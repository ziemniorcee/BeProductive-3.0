import React from "react";
import { LoginScreen } from "./screens/LoginScreen";
import MyDayScreen from "./screens/MyDayScreen";
import NowScreen from "./screens/NowScreen";
import InboxScreen from "./screens/InboxScreen";
import DayScreen from "./screens/DayScreen";
import MonthScreen from "./screens/MonthScreen";
import StrategyScreen from "./screens/StrategyScreen";

const registry = {
    login: LoginScreen,
    myday: MyDayScreen,
    now: NowScreen,
    inbox: InboxScreen,
    day:DayScreen,
    month: MonthScreen,
    strategy: StrategyScreen,
};

export function ScreenRouter({ view, app }) {
    const Cmp = registry[view.screen] ?? LoginScreen;
    return <Cmp app={app} {...view.props} />;
}
