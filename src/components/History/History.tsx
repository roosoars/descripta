import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import './History.css';

function truncateText(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}...`;
}

export default function History() {
    const { history, clearHistory } = useApp();
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

    if (history.length === 0) {
        return (
            <div className="history-empty">
                <Clock size={48} />
                <h3>Nenhum histórico</h3>
                <p>Suas gerações aparecerão aqui</p>
            </div>
        );
    }

    return (
        <div className="history">
            <div className="history__header">
                <div className="history__header-left">
                    <h2 className="history__title">Histórico</h2>
                    <Badge variant="primary" size="md">
                        {history.length} {history.length === 1 ? 'item' : 'itens'}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="md"
                    onClick={clearHistory}
                    icon={<Trash2 size={18} />}
                >
                    Limpar Histórico
                </Button>
            </div>

            <div className="history__list">
                {history.map((item, index) => {
                    const expanded = expandedItems[index] ?? false;
                    const descriptionPreview = item.description ? truncateText(item.description, 110) : '';
                    const altPreview = truncateText(item.alt, 120);

                    return (
                        <Card
                            key={index}
                            className={`history-item ${expanded ? 'history-item--expanded' : 'history-item--collapsed'}`}
                            padding="md"
                            variant="default"
                        >
                            <div className="history-item__header">
                                <div className="history-item__filename">
                                    <FileText size={16} />
                                    <span>{item.filename}</span>
                                </div>
                                <div className="history-item__header-actions">
                                    <Badge variant="success" size="sm" styleVariant="outline">
                                        Gerado
                                    </Badge>
                                    <button
                                        type="button"
                                        className="history-item__toggle"
                                        onClick={() => {
                                            setExpandedItems((prev) => ({
                                                ...prev,
                                                [index]: !expanded,
                                            }));
                                        }}
                                        aria-expanded={expanded}
                                        aria-controls={`history-item-content-${index}`}
                                    >
                                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        <span>{expanded ? 'Recolher' : 'Expandir'}</span>
                                    </button>
                                </div>
                            </div>

                            {!expanded && (
                                <div className="history-item__preview">
                                    <p className="history-item__preview-line">
                                        <strong>ALT:</strong> {altPreview}
                                    </p>
                                    {item.description && (
                                        <p className="history-item__preview-line">
                                            <strong>DESCRIÇÃO:</strong> {descriptionPreview}
                                        </p>
                                    )}
                                </div>
                            )}

                            {expanded && (
                                <div className="history-item__field">
                                    <div id={`history-item-content-${index}`} className="history-item__content">
                                        <div className="history-item__field">
                                            <label className="history-item__label">ALT TEXT</label>
                                            <p className="history-item__value">{item.alt}</p>
                                        </div>
                                        {item.description && (
                                            <div className="history-item__field">
                                                <label className="history-item__label">DESCRIÇÃO</label>
                                                <p className="history-item__value history-item__description">
                                                    {item.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
