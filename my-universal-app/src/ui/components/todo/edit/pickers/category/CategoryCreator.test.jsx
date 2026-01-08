import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import CategoryCreator from './CategoryCreator';

// --- Mocks ---

// 1. Mock Platform to avoid specific OS issues during test
jest.mock('react-native/Libraries/Utilities/Platform', () => {
    const Platform = jest.requireActual('react-native/Libraries/Utilities/Platform');
    Platform.OS = 'android'; // Default to mobile for standard behavior
    Platform.select = (objs) => objs.default || objs.android || {};
    return Platform;
});

describe('<CategoryCreator />', () => {
    const mockOnBack = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<CategoryCreator onBack={mockOnBack} onSuccess={mockOnSuccess} />);

        // Check for Static Elements
        expect(screen.getByText('Create Category')).toBeTruthy();
        expect(screen.getByText('Name')).toBeTruthy();
        expect(screen.getByText('Color')).toBeTruthy();
        expect(screen.getByPlaceholderText('Category Name...')).toBeTruthy();

        // Check for Button
        expect(screen.getByText('Save Category')).toBeTruthy();
    });

    it('handles name input correctly', () => {
        render(<CategoryCreator onBack={mockOnBack} onSuccess={mockOnSuccess} />);

        const input = screen.getByPlaceholderText('Category Name...');

        // Type into the input
        fireEvent.changeText(input, 'Work');

        // Verify value prop updates (implicitly via render)
        expect(input.props.value).toBe('Work');
    });

    it('calls onBack when the back arrow is pressed', () => {
        render(<CategoryCreator onBack={mockOnBack} onSuccess={mockOnSuccess} />);

        const backButton = screen.getByText('←');
        fireEvent.press(backButton);

        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onSuccess if name is empty', () => {
        render(<CategoryCreator onBack={mockOnBack} onSuccess={mockOnSuccess} />);

        const saveButton = screen.getByText('Save Category');

        // Press save without typing anything
        fireEvent.press(saveButton);

        expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('calls onSuccess when name is valid and save is pressed', () => {
        render(<CategoryCreator onBack={mockOnBack} onSuccess={mockOnSuccess} />);

        // 1. Enter Name
        const input = screen.getByPlaceholderText('Category Name...');
        fireEvent.changeText(input, 'Personal');

        // 2. Press Save
        const saveButton = screen.getByText('Save Category');
        fireEvent.press(saveButton);

        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    /* * Note on Color Slider Testing:
     * Testing the PanResponder and layout measurement in a unit test environment (Jest)
     * is extremely difficult because `measure` returns undefined/zeros in Node.js,
     * and physical gestures are hard to simulate.
     * * Below is a "Smoke Test" just to ensure the slider components render
     * without crashing.
     */
    it('renders the color slider elements', () => {
        render(<CategoryCreator onBack={mockOnBack} onSuccess={mockOnSuccess} />);

        // Check if the initial Hex code is displayed (First color in spectrum is #ff0000)
        expect(screen.getByText('#ff0000')).toBeTruthy();
    });
});