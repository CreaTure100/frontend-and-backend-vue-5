
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


export function generateAnalogousPalette(baseHex, count = 5) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return generateRandomPalette(count);
  
  const colors = [];
  const step = 30; 
  
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


export function generateMonochromaticPalette(baseHex, count = 5) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return generateRandomPalette(count);
  
  const colors = [];
  const lightnessStep = 12; 
  const seen = new Set();
  
  for (let i = 0; i < count; i++) {
    const baseL = baseHsl.l + (i - Math.floor(count / 2)) * lightnessStep;
    
    let hex = '';
    let finalL = baseL;

    for (let attempt = 0; attempt < 5; attempt++) {
      const jitter = attempt === 0 ? 0 : (attempt % 2 === 0 ? attempt : -attempt); // 0, +1, -2, +3, -4
      const l = Math.max(20, Math.min(90, Math.round(baseL + jitter)));
      const candidate = { h: baseHsl.h, s: baseHsl.s, l };
      hex = hslToHex(candidate.h, candidate.s, candidate.l);
      if (!seen.has(hex)) {
        finalL = l;
        seen.add(hex);
        break;
      }
    }
    
    colors.push({
      id: Date.now() + i,
      hex,
      hsl: { h: baseHsl.h, s: baseHsl.s, l: finalL },
      locked: false
    });
  }
  return colors;
}


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


export function generateComplementaryPalette(baseHex) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return generateRandomPalette(2);
  
  const colors = [];

  colors.push({
    id: Date.now(),
    hex: baseHex,
    hsl: baseHsl,
    locked: false
  });
  

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
 * Подбор акцентных цветов: комплементарный и два триадных относительно базового.
 * Возвращает массив объектов { hex, label }.
 */
export function getAccentColors(baseHex) {
  const baseHsl = hexToHsl(baseHex);
  if (!baseHsl) return [];
  
  const variants = [
    { h: (baseHsl.h + 180) % 360, s: baseHsl.s, l: baseHsl.l, label: '' },
    { h: (baseHsl.h + 120) % 360, s: baseHsl.s, l: baseHsl.l, label: '' },
    { h: (baseHsl.h + 240) % 360, s: baseHsl.s, l: baseHsl.l, label: '' },
  ];
  
  const seen = new Set();
  const accents = [];
  variants.forEach((v) => {
    const hex = hslToHex(v.h, v.s, v.l);
    if (!seen.has(hex)) {
      seen.add(hex);
      accents.push({ hex, label: v.label });
    }
  });
  
  return accents;
}


export function encodePalette(colors = []) {
  try {
    const hexes = colors.map(c => c.hex);
    return btoa(JSON.stringify(hexes));
  } catch (e) {
    console.error('Failed to encode palette', e);
    return '';
  }
}


export function decodePalette(encoded) {
  if (!encoded) return null;
  try {
    const json = atob(encoded);
    const hexes = JSON.parse(json);
    if (!Array.isArray(hexes)) return null;
    return hexes.filter(Boolean);
  } catch (e) {
    console.error('Failed to decode palette', e);
    return null;
  }
}


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


export function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}


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


export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}