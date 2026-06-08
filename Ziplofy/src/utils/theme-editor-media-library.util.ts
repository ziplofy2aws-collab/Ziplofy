export type ThemeEditorMediaFile = {
  id: string;
  name: string;
  url: string;
  sizeLabel?: string;
  source?: 'stock' | 'upload';
  createdAt?: number;
};

const STOCK_IMAGES: ThemeEditorMediaFile[] = [
  {
    id: 'stock-1',
    name: 'Product on white',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80',
    sizeLabel: '1200 × 800',
    source: 'stock',
  },
  {
    id: 'stock-2',
    name: 'Headphones',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80',
    sizeLabel: '1200 × 800',
    source: 'stock',
  },
  {
    id: 'stock-3',
    name: 'Camera',
    url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80',
    sizeLabel: '1200 × 800',
    source: 'stock',
  },
  {
    id: 'stock-4',
    name: 'Fashion portrait',
    url: 'https://images.unsplash.com/photo-1515886657613-9f4965b9c5f9?w=1200&q=80',
    sizeLabel: '1200 × 900',
    source: 'stock',
  },
  {
    id: 'stock-5',
    name: 'Minimal desk',
    url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bfee?w=1200&q=80',
    sizeLabel: '1200 × 800',
    source: 'stock',
  },
  {
    id: 'stock-6',
    name: 'Beauty product',
    url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80',
    sizeLabel: '1200 × 800',
    source: 'stock',
  },
];

function storageKey(storeId: string): string {
  return `ziplofy-theme-editor-media:${storeId || 'dev'}`;
}

export function stockThemeEditorImages(): ThemeEditorMediaFile[] {
  return STOCK_IMAGES;
}

export function loadUploadedThemeEditorMedia(storeId: string): ThemeEditorMediaFile[] {
  try {
    const raw = localStorage.getItem(storageKey(storeId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ThemeEditorMediaFile[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUploadedThemeEditorMedia(
  storeId: string,
  files: ThemeEditorMediaFile[]
): void {
  try {
    localStorage.setItem(storageKey(storeId), JSON.stringify(files.slice(0, 80)));
  } catch {
    /* quota */
  }
}

export function addUploadedThemeEditorMedia(
  storeId: string,
  file: ThemeEditorMediaFile
): ThemeEditorMediaFile[] {
  const existing = loadUploadedThemeEditorMedia(storeId);
  const next = [file, ...existing.filter((f) => f.id !== file.id)];
  saveUploadedThemeEditorMedia(storeId, next);
  return next;
}

export function allThemeEditorMediaFiles(storeId: string): ThemeEditorMediaFile[] {
  return [...loadUploadedThemeEditorMedia(storeId), ...STOCK_IMAGES];
}
