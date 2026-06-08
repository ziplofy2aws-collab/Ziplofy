# Wave Divider Customization Guide

## Overview
The `WaveDivider` component allows you to easily customize wave patterns throughout your storefront. All waves are now configurable through the `WAVE_CONFIG` object in `StorefrontApp.tsx`.

## Quick Start

### Location
The wave configuration is located at the top of the `StorefrontApp` component in `src/pages/StorefrontApp.tsx`:

```typescript
const WAVE_CONFIG = {
  heroBottom: { type: 'smooth', fillColor: 'fill-white', height: 16 },
  trustBadgesBottom: { type: 'gentle', fillColor: 'fill-gray-50', height: 20 },
  collectionsTop: { type: 'smooth', fillColor: 'fill-indigo-50', height: 20 },
  collectionsBottom: { type: 'gentle', fillColor: 'fill-indigo-50', height: 16 },
  productsTop: { type: 'smooth', fillColor: 'fill-indigo-50', height: 24 },
  productsBottom: { type: 'dramatic', fillColor: 'fill-gray-900', height: 20 },
};
```

## Wave Types

### Available Types:
1. **`'smooth'`** - Smooth, gentle curves (default)
2. **`'gentle'`** - Very subtle, low amplitude waves
3. **`'rough'`** - More dramatic, varied waves with some randomness
4. **`'dramatic'`** - High amplitude, dramatic waves
5. **`'random'`** - Random wave pattern (changes on each render)

### Examples:

```typescript
// Smooth wave
heroBottom: { type: 'smooth', fillColor: 'fill-white', height: 16 }

// Gentle wave
trustBadgesBottom: { type: 'gentle', fillColor: 'fill-gray-50', height: 20 }

// Dramatic wave
productsBottom: { type: 'dramatic', fillColor: 'fill-gray-900', height: 20 }

// Random wave (different each time)
collectionsTop: { type: 'random', fillColor: 'fill-indigo-50', height: 20 }
```

## Advanced Customization

### Custom Amplitude and Frequency

You can also customize the amplitude (wave height) and frequency (number of waves):

```typescript
const WAVE_CONFIG = {
  heroBottom: { 
    type: 'smooth', 
    fillColor: 'fill-white', 
    height: 16,
    amplitude: 40,  // Higher = taller waves (default: 30)
    frequency: 8     // Higher = more waves (default: 6)
  },
};
```

### Custom Colors

Use any Tailwind color class:

```typescript
heroBottom: { 
  type: 'smooth', 
  fillColor: 'fill-blue-500',  // Any Tailwind color
  height: 16 
}
```

### Custom Wave Path

For complete control, you can provide a custom SVG path:

```typescript
<WaveDivider
  customPath="M0,60 L360,40 L720,80 L1080,30 L1440,60 L1440,120 L0,120 Z"
  fillColor="fill-purple-500"
  height={20}
/>
```

## Wave Positions

- **`position: 'top'`** - Wave at the top of the section (flipped)
- **`position: 'bottom'`** - Wave at the bottom of the section (default)

## Component Props

```typescript
interface WaveDividerProps {
  type?: 'smooth' | 'rough' | 'gentle' | 'dramatic' | 'random';
  fillColor?: string;        // Tailwind color class
  height?: number;           // Height in rem units (multiplied by 0.25)
  amplitude?: number;        // Wave amplitude (default: 30)
  frequency?: number;        // Number of waves (default: 6)
  customPath?: string;       // Custom SVG path (overrides type)
  className?: string;         // Additional CSS classes
  position?: 'top' | 'bottom';
}
```

## Tips

1. **Consistency**: Use similar wave types for related sections
2. **Height**: Adjust height based on section spacing (16-24 is typical)
3. **Color**: Match fillColor to the section's background color
4. **Random Type**: Use sparingly - it regenerates on each render
5. **Performance**: Custom paths are more performant than random type

## Examples

### All Smooth Waves
```typescript
const WAVE_CONFIG = {
  heroBottom: { type: 'smooth', fillColor: 'fill-white', height: 16 },
  trustBadgesBottom: { type: 'smooth', fillColor: 'fill-gray-50', height: 20 },
  collectionsTop: { type: 'smooth', fillColor: 'fill-indigo-50', height: 20 },
  collectionsBottom: { type: 'smooth', fillColor: 'fill-indigo-50', height: 16 },
  productsTop: { type: 'smooth', fillColor: 'fill-indigo-50', height: 24 },
  productsBottom: { type: 'smooth', fillColor: 'fill-gray-900', height: 20 },
};
```

### Varied Wave Types
```typescript
const WAVE_CONFIG = {
  heroBottom: { type: 'gentle', fillColor: 'fill-white', height: 16 },
  trustBadgesBottom: { type: 'smooth', fillColor: 'fill-gray-50', height: 20 },
  collectionsTop: { type: 'rough', fillColor: 'fill-indigo-50', height: 20 },
  collectionsBottom: { type: 'gentle', fillColor: 'fill-indigo-50', height: 16 },
  productsTop: { type: 'smooth', fillColor: 'fill-indigo-50', height: 24 },
  productsBottom: { type: 'dramatic', fillColor: 'fill-gray-900', height: 20 },
};
```

### High Frequency Waves
```typescript
const WAVE_CONFIG = {
  heroBottom: { 
    type: 'smooth', 
    fillColor: 'fill-white', 
    height: 16,
    frequency: 12  // More waves
  },
};
```
