import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PenTool, Zap, Shield, Globe, Code2 } from 'lucide-react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import PublicNav from '../PublicNav/PublicNav';
import './Login.css';

export default function Login() {
    const { loginWithGoogle, loginWithGithub } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loading, setLoading] = useState<'google' | 'github' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (provider: 'google' | 'github') => {
        try {
            setLoading(provider);
            setError(null);
            if (provider === 'google') await loginWithGoogle();
            else await loginWithGithub();
        } catch (err) {
            setError('Falha na autenticação. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="login">
            {/* Navigation */}
            <PublicNav active="home" onAccessClick={() => setShowLoginModal(true)} />

            {/* Hero Section */}
            <div className="login__hero">
                <div className="login__hero-content">


                    <h1 className="login__title">
                        Acessibilidade com IA <br />
                        para a Web Moderna
                    </h1>

                    <p className="login__subtitle">
                        Gere textos ALT e descrições de imagens precisas e otimizadas para SEO em segundos.
                        Impulsionado por Google Gemini e OpenAI.
                    </p>
                </div>
            </div>

            {/* Features */}
            <div className="login__features">
                <div className="feature">
                    <div className="feature__icon">
                        <Zap size={24} />
                    </div>
                    <h3 className="feature__title">Ultra Rápido</h3>
                    <p className="feature__desc">Processe lotes em segundos</p>
                </div>

                <div className="feature">
                    <div className="feature__icon">
                        <Globe size={24} />
                    </div>
                    <h3 className="feature__title">Multi-idioma</h3>
                    <p className="feature__desc">Suporte nativo PT, EN, ES</p>
                </div>

                <div className="feature">
                    <div className="feature__icon">
                        <Code2 size={24} />
                    </div>
                    <h3 className="feature__title">Developer First</h3>
                    <p className="feature__desc">Exportação JSON, CSV, JSX</p>
                </div>

                <div className="feature">
                    <div className="feature__icon">
                        <Shield size={24} />
                    </div>
                    <h3 className="feature__title">Privacidade Total</h3>
                    <p className="feature__desc">Chaves no navegador</p>
                </div>
            </div>

            {/* Footer */}
            <footer className="login__footer">
                <div className="login__footer-content">
                    <div className="login__footer-brand">
                        <PenTool size={14} />
                        <span>DESCRIPTA © 2025</span>
                    </div>
                    <div className="login__footer-links">
                        <a href="#privacidade">Privacidade</a>
                        <a href="#termos">Termos</a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>

            {/* Login Modal */}
            <Modal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                title="🔐 Entrar no DESCRIPTA"
                size="sm"
                centered
            >
                <div className="login-modal-content">
                    <p className="login-modal-subtitle">
                        Escolha sua forma de autenticação preferida para começar a gerar descrições de imagens.
                    </p>

                    <div className="login-modal-buttons">
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            onClick={() => handleLogin('google')}
                            loading={loading === 'google'}
                            disabled={loading !== null}
                        >
                            {loading === 'google' ? 'Conectando...' : 'Continuar com Google'}
                        </Button>

                        <Button
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={() => handleLogin('github')}
                            loading={loading === 'github'}
                            disabled={loading !== null}
                        >
                            {loading === 'github' ? 'Conectando...' : 'Continuar com GitHub'}
                        </Button>
                    </div>

                    {error && (
                        <div className="login-modal-error">
                            {error}
                        </div>
                    )}

                    <div className="login-modal-info">
                        <p>
                            🔒 Suas chaves de API e dados ficam armazenados apenas no seu navegador.
                            Nunca enviamos suas informações para nossos servidores.
                        </p>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
