import React, { useState, useRef } from "react";
import { TShirt } from "../types";
import { defaultTShirts } from "../data/defaultAssets";
import { Upload, Check, Palette } from "lucide-react";

interface TShirtSelectorProps {
  selectedTShirt: TShirt;
  onTShirtSelect: (tShirt: TShirt) => void;
  onCustomTShirtUpload: (imageBase64: string, name: string) => void;
  tShirtTexture: "none" | "piquet" | "heather";
  onTextureChange: (texture: "none" | "piquet" | "heather") => void;
  id?: string;
}

export const TShirtSelector: React.FC<TShirtSelectorProps> = ({
  selectedTShirt,
  onTShirtSelect,
  onCustomTShirtUpload,
  tShirtTexture,
  onTextureChange,
  id = "tshirt-selector-panel",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [customColor, setCustomColor] = useState(selectedTShirt.color);

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
        onCustomTShirtUpload(base64, file.name);
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

  // Custom Color Selection
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onTShirtSelect({
      id: "custom-color",
      name: `Custom Color Shirt`,
      color: color,
      colorName: "Custom Hue",
      isCustom: true,
    });
  };

  return (
    <div id={id} className="flex flex-col gap-5 bg-white p-5 border border-[var(--border)] rounded-2xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Choose a Color</h3>
        <p className="text-xs text-[var(--text-tertiary)]">Pick a polo shirt color or upload your own product photo.</p>
      </div>

      {/* Grid of default polo shirt swatches */}
      <div className="grid grid-cols-5 gap-2.5">
        {defaultTShirts.map((shirt) => {
          const isSelected = selectedTShirt.id === shirt.id && !selectedTShirt.isCustom;
          return (
            <button
              key={shirt.id}
              onClick={() => onTShirtSelect(shirt)}
              className={`group relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected 
                  ? "border-[var(--accent)] bg-[var(--accent-light)]" 
                  : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]"
              }`}
              title={`${shirt.name} (${shirt.colorName})`}
            >
              {/* Color Swatch Dot */}
              <div
                className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center transition"
                style={{ backgroundColor: shirt.color, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
              >
                {isSelected && (
                  <Check className={`w-4 h-4 ${
                    shirt.id === "black" ? "text-white" : "text-slate-900"
                  }`} />
                )}
              </div>
              <span className="text-[10px] font-medium text-[var(--text-secondary)] mt-1 truncate max-w-full px-1">
                {shirt.colorName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-panels for advanced custom options */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]">
        {/* Custom Color Wheel */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            Custom Shade
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={handleColorChange}
              className="w-7 h-7 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {customColor.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Fabric Texture selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">
            Fabric Texture
          </label>
          <select
            value={tShirtTexture}
            onChange={(e) => onTextureChange(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--border-hover)] transition focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="none">Flat Jersey Cotton</option>
            <option value="piquet">Premium Piquet Mesh</option>
            <option value="heather">Vintage Heather Knit</option>
          </select>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        id="tshirt-upload-dropzone"
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
          <span className="text-xs font-semibold text-[var(--text-primary)] block">Upload T-Shirt Photo</span>
          <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">Drag & drop or click to select</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
