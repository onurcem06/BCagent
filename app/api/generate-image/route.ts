import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { prompts } = await req.json();

        // Optimized prompts for high quality outputs
        const heroPrompt = encodeURIComponent(`Professional high-end website landing page hero background, 8k resolution, cinematic lighting, conceptual design, ${prompts.hero}`);
        const socialPrompt = encodeURIComponent(`Professional high-quality social media post, Instagram aesthetic, clean composition, vibrant, ${prompts.social}`);
        const logoPrompt = encodeURIComponent(`Minimalist modern vector logo symbol on pure white background, flat design, high contrast, ${prompts.logo}`);

        // Using Pollinations.ai for high-speed, high-quality, free generation
        const hero_url = `https://pollinations.ai/p/${heroPrompt}?width=1280&height=720&seed=${Math.floor(Math.random() * 10000)}&model=flux`;
        const social_url = `https://pollinations.ai/p/${socialPrompt}?width=1080&height=1080&seed=${Math.floor(Math.random() * 10000)}&model=flux`;
        const logo_url = `https://pollinations.ai/p/${logoPrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 10000)}&model=flux`;

        // Pre-fetch check (optional but helps ensure URLs are "ready" if the service allows)

        return NextResponse.json({
            hero_url,
            social_url,
            logo_url
        });

    } catch (error: any) {
        console.error('IMAGE GENERATION ERROR:', error);
        return NextResponse.json(
            { error: error.message || 'An error occurred during image generation.' },
            { status: 500 }
        );
    }
}
