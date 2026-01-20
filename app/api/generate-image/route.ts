import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { prompt, type } = await req.json();

        let finalPrompt = prompt;
        if (type === 'logo') {
            finalPrompt = `Minimalist professional vector logo, high contrast, flat design, white background, no text, ${prompt}`;
        } else if (type === 'hero') {
            finalPrompt = `Cinematic high-quality commercial photography, website landing page hero background, professional lighting, ${prompt}`;
        }

    } catch (error: any) {
        console.error('IMAGE GENERATION ERROR:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during image generation.' },
            { status: 500 }
        );
    }
}
