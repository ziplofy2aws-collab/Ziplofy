import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CustomThemesProvider, useCustomThemes } from './custom-themes.context';

vi.mock('../config/axios.config', () => ({
  axiosi: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { axiosi } from '../config/axios.config';

function TestConsumer() {
  const ctx = useCustomThemes();
  return (
    <div>
      <span data-testid="has-fetchAll">{typeof ctx.fetchAll}</span>
      <span data-testid="has-createTheme">{typeof ctx.createTheme}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="error">{ctx.error || 'null'}</span>
      <span data-testid="themes-count">{ctx.customThemes.length}</span>
      <button onClick={() => ctx.fetchAll()}>Fetch</button>
    </div>
  );
}

describe('CustomThemesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('CustomThemesProvider provides context with all methods', () => {
    render(
      <CustomThemesProvider>
        <TestConsumer />
      </CustomThemesProvider>
    );

    expect(screen.getByTestId('has-fetchAll')).toHaveTextContent('function');
    expect(screen.getByTestId('has-createTheme')).toHaveTextContent('function');
    expect(screen.getByTestId('themes-count')).toHaveTextContent('0');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  it('fetchAll calls GET /custom-themes', async () => {
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: [], count: 0 },
    });

    render(
      <CustomThemesProvider>
        <TestConsumer />
      </CustomThemesProvider>
    );

    screen.getByText('Fetch').click();

    await waitFor(() => {
      expect(axiosi.get).toHaveBeenCalledWith('/custom-themes');
    });
  });

  it('fetchAll sets customThemes on success', async () => {
    const mockThemes = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Theme',
        html: '',
        css: '',
        themePath: 'test',
        createdBy: { _id: '1', name: 'User', email: 'u@test.com' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    (axiosi.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: mockThemes, count: 1 },
    });

    render(
      <CustomThemesProvider>
        <TestConsumer />
      </CustomThemesProvider>
    );

    screen.getByText('Fetch').click();

    await waitFor(() => {
      expect(screen.getByTestId('themes-count')).toHaveTextContent('1');
    });
  });

  it('fetchAll sets error on failure', async () => {
    (axiosi.get as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { message: 'Network error' } },
    });

    render(
      <CustomThemesProvider>
        <TestConsumer />
      </CustomThemesProvider>
    );

    screen.getByText('Fetch').click();

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
  });

  it('useCustomThemes throws outside provider', () => {
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useCustomThemes must be used within CustomThemesProvider');
  });
});
