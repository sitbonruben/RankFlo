/**
 * Color utility helpers for brand extraction.
 *
 * Supports parsing, conversion, contrast calculation, and analysis
 * of hex, rgb, and hsl color formats. All functions work with
 * standard CSS color strings.
 */

// ─── Types ──────────────────────────────────────────────────────

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

// ─── Parsing ────────────────────────────────────────────────────

/**
 * Parse a CSS color string (hex, rgb, rgba, hsl, hsla) into RGB values.
 * Returns null if the string cannot be parsed.
 *
 * @param color - A CSS color string like "#ff0000", "rgb(255,0,0)", "hsl(0,100%,50%)".
 * @returns RGB object or null.
 */
export function parseColor(color: string): RGB | null {
  const trimmed = color.trim().toLowerCase();

  // Hex: #fff, #ffffff, #ffffffff
  const hexResult = parseHex(trimmed);
  if (hexResult) return hexResult;

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbResult = parseRgbString(trimmed);
  if (rgbResult) return rgbResult;

  // hsl(h, s%, l%) or hsla(h, s%, l%, a)
  const hslResult = parseHslString(trimmed);
  if (hslResult) return hslResult;

  return null;
}

/**
 * Parse a hex color string into RGB values.
 * Supports 3, 4, 6, and 8 digit hex strings with or without leading #.
 */
export function parseHex(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, "");

  let r: number, g: number, b: number;

  if (cleaned.length === 3 || cleaned.length === 4) {
    r = parseInt(cleaned[0]! + cleaned[0]!, 16);
    g = parseInt(cleaned[1]! + cleaned[1]!, 16);
    b = parseInt(cleaned[2]! + cleaned[2]!, 16);
  } else if (cleaned.length === 6 || cleaned.length === 8) {
    r = parseInt(cleaned.slice(0, 2), 16);
    g = parseInt(cleaned.slice(2, 4), 16);
    b = parseInt(cleaned.slice(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Parse an rgb() or rgba() CSS string into RGB values.
 */
export function parseRgbString(str: string): RGB | null {
  const match = str.match(
    /rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})/,
  );
  if (!match) return null;

  const r = parseInt(match[1]!, 10);
  const g = parseInt(match[2]!, 10);
  const b = parseInt(match[3]!, 10);

  if (r > 255 || g > 255 || b > 255) return null;
  return { r, g, b };
}

/**
 * Parse an hsl() or hsla() CSS string into RGB values.
 */
export function parseHslString(str: string): RGB | null {
  const match = str.match(
    /hsla?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})%?\s*[,\s]\s*(\d{1,3})%?/,
  );
  if (!match) return null;

  const h = parseInt(match[1]!, 10);
  const s = parseInt(match[2]!, 10);
  const l = parseInt(match[3]!, 10);

  return hslToRgb({ h, s, l });
}

// ─── Conversion ─────────────────────────────────────────────────

/**
 * Convert RGB values to a hex color string.
 *
 * @param rgb - RGB values.
 * @returns A hex string like "#ff0000".
 */
export function rgbToHex(rgb: RGB): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * Convert RGB to HSL.
 *
 * @param rgb - RGB values.
 * @returns HSL object with h (0-360), s (0-100), l (0-100).
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB.
 *
 * @param hsl - HSL values.
 * @returns RGB object.
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

// ─── Analysis ───────────────────────────────────────────────────

/**
 * Calculate the relative luminance of a color.
 * Used for contrast ratio calculations per WCAG 2.0.
 *
 * @param rgb - RGB values.
 * @returns Relative luminance between 0 and 1.
 */
export function relativeLuminance(rgb: RGB): number {
  const rsrgb = rgb.r / 255;
  const gsrgb = rgb.g / 255;
  const bsrgb = rgb.b / 255;

  const r =
    rsrgb <= 0.03928
      ? rsrgb / 12.92
      : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const g =
    gsrgb <= 0.03928
      ? gsrgb / 12.92
      : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const b =
    bsrgb <= 0.03928
      ? bsrgb / 12.92
      : Math.pow((bsrgb + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate the contrast ratio between two colors per WCAG 2.0.
 * Result ranges from 1 (no contrast) to 21 (maximum contrast).
 *
 * WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
 * WCAG AAA requires 7:1 for normal text, 4.5:1 for large text.
 *
 * @param color1 - First color as hex string or RGB.
 * @param color2 - Second color as hex string or RGB.
 * @returns Contrast ratio.
 */
export function contrastRatio(
  color1: string | RGB,
  color2: string | RGB,
): number {
  const rgb1 = typeof color1 === "string" ? parseColor(color1) : color1;
  const rgb2 = typeof color2 === "string" ? parseColor(color2) : color2;

  if (!rgb1 || !rgb2) return 1;

  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determine whether a color is light or dark.
 * Uses the relative luminance threshold of 0.179 (common heuristic).
 *
 * @param color - A CSS color string or RGB object.
 * @returns "light" or "dark".
 */
export function isLightOrDark(color: string | RGB): "light" | "dark" {
  const rgb = typeof color === "string" ? parseColor(color) : color;
  if (!rgb) return "light";

  const luminance = relativeLuminance(rgb);
  return luminance > 0.179 ? "light" : "dark";
}

/**
 * Find the dominant colors from a list of CSS color strings.
 * Groups similar colors and returns the most frequently occurring ones.
 *
 * @param colors - Array of CSS color strings.
 * @param maxResults - Maximum number of dominant colors to return (default: 5).
 * @returns Array of hex color strings sorted by frequency.
 */
export function findDominantColors(
  colors: string[],
  maxResults = 5,
): string[] {
  const colorMap = new Map<string, number>();

  for (const colorStr of colors) {
    const rgb = parseColor(colorStr);
    if (!rgb) continue;

    // Quantize to reduce similar colors (group by 16-step buckets)
    const quantized = rgbToHex({
      r: Math.round(rgb.r / 16) * 16,
      g: Math.round(rgb.g / 16) * 16,
      b: Math.round(rgb.b / 16) * 16,
    });

    colorMap.set(quantized, (colorMap.get(quantized) ?? 0) + 1);
  }

  // Sort by frequency (descending) and return top results
  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex);

  // Filter out near-black and near-white which are usually not "brand" colors
  const filtered = sorted.filter((hex) => {
    const rgb = parseHex(hex);
    if (!rgb) return false;
    const { l } = rgbToHsl(rgb);
    return l > 10 && l < 90;
  });

  return (filtered.length > 0 ? filtered : sorted).slice(0, maxResults);
}

/**
 * Generate a complementary color (opposite on the color wheel).
 *
 * @param color - A CSS color string or RGB object.
 * @returns Hex string of the complementary color.
 */
export function complementaryColor(color: string | RGB): string {
  const rgb = typeof color === "string" ? parseColor(color) : color;
  if (!rgb) return "#000000";

  const hsl = rgbToHsl(rgb);
  const complementHsl: HSL = {
    h: (hsl.h + 180) % 360,
    s: hsl.s,
    l: hsl.l,
  };

  return rgbToHex(hslToRgb(complementHsl));
}

/**
 * Generate an analogous color pair (30 degrees apart on the color wheel).
 *
 * @param color - A CSS color string or RGB object.
 * @returns Tuple of [left analogous hex, right analogous hex].
 */
export function analogousColors(
  color: string | RGB,
): [string, string] {
  const rgb = typeof color === "string" ? parseColor(color) : color;
  if (!rgb) return ["#000000", "#000000"];

  const hsl = rgbToHsl(rgb);

  const left: HSL = { h: (hsl.h + 330) % 360, s: hsl.s, l: hsl.l };
  const right: HSL = { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l };

  return [rgbToHex(hslToRgb(left)), rgbToHex(hslToRgb(right))];
}

/**
 * Generate a triadic color set (120 degrees apart on the color wheel).
 *
 * @param color - A CSS color string or RGB object.
 * @returns Tuple of [second triad hex, third triad hex].
 */
export function triadicColors(
  color: string | RGB,
): [string, string] {
  const rgb = typeof color === "string" ? parseColor(color) : color;
  if (!rgb) return ["#000000", "#000000"];

  const hsl = rgbToHsl(rgb);

  const second: HSL = { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l };
  const third: HSL = { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l };

  return [rgbToHex(hslToRgb(second)), rgbToHex(hslToRgb(third))];
}

/**
 * Lighten a color by a percentage.
 *
 * @param color - A CSS color string or RGB object.
 * @param amount - Percentage to lighten (0-100).
 * @returns Hex string of the lightened color.
 */
export function lighten(color: string | RGB, amount: number): string {
  const rgb = typeof color === "string" ? parseColor(color) : color;
  if (!rgb) return "#ffffff";

  const hsl = rgbToHsl(rgb);
  const newL = Math.min(100, hsl.l + amount);

  return rgbToHex(hslToRgb({ ...hsl, l: newL }));
}

/**
 * Darken a color by a percentage.
 *
 * @param color - A CSS color string or RGB object.
 * @param amount - Percentage to darken (0-100).
 * @returns Hex string of the darkened color.
 */
export function darken(color: string | RGB, amount: number): string {
  const rgb = typeof color === "string" ? parseColor(color) : color;
  if (!rgb) return "#000000";

  const hsl = rgbToHsl(rgb);
  const newL = Math.max(0, hsl.l - amount);

  return rgbToHex(hslToRgb({ ...hsl, l: newL }));
}

/**
 * Check if a CSS color string is a valid parseable color.
 *
 * @param color - A CSS color string.
 * @returns True if the color can be parsed.
 */
export function isValidColor(color: string): boolean {
  return parseColor(color) !== null;
}
