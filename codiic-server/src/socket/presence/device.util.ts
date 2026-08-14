export type LiveDeviceType = 'desktop' | 'mobile' | 'tablet' | 'other';

const DEVICE_LABEL: Record<LiveDeviceType, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
  other: 'Other',
};

export function normalizeDeviceType(value: unknown): LiveDeviceType | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  if (key === 'desktop' || key === 'mobile' || key === 'tablet' || key === 'other') {
    return key;
  }
  return null;
}

export function detectDeviceFromUserAgent(userAgent: string | undefined): LiveDeviceType {
  const ua = (userAgent || '').toLowerCase();
  if (!ua) return 'other';
  if (/ipad|tablet|kindle|silk|(android(?!.*mobile))/.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) return 'mobile';
  if (/mozilla|chrome|safari|firefox|edg|opr|msie|trident/.test(ua)) return 'desktop';
  return 'other';
}

export function deviceLabel(device: LiveDeviceType): string {
  return DEVICE_LABEL[device];
}
