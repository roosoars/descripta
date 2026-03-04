import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DocsPage from '../../../components/Docs/DocsPage';

vi.mock('../../../components/PublicNav/PublicNav', () => ({
    default: () => <div data-testid="public-nav">PUBLIC NAV</div>,
}));

describe('DocsPage', () => {
    it('renders docs hero and primary sections', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.getByText('Guia de uso do Descripta')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Início Rápido' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Visão Geral' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Acesso e Autenticação' })).toBeInTheDocument();
    });

    it('renders sidebar and outline links for section anchors', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        const quickStartLinks = screen.getAllByRole('link', { name: 'Início Rápido' });
        expect(quickStartLinks.length).toBeGreaterThan(0);
        expect(quickStartLinks[0]).toHaveAttribute('href', '#inicio-rapido');

        const overviewLinks = screen.getAllByRole('link', { name: 'Visão Geral' });
        expect(overviewLinks.length).toBeGreaterThan(0);
        expect(overviewLinks[0]).toHaveAttribute('href', '#visao-geral');
    });

    it('does not render legacy page navigation controls', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.queryByRole('button', { name: /Página anterior/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Próxima página/i })).not.toBeInTheDocument();
        expect(screen.queryByText(/Página \d+ de \d+/i)).not.toBeInTheDocument();
    });

    it('does not mention support or feature request', () => {
        render(
            <MemoryRouter>
                <DocsPage />
            </MemoryRouter>
        );

        expect(screen.queryByText(/SUPORTE/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/SOLICITAR FUNCIONALIDADE/i)).not.toBeInTheDocument();
    });
});
