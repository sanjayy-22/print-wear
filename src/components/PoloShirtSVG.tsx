import React from "react";

interface PoloShirtProps {
  color: string;
  texture: "none" | "piquet" | "heather";
  customImage?: string; // If user uploaded a custom shirt image
  className?: string;
  id?: string;
  neckCutoutWidth?: number;
  neckCutoutHeight?: number;
}

export const PoloShirtSVG: React.FC<PoloShirtProps> = ({
  color,
  texture,
  customImage,
  className = "w-full h-full",
  id = "polo-shirt-svg-container",
  neckCutoutWidth = 0,
  neckCutoutHeight = 0,
}) => {
  if (customImage) {
    return (
      <div id={id} className={`relative flex items-center justify-center overflow-hidden bg-[var(--bg-canvas)] rounded-2xl ${className}`}>
        <img
          id="custom-shirt-image"
          src={customImage}
          alt="Custom Uploaded T-Shirt"
          className="max-w-full max-h-full object-contain pointer-events-none"
          referrerPolicy="no-referrer"
        />
        {/* Semi-transparent fabric overlay to help blend the logo even on custom shirts */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 bg-radial from-transparent to-black/5"
          style={{ mixBlendMode: "overlay" }}
        />
      </div>
    );
  }

  // Beautiful SVG rendering of a Premium Polo Shirt
  return (
    <svg
      id={id}
      viewBox="0 0 500 500"
      className={`${className} drop-shadow-lg select-none`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft Drop Shadow for the collar and button placket */}
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        <filter id="soft-shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
        </filter>

        {/* Piquet fabric texture pattern */}
        <pattern id="piquet-texture" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="none" />
          <circle cx="2" cy="2" r="1" fill="#000000" opacity="0.06" />
        </pattern>

        {/* Heather/Textured knit pattern */}
        <pattern id="heather-texture" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="8" y2="8" stroke="#000000" strokeWidth="1" opacity="0.08" />
          <line x1="8" y1="0" x2="0" y2="8" stroke="#000000" strokeWidth="1" opacity="0.04" />
        </pattern>

        {/* Soft fabric crease linear gradient */}
        <linearGradient id="fold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="30%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="75%" stopColor="#000000" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>

        {/* Radial highlight for professional lighting */}
        <radialGradient id="light-highlight" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#000000" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </radialGradient>

        {/* Soft edge blur for neck cutout */}
        <filter id="cutout-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        {/* Dynamic Neck Cutout Mask */}
        <mask id="neck-mask">
          <rect x="-100" y="-100" width="700" height="700" fill="white" />
          {neckCutoutWidth > 0 && neckCutoutHeight > 0 && (
            <ellipse
              cx="250"
              cy="75"
              rx={neckCutoutWidth}
              ry={neckCutoutHeight}
              fill="black"
              filter="url(#cutout-blur)"
            />
          )}
        </mask>
      </defs>

      {/* Main Shirt Body Group */}
      <g id="shirt-body-group" mask="url(#neck-mask)">
        {/* Back neck inner collar area */}
        <path
          id="back-inner-neck"
          d="M 200 80 Q 250 110 300 80 C 290 70 210 70 200 80 Z"
          fill="#1e293b"
          opacity="0.3"
        />

        {/* Base Shirt Shape: Torso + Sleeves */}
        <path
          id="main-shirt-path"
          d="M 200 80 
             C 170 85, 120 115, 80 150 
             C 75 155, 78 165, 85 170 
             L 115 195 
             C 120 200, 130 198, 135 190 
             L 150 165 
             L 155 420 
             C 155 435, 165 440, 180 440 
             L 320 440 
             C 335 440, 345 435, 345 420 
             L 350 165 
             L 365 190 
             C 370 198, 380 200, 385 195 
             L 415 170 
             C 422 165, 425 155, 420 150 
             C 380 115, 330 85, 300 80 
             C 285 102, 215 102, 200 80 Z"
          fill={color}
        />

        {/* Fabric Texture Layer */}
        {texture === "piquet" && (
          <path
            id="piquet-texture-overlay"
            d="M 200 80 
               C 170 85, 120 115, 80 150 
               C 75 155, 78 165, 85 170 
               L 115 195 
               C 120 200, 130 198, 135 190 
               L 150 165 
               L 155 420 
               C 155 435, 165 440, 180 440 
               L 320 440 
               C 335 440, 345 435, 345 420 
               L 350 165 
               L 365 190 
               C 370 198, 380 200, 385 195 
               L 415 170 
               C 422 165, 425 155, 420 150 
               C 380 115, 330 85, 300 80 
               C 285 102, 215 102, 200 80 Z"
            fill="url(#piquet-texture)"
          />
        )}
        {texture === "heather" && (
          <path
            id="heather-texture-overlay"
            d="M 200 80 
               C 170 85, 120 115, 80 150 
               C 75 155, 78 165, 85 170 
               L 115 195 
               C 120 200, 130 198, 135 190 
               L 150 165 
               L 155 420 
               C 155 435, 165 440, 180 440 
               L 320 440 
               C 335 440, 345 435, 345 420 
               L 350 165 
               L 365 190 
               C 370 198, 380 200, 385 195 
               L 415 170 
               C 422 165, 425 155, 420 150 
               C 380 115, 330 85, 300 80 
               C 285 102, 215 102, 200 80 Z"
            fill="url(#heather-texture)"
          />
        )}

        {/* Realistic Creases & Folds Layer (overlayed for shading) */}
        <path
          id="fabric-folds-overlay"
          d="M 200 80 
             C 170 85, 120 115, 80 150 
             C 75 155, 78 165, 85 170 
             L 115 195 
             C 120 200, 130 198, 135 190 
             L 150 165 
             L 155 420 
             C 155 435, 165 440, 180 440 
             L 320 440 
             C 335 440, 345 435, 345 420 
             L 350 165 
             L 365 190 
             C 370 198, 380 200, 385 195 
             L 415 170 
             C 422 165, 425 155, 420 150 
             C 380 115, 330 85, 300 80 
             C 285 102, 215 102, 200 80 Z"
          fill="url(#fold-grad)"
          style={{ mixBlendMode: "multiply" }}
          opacity="0.8"
        />

        {/* Professional Studio Lighting layer */}
        <path
          id="lighting-shading-overlay"
          d="M 200 80 
             C 170 85, 120 115, 80 150 
             C 75 155, 78 165, 85 170 
             L 115 195 
             C 120 200, 130 198, 135 190 
             L 150 165 
             L 155 420 
             C 155 435, 165 440, 180 440 
             L 320 440 
             C 335 440, 345 435, 345 420 
             L 350 165 
             L 365 190 
             C 370 198, 380 200, 385 195 
             L 415 170 
             C 422 165, 425 155, 420 150 
             C 380 115, 330 85, 300 80 
             C 285 102, 215 102, 200 80 Z"
          fill="url(#light-highlight)"
          style={{ mixBlendMode: "overlay" }}
          opacity="0.65"
        />
      </g>

      {/* Polo Collar and Buttons Details Group (with soft drop-shadows) */}
      <g id="polo-collar-placket" filter="url(#shadow)" mask="url(#neck-mask)">
        {/* Sleeve rib cuffs */}
        {/* Left Sleeve cuff */}
        <path
          id="left-sleeve-cuff"
          d="M 85 170 L 115 195 C 113 190, 108 180, 105 175 C 98 168, 91 163, 85 170 Z"
          fill="#000000"
          opacity="0.15"
        />
        {/* Right Sleeve cuff */}
        <path
          id="right-sleeve-cuff"
          d="M 415 170 L 385 195 C 387 190, 392 180, 395 175 C 402 168, 409 163, 415 170 Z"
          fill="#000000"
          opacity="0.15"
        />

        {/* Button Placket (the vertical button strip) */}
        <rect
          id="button-placket-base"
          x="238"
          y="95"
          width="24"
          height="95"
          rx="3"
          fill={color}
          filter="url(#shadow)"
        />
        <rect
          id="button-placket-shade"
          x="238"
          y="95"
          width="24"
          height="95"
          rx="3"
          fill="#000000"
          opacity="0.08"
        />
        <rect
          id="button-placket-seams"
          x="240"
          y="95"
          width="20"
          height="95"
          fill="none"
          stroke="#000000"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.3"
        />

        {/* Buttons */}
        {/* Button 1 */}
        <circle cx="250" cy="115" r="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <circle cx="250" cy="115" r="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1,1" />
        {/* Button 2 */}
        <circle cx="250" cy="145" r="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <circle cx="250" cy="145" r="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1,1" />
        {/* Button 3 */}
        <circle cx="250" cy="175" r="4.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" />
        <circle cx="250" cy="175" r="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="1,1" />

        {/* Left Collar flap */}
        <path
          id="collar-flap-left"
          d="M 250 100 
             C 240 100, 205 92, 195 80
             C 190 75, 200 70, 215 70
             C 230 70, 245 90, 250 100 Z"
          fill={color}
          filter="url(#shadow)"
        />
        <path
          id="collar-flap-left-shade"
          d="M 250 100 
             C 240 100, 205 92, 195 80
             C 190 75, 200 70, 215 70
             C 230 70, 245 90, 250 100 Z"
          fill="#ffffff"
          opacity="0.08"
        />

        {/* Right Collar flap */}
        <path
          id="collar-flap-right"
          d="M 250 100 
             C 260 100, 295 92, 305 80
             C 310 75, 300 70, 285 70
             C 270 70, 255 90, 250 100 Z"
          fill={color}
          filter="url(#shadow)"
        />
        <path
          id="collar-flap-right-shade"
          d="M 250 100 
             C 260 100, 295 92, 305 80
             C 310 75, 300 70, 285 70
             C 270 70, 255 90, 250 100 Z"
          fill="#000000"
          opacity="0.12"
        />

        {/* Shadow under collar folds */}
        <path
          id="collar-under-shadow"
          d="M 195 80 Q 250 112 305 80 C 285 92, 215 92, 195 80 Z"
          fill="#000000"
          opacity="0.25"
        />
      </g>
    </svg>
  );
};
