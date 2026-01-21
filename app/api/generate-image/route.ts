import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { prompts } = await req.json();

        // Use the prompts as provided, adding minimal quality boosters to avoid URL length issues
        const heroPrompt = encodeURIComponent(`${prompts.hero}, professional photography, 8k, highly detailed`);
        const socialPrompt = encodeURIComponent(`${prompts.social}, editorial style, high resolution`);
        const logoPrompt = encodeURIComponent(`${prompts.logo}, flat vector, clean branding, white background`);

        // Using Pollinations.ai for high-speed generation
        const seed = Math.floor(Math.random() * 1000000);
        const hero_url = `https://pollinations.ai/p/${heroPrompt}?width=1280&height=720&seed=${seed}&model=flux`;
        const social_url = `https://pollinations.ai/p/${socialPrompt}?width=1080&height=1080&seed=${seed}&model=flux`;
        const logo_url = `https://pollinations.ai/p/${logoPrompt}?width=512&height=512&seed=${seed}&model=flux`;

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
