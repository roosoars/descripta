export interface ImageMetadata {
    objects: string[];
    people: boolean;
    decorative: boolean;
    dominant_colors: string[];
    confidence: number;
}

export interface Result {
    filename: string;
    alt: string;
    description: string;
    metadata?: ImageMetadata;
    status: 'generated' | 'edited' | 'approved';
    originalAlt?: string;
    imageUrl?: string;
}

export type AIProvider = 'gemini' | 'openai' | 'github-models';
export type Language = 'pt-BR' | 'en-US' | 'es-ES';
export type DescriptionStyle = 'concise' | 'detailed' | 'formal' | 'informal';

export const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
];

export const OPENAI_MODELS = [
    'gpt-4o',
    'gpt-4o-mini',
];

export const GITHUB_MODELS = [
    'openai/gpt-4o',
    'openai/gpt-4.1-mini',
];

export function getProviderFallbackModels(provider: AIProvider): string[] {
    if (provider === 'gemini') return GEMINI_MODELS;
    if (provider === 'openai') return OPENAI_MODELS;
    return GITHUB_MODELS;
}
