import {
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
  PlusIcon,
  ShoppingBagIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import BrandAdditionalSection from '../../components/BrandAdditionalSection';
import BrandCoverImageSection from '../../components/BrandCoverImageSection';
import BrandEssentialSection from '../../components/BrandEssentialSection';
import BrandLogosSection from '../../components/BrandLogosSection';
import BrandPrimaryColorSection from '../../components/BrandPrimaryColorSection';
import BrandSecondaryColorSection from '../../components/BrandSecondaryColorSection';
import BrandSloganSection from '../../components/BrandSloganSection';
import BrandVisualPlaceholder from '../../components/BrandVisualPlaceholder';
import { SettingsHero, SettingsPanel } from '../../components/settings/SettingsPageScaffold';
import { useStoreBranding } from '../../contexts/store-branding.context';
import { useStore } from '../../contexts/store.context';

const BrandSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeStoreId } = useStore();
  const { branding, loading: brandingLoading, getByStoreId, create, update } = useStoreBranding();
  const [socialMenuAnchor, setSocialMenuAnchor] = useState<null | HTMLElement>(null);
  const [addedSocialLinks, setAddedSocialLinks] = useState<string[]>([]);
  const [socialLinkUrls, setSocialLinkUrls] = useState<Record<string, string>>({});
  const [defaultLogoUrl, setDefaultLogoUrl] = useState<string>('');
  const [squareLogoUrl, setSquareLogoUrl] = useState<string>('');
  const [defaultLogoError, setDefaultLogoError] = useState<boolean>(false);
  const [squareLogoError, setSquareLogoError] = useState<boolean>(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [coverImageError, setCoverImageError] = useState<boolean>(false);
  const [slogan, setSlogan] = useState<string>('');
  const [showSloganInput, setShowSloganInput] = useState<boolean>(false);
  const [shortDescription, setShortDescription] = useState<string>('');
  const [showShortDescriptionInput, setShowShortDescriptionInput] = useState<boolean>(false);
  const [primaryColor, setPrimaryColor] = useState<string>('');
  const [contrastColor, setContrastColor] = useState<string>('');
  const [primaryColorPickerAnchor, setPrimaryColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [contrastColorPickerAnchor, setContrastColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [secondaryColors, setSecondaryColors] = useState<string[]>([]);
  const [secondaryContrastColor, setSecondaryContrastColor] = useState<string>('');
  const [secondaryColorPickerAnchor, setSecondaryColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [editingSecondaryColorIndex, setEditingSecondaryColorIndex] = useState<number | null>(null);
  const [secondaryContrastColorPickerAnchor, setSecondaryContrastColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [tempSecondaryColor, setTempSecondaryColor] = useState<string>('#000000');
  const [isDirty, setIsDirty] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const socialMenuRef = useRef<HTMLDivElement>(null);
  const primaryColorPickerRef = useRef<HTMLDivElement>(null);
  const contrastColorPickerRef = useRef<HTMLDivElement>(null);
  const secondaryColorPickerRef = useRef<HTMLDivElement>(null);
  const secondaryContrastColorPickerRef = useRef<HTMLDivElement>(null);

  const markDirty = useCallback(() => {
    if (initialLoadComplete) {
      setIsDirty(true);
    }
  }, [initialLoadComplete]);

  const handleOpenSocialMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSocialMenuAnchor(event.currentTarget);
  }, []);

  const handleCloseSocialMenu = useCallback(() => {
    setSocialMenuAnchor(null);
  }, []);

  const handleAddSocialLink = useCallback((platformName: string) => {
    if (!addedSocialLinks.includes(platformName)) {
      setAddedSocialLinks([...addedSocialLinks, platformName]);
      setSocialLinkUrls({ ...socialLinkUrls, [platformName]: '' });
      markDirty();
    }
    handleCloseSocialMenu();
  }, [addedSocialLinks, socialLinkUrls, markDirty, handleCloseSocialMenu]);

  const handleRemoveSocialLink = useCallback((platformName: string) => {
    setAddedSocialLinks(addedSocialLinks.filter(name => name !== platformName));
    const newUrls = { ...socialLinkUrls };
    delete newUrls[platformName];
    setSocialLinkUrls(newUrls);
    markDirty();
  }, [addedSocialLinks, socialLinkUrls, markDirty]);

  const handleUrlChange = useCallback((platformName: string, url: string) => {
    setSocialLinkUrls({ ...socialLinkUrls, [platformName]: url });
    markDirty();
  }, [socialLinkUrls, markDirty]);

  const getPlatformIcon = useCallback((platformName: string) => {
    const platform = socialPlatforms.find(p => p.name === platformName);
    return platform?.icon || <GlobeAltIcon className="w-5 h-5" />;
  }, []);

  const getExampleUrl = useCallback((platformName: string) => {
    const examples: Record<string, string> = {
      'Facebook': 'https://facebook.com/ziplofy',
      'X': 'https://x.com/ziplofy',
      'Pinterest': 'https://pinterest.com/ziplofy',
      'Instagram': 'https://instagram.com/ziplofy',
      'TikTok': 'https://tiktok.com/@ziplofy',
      'Tumblr': 'https://tumblr.com/ziplofy',
      'Snapchat': 'https://snapchat.com/add/ziplofy',
      'YouTube': 'https://youtube.com/ziplofy',
      'Vimeo': 'https://vimeo.com/ziplofy',
      'LinkedIn': 'https://linkedin.com/company/ziplofy',
      'Spotify': 'https://open.spotify.com/artist/ziplofy',
      'WhatsApp': 'https://wa.me/ziplofy',
      'Threads': 'https://threads.net/@ziplofy',
      'KakaoTalk': 'https://kakaotalk.com/ziplofy',
      'LINE': 'https://line.me/ziplofy',
      'Discord': 'https://discord.gg/ziplofy',
      'Twitch': 'https://twitch.tv/ziplofy',
      'Weibo': 'https://weibo.com/ziplofy',
      'WeChat': 'https://wechat.com/ziplofy',
      'Ziplofy Inbox': 'https://ziplofy.com/inbox',
    };
    return examples[platformName] || `https://${platformName.toLowerCase()}.com/ziplofy`;
  }, []);

  const socialPlatforms = [
    { name: 'Facebook', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'X', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'Pinterest', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'Instagram', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'TikTok', icon: <MusicalNoteIcon className="w-5 h-5" /> },
    { name: 'Tumblr', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'Snapchat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { name: 'YouTube', icon: <VideoCameraIcon className="w-5 h-5" /> },
    { name: 'Vimeo', icon: <VideoCameraIcon className="w-5 h-5" /> },
    { name: 'LinkedIn', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'Spotify', icon: <MusicalNoteIcon className="w-5 h-5" /> },
    { name: 'WhatsApp', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { name: 'Threads', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'KakaoTalk', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { name: 'LINE', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { name: 'Discord', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { name: 'Twitch', icon: <VideoCameraIcon className="w-5 h-5" /> },
    { name: 'Weibo', icon: <GlobeAltIcon className="w-5 h-5" /> },
    { name: 'WeChat', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { name: 'Ziplofy Inbox', icon: <ShoppingBagIcon className="w-5 h-5" /> },
  ];

  const availablePlatforms = socialPlatforms.filter(platform => !addedSocialLinks.includes(platform.name));

  const handleOpenPrimaryColorPicker = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setPrimaryColorPickerAnchor(event.currentTarget);
  }, []);

  const handleClosePrimaryColorPicker = useCallback(() => {
    setPrimaryColorPickerAnchor(null);
  }, []);

  const handleOpenContrastColorPicker = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setContrastColorPickerAnchor(event.currentTarget);
  }, []);

  const handleCloseContrastColorPicker = useCallback(() => {
    setContrastColorPickerAnchor(null);
  }, []);

  const handlePrimaryColorChange = useCallback((color: string) => {
    setPrimaryColor(color);
    markDirty();
  }, [markDirty]);

  const handleContrastColorChange = useCallback((color: string) => {
    setContrastColor(color);
    markDirty();
  }, [markDirty]);

  const handleOpenSecondaryColorPicker = useCallback((event: React.MouseEvent<HTMLElement>, index?: number) => {
    if (index === undefined && secondaryColors.length >= 2) {
      return;
    }
    if (index !== undefined) {
      setEditingSecondaryColorIndex(index);
      setTempSecondaryColor(secondaryColors[index] || '#000000');
    } else {
      setEditingSecondaryColorIndex(null);
      setTempSecondaryColor('#000000');
    }
    setSecondaryColorPickerAnchor(event.currentTarget);
  }, [secondaryColors]);

  const handleCloseSecondaryColorPicker = useCallback(() => {
    setSecondaryColorPickerAnchor(null);
    setEditingSecondaryColorIndex(null);
    setTempSecondaryColor('#000000');
  }, []);

  const handleOpenSecondaryContrastColorPicker = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setSecondaryContrastColorPickerAnchor(event.currentTarget);
  }, []);

  const handleCloseSecondaryContrastColorPicker = useCallback(() => {
    setSecondaryContrastColorPickerAnchor(null);
  }, []);

  const handleAddSecondaryColor = useCallback(() => {
    if (editingSecondaryColorIndex !== null) {
      const newColors = [...secondaryColors];
      newColors[editingSecondaryColorIndex] = tempSecondaryColor;
      setSecondaryColors(newColors);
    } else {
      if (secondaryColors.length < 2) {
        setSecondaryColors([...secondaryColors, tempSecondaryColor]);
      }
    }
    handleCloseSecondaryColorPicker();
    markDirty();
  }, [editingSecondaryColorIndex, secondaryColors, tempSecondaryColor, handleCloseSecondaryColorPicker, markDirty]);

  const handleRemoveSecondaryColor = useCallback((index: number) => {
    setSecondaryColors(secondaryColors.filter((_, i) => i !== index));
    markDirty();
  }, [secondaryColors, markDirty]);

  const handleSecondaryContrastColorChange = useCallback((color: string) => {
    setSecondaryContrastColor(color);
    markDirty();
  }, [markDirty]);

  const handleSave = useCallback(async () => {
    if (!activeStoreId) {
      toast.error('No store selected. Please select a store to save branding.');
      return;
    }

    const socialLinksPayload = addedSocialLinks.reduce<Record<string, string>>((acc, platform) => {
      if (socialLinkUrls[platform] !== undefined) {
        acc[platform] = socialLinkUrls[platform];
      }
      return acc;
    }, {});

    const payload = {
      defaultLogoUrl,
      squareLogoUrl,
      primaryColor,
      contrastColor,
      secondaryColors,
      secondaryContrastColor,
      coverImageUrl,
      slogan,
      shortDescription,
      socialLinks: socialLinksPayload,
    };

    setSaving(true);
    try {
      if (branding && branding._id) {
        await update(branding._id, payload);
        toast.success('Branding updated successfully');
      } else {
        await create({ storeId: activeStoreId, ...payload });
        toast.success('Branding saved successfully');
      }
      setIsDirty(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save branding';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [activeStoreId, addedSocialLinks, branding, contrastColor, coverImageUrl, create, defaultLogoUrl, primaryColor, secondaryColors, secondaryContrastColor, shortDescription, slogan, socialLinkUrls, squareLogoUrl, update]);

  useEffect(() => {
    if (activeStoreId) {
      setInitialLoadComplete(false);
      getByStoreId(activeStoreId).catch(() => {});
    }
  }, [activeStoreId, getByStoreId]);

  useEffect(() => {
    if (brandingLoading) {
      return;
    }

    setInitialLoadComplete(false);

    if (branding) {
      setDefaultLogoUrl(branding.defaultLogoUrl ?? '');
      setSquareLogoUrl(branding.squareLogoUrl ?? '');
      setPrimaryColor(branding.primaryColor ?? '');
      setContrastColor(branding.contrastColor ?? '');
      setSecondaryColors(branding.secondaryColors ? [...branding.secondaryColors] : []);
      setSecondaryContrastColor(branding.secondaryContrastColor ?? '');
      setCoverImageUrl(branding.coverImageUrl ?? '');
      const brandingSlogan = branding.slogan ?? '';
      setSlogan(brandingSlogan);
      setShowSloganInput(Boolean(branding.slogan));
      const brandingShortDescription = branding.shortDescription ?? '';
      setShortDescription(brandingShortDescription);
      setShowShortDescriptionInput(Boolean(branding.shortDescription));
      const socialLinksData = branding.socialLinks ? { ...branding.socialLinks } : {};
      setAddedSocialLinks(Object.keys(socialLinksData));
      setSocialLinkUrls(socialLinksData);
    } else {
      setDefaultLogoUrl('');
      setSquareLogoUrl('');
      setPrimaryColor('');
      setContrastColor('');
      setSecondaryColors([]);
      setSecondaryContrastColor('');
      setCoverImageUrl('');
      setSlogan('');
      setShowSloganInput(false);
      setShortDescription('');
      setShowShortDescriptionInput(false);
      setAddedSocialLinks([]);
      setSocialLinkUrls({});
    }

    setDefaultLogoError(false);
    setSquareLogoError(false);
    setCoverImageError(false);
    setTempSecondaryColor('#000000');
    setIsDirty(false);

    setInitialLoadComplete(true);
  }, [branding, brandingLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (socialMenuRef.current && !socialMenuRef.current.contains(event.target as Node) && socialMenuAnchor) {
        handleCloseSocialMenu();
      }
      if (primaryColorPickerRef.current && !primaryColorPickerRef.current.contains(event.target as Node) && primaryColorPickerAnchor) {
        handleClosePrimaryColorPicker();
      }
      if (contrastColorPickerRef.current && !contrastColorPickerRef.current.contains(event.target as Node) && contrastColorPickerAnchor) {
        handleCloseContrastColorPicker();
      }
      if (secondaryColorPickerRef.current && !secondaryColorPickerRef.current.contains(event.target as Node) && secondaryColorPickerAnchor) {
        handleCloseSecondaryColorPicker();
      }
      if (secondaryContrastColorPickerRef.current && !secondaryContrastColorPickerRef.current.contains(event.target as Node) && secondaryContrastColorPickerAnchor) {
        handleCloseSecondaryContrastColorPicker();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [socialMenuAnchor, primaryColorPickerAnchor, contrastColorPickerAnchor, secondaryColorPickerAnchor, secondaryContrastColorPickerAnchor, handleCloseSocialMenu, handleClosePrimaryColorPicker, handleCloseContrastColorPicker, handleCloseSecondaryColorPicker, handleCloseSecondaryContrastColorPicker]);

  const getPopoverPosition = (anchorEl: HTMLElement | null) => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
    };
  };

  const handleBack = useCallback(() => {
    navigate('/settings/general');
  }, [navigate]);

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6 pb-10">
      <SettingsHero
        title="Brand"
        description="Define logo, colors, messaging, and social links used across your storefront."
        leading={
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Back
          </button>
        }
        actions={
          initialLoadComplete && isDirty ? (
            <button
              onClick={handleSave}
              disabled={saving || brandingLoading}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          ) : null
        }
      />

      {/* Visual Placeholder Area */}
      <BrandVisualPlaceholder />

      {/* Content Section */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">What should you add?</h2>
        <BrandEssentialSection />
        <BrandAdditionalSection />
      </div>

      {/* Logos Section */}
      <BrandLogosSection
        defaultLogoUrl={defaultLogoUrl}
        squareLogoUrl={squareLogoUrl}
        defaultLogoError={defaultLogoError}
        squareLogoError={squareLogoError}
        onDefaultLogoUrlChange={setDefaultLogoUrl}
        onSquareLogoUrlChange={setSquareLogoUrl}
        onDefaultLogoError={setDefaultLogoError}
        onSquareLogoError={setSquareLogoError}
        markDirty={markDirty}
      />

      {/* Colors Section */}
      <SettingsPanel className="mb-8 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-6">Colors</h3>

        {/* Primary Color */}
        <BrandPrimaryColorSection
          primaryColor={primaryColor}
          contrastColor={contrastColor}
          primaryColorPickerAnchor={primaryColorPickerAnchor}
          contrastColorPickerAnchor={contrastColorPickerAnchor}
          primaryColorPickerRef={primaryColorPickerRef}
          contrastColorPickerRef={contrastColorPickerRef}
          onOpenPrimaryColorPicker={handleOpenPrimaryColorPicker}
          onClosePrimaryColorPicker={handleClosePrimaryColorPicker}
          onOpenContrastColorPicker={handleOpenContrastColorPicker}
          onCloseContrastColorPicker={handleCloseContrastColorPicker}
          onPrimaryColorChange={handlePrimaryColorChange}
          onContrastColorChange={handleContrastColorChange}
          getPopoverPosition={getPopoverPosition}
        />

        {/* Secondary Color */}
        <BrandSecondaryColorSection
          secondaryColors={secondaryColors}
          secondaryContrastColor={secondaryContrastColor}
          editingSecondaryColorIndex={editingSecondaryColorIndex}
          tempSecondaryColor={tempSecondaryColor}
          secondaryColorPickerAnchor={secondaryColorPickerAnchor}
          secondaryContrastColorPickerAnchor={secondaryContrastColorPickerAnchor}
          secondaryColorPickerRef={secondaryColorPickerRef}
          secondaryContrastColorPickerRef={secondaryContrastColorPickerRef}
          onOpenSecondaryColorPicker={handleOpenSecondaryColorPicker}
          onCloseSecondaryColorPicker={handleCloseSecondaryColorPicker}
          onOpenSecondaryContrastColorPicker={handleOpenSecondaryContrastColorPicker}
          onCloseSecondaryContrastColorPicker={handleCloseSecondaryContrastColorPicker}
          onAddSecondaryColor={handleAddSecondaryColor}
          onRemoveSecondaryColor={handleRemoveSecondaryColor}
          onSecondaryContrastColorChange={handleSecondaryContrastColorChange}
          onTempSecondaryColorChange={setTempSecondaryColor}
          getPopoverPosition={getPopoverPosition}
        />
      </SettingsPanel>

      {/* Cover Image Section */}
      <BrandCoverImageSection
        coverImageUrl={coverImageUrl}
        coverImageError={coverImageError}
        onCoverImageUrlChange={setCoverImageUrl}
        onCoverImageErrorChange={setCoverImageError}
        onMarkDirty={markDirty}
      />

      {/* Slogan Section */}
      <BrandSloganSection
        slogan={slogan}
        showSloganInput={showSloganInput}
        onSloganChange={setSlogan}
        onShowSloganInputChange={setShowSloganInput}
        onMarkDirty={markDirty}
      />

      {/* Short Description Section */}
      <SettingsPanel className="mb-8 p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Short description</h3>
            <p className="text-xs text-gray-600 mb-4">Description of your business often used in bios and listings</p>
            {(showShortDescriptionInput || shortDescription) ? (
              <div className="mb-4">
                <textarea
                  placeholder="Enter your short description"
                  value={shortDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 150) {
                      markDirty();
                      setShortDescription(value);
                    }
                  }}
                  maxLength={150}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{shortDescription.length}/150 characters</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                  <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">Add a short description</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (!showShortDescriptionInput && !shortDescription) {
                setShowShortDescriptionInput(true);
              }
            }}
            className="ml-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </SettingsPanel>

      {/* Social Links Section */}
      <SettingsPanel className="mb-8 p-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Social links</h3>
          <p className="text-xs text-gray-600 mb-4">Social links for your business, often used in the theme footer</p>
          <div className="relative inline-block mb-6">
            <button
              onClick={handleOpenSocialMenu}
              disabled={availablePlatforms.length === 0}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-900 transition-colors hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Add social link</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            {socialMenuAnchor && (
              <div
                ref={socialMenuRef}
                className="absolute z-50 mt-1 bg-white border border-gray-200 shadow-lg max-h-96 overflow-y-auto w-[250px]"
                style={{
                  top: socialMenuAnchor.getBoundingClientRect().bottom + window.scrollY + 4,
                  left: socialMenuAnchor.getBoundingClientRect().left + window.scrollX,
                }}
              >
                {availablePlatforms.map((platform) => (
                  <button
                    key={platform.name}
                    onClick={() => handleAddSocialLink(platform.name)}
                    className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="text-gray-600">{platform.icon}</div>
                    <span className="text-sm text-gray-900">{platform.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Social Links */}
          {addedSocialLinks.length > 0 && (
            <div className="flex flex-col gap-6">
              {addedSocialLinks.map((platformName) => (
                <div key={platformName}>
                  <p className="text-sm font-medium text-gray-900 mb-2">{platformName}</p>
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                        {getPlatformIcon(platformName)}
                      </div>
                      <input
                        type="text"
                        placeholder="Link"
                        value={socialLinkUrls[platformName] || ''}
                        onChange={(e) => handleUrlChange(platformName, e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveSocialLink(platformName)}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{getExampleUrl(platformName)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsPanel>

      {/* Learn More Link */}
      <div className="text-center mt-6">
        <a
          href="#"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Learn more about managing your brand settings
        </a>
      </div>
      </div>
    </div>
  );
};

export default BrandSettingsPage;
