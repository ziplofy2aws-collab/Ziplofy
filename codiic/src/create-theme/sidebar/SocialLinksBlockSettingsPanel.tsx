import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ThemeEditorLinkField } from '../../components/theme-editor/ThemeEditorLinkField';
import type { ThemeEditorFieldType } from './create-theme-field.utils';
import {
  availableSocialPlatforms,
  instanceIdFromSocialLinksNodeId,
  readSocialPlatformOrderFromValues,
  serializeSocialPlatformOrder,
  socialLinksPlatformOrderPath,
  socialLinksUrlPath,
  socialPlatformById,
} from './theme-editor-social-links-block-panel.utils';

type Props = {
  nodeId: string;
  values: Record<string, string | boolean>;
  onFieldChange: (path: string, type: ThemeEditorFieldType, value: string | boolean) => void;
};

const SocialLinksBlockSettingsPanel: React.FC<Props> = ({ nodeId, values, onFieldChange }) => {
  const instanceId = instanceIdFromSocialLinksNodeId(nodeId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  const addedIds = useMemo(
    () => (instanceId ? readSocialPlatformOrderFromValues(values, instanceId) : []),
    [instanceId, values]
  );
  const available = useMemo(() => availableSocialPlatforms(addedIds), [addedIds]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!menuWrapRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuOpen]);

  const writeOrder = useCallback(
    (ids: string[]) => {
      if (!instanceId) return;
      onFieldChange(socialLinksPlatformOrderPath(instanceId), 'text', serializeSocialPlatformOrder(ids));
    },
    [instanceId, onFieldChange]
  );

  const handleAdd = useCallback(
    (platformId: string) => {
      if (!instanceId) return;
      writeOrder([...addedIds, platformId]);
      setMenuOpen(false);
    },
    [addedIds, instanceId, writeOrder]
  );

  const handleRemove = useCallback(
    (platformId: string) => {
      if (!instanceId) return;
      const platform = socialPlatformById(platformId);
      if (!platform) return;
      writeOrder(addedIds.filter((id) => id !== platformId));
      onFieldChange(socialLinksUrlPath(instanceId, platform.settingKey), 'text', '');
    },
    [addedIds, instanceId, onFieldChange, writeOrder]
  );

  const handleMove = useCallback(
    (platformId: string, direction: -1 | 1) => {
      const index = addedIds.indexOf(platformId);
      if (index < 0) return;
      const target = index + direction;
      if (target < 0 || target >= addedIds.length) return;
      const next = [...addedIds];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      writeOrder(next);
    },
    [addedIds, writeOrder]
  );

  if (!instanceId) {
    return (
      <div className="px-3 py-4 text-[13px] text-gray-500">
        Select the Social media links block to edit platforms.
      </div>
    );
  }

  return (
    <div className="px-1 py-3">
      <p className="mb-3 px-1 text-[12px] leading-snug text-gray-500">
        Add social platforms, set their links, and reorder how they appear in the footer.
      </p>

      <div className="relative mb-4 px-1" ref={menuWrapRef}>
        <button
          type="button"
          disabled={available.length === 0}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Add social link</span>
          <ChevronDownIcon className="h-4 w-4" aria-hidden />
        </button>
        {menuOpen && available.length > 0 ? (
          <div className="absolute z-50 mt-1 max-h-72 w-[240px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {available.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => handleAdd(platform.id)}
                className="flex w-full px-3 py-2 text-left text-[13px] text-gray-900 transition-colors hover:bg-gray-50"
              >
                {platform.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {addedIds.length === 0 ? (
        <p className="px-1 text-[13px] text-gray-400">No social links yet. Add a platform to get started.</p>
      ) : (
        <div className="flex flex-col gap-5 px-1">
          {addedIds.map((platformId, index) => {
            const platform = socialPlatformById(platformId);
            if (!platform) return null;
            const urlPath = socialLinksUrlPath(instanceId, platform.settingKey);
            const urlValue = String(values[urlPath] ?? '');

            return (
              <div key={platformId}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-gray-900">{platform.label}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(platformId, -1)}
                      className="rounded px-1.5 py-0.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={index === addedIds.length - 1}
                      onClick={() => handleMove(platformId, 1)}
                      className="rounded px-1.5 py-0.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(platformId)}
                      className="rounded px-1.5 py-0.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <ThemeEditorLinkField
                  id={`social-link-${platformId}`}
                  label="Link"
                  value={urlValue}
                  placeholder="Paste a link or search"
                  onChange={(next) => onFieldChange(urlPath, 'text', next)}
                  showDynamicSource
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SocialLinksBlockSettingsPanel;
