import { TShirt, Logo } from "../types";

export const defaultTShirts: TShirt[] = [
  {
    id: "sand_beige",
    name: "Sand Beige Polo",
    color: "#C5B398",
    colorName: "Sand Beige",
    url: "/assets/sand_beige_knit_polo.png"
  },
  {
    id: "navy_blue",
    name: "Navy Blue Polo",
    color: "#1F2D3D",
    colorName: "Navy Blue",
    url: "/assets/navy_blue_knit_polo.png"
  },
  {
    id: "olive_green",
    name: "Olive Green Polo",
    color: "#3E4C3E",
    colorName: "Olive Green",
    url: "/assets/olive_green_knit_polo.png"
  }
];

// High-fidelity vector SVG Data URLs for the default logos
export const defaultLogos: Logo[] = [
  {
    id: "sairam",
    name: "Sairam Institutions Logo",
    url: "/assets/sairam_logo.png"
  },
  {
    id: "zenith",
    name: "Zenith Tech Crest",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
        <path d="M 50 20 L 75 40 L 50 60 L 25 40 Z" fill="#38bdf8" opacity="0.2"/>
        <polygon points="50,30 65,45 50,60 35,45" fill="#38bdf8"/>
        <line x1="50" y1="5" x2="50" y2="95" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4" opacity="0.5"/>
      </svg>
    `)}`
  },
  {
    id: "alpha",
    name: "Alpha Developer Emblem",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <rect width="100" height="100" rx="16" fill="#1e1b4b" stroke="#f43f5e" stroke-width="3"/>
        <text x="50" y="62" font-family="'JetBrains Mono', monospace" font-weight="900" font-size="42" fill="#f43f5e" text-anchor="middle">&lt;/&gt;</text>
        <circle cx="50" cy="50" r="42" stroke="#f43f5e" stroke-width="1" stroke-dasharray="2,4" opacity="0.5"/>
      </svg>
    `)}`
  },
  {
    id: "gold_crest",
    name: "Regal Gold Crest",
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <circle cx="50" cy="50" r="44" fill="#1c1917" stroke="#ca8a04" stroke-width="4"/>
        <circle cx="50" cy="50" r="38" fill="none" stroke="#ca8a04" stroke-width="1" stroke-dasharray="2,2"/>
        <path d="M 50 22 C 38 22, 32 35, 32 50 C 32 65, 42 75, 50 78 C 58 75, 68 65, 68 50 C 68 35, 62 22, 50 22 Z" fill="none" stroke="#ca8a04" stroke-width="2"/>
        <text x="50" y="58" font-family="'Playfair Display', Georgia, serif" font-weight="700" font-size="24" fill="#ca8a04" text-anchor="middle">R</text>
        <path d="M 38 72 Q 50 75 62 72" stroke="#ca8a04" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `)}`
  }
];
