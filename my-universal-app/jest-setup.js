/* jest-setup.js */
import 'react-native-gesture-handler/jestSetup';

// Mock expo-image
jest.mock("expo-image", () => {
    const { View } = require("react-native");
    return {
        Image: (props) => {
            return <View testID="mock-expo-image" {...props} />;
        },
    };
});

// Mock screen orientation
jest.mock("expo-screen-orientation", () => ({
    lockAsync: jest.fn(),
    OrientationLock: {
        PORTRAIT_UP: "PORTRAIT_UP",
    },
}));

