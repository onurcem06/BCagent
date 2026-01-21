import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { prompts } = await req.json();

        // Optimized prompts for high quality outputs - Expert Version
        const heroPrompt = encodeURIComponent(`Professional high-end luxury website landing page, cinematic 4d, octane render, 8k, ray-traced, hyper-realistic, ${prompts.hero}`);
        const socialPrompt = encodeURIComponent(`High-fashion editorial social media post, magazine aesthetic, ultra-sharp focus, professional lighting, ${prompts.social}`);
        const logoPrompt = encodeURIComponent(`Premium vector logo, symmetrical, high-contrast, professional branding symbol on white, flat vector, ${prompts.logo}`);

        // Using Pollinations.ai for high-speed, high-quality, free generation
        const hero_url = `https://pollinations.ai/p/${heroPrompt}?width=1280&height=720&seed=${Math.floor(Math.random() * 10000)}&model=flux-pro`;
        const social_url = `https://pollinations.ai/p/${socialPrompt}?width=1080&height=1080&seed=${Math.floor(Math.random() * 10000)}&model=flux-pro`;
        const logo_url = `https://pollinations.ai/p/${logoPrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 10000)}&model=flux-pro`;

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
