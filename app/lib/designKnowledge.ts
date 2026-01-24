export interface DesignSystem {
    id: string;
    name: string;
    description: string;
    vibe: string[];
    specs: {
        radius: string;
        shadows: string;
        spacing: string;
        typography_style: string;
    };
    best_for: string[];
}

export interface FontPairing {
    id: string;
    category: string;
    heading: string;
    body: string;
    rationale: string;
}

export const DESIGN_LIBRARY = {
    systems: [
        {
            id: 'material_v3',
            name: 'Material Design 3 (Google)',
            description: "Modern, playful, and adaptive. Best for Android-native vibes and friendly startups.",
            vibe: ['Personal', 'Adaptive', 'Organic'],
            specs: { radius: '16px', shadows: 'Soft depth', spacing: '8px grid', typography_style: 'Expressive scale' },
            best_for: ['Mobile Apps', 'Consumer Tech', 'Social Tools']
        },
        {
            id: 'carbon',
            name: 'Carbon (IBM)',
            description: "Technical, industrial, and highly efficient. For professional tools and data.",
            vibe: ['Technical', 'Precise', 'Utilitarian'],
            specs: { radius: '0px', shadows: 'None', spacing: 'Compact', typography_style: 'IBM Plex Sans' },
            best_for: ['DevTools', 'Enterprise', 'SaaS', 'Fintech']
        },
        {
            id: 'hig',
            name: 'Human Interface (Apple)',
            description: "Fluid, high-end, and glass-centric. The peak of premium digital aesthetics.",
            vibe: ['Premium', 'Intuitive', 'Clean'],
            specs: { radius: 'Squircle', shadows: 'Ambient', spacing: 'Breathable', typography_style: 'San Francisco' },
            best_for: ['Luxury Tech', 'iOS Apps', 'Premium Agencies']
        },
        {
            id: 'soft_care',
            name: 'Soft Care (Healthcare 2025)',
            description: "Trust-focused, empathetic, and calming. Uses pastel tones and organic corners.",
            vibe: ['Trust', 'Calm', 'Empathetic'],
            specs: { radius: '12px', shadows: 'Very soft', spacing: 'Comfortable', typography_style: 'Humanist Sans' },
            best_for: ['Medical', 'Wellness', 'Hospitals', 'Insurance']
        },
        {
            id: 'neo_trust',
            name: 'Neo-Trust (Fintech 2026)',
            description: "Futuristic banking. Glassmorphism, deep gradients, and information density.",
            vibe: ['Futuristic', 'Secure', 'Innovative'],
            specs: { radius: '20px', shadows: 'Glow + Glass', spacing: 'Standard', typography_style: 'Manrope' },
            best_for: ['Crypto', 'Neobanks', 'Investment Platforms']
        },
        {
            id: 'y2k_acid',
            name: 'Y2K Acid (Gen Z 2026)',
            description: "Bold, retro-futuristic, and anti-design. Kinetic typography and neon contrasts.",
            vibe: ['Rebellious', 'Energetic', 'Retro'],
            specs: { radius: '0px / Pill', shadows: 'Hard black shadows', spacing: 'Tight', typography_style: 'Display / Syne' },
            best_for: ['Streetwear', 'Media', 'Events', 'Alternative Brands']
        },
        {
            id: 'quiet_luxury',
            name: 'Quiet Luxury (Fashion/Premium)',
            description: "Sophisticated minimalism. High-contrast typography and vast whitespace.",
            vibe: ['Elegant', 'Expensive', 'Minimal'],
            specs: { radius: '4px', shadows: 'Invisible', spacing: 'Oversized', typography_style: 'High-contrast Serif' },
            best_for: ['Fashion', 'Real Estate', 'Jewelry', 'Art']
        },
        {
            id: 'eco_balance',
            name: 'Eco Balance (Natural/Organic)',
            description: "Earthy, sustainable, and textured. Uses wabi-sabi principles and natural tones.",
            vibe: ['Pure', 'Sustainable', 'Raw'],
            specs: { radius: '32px / Organic', shadows: 'None', spacing: 'Generous', typography_style: 'Serif / Fraunces' },
            best_for: ['Organic Food', 'Skincare', 'Sustainable Home']
        },
        {
            id: 'uber_move',
            name: 'Base (Uber/Logistics)',
            description: "Movement and grid-based bold logic. High contrast black & white.",
            vibe: ['Bold', 'Fast', 'Global'],
            specs: { radius: '8px', shadows: 'Elevation cards', spacing: 'Systematic', typography_style: 'Uber Move' },
            best_for: ['Travel', 'Logistics', 'Delivery', 'Ride-sharing']
        },
        {
            id: 'spotify_dark',
            name: 'Encore (Spotify/Music)',
            description: "Dark-mode native, vibrant content focus using album art logic.",
            vibe: ['Cool', 'Vibrant', 'Vocal'],
            specs: { radius: 'Pill', shadows: 'Color glows', spacing: 'Media grid', typography_style: 'Circular' },
            best_for: ['Music', 'Podcast', 'Content Creation', 'Gen Z']
        }
    ] as DesignSystem[],

    fontPairings: [
        { id: 'startup', category: 'Modern', heading: 'DM Sans', body: 'Archivo', rationale: 'Clean startup vibe.' },
        { id: 'fintech', category: 'Tech', heading: 'Manrope', body: 'Inter', rationale: 'Maximum legibility for data.' },
        { id: 'luxury', category: 'Luxury', heading: 'Playfair Display', body: 'Montserrat', rationale: 'Elegant but modern.' },
        { id: 'medical', category: 'Health', heading: 'Figtree', body: 'Open Sans', rationale: 'Friendly and accessible.' },
        { id: 'creative', category: 'Editorial', heading: 'Syne', body: 'Space Grotesk', rationale: 'Artistic and bold.' },
        { id: 'premium_serif', category: 'Luxury', heading: 'Cormorant Garamond', body: 'Proxima Nova', rationale: 'Literary and high-end.' },
        { id: 'retro', category: 'Playful', heading: 'Fraunces', body: 'Nunito', rationale: 'Nostalgic and warm.' },
        { id: 'impact', category: 'Corporate', heading: 'Oswald', body: 'Cardo', rationale: 'Authoritative and bold.' },
        { id: 'geometric', category: 'Tech', heading: 'Poppins', body: 'Roboto', rationale: 'Geometric balance.' },
        { id: 'minimal_swiss', category: 'Modern', heading: 'Inter', body: 'Inter', rationale: 'Utility-first Swiss design.' }
    ] as FontPairing[]
};

export const getDesignSystemSummary = () => {
    return DESIGN_LIBRARY.systems.map(s =>
        `- ${s.name} (${s.vibe.join(', ')}): ${s.description} [Best for: ${s.best_for.join(', ')}]`
    ).join('\n');
};

export const getFontPairingSummary = () => {
    return DESIGN_LIBRARY.fontPairings.map(f =>
        `- [${f.category}] ${f.heading} + ${f.body}: ${f.rationale}`
    ).join('\n');
};
