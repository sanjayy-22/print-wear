import React, { useState, useRef } from "react";
import { Logo } from "../types";
import { defaultLogos } from "../data/defaultAssets";
import { Upload, Check, Info } from "lucide-react";

interface LogoSelectorProps {
  selectedLogo: Logo | null;
  onLogoSelect: (logo: Logo) => void;
  onCustomLogoUpload: (imageBase64: string, name: string) => void;
  id?: string;
}

export const LogoSelector: React.FC<LogoSelectorProps> = ({
  selectedLogo,
  onLogoSelect,
  onCustomLogoUpload,
  id = "logo-selector-panel",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // File Upload Handlers (Supports drag-and-drop and manual select)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onCustomLogoUpload(base64, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div id={id} className="flex flex-col gap-5 bg-white p-5 border border-[var(--border)] rounded-2xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Choose a Logo</h3>
        <p className="text-xs text-[var(--text-tertiary)]">Pick a default logo or upload your own transparent design.</p>
      </div>

      {/* Grid of default logos */}
      <div className="flex flex-col gap-2">
        {defaultLogos.map((logo) => {
          const isSelected = selectedLogo?.id === logo.id && !selectedLogo.isCustom;
          const isSairam = logo.id === "sairam";

          return (
            <button
              key={logo.id}
              onClick={() => onLogoSelect(logo)}
              className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left cursor-pointer ${
                isSelected 
                  ? "border-[var(--accent)] bg-[var(--accent-light)]" 
                  : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {/* Logo Preview box */}
              <div className={`w-12 h-12 rounded-lg bg-white border border-[var(--border)] p-1.5 flex items-center justify-center relative overflow-hidden shrink-0 ${
                isSairam ? "w-16" : ""
              }`}>
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Logo metadata details */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {logo.name}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {isSairam ? "Corporate & Education Logo" : "Vector branding design"}
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="bg-[var(--accent)] text-white p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Transparent Logo upload zone */}
      <div
        id="logo-upload-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition ${
          isDragging 
            ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" 
            : "border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
        }`}
      >
        <Upload className="w-5 h-5" />
        <div className="text-center">
          <span className="text-xs font-semibold text-[var(--text-primary)] block">Upload Custom Logo</span>
          <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Drag & drop PNG/SVG or click here</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Transparency notice helper */}
      <div className="flex items-start gap-2.5 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
        <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)] font-semibold block mb-0.5">Transparency Tip</strong>
          Use transparent PNG or SVG logos for the most realistic blending with the shirt fabric.
        </p>
      </div>
    </div>
  );
};
