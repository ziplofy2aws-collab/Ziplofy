import { describe, expect, it, vi } from 'vitest';

vi.mock('react-dom/client', () => {
  return {
    createRoot: vi.fn(() => ({
      render: vi.fn(),
    })),
  };
});

vi.mock('./App.tsx', () => ({
  __esModule: true,
  default: () => null,
}));

describe('main entry', () => {
  it('mounts React app into #root', async () => {
    const rootElem = document.createElement('div');
    rootElem.id = 'root';
    document.body.appendChild(rootElem);

    const { createRoot } = await import('react-dom/client');

    await import('./main');

    expect((createRoot as any).mock.calls[0][0]).toBe(rootElem);
  });
});

