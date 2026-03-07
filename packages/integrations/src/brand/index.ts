export { BrandExtractor } from "./extractor";

export {
  // Types
  type RGB,
  type HSL,
  // Parsing
  parseColor,
  parseHex,
  parseRgbString,
  parseHslString,
  // Conversion
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  // Analysis
  relativeLuminance,
  contrastRatio,
  isLightOrDark,
  findDominantColors,
  // Generation
  complementaryColor,
  analogousColors,
  triadicColors,
  lighten,
  darken,
  // Validation
  isValidColor,
} from "./color";
