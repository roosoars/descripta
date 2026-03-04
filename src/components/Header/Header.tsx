import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { PenTool, Settings, LogOut, Moon, Sun } from 'lucide-react';
import './Header.css';

export default function Header() {
    const { user, logout } = useAuth();
    const { setShowSettings, provider, model } = useApp();
    const { theme, toggleTheme } = useTheme();

    if (!user) return null;

    const providerLabel = provider === 'gemini'
        ? 'Gemini'
        : provider === 'openai'
            ? 'OpenAI'
            : 'GitHub Models';

    return (
        <header className="header">
            <div className="header__inner">
                <div className="header__brand">
                    <PenTool size={20} className="header__logo" />
                    <span className="header__title">DESCRIPTA</span>
                </div>

                <div className="header__actions">
                    <div className="header__status">
                        <span className="status-indicator"></span>
                        <span className="status-text">{providerLabel} / {model}</span>
                    </div>

                    <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button className="icon-btn" onClick={() => setShowSettings(true)} title="Settings">
                        <Settings size={18} />
                    </button>

                    <button className="icon-btn" onClick={logout} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
