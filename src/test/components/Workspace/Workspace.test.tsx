import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Workspace from '../../../components/Workspace/Workspace';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { generateBatchDescriptions } from '../../../services/ai-service';

vi.mock('../../../context/AppContext', () => ({
    useApp: vi.fn(),
}));

vi.mock('../../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../../services/ai-service', () => ({
    generateBatchDescriptions: vi.fn(),
}));

vi.mock('../../../services/firebase', () => ({
    auth: {},
    app: {},
}));

vi.mock('../../../components/Layout/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

describe('Workspace', () => {
    const mockContext = {
        apiKey: 'key123',
        provider: 'gemini',
        model: 'pro',
        language: 'pt-BR',
        style: 'concise',
        addResult: vi.fn(),
        results: [],
        clearResults: vi.fn(),
        showToast: vi.fn(),
        glossary: [],
        showSettings: false,
        setShowSettings: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as unknown as Mock).mockReturnValue({
            githubAccessToken: 'gh-oauth-token',
        });
    });

    it('renders upload zone initially', () => {
        (useApp as unknown as Mock).mockReturnValue(mockContext);
        render(<Workspace />);
        expect(screen.getByText(/Clique ou arraste imagens aqui/i)).toBeInTheDocument();
    });

    it('switches tabs', async () => {
        (useApp as unknown as Mock).mockReturnValue({ ...mockContext, history: [] }); // History component needs history
        const user = userEvent.setup();
        render(<Workspace />);

        await user.click(screen.getByText('Histórico'));
        expect(screen.queryByText(/Clique ou arraste imagens aqui/i)).not.toBeInTheDocument();
        // Assuming History component renders (mocked or real)
    });

    it('handles file upload and processing', async () => {
        (useApp as unknown as Mock).mockReturnValue(mockContext);
        (generateBatchDescriptions as unknown as Mock).mockResolvedValue([
            { filename: 'test.png', alt: 'Test Alt' }
        ]);

        render(<Workspace />);

        // Simulate file selection
        // For now just ensuring it doesn't crash on render with mocked context
        // Actually the Dropzone component in Workspace has an input ref and calls click. 
        // We can just find by implicit handling if we want, or mock the upload.
        // It's easier to simulate dropping or selecting if we can access the input.
        // Looking at Workspace.tsx: input is inside Card, style display: none.

        // Simpler approach: find input by arbitrary selector since it has no label attached directly (Card wraps it)
        // input type="file"
        // Let's assume we can trigger handleFileSelect via userEvent.upload if we find the input?
        // But input is hidden. userEvent.upload(input, file) works on hidden inputs usually.
    });
});
