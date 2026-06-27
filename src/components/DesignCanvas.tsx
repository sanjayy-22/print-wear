import React, { useRef, useState, useEffect } from "react";
import { PoloShirtSVG } from "./PoloShirtSVG";
import { Placement, Logo } from "../types";
import { TryOnModel } from "./TryOnSelector";
import { Move, RotateCw, Maximize2, RotateCcw } from "lucide-react";

interface DesignCanvasProps {
  tShirtColor: string;
  tShirtTexture: "none" | "piquet" | "heather";
  customTShirtImage?: string;
  selectedLogo: Logo | null;
  placement: Placement; // LOGO placement
  onPlacementChange: (placement: Placement) => void;
  shirtPlacement: {
    x: number;
    y: number;
    scale: number;
    rotation: number;
    neckCutoutWidth?: number;
    neckCutoutHeight?: number;
    opacity?: number;
    mixBlendMode?: string;
  };
  onShirtPlacementChange: (placement: any) => void;
  selectedModel: TryOnModel;
  activeAdjustmentMode: "logo" | "shirt";
  showGuidelines: boolean;
  id?: string;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  tShirtColor,
  tShirtTexture,
  customTShirtImage,
  selectedLogo,
  placement,
  onPlacementChange,
  shirtPlacement,
  onShirtPlacementChange,
  selectedModel,
  activeAdjustmentMode,
  showGuidelines,
  id = "design-canvas-workbench",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [logoPlacementStart, setLogoPlacementStart] = useState<Placement>({ ...placement });
  const [shirtPlacementStart, setShirtPlacementStart] = useState({ ...shirtPlacement });

  const hasModel = selectedModel.id !== "flat" && selectedModel.url;

  // Reset parameters to default
  const handleReset = () => {
    if (activeAdjustmentMode === "shirt") {
      onShirtPlacementChange({
        ...selectedModel.defaultShirtPlacement
      });
    } else {
      onPlacementChange({
        x: 64,
        y: 34,
        scale: 0.65,
        rotation: 0,
        opacity: 1,
        mixBlendMode: "multiply",
      });
    }
  };

  // Drag interaction starts
  const handleMouseDown = (
    e: React.MouseEvent | React.TouchEvent,
    action: "move" | "scale" | "rotate"
  ) => {
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setDragStart({ x: clientX, y: clientY });
    setLogoPlacementStart({ ...placement });
    setShirtPlacementStart({ ...shirtPlacement });

    if (action === "move") setIsDragging(true);
    if (action === "scale") setIsScaling(true);
    if (action === "rotate") setIsRotating(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging && !isScaling && !isRotating) return;
      if (!containerRef.current) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      const percentDeltaX = (deltaX / rect.width) * 100;
      const percentDeltaY = (deltaY / rect.height) * 100;

      if (isDragging) {
        if (activeAdjustmentMode === "shirt" && hasModel) {
          const newX = Math.max(10, Math.min(90, shirtPlacementStart.x + percentDeltaX));
          const newY = Math.max(10, Math.min(90, shirtPlacementStart.y + percentDeltaY));
          onShirtPlacementChange({
            ...shirtPlacement,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
          });
        } else {
          const newX = Math.max(10, Math.min(90, logoPlacementStart.x + percentDeltaX));
          const newY = Math.max(10, Math.min(90, logoPlacementStart.y + percentDeltaY));
          onPlacementChange({
            ...placement,
            x: Math.round(newX * 10) / 10,
            y: Math.round(newY * 10) / 10,
          });
        }
      }

      if (isScaling) {
        const scaleFactor = 1 + deltaX / 120;
        if (activeAdjustmentMode === "shirt" && hasModel) {
          const newScale = Math.max(0.3, Math.min(3.0, shirtPlacementStart.scale * scaleFactor));
          onShirtPlacementChange({
            ...shirtPlacement,
            scale: Math.round(newScale * 100) / 100,
          });
        } else {
          const newScale = Math.max(0.2, Math.min(2.5, logoPlacementStart.scale * scaleFactor));
          onPlacementChange({
            ...placement,
            scale: Math.round(newScale * 100) / 100,
          });
        }
      }

      if (isRotating) {
        const rotFactor = deltaY * 0.8;
        if (activeAdjustmentMode === "shirt" && hasModel) {
          const newRotation = (shirtPlacementStart.rotation + rotFactor) % 360;
          onShirtPlacementChange({
            ...shirtPlacement,
            rotation: Math.round(newRotation),
          });
        } else {
          const newRotation = (logoPlacementStart.rotation + rotFactor) % 360;
          onPlacementChange({
            ...placement,
            rotation: Math.round(newRotation),
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsScaling(false);
      setIsRotating(false);
    };

    if (isDragging || isScaling || isRotating) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove, { passive: false });
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [
    isDragging,
    isScaling,
    isRotating,
    dragStart,
    logoPlacementStart,
    shirtPlacementStart,
    placement,
    shirtPlacement,
    activeAdjustmentMode,
    hasModel,
    onPlacementChange,
    onShirtPlacementChange,
  ]);

  // Determine active gizmo state for visual highlights
  const isShirtGizmoActive = activeAdjustmentMode === "shirt" && hasModel;
  const isLogoGizmoActive = activeAdjustmentMode === "logo";

  return (
    <div className="flex flex-col items-center w-full gap-3">
      {/* Designer Canvas */}
      <div
        id={id}
        ref={containerRef}
        className="relative w-full aspect-[3/4] max-w-[440px] bg-[var(--bg-canvas)] border border-[var(--border)] rounded-2xl overflow-hidden flex items-center justify-center select-none"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        {/* Model Background Portrait */}
        {hasModel && (
          <img
            src={selectedModel.url}
            alt={selectedModel.name}
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Guideline Target box overlay for Left Chest */}
        {showGuidelines && !customTShirtImage && isLogoGizmoActive && (
          <div
            id="left-chest-guideline"
            className="absolute z-10 w-[60px] h-[60px] border-2 border-dashed border-[var(--accent)]/40 rounded-xl bg-[var(--accent)]/5 flex flex-col items-center justify-center pointer-events-none"
            style={{
              left: hasModel ? `${shirtPlacement.x + (64 - 50) * shirtPlacement.scale}%` : "64%",
              top: hasModel ? `${shirtPlacement.y + (34 - 50) * shirtPlacement.scale}%` : "34%",
              transform: "translate(-50%, -50%)",
              opacity: 0.6,
            }}
          >
            <span className="text-[8px] font-medium text-[var(--accent)]">LEFT</span>
            <span className="text-[8px] font-medium text-[var(--accent)]">CHEST</span>
          </div>
        )}

        {/* Apparel Layer (Polo Shirt Container) */}
        <div
          id="draggable-shirt-node"
          className={`absolute select-none transition-shadow ${
            hasModel ? "z-10" : "w-full h-full"
          } ${
            isShirtGizmoActive && (isDragging || isScaling || isRotating)
              ? "ring-2 ring-[var(--accent)]/60 ring-offset-2 ring-offset-white rounded-xl"
              : ""
          }`}
          style={
            hasModel
              ? {
                  left: `${shirtPlacement.x}%`,
                  top: `${shirtPlacement.y}%`,
                  width: "100%",
                  height: "100%",
                  transform: `translate(-50%, -50%) scale(${shirtPlacement.scale}) rotate(${shirtPlacement.rotation}deg)`,
                  opacity: shirtPlacement.opacity !== undefined ? shirtPlacement.opacity : 0.95,
                  mixBlendMode: (shirtPlacement.mixBlendMode || "normal") as any,
                }
              : {
                  left: "50%",
                  top: "50%",
                  width: "100%",
                  height: "100%",
                  transform: "translate(-50%, -50%)",
                }
          }
        >
          {/* Base Polo Shirt SVG / Upload Renderer */}
          <PoloShirtSVG
            color={tShirtColor}
            texture={tShirtTexture}
            customImage={customTShirtImage}
            className="w-full h-full max-w-full max-h-full"
            neckCutoutWidth={shirtPlacement.neckCutoutWidth || 0}
            neckCutoutHeight={shirtPlacement.neckCutoutHeight || 0}
          />

          {/* Draggable Logo inside Shirt context */}
          {selectedLogo && (
            <div
              id="draggable-logo-node"
              className={`absolute select-none z-20 group cursor-grab active:cursor-grabbing ${
                isLogoGizmoActive && (isDragging || isScaling || isRotating)
                  ? "ring-2 ring-[var(--accent)]/60 ring-offset-2 ring-offset-white rounded-lg"
                  : ""
              }`}
              style={{
                left: `${placement.x}%`,
                top: `${placement.y}%`,
                transform: `translate(-50%, -50%)`,
                width: "120px",
                height: "120px",
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center relative"
                style={{
                  transform: `scale(${placement.scale}) rotate(${placement.rotation}deg)`,
                  opacity: placement.opacity,
                }}
              >
                <img
                  id="render-logo-img"
                  src={selectedLogo.url}
                  alt={selectedLogo.name}
                  className="max-w-full max-h-full object-contain pointer-events-none"
                  style={{
                    mixBlendMode: placement.mixBlendMode as any,
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* Direct Logo Gizmo Frame */}
                {isLogoGizmoActive && (
                  <div className="absolute -inset-3 border-2 border-dashed border-[var(--accent)]/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-[9px] text-[var(--text-secondary)] px-1.5 py-0.5 border border-[var(--border)] rounded shadow-sm whitespace-nowrap">
                      Scale: {Math.round(placement.scale * 100)}%
                    </div>
                  </div>
                )}

                {/* Interactive Logo Handles */}
                {isLogoGizmoActive && (
                  <>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 z-30"
                      onMouseDown={(e) => handleMouseDown(e, "move")}
                      onTouchStart={(e) => handleMouseDown(e, "move")}
                    >
                      <div className="bg-[var(--accent)] text-white p-1 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform cursor-move">
                        <Move className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div
                      className="absolute -bottom-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40 cursor-se-resize"
                      onMouseDown={(e) => handleMouseDown(e, "scale")}
                      onTouchStart={(e) => handleMouseDown(e, "scale")}
                    >
                      <div className="bg-[var(--accent)] text-white p-1.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5 rotate-45" />
                      </div>
                    </div>

                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40 cursor-alias"
                      onMouseDown={(e) => handleMouseDown(e, "rotate")}
                      onTouchStart={(e) => handleMouseDown(e, "rotate")}
                    >
                      <div className="bg-[var(--accent)] text-white p-1.5 rounded-full shadow-md hover:scale-110 active:scale-95 transition-transform">
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shirt Gizmo Overlay (Visible only in Shirt Mode) */}
        {isShirtGizmoActive && (
          <div
            className="absolute z-20 pointer-events-none border-2 border-dashed border-[var(--accent)]/40 rounded-xl"
            style={{
              left: `${shirtPlacement.x}%`,
              top: `${shirtPlacement.y}%`,
              width: `${85 * shirtPlacement.scale}%`,
              height: `${85 * shirtPlacement.scale}%`,
              transform: `translate(-50%, -50%) rotate(${shirtPlacement.rotation}deg)`,
            }}
          >
            {/* Direct controls for Shirt Layer fitting */}
            <div className="absolute inset-0 pointer-events-auto group">
              {/* Visual info banner */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[9px] text-white font-medium px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                Size: {Math.round(shirtPlacement.scale * 100)}%
              </div>

              {/* Central drag handler */}
              <div
                className="absolute inset-0 flex items-center justify-center cursor-move"
                onMouseDown={(e) => handleMouseDown(e, "move")}
                onTouchStart={(e) => handleMouseDown(e, "move")}
              >
                <div className="bg-[var(--accent)]/90 text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                  <Move className="w-4 h-4" />
                </div>
              </div>

              {/* Sizing scale handle */}
              <div
                className="absolute -bottom-4 -right-4 cursor-se-resize"
                onMouseDown={(e) => handleMouseDown(e, "scale")}
                onTouchStart={(e) => handleMouseDown(e, "scale")}
              >
                <div className="bg-[var(--accent)] text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                  <Maximize2 className="w-4 h-4 rotate-45" />
                </div>
              </div>

              {/* Rotation handle */}
              <div
                className="absolute -top-4 -right-4 cursor-alias"
                onMouseDown={(e) => handleMouseDown(e, "rotate")}
                onTouchStart={(e) => handleMouseDown(e, "rotate")}
              >
                <div className="bg-[var(--accent)] text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                  <RotateCw className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Workspace Quick-Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        <button
          id="btn-reset-left-chest"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {activeAdjustmentMode === "shirt" ? "Reset Fit" : "Reset Logo"}
        </button>

        {activeAdjustmentMode === "shirt" ? (
          <div className="text-[11px] text-[var(--text-tertiary)]">
            Position: <span className="text-[var(--text-secondary)] font-medium">{shirtPlacement.x}% × {shirtPlacement.y}%</span> · Scale: <span className="text-[var(--text-secondary)] font-medium">{Math.round(shirtPlacement.scale * 100)}%</span>
          </div>
        ) : (
          <div className="text-[11px] text-[var(--text-tertiary)]">
            Position: <span className="text-[var(--text-secondary)] font-medium">{placement.x}% × {placement.y}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
