import { BrandIdentity } from './types';

export const triggerCanvaAutofill = async (identity: BrandIdentity) => {
    try {
        const response = await fetch('/api/canva/autofill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Canva sync failed');
        }

        return await response.json();
    } catch (error) {
        console.error("Canva service error:", error);
        throw error;
    }
};

/**
 * Maps BrandIdentity to Canva Autofill data structure
 * @param identity The BrandIdentity object
 * @returns Object formatted for Canva Autofill 'data' field
 */
export const mapIdentityToCanvaData = (identity: BrandIdentity) => {
    return {
        brand_name: {
            type: "text",
            text: identity.slogan_tone.tagline?.split(',')[0] || "My Brand"
        },
        brand_tagline: {
            type: "text",
            text: identity.slogan_tone.tagline || ""
        },
        primary_color: {
            type: "text", // Canva usually expects hex in a text field if for text labels, colors are handled differently via styles
            text: identity.color_palette.primary
        },
        hero_image: identity.visuals?.hero_url ? {
            type: "image",
            asset_id: "", // In a real flow, you'd upload the image to Canva first and get an asset_id
            url: identity.visuals.hero_url
        } : undefined,
        // Add more mappings as needed for your specific Canva template
    };
};
