import React, { useState, useEffect } from "react";
import { TShirt, Logo, Placement, GeminiAnalysis } from "./types";
import { defaultTShirts, defaultLogos } from "./data/defaultAssets";
import { TShirtSelector } from "./components/TShirtSelector";
import { LogoSelector } from "./components/LogoSelector";
import { DesignCanvas } from "./components/DesignCanvas";
import {
  Download,
  X,
  Share2,
  Loader2,
  CheckCircle,
  Shirt,
  ArrowLeft,
  ArrowRight,
  Upload,
  Camera,
  RotateCcw,
  Sparkles,
  Settings,
} from "lucide-react";

export default function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState<"customize" | "tryon">("customize");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [userApiKey, setUserApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem("wavespeed_api_key") || "";
    } catch {
      return "";
    }
  });

  // Primary State (Customize Page)
  const [selectedTShirt, setSelectedTShirt] = useState<TShirt>(defaultTShirts[0]);
  const [tShirtTexture, setTShirtTexture] = useState<"none" | "piquet" | "heather">("piquet");
  const [customTShirtImage, setCustomTShirtImage] = useState<string | undefined>(undefined);

  // Logo parameters
  const [selectedLogo, setSelectedLogo] = useState<Logo | null>(defaultLogos[0]);
  const [placement, setPlacement] = useState<Placement>({
    x: 64,
    y: 34,
    scale: 0.65,
    rotation: 0,
    opacity: 1,
    mixBlendMode: "multiply",
  });

  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"garment" | "logo" | "adjust">("garment");

  // Try-On Page State
  const [personImage, setPersonImage] = useState<string | null>(null);
  const [personImageName, setPersonImageName] = useState<string>("");
  const [isDraggingPerson, setIsDraggingPerson] = useState(false);

  // Costume fit adjustment state (Step 2)
  const [shirtPlacement, setShirtPlacement] = useState({
    x: 50,
    y: 60,
    scale: 0.85,
    rotation: 0,
    neckCutoutWidth: 35,
    neckCutoutHeight: 20,
    opacity: 0.95,
    mixBlendMode: "normal",
  });

  // Reset try-on placement when person image changes
  useEffect(() => {
    setShirtPlacement({
      x: 50,
      y: 60,
      scale: 0.85,
      rotation: 0,
      neckCutoutWidth: 35,
      neckCutoutHeight: 20,
      opacity: 0.95,
      mixBlendMode: "normal",
    });
    setFinalMockupUrl(null);
  }, [personImage]);

  // Render & AI States
  const [isGeneratingRender, setIsGeneratingRender] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<string>("");
  const [renderProgressPercent, setRenderProgressPercent] = useState<number>(0);
  const [finalMockupUrl, setFinalMockupUrl] = useState<string | null>(null);



  // Handle Custom Garment Upload
  const handleCustomTShirtUpload = (base64: string, name: string) => {
    setCustomTShirtImage(base64);
    setSelectedTShirt({
      id: "custom-upload",
      name: name,
      color: "#f8fafc",
      colorName: "Custom",
      isCustom: true,
    });
  };

  // Handle Custom Logo Upload
  const handleCustomLogoUpload = (base64: string, name: string) => {
    const newLogo: Logo = {
      id: `custom-logo-${Date.now()}`,
      name: name,
      url: base64,
      isCustom: true,
    };
    setSelectedLogo(newLogo);
  };

  // Handle Person Photo Upload
  const handlePersonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processPersonFile(files[0]);
    }
  };

  const processPersonFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      if (base64) {
        setPersonImage(base64);
        setPersonImageName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePersonDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPerson(true);
  };
  const handlePersonDragLeave = () => setIsDraggingPerson(false);
  const handlePersonDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPerson(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processPersonFile(files[0]);
  };

  // High-Resolution 1000px Canvas Compiler
  const compileHighResDesign = (includePerson: boolean = false, includeLogo: boolean = true): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 1000;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Failed to get 2d graphics context");

        const drawShirtAndLogo = (shirtImg: HTMLImageElement) => {
          if (includePerson && personImage) {
            // Compile with the person photo as the background (matching client preview)
            const personImg = new Image();
            personImg.crossOrigin = "anonymous";
            personImg.onload = () => {
              // Draw person background
              ctx.drawImage(personImg, 0, 0, 1000, 1000);

              // Draw shirt overlay
              const sX = (shirtPlacement.x / 100) * 1000;
              const sY = (shirtPlacement.y / 100) * 1000;

              ctx.save();
              ctx.translate(sX, sY);
              ctx.rotate((shirtPlacement.rotation * Math.PI) / 180);
              ctx.scale(shirtPlacement.scale, shirtPlacement.scale);

              ctx.globalAlpha = shirtPlacement.opacity !== undefined ? shirtPlacement.opacity : 0.95;
              if (shirtPlacement.mixBlendMode && shirtPlacement.mixBlendMode !== "normal") {
                ctx.globalCompositeOperation =
                  shirtPlacement.mixBlendMode === "multiply" ? "multiply" : "source-over";
              }

              ctx.drawImage(shirtImg, -500, -500, 1000, 1000);

              ctx.globalAlpha = 1.0;
              ctx.globalCompositeOperation = "source-over";

              if (selectedLogo && includeLogo) {
                const logoImg = new Image();
                logoImg.crossOrigin = "anonymous";
                logoImg.onload = () => {
                  const lX = -500 + (placement.x / 100) * 1000;
                  const lY = -500 + (placement.y / 100) * 1000;

                  ctx.save();
                  ctx.translate(lX, lY);
                  ctx.rotate((placement.rotation * Math.PI) / 180);
                  ctx.globalAlpha = placement.opacity;

                  if (placement.mixBlendMode && placement.mixBlendMode !== "normal") {
                    ctx.globalCompositeOperation =
                      placement.mixBlendMode === "multiply" ? "multiply" : "source-over";
                  }

                  const baseSize = 240;
                  const logoWidth = baseSize * placement.scale;
                  const aspect = logoImg.width / logoImg.height;
                  const logoHeight = logoWidth / aspect;

                  ctx.drawImage(logoImg, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
                  ctx.restore();
                  ctx.restore();
                  resolve(canvas.toDataURL("image/png"));
                };
                logoImg.src = selectedLogo.url;
              } else {
                ctx.restore();
                resolve(canvas.toDataURL("image/png"));
              }
            };
            personImg.src = personImage;
          } else {
            // Draw flat lay shirt only
            ctx.drawImage(shirtImg, 0, 0, 1000, 1000);

            if (selectedLogo && includeLogo) {
              const logoImg = new Image();
              logoImg.crossOrigin = "anonymous";
              logoImg.onload = () => {
                ctx.save();
                const targetX = (placement.x / 100) * 1000;
                const targetY = (placement.y / 100) * 1000;

                ctx.translate(targetX, targetY);
                ctx.rotate((placement.rotation * Math.PI) / 180);
                ctx.globalAlpha = placement.opacity;

                if (placement.mixBlendMode && placement.mixBlendMode !== "normal") {
                  ctx.globalCompositeOperation =
                    placement.mixBlendMode === "multiply" ? "multiply" : "source-over";
                }

                const baseSize = 240;
                const logoWidth = baseSize * placement.scale;
                const aspect = logoImg.width / logoImg.height;
                const logoHeight = logoWidth / aspect;

                ctx.drawImage(logoImg, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
                ctx.restore();
                resolve(canvas.toDataURL("image/png"));
              };
              logoImg.src = selectedLogo.url;
            } else {
              resolve(canvas.toDataURL("image/png"));
            }
          }
        };

        const shirtImg = new Image();
        shirtImg.crossOrigin = "anonymous";
        shirtImg.onload = () => shirtImg.src && drawShirtAndLogo(shirtImg);
        shirtImg.onerror = () => reject("Failed to load shirt template");

        const shirtUrl = customTShirtImage || selectedTShirt.url;
        if (shirtUrl) {
          shirtImg.src = shirtUrl;
        } else {
          const svgElement = document.getElementById("polo-shirt-svg-container");
          if (!svgElement) {
            reject("Shirt SVG not found");
            return;
          }
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
          shirtImg.src = URL.createObjectURL(svgBlob);
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  // Trigger WaveSpeed AI Virtual Try-On
  const handleTriggerTryOn = async () => {
    if (!personImage) {
      alert("Please upload your photo first.");
      return;
    }

    setIsGeneratingRender(true);
    setRenderProgressPercent(10);
    setRenderProgress("Preparing your design...");

    try {
      setRenderProgressPercent(30);
      setRenderProgress("Compiling custom outfit...");

      const clothingImg = await compileHighResDesign(false, true);

      let response;
      let result;
      let isStaticDeploy = false;

      try {
        setRenderProgressPercent(50);
        setRenderProgress("Connecting to local API proxy...");
        
        response = await fetch("/api/wavespeed/tryon", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            person_image: personImage,
            clothing_image: clothingImg,
            wavespeed_api_key: userApiKey,
          }),
        });

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("text/html") || response.status === 404) {
          isStaticDeploy = true;
        } else {
          result = await response.json();
        }
      } catch (err) {
        isStaticDeploy = true;
      }

      if (isStaticDeploy) {
        if (!userApiKey) {
          alert("Static Deploy Detected: To perform virtual try-ons directly in the browser on Netlify, please configure your WaveSpeed API Key in the Settings (gear icon in the top header).");
          setIsGeneratingRender(false);
          return;
        }

        setRenderProgressPercent(60);
        setRenderProgress("Static site mode: Requesting WaveSpeed AI directly from browser...");

        const directResponse = await fetch("https://api.wavespeed.ai/api/v3/openai/gpt-image-2/edit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userApiKey}`,
          },
          body: JSON.stringify({
            enable_base64_output: false,
            enable_sync_mode: true,
            images: [personImage, clothingImg],
            output_format: "png",
            prompt: "Change the clothes of the person in the first image to wear the customized polo shirt shown in the second image. Fit it naturally on their body, adjusting to their posture and lighting.",
            quality: "medium",
            resolution: "1k"
          }),
        });

        if (!directResponse.ok) {
          const errText = await directResponse.text();
          let parsedErr;
          try {
            parsedErr = JSON.parse(errText);
          } catch {}
          throw new Error(parsedErr?.error || parsedErr?.message || `WaveSpeed API returned status ${directResponse.status}`);
        }

        result = await directResponse.json();
      }

      if (result.error) {
        console.error("WaveSpeed API error:", result.error);
        alert(`Try-On Failed: ${result.error}. Please ensure a valid WaveSpeed API Key is configured in the Settings (gear icon in the top header).`);
        setIsGeneratingRender(false);
        return;
      }

      setRenderProgressPercent(95);
      setRenderProgress("Finalizing try-on...");

      const outputUrl = Array.isArray(result.outputs) 
        ? result.outputs[0] 
        : Array.isArray(result.output) 
          ? result.output[0] 
          : (result.output || result.outputs);

      setTimeout(() => {
        setFinalMockupUrl(outputUrl || clothingImg);
        setIsGeneratingRender(false);
        setRenderProgressPercent(100);
      }, 300);
    } catch (err: any) {
      console.error(err);
      alert(`Try-on connection error: ${err.message}. Please verify your network and check that you have entered the correct WaveSpeed API key in Settings.`);
      setIsGeneratingRender(false);
    }
  };



  const handleDownloadDesign = async () => {
    const src = finalMockupUrl;
    if (!src) return;
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `TryOn_${selectedTShirt.colorName}_${selectedLogo?.name || "Plain"}.png`;
      link.href = blobUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct blob download failed, falling back to open in tab:", err);
      const link = document.createElement("a");
      link.target = "_blank";
      link.href = src;
      link.click();
    }
  };

  // Settings Modal component
  const renderSettingsModal = () => {
    if (!showSettings) return null;
    
    return (
      <div className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Developer Configurations</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">WaveSpeed API Key</label>
              <input
                type="password"
                placeholder="Enter your WAVESPEED_API_KEY..."
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--accent)]"
              />
              <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed mt-1">
                Enter your private key to run virtual try-on models. Your key is stored locally in your browser cache (localStorage) and never exposed to the public.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-3.5 mt-1">
            <button
              onClick={() => setShowSettings(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-primary)] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                try {
                  localStorage.setItem("wavespeed_api_key", userApiKey);
                  alert("Settings saved successfully!");
                  setShowSettings(false);
                } catch {
                  alert("Failed to access local storage.");
                }
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition cursor-pointer"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "garment" as const, label: "Garment" },
    { id: "logo" as const, label: "Logo" },
    { id: "adjust" as const, label: "Adjust" },
  ];

  // Helper variables for canvas
  const flatShirtPlacement = {
    x: 50, y: 50, scale: 1.0, rotation: 0,
    neckCutoutWidth: 0, neckCutoutHeight: 0,
    opacity: 1, mixBlendMode: "normal",
  };
  
  const flatModel = { id: "flat" as const, name: "Flat Lay", gender: "flat" as const, defaultShirtPlacement: { x: 50, y: 50, scale: 1.0, rotation: 0 } };
  const customPersonModel = {
    id: "custom-person",
    name: "Your Portrait",
    url: personImage || undefined,
    gender: "custom" as const,
    defaultShirtPlacement: { x: 50, y: 60, scale: 0.85, rotation: 0 }
  };

  // ===================== PAGE: CUSTOMIZE =====================
  if (currentPage === "customize") {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center">
              <Shirt className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              Virtual Try-On Studio
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition cursor-pointer flex items-center"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-[var(--border)]" />
            <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
              Step 1 of 2 — Customize
            </div>
          </div>
        </header>

        {/* Main Grid Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Canvas */}
          <section className="lg:col-span-7 flex flex-col gap-5 bg-white p-5 md:p-6 border border-[var(--border)] rounded-2xl animate-fade-in" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Customize Your Garment</h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Pick a color, choose a logo, and adjust its layout details.</p>
              </div>
              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showGuidelines} onChange={(e) => setShowGuidelines(e.target.checked)} className="rounded" />
                Guides
              </label>
            </div>

            {/* Design Canvas flat lay */}
            <DesignCanvas
              tShirtColor={selectedTShirt.color}
              tShirtTexture={tShirtTexture}
              customTShirtImage={customTShirtImage || selectedTShirt.url}
              selectedLogo={selectedLogo}
              placement={placement}
              onPlacementChange={setPlacement}
              shirtPlacement={flatShirtPlacement}
              onShirtPlacementChange={() => {}}
              selectedModel={flatModel}
              activeAdjustmentMode="logo"
              showGuidelines={showGuidelines}
            />

            {/* Step Continue Button */}
            <button
              onClick={() => setCurrentPage("tryon")}
              className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-white active:scale-[0.98]"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              Continue to Try-On
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>

          {/* RIGHT: Customize Sidebar */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            {/* Tab bar */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-1 rounded-xl flex gap-1 w-full overflow-x-auto select-none shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-semibold transition cursor-pointer min-w-[60px] ${
                    activeTab === tab.id
                      ? "bg-white text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-white/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="transition-all duration-200">
              {activeTab === "garment" && (
                <TShirtSelector
                  selectedTShirt={selectedTShirt}
                  onTShirtSelect={(t) => { setSelectedTShirt(t); setCustomTShirtImage(undefined); }}
                  onCustomTShirtUpload={handleCustomTShirtUpload}
                  tShirtTexture={tShirtTexture}
                  onTextureChange={setTShirtTexture}
                />
              )}

              {activeTab === "logo" && (
                <LogoSelector
                  selectedLogo={selectedLogo}
                  onLogoSelect={setSelectedLogo}
                  onCustomLogoUpload={handleCustomLogoUpload}
                />
              )}

              {activeTab === "adjust" && (
                <div className="flex flex-col gap-4 bg-white p-5 border border-[var(--border)] rounded-2xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Fine-Tune Logo</h3>
                    <p className="text-xs text-[var(--text-tertiary)]">Adjust logo size, rotation, opacity and blend modes.</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-medium">Scale</span>
                      <span className="text-[var(--text-primary)] font-semibold">{Math.round(placement.scale * 100)}%</span>
                    </div>
                    <input type="range" min="0.2" max="2.0" step="0.05" value={placement.scale}
                      onChange={(e) => setPlacement({ ...placement, scale: parseFloat(e.target.value) })} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-medium">Rotation</span>
                      <span className="text-[var(--text-primary)] font-semibold">{placement.rotation}°</span>
                    </div>
                    <input type="range" min="-180" max="180" step="1" value={placement.rotation}
                      onChange={(e) => setPlacement({ ...placement, rotation: parseInt(e.target.value) })} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-medium">Opacity</span>
                      <span className="text-[var(--text-primary)] font-semibold">{Math.round(placement.opacity * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="1.0" step="0.05" value={placement.opacity}
                      onChange={(e) => setPlacement({ ...placement, opacity: parseFloat(e.target.value) })} />
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-[var(--border)] pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-medium">Blend Mode</span>
                      <span className="text-[10px] text-[var(--accent)] font-medium">Multiply recommended</span>
                    </div>
                    <select value={placement.mixBlendMode}
                      onChange={(e) => setPlacement({ ...placement, mixBlendMode: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg cursor-pointer hover:border-[var(--border-hover)] transition focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="normal">Normal (Solid overlay)</option>
                      <option value="multiply">Multiply (Fabric shadows)</option>
                      <option value="screen">Screen (Light graphics)</option>
                      <option value="overlay">Overlay (High contrast)</option>
                      <option value="darken">Darken Only</option>
                    </select>
                  </div>
                </div>
              )}
            </div>


          </section>
        </main>
        {renderSettingsModal()}
      </div>
    );
  }

  // ===================== PAGE: TRY-ON =====================
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)] px-6 py-3 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFinalMockupUrl(null);
              setCurrentPage("customize");
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border)] px-3 py-1.5 rounded-lg transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Design
          </button>
          <div className="h-5 w-px bg-[var(--border)]" />
          <h1 className="text-sm font-semibold text-[var(--text-primary)]">Virtual Try-On</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition cursor-pointer flex items-center"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-[var(--border)]" />
          <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
            Step 2 of 2 — Try On
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Design Preview or Final Result */}
        <section className="lg:col-span-6 flex flex-col gap-5 bg-white p-5 md:p-6 border border-[var(--border)] rounded-2xl animate-fade-in" style={{ boxShadow: 'var(--shadow-sm)' }}>
          {finalMockupUrl ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Your Try-On Result</h2>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">The customized shirt has been fitted onto your photo.</p>
                </div>
                <div className="bg-green-50 text-green-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="w-3.5 h-3.5" /> Try-On Complete
                </div>
              </div>
              <div className="relative w-full aspect-[3/4] bg-[var(--bg-canvas)] border border-[var(--border)] rounded-2xl overflow-hidden flex items-center justify-center">
                <img src={finalMockupUrl} alt="Try-On Result" className="max-w-full max-h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Customized Shirt Design</h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">This custom knit polo shirt will be fitted onto your photo.</p>
              </div>

              {/* Dyanmic flat shirt preview */}
              <div className="relative w-full aspect-square bg-[var(--bg-canvas)] border border-[var(--border)] rounded-2xl overflow-hidden flex items-center justify-center p-6">
                <DesignCanvas
                  tShirtColor={selectedTShirt.color}
                  tShirtTexture={tShirtTexture}
                  customTShirtImage={customTShirtImage || selectedTShirt.url}
                  selectedLogo={selectedLogo}
                  placement={placement}
                  onPlacementChange={setPlacement}
                  shirtPlacement={flatShirtPlacement}
                  onShirtPlacementChange={() => {}}
                  selectedModel={flatModel}
                  activeAdjustmentMode="logo"
                  showGuidelines={false}
                />
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Upload Photo + Try On Action / Success Actions */}
        <section className="lg:col-span-6 flex flex-col gap-5">
          {finalMockupUrl ? (
            <div className="bg-white border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 animate-fade-in" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{selectedTShirt.colorName} Polo Try-On</h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Your high-resolution try-on result has been generated successfully.</p>
              </div>

              <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border)]">
                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleDownloadDesign} className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-semibold bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-white transition active:scale-95 cursor-pointer">
                    <Download className="w-4.5 h-4.5" /> Download Mockup
                  </button>
                  <button
                    onClick={() => {
                      if (finalMockupUrl) {
                        navigator.clipboard?.writeText(finalMockupUrl).then(() => alert("Link copied!")).catch(() => alert("Link copied!"));
                      }
                    }}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-primary)] transition active:scale-95 cursor-pointer"
                  >
                    <Share2 className="w-4.5 h-4.5" /> Copy Link
                  </button>
                </div>

                <div className="h-px bg-[var(--border)] my-1" />

                {/* Adjust fit & retry button */}
                <button
                  onClick={() => setFinalMockupUrl(null)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try On Again
                </button>

                {/* Back to Design page button */}
                <button
                  onClick={() => {
                    setFinalMockupUrl(null);
                    setCurrentPage("customize");
                  }}
                  className="w-full py-3.5 px-4 rounded-xl text-xs font-semibold bg-[var(--accent-light)] hover:bg-[var(--border)] text-[var(--accent)] transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Customize Another Garment
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 bg-white p-5 border border-[var(--border)] rounded-2xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Upload Your Portrait Photo</h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Upload a clear upper-body photo, and the AI will fit your customized shirt onto you.</p>
              </div>

              {personImage ? (
                <div className="flex flex-col gap-4">
                  <div className="relative aspect-[3/4] max-w-[280px] mx-auto bg-[var(--bg-canvas)] border border-[var(--border)] rounded-xl overflow-hidden flex items-center justify-center">
                    <img src={personImage} alt="Your upload" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <Camera className="w-4 h-4 text-[var(--accent)] shrink-0" />
                      <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {personImageName || "Photo uploaded"}
                      </span>
                    </div>
                    <button
                      onClick={() => { setPersonImage(null); setPersonImageName(""); }}
                      className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={handlePersonDragOver}
                  onDragLeave={handlePersonDragLeave}
                  onDrop={handlePersonDrop}
                  onClick={() => document.getElementById("person-upload-input")?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                    isDraggingPerson
                      ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]"
                      : "border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] text-[var(--text-tertiary)]"
                  }`}
                >
                  <Camera className="w-8 h-8 opacity-60" />
                  <div className="text-center">
                    <span className="text-xs font-semibold text-[var(--text-primary)] block">Drop your portrait photo here</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] block mt-0.5">or click to browse · JPG, PNG</span>
                  </div>
                  <input
                    id="person-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePersonUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Try On Button */}
              <button
                onClick={handleTriggerTryOn}
                disabled={isGeneratingRender || !personImage}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-2 ${
                  isGeneratingRender || !personImage
                    ? "bg-[var(--bg-secondary)] text-[var(--text-tertiary)] border border-[var(--border)] cursor-not-allowed"
                    : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white active:scale-[0.98]"
                }`}
                style={!isGeneratingRender && personImage ? { boxShadow: '0 4px 14px rgba(196, 85, 59, 0.3)' } : {}}
              >
                {isGeneratingRender ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shirt className="w-4 h-4" />
                )}
                {isGeneratingRender ? "Generating Try-On..." : !personImage ? "Upload a photo to start" : "Try On This Look"}
              </button>
            </div>
          )}
        </section>
      </main>
      {renderSettingsModal()}
    </div>
  );
}
