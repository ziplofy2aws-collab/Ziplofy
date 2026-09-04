'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { getConfigPath } from '@/lib/informatic-theme/load-static-pack';
import { informaticImageStyleCompanionPaths } from '@/lib/informatic-theme/informatic-image-style.utils';

type Props = {
  imageFieldPath: string;
  config: Record<string, unknown>;
  onChange: (path: string, value: unknown) => void;
};

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export function InformaticImageStylePanel({ imageFieldPath, config, onChange }: Props) {
  const [styleOpen, setStyleOpen] = useState(false);
  const companions = informaticImageStyleCompanionPaths(imageFieldPath);

  const cornerRadius = String(getConfigPath(config, companions.CornerRadius) ?? '');
  const overlayColor = String(getConfigPath(config, companions.OverlayColor) ?? '');
  const overlayOpacity = String(getConfigPath(config, companions.OverlayOpacity) ?? '');
  const gradientEnabled = Boolean(getConfigPath(config, companions.GradientEnabled));
  const gradientFrom = String(getConfigPath(config, companions.GradientFrom) ?? '');
  const gradientTo = String(getConfigPath(config, companions.GradientTo) ?? '');
  const gradientDirection =
    String(getConfigPath(config, companions.GradientDirection) ?? 'to-bottom') || 'to-bottom';

  return (
    <div>
      <button
        type="button"
        onClick={() => setStyleOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[#e1e1e1] bg-[#fafafa] px-3 py-2 text-left text-[12px] font-semibold text-gray-700 hover:bg-[#f3f3f3]"
        aria-expanded={styleOpen}
      >
        <span>Image style</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${styleOpen ? 'rotate-180' : ''}`} />
      </button>

      {styleOpen ? (
        <div className="mt-2 space-y-3 rounded-lg border border-[#e8e8e8] bg-white p-3">
          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Corner radius (px)</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={cornerRadius ? Number(cornerRadius) || 0 : 0}
                onChange={(e) => onChange(companions.CornerRadius, e.target.value)}
                className="min-w-0 flex-1"
              />
              <input
                type="number"
                min={0}
                max={40}
                value={cornerRadius}
                placeholder="0"
                onChange={(e) => onChange(companions.CornerRadius, e.target.value)}
                className="h-8 w-16 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Overlay color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={isHexColor(overlayColor) ? overlayColor : '#000000'}
                onChange={(e) => onChange(companions.OverlayColor, e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
              />
              <input
                type="text"
                value={overlayColor}
                placeholder="#000000"
                onChange={(e) => onChange(companions.OverlayColor, e.target.value)}
                className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
              />
            </div>
          </label>

          <label className="block space-y-1">
            <span className="text-[12px] font-medium text-gray-700">Overlay opacity</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={overlayOpacity ? Number(overlayOpacity) || 0 : 0}
                onChange={(e) => onChange(companions.OverlayOpacity, e.target.value)}
                className="min-w-0 flex-1"
              />
              <span className="w-10 text-right text-[11px] text-gray-500">
                {overlayOpacity ? `${overlayOpacity}%` : '0%'}
              </span>
            </div>
          </label>

          <label className="flex items-center justify-between gap-3 text-[12px] font-medium text-gray-700">
            <span>Gradient overlay</span>
            <input
              type="checkbox"
              checked={gradientEnabled}
              onChange={(e) => onChange(companions.GradientEnabled, e.target.checked)}
              className="h-4 w-4 rounded border-[#c9cccf]"
            />
          </label>

          {gradientEnabled ? (
            <>
              <label className="block space-y-1">
                <span className="text-[12px] font-medium text-gray-700">Gradient from</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isHexColor(gradientFrom) ? gradientFrom : '#000000'}
                    onChange={(e) => onChange(companions.GradientFrom, e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={gradientFrom}
                    placeholder="#000000"
                    onChange={(e) => onChange(companions.GradientFrom, e.target.value)}
                    className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
                  />
                </div>
              </label>
              <label className="block space-y-1">
                <span className="text-[12px] font-medium text-gray-700">Gradient to</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isHexColor(gradientTo) ? gradientTo : '#ffffff'}
                    onChange={(e) => onChange(companions.GradientTo, e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={gradientTo}
                    placeholder="transparent"
                    onChange={(e) => onChange(companions.GradientTo, e.target.value)}
                    className="min-h-8 min-w-0 flex-1 rounded border border-[#c9cccf] px-2 text-[12px]"
                  />
                </div>
              </label>
              <label className="block space-y-1">
                <span className="text-[12px] font-medium text-gray-700">Gradient direction</span>
                <select
                  value={gradientDirection}
                  onChange={(e) => onChange(companions.GradientDirection, e.target.value)}
                  className="h-9 w-full rounded border border-[#c9cccf] bg-white px-2 text-[12px]"
                >
                  <option value="to-top">To top</option>
                  <option value="to-bottom">To bottom</option>
                  <option value="to-left">To left</option>
                  <option value="to-right">To right</option>
                </select>
              </label>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
