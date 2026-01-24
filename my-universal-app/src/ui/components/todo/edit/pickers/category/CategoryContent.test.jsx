import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CategoryContent from "./CategoryContent";

// --- Mocks ---

jest.mock("../common/PickerCore", () => {
    const { View, Button } = require("react-native");
    return ({ onPick }) => (
        <View testID="PickerCore_Mock">
            <Button title="Pick Item" onPress={onPick} />
        </View>
    );
});

jest.mock("./CategoryCreator", () => {
    const { View, Button } = require("react-native");
    return ({ onBack, onSuccess }) => (
        <View testID="CategoryCreator_Mock">
            <Button title="Go Back" onPress={onBack} />
            <Button title="Save Success" onPress={onSuccess} />
        </View>
    );
});

describe("CategoryContent", () => {
    const mockCloseMenu = jest.fn();
    const mockApp = {};
    const mockData = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders PickerCore and the FAB by default", () => {
        const { getByTestId, queryByTestId } = render(
            <CategoryContent
                app={mockApp}
                allCategories={mockData}
                type="test"
                closeMenu={mockCloseMenu}
            />
        );

        expect(getByTestId("PickerCore_Mock")).toBeTruthy();
        expect(getByTestId("CreateCategoryFAB")).toBeTruthy();
        expect(queryByTestId("CategoryCreator_Mock")).toBeNull();
    });

    it("switches to CategoryCreator when FAB is pressed", () => {
        const { getByTestId, queryByTestId } = render(
            <CategoryContent
                app={mockApp}
                allCategories={mockData}
                type="test"
                closeMenu={mockCloseMenu}
            />
        );

        fireEvent.press(getByTestId("CreateCategoryFAB"));

        expect(queryByTestId("PickerCore_Mock")).toBeNull();
        expect(queryByTestId("CreateCategoryFAB")).toBeNull();
        expect(getByTestId("CategoryCreator_Mock")).toBeTruthy();
    });

    it("switches back to PickerCore when 'onBack' is triggered", () => {
        const { getByTestId, queryByTestId, getByText } = render(
            <CategoryContent
                app={mockApp}
                allCategories={mockData}
                type="test"
                closeMenu={mockCloseMenu}
            />
        );

        fireEvent.press(getByTestId("CreateCategoryFAB"));
        fireEvent.press(getByText("Go Back"));

        expect(getByTestId("PickerCore_Mock")).toBeTruthy();
        expect(queryByTestId("CategoryCreator_Mock")).toBeNull();
    });

    it("closes the menu when a category is successfully created", () => {
        const { getByTestId, getByText } = render(
            <CategoryContent
                app={mockApp}
                allCategories={mockData}
                type="test"
                closeMenu={mockCloseMenu}
            />
        );

        fireEvent.press(getByTestId("CreateCategoryFAB"));
        fireEvent.press(getByText("Save Success"));

        expect(mockCloseMenu).toHaveBeenCalledTimes(1);
        expect(getByTestId("PickerCore_Mock")).toBeTruthy();
    });

    it("closes the menu when an item is picked from PickerCore", () => {
        const { getByText } = render(
            <CategoryContent
                app={mockApp}
                allCategories={mockData}
                type="test"
                closeMenu={mockCloseMenu}
            />
        );

        fireEvent.press(getByText("Pick Item"));

        expect(mockCloseMenu).toHaveBeenCalledTimes(1);
    });
});