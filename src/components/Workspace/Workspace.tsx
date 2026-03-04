import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { generateBatchDescriptions } from '../../services/ai-service';
import Layout from '../Layout/Layout';
import Results from '../Results/Results';
import History from '../History/History';
import Settings from '../Settings/Settings';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import { Upload, X, Loader2 } from 'lucide-react';
import './Workspace.css';

interface StoredGithubModelMetadata {
    id: string;
    isVisionCapable?: boolean;
}

export default function Workspace() {
    const { apiKey, provider, model, language, style, addResult, results, clearResults, showToast, glossary, showSettings, setShowSettings } = useApp();
    const { githubAccessToken } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [view, setView] = useState<'workspace' | 'history'>('workspace');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleProcess = async () => {
        if (files.length === 0) return;
        const providerCredential = provider === 'github-models'
            ? (githubAccessToken || '')
            : apiKey;

        if (!providerCredential) {
            if (provider === 'github-models') {
                showToast('Reconecte sua conta GitHub nas configurações para listar e usar GitHub Models.', 'error');
                return;
            }
            showToast('Configure sua chave de API primeiro!', 'error');
            return;
        }

        if (provider === 'github-models') {
            const storedCatalogRaw = localStorage.getItem('github_models_catalog');
            if (storedCatalogRaw) {
                try {
                    const storedCatalog = JSON.parse(storedCatalogRaw) as StoredGithubModelMetadata[];
                    const selectedModelMetadata = storedCatalog.find((catalogModel) => catalogModel.id === model);
                    if (selectedModelMetadata && selectedModelMetadata.isVisionCapable === false) {
                        showToast('O modelo selecionado não aceita entrada de imagem. Escolha um modelo com suporte a imagem.', 'error');
                        return;
                    }
                } catch {
                    // Ignore catalog parsing issues and continue request flow.
                }
            }
        }

        // Limpar resultados anteriores para mostrar apenas os novos
        clearResults();

        setProcessing(true);
        setProgress({ current: 0, total: files.length });

        try {
            const newResults = await generateBatchDescriptions(
                files,
                provider,
                providerCredential,
                model,
                language,
                style,
                glossary,
                (current, total) => setProgress({ current, total })
            );

            // Adicionar URL da imagem a cada resultado
            newResults.forEach((result, index) => {
                const imageUrl = URL.createObjectURL(files[index]);
                addResult({ ...result, imageUrl });
            });

            setFiles([]);
            showToast('Geração concluída com sucesso!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Erro ao processar imagens.', 'error');
        } finally {
            setProcessing(false);
            setProgress({ current: 0, total: 0 });
        }
    };

    return (
        <Layout>
            <div className="workspace">
                {/* Header */}
                <div className="workspace__header">
                    <h1 className="workspace__title">
                        {view === 'workspace' ? 'Nova Geração' : 'Histórico'}
                    </h1>
                    <div className="workspace__tabs">
                        <button
                            className={`tab ${view === 'workspace' ? 'tab--active' : ''}`}
                            onClick={() => setView('workspace')}
                        >
                            Workspace
                        </button>
                        <button
                            className={`tab ${view === 'history' ? 'tab--active' : ''}`}
                            onClick={() => setView('history')}
                        >
                            Histórico
                        </button>
                    </div>
                </div>

                {view === 'history' ? (
                    <History />
                ) : (
                    <div className="workspace__content">
                        {/* Upload Zone */}
                        <Card
                            className={`dropzone ${isDragging ? 'dropzone--dragging' : ''}`}
                            padding="xl"
                            variant="bordered"
                            interactive
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                multiple
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <div className="dropzone__content">
                                <Upload size={48} className="dropzone__icon" />
                                <h3 className="dropzone__title">Clique ou arraste imagens aqui</h3>
                                <p className="dropzone__subtitle">JPG, PNG, WebP até 5MB</p>
                            </div>
                        </Card>

                        {/* File List */}
                        {files.length > 0 && (
                            <Card className="file-list" padding="md">
                                <div className="file-list__header">
                                    <span>Fila ({files.length})</span>
                                    <Badge variant="primary">{files.length} arquivo{files.length > 1 ? 's' : ''}</Badge>
                                    <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
                                        Limpar Tudo
                                    </Button>
                                </div>
                                <div className="file-list__items">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="file-item">
                                            <span className="file-item__name">{file.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                icon={<X size={16} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile(idx);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={handleProcess}
                                    loading={processing}
                                    disabled={processing}
                                    icon={processing ? <Loader2 className="animate-spin" size={18} /> : undefined}
                                >
                                    {processing
                                        ? `Processando ${progress.current}/${progress.total}`
                                        : 'Gerar Descrições'}
                                </Button>
                            </Card>
                        )}

                        {/* Results */}
                        {results.length > 0 && <Results />}
                    </div>
                )}
            </div>

            {showSettings && <Settings onClose={() => setShowSettings(false)} />}
        </Layout>
    );
}
