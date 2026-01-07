import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreenCore from './LoginScreenCore';

// 1. Create a "Mock" App structure
const createMockApp = () => ({
    services: {
        auth: {
            login: jest.fn(), // A spy function to track calls
        }
    },
    start: jest.fn(),
});

describe('LoginScreenCore', () => {

    it('renders correctly', () => {
        const mockApp = createMockApp();
        const { getByText, getByPlaceholderText } = render(<LoginScreenCore app={mockApp} />);

        expect(getByText('Sign in')).toBeTruthy();
        expect(getByPlaceholderText('alice@example.com')).toBeTruthy();
    });

    it('shows error if fields are empty', async () => {
        const mockApp = createMockApp();
        const { getByText } = render(<LoginScreenCore app={mockApp} />);

        fireEvent.press(getByText('Login'));

        await waitFor(() => {
            expect(getByText('Enter email and password')).toBeTruthy();
        });

        expect(mockApp.services.auth.login).not.toHaveBeenCalled();
    });

    it('calls login service with correct data', async () => {
        const mockApp = createMockApp();
        // Mock a successful response
        mockApp.services.auth.login.mockResolvedValueOnce(true);

        const { getByText, getByPlaceholderText } = render(<LoginScreenCore app={mockApp} />);

        // Type email and password
        fireEvent.changeText(getByPlaceholderText('alice@example.com'), 'igor@test.com');
        fireEvent.changeText(getByPlaceholderText('********'), 'password123');

        // Press Login
        fireEvent.press(getByText('Login'));

        // Wait for the async function to finish
        await waitFor(() => {
            expect(mockApp.services.auth.login).toHaveBeenCalledWith({
                email: 'igor@test.com',
                password: 'password123'
            });
        });

        // Ensure app.start() was called
        expect(mockApp.start).toHaveBeenCalled();
    });
});