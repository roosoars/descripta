import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import type { ImageMetadata, Language, DescriptionStyle, Result } from '../types';

export interface AIResponse {
    alt: string;
    description: string;
    metadata: ImageMetadata;
}

/**
 * Generate ALT text and accessibility description for an image using AI
 */
export async function generateDescription(
    image: File,
    provider: 'gemini' | 'openai' | 'github-models',
    apiKey: string,
    model: string,
    language: Language = 'pt-BR',
    style: DescriptionStyle = 'concise',
    glossary: { term: string; definition: string }[] = []
): Promise<AIResponse> {
    if (provider === 'gemini') {
        return generateWithGemini(image, apiKey, model, language, style, glossary);
    }

    if (provider === 'openai') {
        return generateWithOpenAI(image, apiKey, model, language, style, glossary);
    }

    return generateWithGithubModels(image, apiKey, model, language, style, glossary);
}

function buildPrompt(language: Language, style: DescriptionStyle, glossary: { term: string; definition: string }[]): string {
    const langName = ({
        'pt-BR': 'Portuguese (Brazil)',
        'en-US': 'English (US)',
        'es-ES': 'Spanish'
    } as Record<Language, string>)[language];

    const styleDesc = ({
        'concise': 'Direct, objective, max 125 chars for alt text.',
        'detailed': 'Comprehensive, descriptive, including visual details.',
        'formal': 'Professional tone, technical vocabulary if applicable.',
        'informal': 'Casual tone, simple language.'
    } as Record<DescriptionStyle, string>)[style];

    let glossaryText = '';
    if (glossary.length > 0) {
        glossaryText = `
    Use the following glossary terms if applicable:
    ${glossary.map(g => `- "${g.term}": ${g.definition}`).join('\n')}
        `;
    }

    return `Analyze this image and provide a JSON response in ${langName}.

    Critical output rules:
    1) Write ALL textual fields strictly in ${langName}.
    2) Apply this style to both "alt" and "description": ${styleDesc}
    3) If a glossary term is contextually relevant, use its mapped definition exactly.
    4) Keep language and style consistent; do not fallback to default wording.
    ${glossaryText}

    Required JSON structure:
    {
      "alt": "The alt text string (max 125 chars if concise)",
      "description": "A detailed accessibility description for screen readers",
      "metadata": {
        "objects": ["list", "of", "main", "objects"],
        "people": boolean (true if people are present),
        "decorative": boolean (true if image is purely decorative/abstract),
        "dominant_colors": ["#Hex1", "#Hex2"],
        "confidence": number (0.0 to 1.0)
      }
    }`;
}

/**
 * Generate description using Google Gemini
 */
async function generateWithGemini(
    image: File,
    apiKey: string,
    model: string,
    language: Language,
    style: DescriptionStyle,
    glossary: { term: string; definition: string }[]
): Promise<AIResponse> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({ model });

    const imageData = await fileToBase64(image);
    const base64Data = imageData.split(',')[1];

    const prompt = buildPrompt(language, style, glossary);

    const result = await genModel.generateContent([
        prompt,
        {
            inlineData: {
                data: base64Data,
                mimeType: image.type,
            },
        },
    ]);

    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
    }

    return JSON.parse(jsonMatch[0]);
}

/**
 * Generate description using OpenAI
 */
async function generateWithOpenAI(
    image: File,
    apiKey: string,
    model: string,
    language: Language,
    style: DescriptionStyle,
    glossary: { term: string; definition: string }[]
): Promise<AIResponse> {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const imageData = await fileToBase64(image);
    const prompt = buildPrompt(language, style, glossary);

    const response = await openai.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: imageData } },
                ],
            },
        ],
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
}

/**
 * Generate description using GitHub Models (OpenAI compatible endpoint)
 */
async function generateWithGithubModels(
    image: File,
    apiKey: string,
    model: string,
    language: Language,
    style: DescriptionStyle,
    glossary: { term: string; definition: string }[]
): Promise<AIResponse> {
    const client = new OpenAI({
        apiKey,
        baseURL: 'https://models.github.ai/inference',
        dangerouslyAllowBrowser: true,
    });
    const imageData = await fileToBase64(image);
    const prompt = buildPrompt(language, style, glossary);

    const response = await client.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: imageData } },
                ],
            },
        ],
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response from GitHub Models');
    }

    return JSON.parse(content);
}

/**
 * Convert File to base64 data URL
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Process multiple images in batch
 */
export async function generateBatchDescriptions(
    images: File[],
    provider: 'gemini' | 'openai' | 'github-models',
    apiKey: string,
    model: string,
    language: Language,
    style: DescriptionStyle,
    glossary: { term: string; definition: string }[] = [],
    onProgress?: (current: number, total: number) => void
): Promise<Result[]> {
    const results: Result[] = [];

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        try {
            const response = await generateDescription(image, provider, apiKey, model, language, style, glossary);
            results.push({
                filename: image.name,
                alt: response.alt,
                description: response.description,
                metadata: response.metadata,
                status: 'generated',
                originalAlt: response.alt
            });
        } catch (error) {
            console.error(`Error processing ${image.name}:`, error);
            // Push error state or skip? For now, we skip or could push an error result
        }

        if (onProgress) {
            onProgress(i + 1, images.length);
        }
    }

    return results;
}
