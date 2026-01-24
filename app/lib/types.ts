export type BrandDNA = {
  purpose: string;
  values: string[];
  usp: string;
};

export type TargetAudience = {
  demographics: string;
  psychographics: string;
  archetype: string;
};

export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  rationale: string;
};

export type Typography = {
  heading_font: string;
  body_font: string;
  style_rationale: string;
};

export type SloganTone = {
  tagline: string;
  tone_of_voice: string;
  keywords: string[];
};

export type CompetitorAnalysis = {
  market_gap: string;
  differentiation: string;
};

export type BrandIdentity = {
  brand_name: string;
  brand_dna: BrandDNA;
  target_audience: TargetAudience;
  color_palette: ColorPalette;
  typography: Typography;
  slogan_tone: SloganTone;
  competitor_analysis: CompetitorAnalysis;
  visuals?: {
    hero_url?: string;
    social_url?: string;
    logo_url?: string;
  };
  metadata?: {
    industry?: string;
    style_notes?: string;
  };
  status?: 'draft' | 'confirmed';
  deleted?: boolean;
};

export const INITIAL_BRAND_IDENTITY: BrandIdentity = {
  brand_name: "",
  brand_dna: { purpose: "", values: [], usp: "" },
  target_audience: { demographics: "", psychographics: "", archetype: "" },
  color_palette: { primary: "", secondary: "", accent: "", rationale: "" },
  typography: { heading_font: "", body_font: "", style_rationale: "" },
  slogan_tone: { tagline: "", tone_of_voice: "", keywords: [] },
  competitor_analysis: { market_gap: "", differentiation: "" },
  visuals: {
    hero_url: "",
    social_url: "",
    logo_url: ""
  },
  status: 'draft'
};

export type BrandIdentityKeys = keyof BrandIdentity;
