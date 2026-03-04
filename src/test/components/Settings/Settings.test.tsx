import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settings from '../../../components/Settings/Settings';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { discoverProviderModels } from '../../../services/model-discovery';

vi.mock('../../../context/AppContext', () => ({
    useApp: vi.fn(),
}));

vi.mock('../../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../../services/model-discovery', () => ({
    discoverProviderModels: vi.fn(),
}));

describe('Settings', () => {
    const mockContext = {
        apiKey: 'key123',
        setApiKey: vi.fn(),
        provider: 'gemini',
        setProvider: vi.fn(),
        model: 'gemini-2.5-flash',
        setModel: vi.fn(),
        language: 'pt-BR',
        setLanguage: vi.fn(),
        style: 'concise',
        setStyle: vi.fn(),
        history: [],
        glossary: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useApp as unknown as Mock).mockReturnValue(mockContext);
        (useAuth as unknown as Mock).mockReturnValue({ isGithubUser: true });
        (discoverProviderModels as unknown as Mock).mockResolvedValue(['gemini-2.5-flash', 'gemini-2.5-pro']);
    });

    it('renders provider options including GitHub Models for GitHub users', () => {
        render(<Settings onClose={() => { }} />);

        expect(screen.getByText('Google Gemini')).toBeInTheDocument();
        expect(screen.getByText('OpenAI')).toBeInTheDocument();
        expect(screen.getByText('GitHub Models')).toBeInTheDocument();
    });

    it('hides GitHub Models provider for non-GitHub users', () => {
        (useAuth as unknown as Mock).mockReturnValue({ isGithubUser: false });
        render(<Settings onClose={() => { }} />);

        expect(screen.queryByText('GitHub Models')).not.toBeInTheDocument();
        expect(
            screen.getByText('Faça login com GitHub para habilitar o provedor GitHub Models.')
        ).toBeInTheDocument();
    });

    it('saves api key', async () => {
        const setApiKeyMock = vi.fn();
        const onCloseMock = vi.fn();
        (useApp as unknown as Mock).mockReturnValue({
            ...mockContext,
            setApiKey: setApiKeyMock,
        });

        const user = userEvent.setup();
        render(<Settings onClose={onCloseMock} />);

        const input = screen.getByPlaceholderText('Insira sua chave de API');
        await user.clear(input);
        await user.type(input, 'new-key');
        await user.click(screen.getByText('Salvar e Continuar'));

        expect(setApiKeyMock).toHaveBeenCalledWith('new-key');
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('loads discovered models when api key is present', async () => {
        render(<Settings onClose={() => { }} />);

        await waitFor(() => {
            expect(discoverProviderModels).toHaveBeenCalledWith('gemini', 'key123');
        });
    });
});
