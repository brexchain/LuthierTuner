/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CustomArtwork } from '../types';
import { MASTERCRAFT_PRESETS } from '../data/tonewoods';
import { Sparkles, Wand2, Image as ImageIcon, Download, Check, X, RefreshCw, Layers, AlertTriangle } from 'lucide-react';

interface ImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyArtwork: (artwork: CustomArtwork) => void;
  activeArtwork: CustomArtwork | null;
  history: CustomArtwork[];
  onAddToHistory: (artwork: CustomArtwork) => void;
}

const PRESET_PROMPTS = [
  {
    title: 'Vintage 1959 Sunburst',
    prompt: 'Ultra-luxurious 1959 iced tea sunburst finish on bookmatched quilted maple acoustic guitar soundboard, nitrocellulose gloss, rich mahogany depth, macro texture.',
    target: 'finish' as const,
  },
  {
    title: 'Celtic Abalone Rosette',
    prompt: 'Circular rosette inlay for acoustic guitar soundhole, intricate Celtic knotwork in iridescent green and blue abalone pearl shell and ebony purfling, centered circular composition, black background.',
    target: 'rosette' as const,
  },
  {
    title: 'Hawaiian Curly Koa',
    prompt: 'Deep golden amber curly Hawaiian Koa acoustic tonewood grain, exquisite 3D holographic flame figure, rich oil satin finish, fine woodcraft macro photograph.',
    target: 'finish' as const,
  },
  {
    title: 'Tree of Life Pearl Inlay',
    prompt: 'Circular rosette design featuring flowing vine and floral tree of life inlaid in white mother of pearl and rosewood purfling, ultra high detail craft photography.',
    target: 'rosette' as const,
  },
  {
    title: 'Midnight Nebula Sparkle',
    prompt: 'Deep indigo and dark violet metallic sparkle lacquer acoustic guitar top with subtle star dust cosmic pearl flakes, glass lacquer reflection.',
    target: 'finish' as const,
  },
];

export const ImageStudioModal: React.FC<ImageStudioModalProps> = ({
  isOpen,
  onClose,
  onApplyArtwork,
  activeArtwork,
  history,
  onAddToHistory,
}) => {
  const [prompt, setPrompt] = useState('');
  const [targetType, setTargetType] = useState<'finish' | 'rosette'>('finish');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<CustomArtwork | null>(activeArtwork);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleApplyPresetArtwork = (item: CustomArtwork) => {
    setSelectedArtwork(item);
    onAddToHistory(item);
    onApplyArtwork(item);
    setError(null);
    setIsQuotaError(false);
  };

  const handleGenerate = async (presetPrompt?: string, presetTarget?: 'finish' | 'rosette') => {
    const textToUse = presetPrompt || prompt;
    const targetToUse = presetTarget || targetType;

    if (!textToUse.trim()) return;

    setIsGenerating(true);
    setError(null);
    setIsQuotaError(false);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToUse,
          aspectRatio: '1:1',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.imageUrl) {
        if (data.isQuota || res.status === 429) {
          setIsQuotaError(true);
        }
        throw new Error(data.error || 'Failed to generate image');
      }

      const newArtwork: CustomArtwork = {
        id: 'art-' + Date.now(),
        title: textToUse.slice(0, 32) + '...',
        prompt: textToUse,
        imageUrl: data.imageUrl,
        target: targetToUse,
        createdAt: Date.now(),
      };

      setSelectedArtwork(newArtwork);
      onAddToHistory(newArtwork);
      onApplyArtwork(newArtwork);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error generating image';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedArtwork || !editPrompt.trim()) return;

    setIsEditing(true);
    setError(null);
    setIsQuotaError(false);

    try {
      const res = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: selectedArtwork.imageUrl,
          prompt: editPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.imageUrl) {
        if (data.isQuota || res.status === 429) {
          setIsQuotaError(true);
        }
        throw new Error(data.error || 'Failed to edit image');
      }

      const editedArtwork: CustomArtwork = {
        id: 'art-' + Date.now(),
        title: `${selectedArtwork.title} (Edited)`,
        prompt: `${selectedArtwork.prompt} -> ${editPrompt}`,
        imageUrl: data.imageUrl,
        target: selectedArtwork.target,
        createdAt: Date.now(),
      };

      setSelectedArtwork(editedArtwork);
      onAddToHistory(editedArtwork);
      onApplyArtwork(editedArtwork);
      setEditPrompt('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error editing image';
      setError(message);
    } finally {
      setIsEditing(false);
    }
  };

  const downloadImage = (imageUrl: string, filename = 'luthier-custom-design.png') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#120a06] border border-amber-500/25 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col gap-5 text-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg uppercase tracking-wider text-amber-200">
                Luthier Custom Studio
              </h2>
              <p className="font-mono text-xs text-amber-200/50">
                Create & edit guitar finishes and rosette inlays using text prompts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-amber-500/20 text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/70 border border-red-500/30 rounded-lg text-red-200 font-mono text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{isQuotaError ? 'Gemini Quota Notice (429)' : 'Studio Notice'}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-red-200/90 leading-relaxed">{error}</p>
            {isQuotaError && (
              <p className="text-[10px] text-amber-300/80 bg-black/40 p-2 rounded border border-amber-500/20 mt-1">
                Tip: Free-tier accounts have 0 quota for image generation. Please connect a billing-enabled Google Cloud project in AI Studio Settings, or pick any of our instant handcrafted mastercraft tonewoods below!
              </p>
            )}
          </div>
        )}

        {/* Main Grid: Left Controls, Right Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Input & Presets (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Target selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-amber-200/60 uppercase">Craft Target:</span>
              <button
                type="button"
                onClick={() => setTargetType('finish')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all cursor-pointer ${
                  targetType === 'finish'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-semibold shadow-[0_0_10px_rgba(247,198,107,0.2)]'
                    : 'border-amber-500/15 bg-black/40 text-amber-200/50 hover:text-amber-200'
                }`}
              >
                Guitar Body Finish
              </button>
              <button
                type="button"
                onClick={() => setTargetType('rosette')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-all cursor-pointer ${
                  targetType === 'rosette'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-semibold shadow-[0_0_10px_rgba(247,198,107,0.2)]'
                    : 'border-amber-500/15 bg-black/40 text-amber-200/50 hover:text-amber-200'
                }`}
              >
                Soundhole Rosette Inlay
              </button>
            </div>

            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-amber-200/70 block">
                Prompt Description:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  targetType === 'finish'
                    ? 'e.g., Brazilian rosewood bookmatched top with honey sunburst nitro finish...'
                    : 'e.g., Ornate mother of pearl rosette ring with herringbone purfling on dark ebony...'
                }
                rows={3}
                className="w-full bg-black/60 border border-amber-500/20 rounded-xl p-3 font-mono text-xs text-amber-100 placeholder-amber-200/30 focus:border-amber-400 focus:outline-none resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isGenerating || !prompt.trim()}
                  onClick={() => handleGenerate()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold font-mono text-xs rounded-lg hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Create Design</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Handcrafted Master Tonewoods Section */}
            <div className="space-y-2 pt-2 border-t border-amber-500/10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-amber-300/80 uppercase tracking-wider block">
                  Handcrafted Master Tonewoods (Instant Apply):
                </span>
                <span className="text-[10px] font-mono text-[#7ef0cf]">Instant 1-Click</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MASTERCRAFT_PRESETS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyPresetArtwork(item)}
                    className="flex flex-col text-left p-2 rounded-lg bg-black/50 border border-amber-500/20 hover:border-amber-400/60 hover:bg-amber-500/15 transition-all cursor-pointer group"
                  >
                    <div className="w-full h-12 rounded overflow-hidden mb-1.5 border border-amber-500/10 bg-black">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={`w-full h-full object-cover ${item.target === 'rosette' ? 'rounded-full scale-90' : ''}`}
                      />
                    </div>
                    <span className="font-serif text-[11px] text-amber-200 group-hover:text-amber-100 font-semibold line-clamp-1">
                      {item.title}
                    </span>
                    <span className="font-mono text-[9px] text-amber-200/40 uppercase">
                      {item.target}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Inspiration */}
            <div className="space-y-2 pt-2 border-t border-amber-500/10">
              <span className="font-mono text-[11px] text-amber-200/50 uppercase tracking-wider block">
                Inspiration Presets (Click to Prompt Gemini):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_PROMPTS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(preset.prompt);
                      setTargetType(preset.target);
                      handleGenerate(preset.prompt, preset.target);
                    }}
                    disabled={isGenerating}
                    className="text-left p-2.5 rounded-lg bg-black/40 border border-amber-500/15 hover:border-amber-400/40 hover:bg-amber-500/10 transition-all cursor-pointer group"
                  >
                    <div className="font-serif text-xs font-semibold text-amber-200 group-hover:text-amber-100">
                      {preset.title}
                    </div>
                    <div className="font-mono text-[10px] text-amber-200/40 line-clamp-1 mt-0.5">
                      {preset.target} · {preset.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Iterative Image Editing Section */}
            {selectedArtwork && (
              <div className="space-y-2 pt-3 border-t border-amber-500/15">
                <div className="flex items-center gap-2 font-mono text-xs text-amber-300">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Active Design with Prompt:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g., make it darker relic sunburst, add gold leaf inlay..."
                    className="flex-1 bg-black/60 border border-amber-500/20 rounded-lg px-3 py-2 font-mono text-xs text-amber-100 placeholder-amber-200/30 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={isEditing || !editPrompt.trim()}
                    onClick={handleEdit}
                    className="px-3 py-2 bg-amber-500/20 border border-amber-400/50 text-amber-200 font-mono text-xs rounded-lg hover:bg-amber-500/30 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isEditing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Apply Edit</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Active Preview & History Gallery (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <span className="font-mono text-xs text-amber-200/60 uppercase">
              Current Artwork Preview
            </span>

            <div className="relative aspect-square w-full rounded-2xl border border-amber-500/20 bg-black/60 overflow-hidden flex items-center justify-center p-2 shadow-inner group">
              {selectedArtwork ? (
                <>
                  <img
                    src={selectedArtwork.imageUrl}
                    alt={selectedArtwork.title}
                    referrerPolicy="no-referrer"
                    className={`max-w-full max-h-full object-cover transition-all ${
                      selectedArtwork.target === 'rosette' ? 'rounded-full border-4 border-amber-800/60' : 'rounded-xl'
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2 backdrop-blur-xs">
                    <div className="text-xs font-serif text-amber-100 font-semibold line-clamp-2">
                      {selectedArtwork.title}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApplyArtwork(selectedArtwork)}
                        className="flex-1 py-1.5 bg-[#7ef0cf] text-black font-mono font-semibold text-[11px] rounded-md hover:brightness-110 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply to Guitar</span>
                      </button>
                      <button
                        onClick={() => downloadImage(selectedArtwork.imageUrl, `${selectedArtwork.target}-design.png`)}
                        className="p-1.5 bg-black/80 border border-amber-400/40 text-amber-200 rounded-md hover:bg-amber-500/20 cursor-pointer"
                        title="Download image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-amber-200/30 p-6 text-center space-y-2">
                  <ImageIcon className="w-10 h-10 stroke-[1.2]" />
                  <p className="font-mono text-xs">
                    No custom artwork yet. Pick an inspiration preset or enter a prompt!
                  </p>
                </div>
              )}
            </div>

            {/* Design History */}
            {history.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 font-mono text-[11px] text-amber-200/50 uppercase">
                  <Layers className="w-3 h-3" />
                  <span>Saved Studio Creations ({history.length})</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedArtwork(item);
                        onApplyArtwork(item);
                      }}
                      className={`relative flex-shrink-0 w-14 h-14 rounded-lg border overflow-hidden transition-all cursor-pointer ${
                        selectedArtwork?.id === item.id
                          ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105'
                          : 'border-amber-500/20 opacity-70 hover:opacity-100'
                      }`}
                      title={item.title}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
