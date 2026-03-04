import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Header from '../../../components/Header/Header';
import userEvent from '@testing-library/user-event';

// Mock context hooks
const mockUseAuth = vi.fn();
const mockUseApp = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('../../../context/AppContext', () => ({
    useApp: () => mockUseApp(),
}));

vi.mock('../../../context/ThemeContext', () => ({
    useTheme: () => mockUseTheme(),
}));

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock return values
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com' },
            logout: vi.fn(),
        });

        mockUseApp.mockReturnValue({
            setShowSettings: vi.fn(),
            provider: 'gemini',
            model: 'gemini-2.5-flash',
        });

        mockUseTheme.mockReturnValue({
            theme: 'light',
            toggleTheme: vi.fn(),
        });
    });

    it('renders nothing if user is not logged in', () => {
        mockUseAuth.mockReturnValue({ user: null });
        const { container } = render(<Header />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders correct provider and model', () => {
        render(<Header />);
        expect(screen.getByText(/Gemini \/ gemini-2.5-flash/)).toBeInTheDocument();
    });

    it('toggles theme on click', async () => {
        const toggleTheme = vi.fn();
        mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme });

        const user = userEvent.setup();
        render(<Header />);

        const themeButton = screen.getByTitle('Toggle Theme');
        await user.click(themeButton);

        expect(toggleTheme).toHaveBeenCalled();
    });

    it('opens settings on click', async () => {
        const setShowSettings = vi.fn();
        mockUseApp.mockReturnValue({
            setShowSettings,
            provider: 'openai',
            model: 'gpt-4o'
        });

        const user = userEvent.setup();
        render(<Header />);

        expect(screen.getByText(/OpenAI \/ gpt-4o/)).toBeInTheDocument();

        const settingsButton = screen.getByTitle('Settings');
        await user.click(settingsButton);

        expect(setShowSettings).toHaveBeenCalledWith(true);
    });

    it('renders GitHub Models label when provider is github-models', () => {
        mockUseApp.mockReturnValue({
            setShowSettings: vi.fn(),
            provider: 'github-models',
            model: 'openai/gpt-4o',
        });

        render(<Header />);
        expect(screen.getByText(/GitHub Models \/ openai\/gpt-4o/)).toBeInTheDocument();
    });

    it('calls logout on click', async () => {
        const logout = vi.fn();
        mockUseAuth.mockReturnValue({
            user: { email: 'test@example.com' },
            logout
        });

        const user = userEvent.setup();
        render(<Header />);

        const logoutButton = screen.getByTitle('Logout');
        await user.click(logoutButton);

        expect(logout).toHaveBeenCalled();
    });
});
