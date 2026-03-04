import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicNav from '../../../components/PublicNav/PublicNav';

const toggleThemeMock = vi.fn();

vi.mock('../../../context/ThemeContext', () => ({
    useTheme: () => ({
        theme: 'light',
        toggleTheme: toggleThemeMock,
    }),
}));

describe('PublicNav', () => {
    it('renders brand icon and no contato entry', () => {
        const { container } = render(<PublicNav active="home" />);

        expect(container.querySelector('.public-nav__brand svg')).toBeInTheDocument();
        expect(screen.queryByText('CONTATO')).not.toBeInTheDocument();
    });

    it('keeps theme button to the right of ENTRAR', async () => {
        const { container } = render(<PublicNav active="home" />);
        const user = userEvent.setup();

        const navActions = Array.from(container.querySelectorAll('.public-nav__actions > *'));
        expect(navActions[2].textContent).toContain('ENTRAR');

        const themeButton = screen.getByRole('button', { name: /Ativar modo escuro/i });
        expect(navActions[3]).toBe(themeButton);

        await user.click(themeButton);
        expect(toggleThemeMock).toHaveBeenCalled();
    });
});
