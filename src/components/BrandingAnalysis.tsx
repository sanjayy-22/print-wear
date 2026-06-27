import React from "react";
import { GeminiAnalysis } from "../types";
import { Sparkles, CheckCircle2, RefreshCw } from "lucide-react";

interface BrandingAnalysisProps {
  analysis: GeminiAnalysis | null;
  isLoading: boolean;
  onAnalyze: () => void;
  hasLogo: boolean;
  id?: string;
}

export const BrandingAnalysis: React.FC<BrandingAnalysisProps> = ({
  analysis,
  isLoading,
  onAnalyze,
  hasLogo,
  id = "branding-analysis-panel",
}) => {
  // Circular Progress Score helper
  const ScoreRing: React.FC<{ score: number; label: string; colorHex: string }> = ({
    score,
    label,
    colorHex,
  }) => {
    const percentage = score * 10;
    const strokeDashoffset = 113 - (113 * percentage) / 100;

    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="28" cy="28" r="18" stroke="var(--border)" strokeWidth="4" fill="none" />
            <circle
              cx="28"
              cy="28"
              r="18"
              stroke={colorHex}
              strokeWidth="4"
              fill="none"
              strokeDasharray="113"
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-bold text-[var(--text-primary)]">{score}/10</span>
        </div>
        <span className="text-[10px] font-medium text-[var(--text-tertiary)] whitespace-nowrap">
          {label}
        </span>
      </div>
    );
  };

  if (!hasLogo) {
    return (
      <div id={id} className="bg-white p-6 border border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-center gap-3" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <Sparkles className="w-6 h-6 text-[var(--text-tertiary)]" />
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-primary)]">Design Analysis</h4>
          <p className="text-xs text-[var(--text-tertiary)] max-w-xs mt-1">
            Add a logo to your design to unlock AI-powered styling feedback.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id={id} className="flex flex-col gap-4 bg-white p-5 rounded-2xl border border-[var(--border)]" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Design Analysis</h3>
        </div>
        {!isLoading && analysis && (
          <button
            onClick={onAnalyze}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border)] px-2.5 py-1 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Re-Analyze
          </button>
        )}
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="flex flex-col gap-4 py-3 animate-pulse">
          {/* Skeletons scores */}
          <div className="flex justify-around items-center border-b border-[var(--border)] pb-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)]" />
                <div className="h-2 w-16 bg-[var(--bg-secondary)] rounded" />
              </div>
            ))}
          </div>
          {/* Skeletons feedback text */}
          <div className="space-y-2 mt-2">
            <div className="h-2 bg-[var(--bg-secondary)] rounded w-1/4" />
            <div className="h-3 bg-[var(--bg-secondary)] rounded w-full" />
            <div className="h-3 bg-[var(--bg-secondary)] rounded w-5/6" />
          </div>
        </div>
      ) : !analysis ? (
        /* Empty Prompt State */
        <div className="flex flex-col items-center justify-center text-center gap-4 py-6">
          <p className="text-xs text-[var(--text-tertiary)] max-w-sm leading-relaxed">
            Get AI feedback on your logo alignment, contrast, and overall design harmony.
          </p>
          <button
            id="btn-trigger-ai-analysis"
            onClick={onAnalyze}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-white transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Analyze Design
          </button>
        </div>
      ) : (
        /* Completed Analysis Results */
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Score Meters row */}
          <div className="flex justify-around items-center border-b border-[var(--border)] pb-4">
            <ScoreRing
              score={analysis.placementRating}
              label="Placement"
              colorHex="var(--accent)"
            />
            <ScoreRing
              score={analysis.contrastRating}
              label="Contrast"
              colorHex="#2D8A56"
            />
            <ScoreRing
              score={analysis.aestheticScore}
              label="Aesthetics"
              colorHex="#C9922E"
            />
          </div>

          {/* Style Category */}
          <div className="flex flex-col gap-1 bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border)]">
            <div className="text-[10px] font-medium text-[var(--text-tertiary)]">Style Category</div>
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              {analysis.brandTheme}
            </div>
          </div>

          {/* Feedback */}
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">Feedback</h4>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              {analysis.feedback}
            </p>
          </div>

          {/* Suggestions */}
          <div className="flex flex-col gap-2 pt-3 border-t border-[var(--border)]">
            <h4 className="text-xs font-semibold text-[var(--text-primary)]">Suggestions</h4>
            <div className="flex flex-col gap-2">
              {analysis.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {suggestion}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
