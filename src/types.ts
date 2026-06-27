export type MixBlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface TShirt {
  id: string;
  name: string;
  url?: string; // Optional image URL or Base64
  color: string; // Display hex color for UI highlights
  colorName: string; // e.g., 'Yellow', 'Navy Blue'
  isCustom?: boolean;
}

export interface Logo {
  id: string;
  name: string;
  url: string; // Image URL or Base64
  isCustom?: boolean;
}

export interface Placement {
  x: number; // Percentage offset on the chest from left (default left chest is around 62-68%)
  y: number; // Percentage offset on the chest from top (default left chest is around 25-30%)
  scale: number; // Scaling factor (e.g. 1.0 = original size)
  rotation: number; // In degrees
  opacity: number; // 0 to 1
  mixBlendMode: MixBlendMode;
}

export interface GeminiAnalysis {
  placementRating: number;
  contrastRating: number;
  aestheticScore: number;
  feedback: string;
  suggestions: string[];
  brandTheme: string;
}
