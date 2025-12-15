// Color utility functions for palette generation and conversion

/**
 * Generate a random color in HSL format
 */
export function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
  const lightness = Math.floor(Math.random() * 30) + 50; // 50-80%
  return { h: hue, s: saturation, l: lightness };
}

/**
 * Convert HSL to HEX
 */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    // Calculate hue based on which color channel is dominant
    // Values 6, 2, 4 represent positions on the color wheel (red, green, blue)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; // Red dominant
      case g: h = ((b - r) / d + 2) / 6; break; // Green dominant
      case b: h = ((r - g) / d + 4) / 6; break; // Blue dominant
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HEX to HSL
 */
export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Generate harmonious palette (random)
 */
export function generateRandomPalette(count = 5) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const color = randomColor();
    colors.push({
      id: Date.now() + i,
      hex: hslToHex(color.h, color.s, color.l),
      hsl: color,
      locked: false
    });
  }
  return colors;
}

/**
 * Generate analogous palette from base color
 */
export function generateAnalogousPalette(baseHex, count = 5) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return generateRandomPalette(count);
  
  const colors = [];
  const step = 30; // 30 degrees on color wheel
  
  for (let i = 0; i < count; i++) {
    const offset = (i - Math.floor(count / 2)) * step;
    const h = (baseHsl.h + offset + 360) % 360;
    const color = { h, s: baseHsl.s, l: baseHsl.l };
    colors.push({
      id: Date.now() + i,
      hex: hslToHex(color.h, color.s, color.l),
      hsl: color,
      locked: false
    });
  }
  return colors;
}

/**
 * Generate monochromatic palette from base color
 */
export function generateMonochromaticPalette(baseHex, count = 5) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return generateRandomPalette(count);
  
  const colors = [];
  const lightnessStep = 15;
  
  for (let i = 0; i < count; i++) {
    const l = Math.max(20, Math.min(90, baseHsl.l + (i - Math.floor(count / 2)) * lightnessStep));
    const color = { h: baseHsl.h, s: baseHsl.s, l };
    colors.push({
      id: Date.now() + i,
      hex: hslToHex(color.h, color.s, color.l),
      hsl: color,
      locked: false
    });
  }
  return colors;
}

/**
 * Generate triadic palette from base color
 */
export function generateTriadicPalette(baseHex) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return generateRandomPalette(3);
  
  const colors = [];
  for (let i = 0; i < 3; i++) {
    const h = (baseHsl.h + i * 120) % 360;
    const color = { h, s: baseHsl.s, l: baseHsl.l };
    colors.push({
      id: Date.now() + i,
      hex: hslToHex(color.h, color.s, color.l),
      hsl: color,
      locked: false
    });
  }
  return colors;
}

/**
 * Generate complementary palette from base color
 */
export function generateComplementaryPalette(baseHex) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return generateRandomPalette(2);
  
  const colors = [];
  // Base color
  colors.push({
    id: Date.now(),
    hex: baseHex,
    hsl: baseHsl,
    locked: false
  });
  
  // Complementary color (180 degrees opposite)
  const h = (baseHsl.h + 180) % 360;
  const complementary = { h, s: baseHsl.s, l: baseHsl.l };
  colors.push({
    id: Date.now() + 1,
    hex: hslToHex(complementary.h, complementary.s, complementary.l),
    hsl: complementary,
    locked: false
  });
  
  return colors;
}

/**
 * Generate palette by mood
 */
export function generateMoodPalette(mood, count = 5) {
  const colors = [];
  let hueRange, satRange, lightRange;
  
  switch (mood) {
    case 'calm':
      hueRange = [180, 240]; // Blues and greens
      satRange = [30, 60];
      lightRange = [60, 80];
      break;
    case 'energetic':
      hueRange = [0, 60]; // Reds, oranges, yellows
      satRange = [70, 100];
      lightRange = [50, 70];
      break;
    case 'professional':
      hueRange = [200, 240]; // Blues
      satRange = [40, 70];
      lightRange = [40, 60];
      break;
    default:
      return generateRandomPalette(count);
  }
  
  for (let i = 0; i < count; i++) {
    const h = Math.floor(Math.random() * (hueRange[1] - hueRange[0]) + hueRange[0]);
    const s = Math.floor(Math.random() * (satRange[1] - satRange[0]) + satRange[0]);
    const l = Math.floor(Math.random() * (lightRange[1] - lightRange[0]) + lightRange[0]);
    const color = { h, s, l };
    
    colors.push({
      id: Date.now() + i,
      hex: hslToHex(color.h, color.s, color.l),
      hsl: color,
      locked: false
    });
  }
  
  return colors;
}

/**
 * Calculate relative luminance for WCAG contrast
 */
export function getRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG accessibility level
 */
export function getAccessibilityLevel(contrastRatio, isLargeText = false) {
  if (isLargeText) {
    if (contrastRatio >= 4.5) return 'AAA';
    if (contrastRatio >= 3) return 'AA';
  } else {
    if (contrastRatio >= 7) return 'AAA';
    if (contrastRatio >= 4.5) return 'AA';
  }
  return 'Fail';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
