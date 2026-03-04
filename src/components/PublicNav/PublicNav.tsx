import { Moon, PenTool, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './PublicNav.css';

interface PublicNavProps {
    active: 'home' | 'docs';
    onAccessClick?: () => void;
    fixed?: boolean;
}

export default function PublicNav({ active, onAccessClick, fixed = false }: PublicNavProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className={`public-nav-shell ${fixed ? 'public-nav-shell--fixed' : ''}`}>
            <nav className="public-nav">
                <a href="/" className="public-nav__brand">
                    <PenTool size={20} />
                    <span>DESCRIPTA</span>
                </a>

                <div className="public-nav__actions">
                    <a href="/" className={`public-nav__btn ${active === 'home' ? 'active' : ''}`}>
                        HOME
                    </a>
                    <a href="/docs" className={`public-nav__btn ${active === 'docs' ? 'active' : ''}`}>
                        DOCS
                    </a>
                    {onAccessClick ? (
                        <button
                            type="button"
                            className="public-nav__btn public-nav__btn--primary"
                            onClick={onAccessClick}
                        >
                            ENTRAR
                        </button>
                    ) : (
                        <a href="/" className="public-nav__btn public-nav__btn--primary">
                            ENTRAR
                        </a>
                    )}
                    <button
                        type="button"
                        className="public-nav__btn public-nav__btn--icon"
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                        aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </nav>
        </header>
    );
}
