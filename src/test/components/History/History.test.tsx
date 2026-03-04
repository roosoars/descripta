import { describe, it, expect, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import History from '../../../components/History/History';
import { useApp } from '../../../context/AppContext';

// Mocking useApp
vi.mock('../../../context/AppContext', () => ({
    useApp: vi.fn(),
}));

describe('History', () => {
    it('renders empty state when no history', () => {
        (useApp as unknown as Mock).mockReturnValue({
            history: [],
            clearHistory: vi.fn(),
        });

        render(<History />);
        expect(screen.getByText('Nenhum histórico')).toBeInTheDocument();
    });

    it('renders history items', () => {
        (useApp as unknown as Mock).mockReturnValue({
            history: [
                { filename: 'img1.png', alt: 'Alt 1', description: 'Desc 1', timestamp: Date.now() },
                { filename: 'img2.png', alt: 'Alt 2', description: 'Desc 2', timestamp: Date.now() }
            ],
            clearHistory: vi.fn(),
        });

        render(<History />);
        expect(screen.getByText('img1.png')).toBeInTheDocument();
        expect(screen.getByText('img2.png')).toBeInTheDocument();
        expect(screen.getByText('Alt 1')).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /Expandir/i })).toHaveLength(2);
    });

    it('expands item on click and shows full content', async () => {
        (useApp as unknown as Mock).mockReturnValue({
            history: [
                {
                    filename: 'img1.png',
                    alt: 'Alt completo do item 1',
                    description: 'Descrição longa do item 1 para teste de expansão',
                },
            ],
            clearHistory: vi.fn(),
        });

        const user = userEvent.setup();
        render(<History />);

        expect(screen.queryByText('ALT TEXT')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: /Expandir/i }));

        expect(screen.getByText('ALT TEXT')).toBeInTheDocument();
        expect(screen.getByText('Alt completo do item 1')).toBeInTheDocument();
        expect(screen.getByText('Descrição longa do item 1 para teste de expansão')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Recolher/i })).toBeInTheDocument();
    });

    it('calls clear history', async () => {
        const clearHistoryMock = vi.fn();
        (useApp as unknown as Mock).mockReturnValue({
            history: [{ filename: 'img1.png', alt: 'Alt 1' }],
            clearHistory: clearHistoryMock,
        });

        const user = userEvent.setup();
        render(<History />);

        const clearBtn = screen.getByText('Limpar Histórico');
        await user.click(clearBtn);

        expect(clearHistoryMock).toHaveBeenCalled();
    });
});
