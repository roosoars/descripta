import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
    getProviderFallbackModels,
    type AIProvider,
    type Language,
    type DescriptionStyle,
} from '../../types';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import Glossary from './Glossary';
import { Github, Info, KeyRound, Sparkles } from 'lucide-react';
import {
    discoverGithubModelCatalog,
    discoverProviderModels,
    type GithubCatalogModel,
} from '../../services/model-discovery';
import './Settings.css';

const GITHUB_MODELS_STORAGE_KEY = 'github_models_catalog';

export default function Settings({ onClose }: { onClose: () => void }) {
    const { isGithubUser, githubAccessToken, githubSessionVersion, refreshGithubSession } = useAuth();
    const {
        apiKey,
        setApiKey,
        provider,
        setProvider,
        model,
        setModel,
        language,
        setLanguage,
        style,
        setStyle,
        history,
    } = useApp();
    const [localKey, setLocalKey] = useState(apiKey);
    const [error, setError] = useState('');
    const [models, setModels] = useState<string[]>(getProviderFallbackModels(provider));
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState('');
    const [oauthLoading, setOauthLoading] = useState(false);
    const [githubCatalog, setGithubCatalog] = useState<GithubCatalogModel[]>([]);

    const githubCatalogById = useMemo(
        () => new Map(githubCatalog.map((catalogModel) => [catalogModel.id, catalogModel])),
        [githubCatalog]
    );

    useEffect(() => {
        const fallbackModels = getProviderFallbackModels(provider);
        const providerCredential = provider === 'github-models'
            ? (githubAccessToken || '')
            : localKey.trim();

        if (!providerCredential) {
            setModelsLoading(false);

            if (provider === 'github-models') {
                setModels([]);
                setGithubCatalog([]);
                localStorage.removeItem(GITHUB_MODELS_STORAGE_KEY);
                setModelsError(
                    isGithubUser
                        ? 'Sessão GitHub sem token OAuth. Clique em "Recarregar login GitHub".'
                        : 'Faça login com GitHub para carregar modelos disponíveis.'
                );
            } else {
                setModels(fallbackModels);
                setGithubCatalog([]);
                setModelsError('');
                if (!fallbackModels.includes(model) && fallbackModels[0]) {
                    setModel(fallbackModels[0]);
                }
            }
            return;
        }

        setModelsLoading(true);
        const timeoutId = window.setTimeout(async () => {
            try {
                if (provider === 'github-models') {
                    const catalog = await discoverGithubModelCatalog(providerCredential);
                    setGithubCatalog(catalog);
                    localStorage.setItem(GITHUB_MODELS_STORAGE_KEY, JSON.stringify(catalog));

                    const activeModels = catalog.map((catalogModel) => catalogModel.id);
                    setModels(activeModels);
                    setModelsError('');

                    if (!activeModels.includes(model) && activeModels[0]) {
                        setModel(activeModels[0]);
                    }
                } else {
                    const discoveredModels = await discoverProviderModels(provider, providerCredential);
                    const activeModels = discoveredModels.length > 0 ? discoveredModels : fallbackModels;

                    setModels(activeModels);
                    setGithubCatalog([]);
                    setModelsError('');
                    if (!activeModels.includes(model) && activeModels[0]) {
                        setModel(activeModels[0]);
                    }
                }
            } catch (loadError) {
                const message = loadError instanceof Error
                    ? loadError.message
                    : 'Falha ao carregar modelos do provedor.';

                if (provider === 'github-models') {
                    const githubFallback = getProviderFallbackModels('github-models');
                    setModels(githubFallback);
                    setGithubCatalog([]);
                    localStorage.removeItem(GITHUB_MODELS_STORAGE_KEY);
                    if (!githubFallback.includes(model) && githubFallback[0]) {
                        setModel(githubFallback[0]);
                    }
                } else {
                    setModels(fallbackModels);
                    if (!fallbackModels.includes(model) && fallbackModels[0]) {
                        setModel(fallbackModels[0]);
                    }
                }

                setModelsError(message);
            } finally {
                setModelsLoading(false);
            }
        }, 350);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [provider, localKey, model, setModel, githubAccessToken, isGithubUser, githubSessionVersion]);

    const handleProviderChange = (newProvider: AIProvider) => {
        setProvider(newProvider);
        setError('');
        setModelsError('');

        if (newProvider === 'github-models') {
            setModels([]);
            if (githubCatalog[0]) {
                setModel(githubCatalog[0].id);
            }
            return;
        }

        const fallbackModels = getProviderFallbackModels(newProvider);
        setModels(fallbackModels);
        if (fallbackModels[0]) {
            setModel(fallbackModels[0]);
        }
    };

    const handleSave = () => {
        if (provider === 'github-models') {
            if (!githubAccessToken) {
                setError('Sessão GitHub sem token OAuth. Atualize a autenticação do GitHub.');
                return;
            }
            if (!model) {
                setError('Selecione um modelo GitHub Models para continuar.');
                return;
            }

            setError('');
            onClose();
            return;
        }

        if (!localKey.trim()) {
            setError('A chave de API é obrigatória');
            return;
        }

        setApiKey(localKey.trim());
        setError('');
        onClose();
    };

    const handleReconnectGithub = async () => {
        try {
            setOauthLoading(true);
            setError('');
            setModelsError('');
            await refreshGithubSession();
        } catch (reconnectError) {
            const message = reconnectError instanceof Error
                ? reconnectError.message
                : 'Não foi possível atualizar a sessão GitHub.';
            setModelsError(message);
        } finally {
            setOauthLoading(false);
        }
    };

    const apiKeyLabel = provider === 'gemini'
        ? 'Chave da API Gemini'
        : provider === 'openai'
            ? 'Chave da API OpenAI'
            : 'Token GitHub Models';

    const apiKeyPlaceholder = provider === 'github-models'
        ? 'Autenticação feita por OAuth via login GitHub'
        : 'Insira sua chave de API';

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="⚙️ Configurações da API"
            size="lg"
            scrollable
            footer={
                <Button variant="primary" size="lg" onClick={handleSave} fullWidth>
                    Salvar e Continuar
                </Button>
            }
        >
            <div className="settings-content">
                <p className="settings-subtitle">
                    🔒 Suas chaves de API são armazenadas localmente e nunca enviadas para nossos servidores.
                </p>

                <div className="settings-form">
                    <div className="form-group">
                        <label className="form-label">Provedor de IA</label>
                        <div className="provider-buttons">
                            <Button
                                variant={provider === 'gemini' ? 'primary' : 'secondary'}
                                size="md"
                                onClick={() => handleProviderChange('gemini')}
                                fullWidth
                            >
                                Google Gemini
                            </Button>
                            <Button
                                variant={provider === 'openai' ? 'primary' : 'secondary'}
                                size="md"
                                onClick={() => handleProviderChange('openai')}
                                fullWidth
                            >
                                OpenAI
                            </Button>
                            {isGithubUser && (
                                <Button
                                    variant={provider === 'github-models' ? 'primary' : 'secondary'}
                                    size="md"
                                    onClick={() => handleProviderChange('github-models')}
                                    fullWidth
                                >
                                    GitHub Models
                                </Button>
                            )}
                        </div>
                        {!isGithubUser && (
                            <p className="settings-helper">
                                Faça login com GitHub para habilitar o provedor GitHub Models.
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Modelo</label>
                        <select
                            className="input"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            disabled={modelsLoading || models.length === 0}
                        >
                            {modelsLoading && <option value={model || ''}>Carregando modelos...</option>}
                            {models.map((modelId) => {
                                const catalogModel = githubCatalogById.get(modelId);
                                const multiplierSuffix = provider === 'github-models' && catalogModel
                                    ? ` • paid ${catalogModel.paidMultiplier} / free ${catalogModel.freeMultiplier}`
                                    : '';

                                return (
                                    <option key={modelId} value={modelId}>
                                        {modelId}{multiplierSuffix}
                                    </option>
                                );
                            })}
                        </select>
                        {modelsError && <p className="settings-helper settings-helper--error">{modelsError}</p>}
                    </div>

                    {provider === 'github-models' && (
                        <div className="settings-oauth-card">
                            <div className="settings-oauth-card__header">
                                <div className="settings-oauth-card__title">
                                    <Github size={18} />
                                    <span>Autenticação GitHub Models</span>
                                </div>
                                <Badge variant={githubAccessToken ? 'success' : 'warning'} dot>
                                    {githubAccessToken ? 'OAuth conectado' : 'OAuth pendente'}
                                </Badge>
                            </div>

                            <p className="settings-helper">
                                O GitHub Models usa o OAuth da sua sessão GitHub. Não é necessário inserir PAT neste fluxo.
                            </p>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleReconnectGithub}
                                loading={oauthLoading}
                                disabled={oauthLoading}
                            >
                                Recarregar login GitHub
                            </Button>

                            <div className="settings-model-catalog">
                                <div className="settings-model-catalog__head">
                                    <span>Modelos disponíveis na sua conta</span>
                                    <Badge variant="info">{githubCatalog.length}</Badge>
                                </div>
                                <p className="settings-model-catalog__hint">
                                    Multiplicador de uso (x) por modelo: referência oficial do Copilot.
                                </p>

                                <div className="settings-model-catalog__list">
                                    {githubCatalog.map((catalogModel) => (
                                        <div key={catalogModel.id} className="settings-model-row">
                                            <div className="settings-model-row__identity">
                                                <span className="settings-model-row__name">{catalogModel.name}</span>
                                                <code className="settings-model-row__id">{catalogModel.id}</code>
                                            </div>
                                            <div className="settings-model-row__meta">
                                                <Badge
                                                    variant={catalogModel.isVisionCapable ? 'success' : 'warning'}
                                                    size="sm"
                                                >
                                                    {catalogModel.isVisionCapable ? 'Imagem' : 'Sem imagem'}
                                                </Badge>
                                                <Badge variant="info" size="sm">
                                                    Paid {catalogModel.paidMultiplier}
                                                </Badge>
                                                <Badge variant="default" size="sm">
                                                    Free {catalogModel.freeMultiplier}
                                                </Badge>
                                                <Badge variant="default" size="sm">
                                                    Tier {catalogModel.rateLimitTier}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {githubCatalog.length === 0 && (
                                        <span className="settings-helper">
                                            Nenhum modelo disponível no momento.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Idioma de Saída</label>
                        <select
                            className="input"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                        >
                            <option value="pt-BR">Português (Brasil)</option>
                            <option value="en-US">English (US)</option>
                            <option value="es-ES">Español</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estilo da Descrição</label>
                        <select
                            className="input"
                            value={style}
                            onChange={(e) => setStyle(e.target.value as DescriptionStyle)}
                        >
                            <option value="concise">Conciso (Direto ao ponto)</option>
                            <option value="detailed">Detalhado (Completo)</option>
                            <option value="formal">Formal (Profissional)</option>
                            <option value="informal">Informal (Casual)</option>
                        </select>
                    </div>

                    {provider !== 'github-models' && (
                        <Input
                            label={apiKeyLabel}
                            id="api-key"
                            type="password"
                            placeholder={apiKeyPlaceholder}
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value)}
                            error={error}
                        />
                    )}

                    {provider === 'github-models' && error && (
                        <p className="settings-helper settings-helper--error">{error}</p>
                    )}

                    <div className="settings-info">
                        {provider === 'github-models' ? <Github size={16} /> : <Info size={16} />}
                        <span>
                            {provider === 'github-models' ? 'Consulte detalhes e multiplicadores em ' : 'Obtenha sua chave de API no '}
                            {provider === 'gemini' ? (
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Google AI Studio
                                </a>
                            ) : provider === 'openai' ? (
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    OpenAI Platform
                                </a>
                            ) : (
                                <a
                                    href="https://docs.github.com/en/copilot/how-tos/use-chat/select-models#request-multipliers"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub Copilot (request multipliers)
                                </a>
                            )}
                        </span>
                    </div>

                    <Glossary />

                    <div className="usage-section">
                        <h3 className="section-title">📊 Uso da API</h3>
                        <div className="usage-stats">
                            <div className="stat-item">
                                <span className="stat-label">Requisições (Sessão)</span>
                                <Badge variant="primary">{history.length}</Badge>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">
                                    {provider === 'github-models' ? 'Sessão OAuth' : 'Status do Serviço'}
                                </span>
                                <Badge
                                    variant={provider === 'github-models' && !githubAccessToken ? 'warning' : 'success'}
                                    dot
                                >
                                    {provider === 'github-models' && !githubAccessToken ? 'Requer login GitHub' : 'Operacional'}
                                </Badge>
                            </div>
                            {provider === 'github-models' && (
                                <>
                                    <div className="stat-item">
                                        <span className="stat-label">Modo de autenticação</span>
                                        <Badge variant="info">
                                            <KeyRound size={12} />
                                            OAuth GitHub
                                        </Badge>
                                    </div>
                                    {model && githubCatalogById.get(model) && (
                                        <div className="stat-item">
                                            <span className="stat-label">Multiplicador do modelo atual</span>
                                            <Badge variant="warning">
                                                <Sparkles size={12} />
                                                {githubCatalogById.get(model)?.paidMultiplier} (paid)
                                            </Badge>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
