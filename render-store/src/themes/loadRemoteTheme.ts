import type { ThemeContract } from './contract';

/**
 * Dynamically loads an independently built ESM theme bundle (e.g. `dist/theme.js` output).
 * Expects `default` export to be a ThemeContract-shaped object.
 */
export async function loadRemoteTheme(moduleUrl: string): Promise<ThemeContract> {
  const mod = (await import(/* @vite-ignore */ moduleUrl)) as {
    default?: ThemeContract;
    gamingThemeContract?: ThemeContract;
    beautyThemeContract?: ThemeContract;
    shoesThemeContract?: ThemeContract;
  };
  const contract = mod.default ?? mod.gamingThemeContract ?? mod.beautyThemeContract ?? mod.shoesThemeContract;
  if (!contract?.HomePage || !contract.ProductPage || !contract.CartPage) {
    throw new Error('Invalid theme module: expected default export ThemeContract with HomePage, ProductPage, CartPage, …');
  }
  return contract;
}
