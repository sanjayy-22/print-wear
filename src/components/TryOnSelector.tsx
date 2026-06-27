import React, { useState, useRef } from "react";
import { Upload, Check, User, Lightbulb } from "lucide-react";

export interface TryOnModel {
  id: string;
  name: string;
  url?: string;
  gender: "male" | "female" | "custom" | "flat";
  defaultShirtPlacement: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
  };
}

export const defaultModels: TryOnModel[] = [
  {
    id: "flat",
    name: "None (Flat Lay)",
    gender: "flat",
    defaultShirtPlacement: { x: 50, y: 50, scale: 1.0, rotation: 0 },
  },
  {
    id: "male",
    name: "Male Model",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600&h=800",
    gender: "male",
    defaultShirtPlacement: { x: 49, y: 62, scale: 0.98, rotation: 0 },
  },
  {
    id: "female",
    name: "Female Model",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=800",
    gender: "female",
    defaultShirtPlacement: { x: 50, y: 60, scale: 0.92, rotation: 0 },
  },
];

interface TryOnSelectorProps {
  selectedModel: TryOnModel;
  onModelSelect: (model: TryOnModel) => void;
  customModelImage?: string;
  onCustomModelUpload: (imageBase64: string, name: string) => void;
  id?: string;
}

export const TryOnSelector: React.FC<TryOnSelectorProps> = ({
  selectedModel,
  onModelSelect,
  customModelImage,
  onCustomModelUpload,
  id = "tryon-selector-panel",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file containing a portrait.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onCustomModelUpload(base64, file.name);
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

  // Compile active models list including custom uploaded portrait if available
  const activeModelsList = [...defaultModels];
  if (customModelImage) {
    activeModelsList.push({
      id: "custom",
      name: "Your Portrait Photo",
      url: customModelImage,
      gender: "custom",
      defaultShirtPlacement: { x: 50, y: 55, scale: 0.85, rotation: 0 },
    });
  }

  return (
    <div id={id} className="flex flex-col gap-5 bg-white p-5 border border-[var(--border)] rounded-2xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Select a Model</h3>
        <p className="text-xs text-[var(--text-tertiary)]">
          Try your outfit on a model or upload your own photo.
        </p>
      </div>

      {/* Grid of default models */}
      <div className="flex flex-col gap-2">
        {activeModelsList.map((model) => {
          const isSelected = selectedModel.id === model.id;
          return (
            <button
              key={model.id}
              onClick={() => onModelSelect(model)}
              className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left cursor-pointer ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {/* Preview Thumbnail */}
              <div className="w-11 h-14 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border)] flex items-center justify-center relative overflow-hidden shrink-0">
                {model.url ? (
                  <img
                    src={model.url}
                    alt={model.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4 text-[var(--text-tertiary)]" />
                )}
              </div>

              {/* Model Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[var(--text-primary)] truncate flex items-center gap-1.5">
                  {model.name}
                  {model.gender === "custom" && (
                    <span className="bg-[var(--accent-light)] text-[9px] font-semibold text-[var(--accent)] px-1.5 py-0.5 rounded">
                      Yours
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {model.id === "flat"
                    ? "Flat-lay shirt customization"
                    : `${model.gender === "custom" ? "Your uploaded" : model.gender} model`}
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

      {/* Upload Person Portrait Zone */}
      <div
        id="person-photo-upload-dropzone"
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
          <span className="text-xs font-semibold text-[var(--text-primary)] block">Upload Your Photo</span>
          <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">
            Drag & drop your portrait or click to browse
          </span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Alignment helper tips */}
      <div className="flex items-start gap-2.5 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
        <Lightbulb className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)] font-semibold block mb-0.5">Fitting Tip</strong>
          Use the "Adjust" tab to position and scale the shirt to fit your photo perfectly.
        </p>
      </div>
    </div>
  );
};
