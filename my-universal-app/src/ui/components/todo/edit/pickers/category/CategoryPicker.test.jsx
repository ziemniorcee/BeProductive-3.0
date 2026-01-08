import React from "react";
import { render } from "@testing-library/react-native";
import CategoryPicker from "./CategoryPicker";

// --- Mocks ---

// Mock EditPicker
jest.mock("../common/EditPicker", () => {
    const { View, Text } = require("react-native");
    return ({ children, label, current }) => (
        <View testID="EditPicker_Mock">
            <Text testID="EditPicker_Label">{label}</Text>
            <Text testID="EditPicker_CurrentName">{current.name}</Text>
            <Text testID="EditPicker_CurrentColor">{current.color}</Text>
            {children({ closeMenu: jest.fn() })}
        </View>
    );
});

// Mock CategoryContent
jest.mock("./CategoryContent", () => {
    const { View } = require("react-native");
    return (props) => (
        <View
            testID="CategoryContent_Mock"
            accessibilityLabel={JSON.stringify(props.allCategories)}
        />
    );
});

describe("CategoryPicker", () => {
    let mockApp;
    const mockCategoriesData = {
        cat1: { id: "cat1", name: "Work", color: "blue" },
        cat2: { id: "cat2", name: "Home", color: "red" },
    };

    beforeEach(() => {
        mockApp = {
            services: {
                categories: {
                    colorByPublicId: jest.fn(),
                    nameByPublicId: jest.fn(),
                    get: jest.fn().mockReturnValue({ byPublicId: mockCategoriesData }),
                },
            },
        };
    });

    it("renders the EditPicker with correct label and current selection", () => {
        mockApp.services.categories.colorByPublicId.mockReturnValue("blue");
        mockApp.services.categories.nameByPublicId.mockReturnValue("Work");

        const { getByTestId } = render(<CategoryPicker app={mockApp} id="cat1" />);

        expect(getByTestId("EditPicker_Label")).toHaveTextContent("Category");
        expect(getByTestId("EditPicker_CurrentName")).toHaveTextContent("Work");
        expect(getByTestId("EditPicker_CurrentColor")).toHaveTextContent("blue");
    });

    it("prepares 'allCategories' by merging 'No category' with service data", () => {
        mockApp.services.categories.colorByPublicId.mockReturnValue("#FFFFFF");
        mockApp.services.categories.nameByPublicId.mockReturnValue("No category");

        const { getByTestId } = render(<CategoryPicker app={mockApp} id={null} />);

        const contentComponent = getByTestId("CategoryContent_Mock");
        const passedCategories = JSON.parse(contentComponent.props.accessibilityLabel);

        expect(passedCategories).toHaveProperty("noneCategory");
        expect(passedCategories.noneCategory.name).toBe("No category");
        expect(passedCategories).toHaveProperty("cat1");
        expect(passedCategories.cat1.name).toBe("Work");
    });

    it("handles null/undefined ID gracefully (Default state)", () => {
        mockApp.services.categories.colorByPublicId.mockReturnValue("#FFFFFF");
        mockApp.services.categories.nameByPublicId.mockReturnValue("No category");

        const { getByTestId } = render(<CategoryPicker app={mockApp} id={null} />);

        expect(getByTestId("EditPicker_CurrentName")).toHaveTextContent("No category");
    });
});