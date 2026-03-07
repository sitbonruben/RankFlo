import type { BrandProfile, BrandColors, BrandFonts } from "../types";
import {
  parseColor,
  rgbToHex,
  rgbToHsl,
  isLightOrDark,
  findDominantColors,
  contrastRatio,
} from "./color";

/** Default timeout for fetching a web page (15 seconds). */
const DEFAULT_TIMEOUT_MS = 15_000;

/**
 * Brand extraction engine.
 *
 * Given a URL, fetches the page HTML and extracts brand signals:
 * - Colors from CSS custom properties, inline styles, meta tags
 * - Fonts from Google Fonts links, @font-face, CSS variables
 * - Tone from page text analysis
 * - Logo from OG image, favicon, and common img patterns
 * - Site metadata from title, description, and OG tags
 *
 * This runs in a Node.js server environment using only fetch and
 * regex-based parsing (no DOM parser libraries).
 */
export class BrandExtractor {
  private timeoutMs: number;

  constructor(opts?: { timeoutMs?: number }) {
    this.timeoutMs = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /**
   * Extract a complete BrandProfile from the given website URL.
   *
   * @param url - The website URL to analyze.
   * @returns A BrandProfile with colors, fonts, tone, and metadata.
   *
   * @example
   * ```ts
   * const extractor = new BrandExtractor();
   * const brand = await extractor.extract("https://example.com");
   * console.log(brand.colors.primary); // "#3b82f6"
   * console.log(brand.fonts.heading);  // "Inter"
   * console.log(brand.tone);           // ["professional", "technical"]
   * ```
   */
  async extract(url: string): Promise<BrandProfile> {
    const html = await this.fetchPage(url);
    const parsedUrl = new URL(url);

    const cssText = this.extractAllCss(html);
    const colors = this.extractColors(html, cssText);
    const fonts = this.extractFonts(html, cssText);
    const tone = this.extractTone(html);
    const siteName =
      this.extractMeta(html, "og:site_name") ??
      this.extractTitle(html) ??
      this.extractMeta(html, "application-name") ??
      parsedUrl.hostname.replace("www.", "");
    const tagline =
      this.extractMeta(html, "description") ??
      this.extractMeta(html, "og:description") ??
      undefined;
    const logoUrl = this.extractLogo(html, parsedUrl.origin);
    const faviconUrl = this.extractFavicon(html, parsedUrl.origin);
    const industry = this.inferIndustry(html);

    return {
      colors,
      fonts,
      tone,
      industry,
      logoUrl,
      faviconUrl,
      siteName,
      tagline,
    };
  }

  // ─── Page Fetching ────────────────────────────────────────────

  /**
   * Fetch the HTML content of a page with timeout and proper headers.
   */
  private async fetchPage(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; RankFlo/1.0; +https://rankflo.io)",
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
      }

      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── CSS Extraction ───────────────────────────────────────────

  /**
   * Extract all CSS text from <style> blocks and inline style attributes.
   */
  private extractAllCss(html: string): string {
    const blocks: string[] = [];

    // <style> tag contents
    const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match: RegExpExecArray | null;
    while ((match = styleTagRegex.exec(html)) !== null) {
      if (match[1]) blocks.push(match[1]);
    }

    // Inline style attributes
    const inlineStyleRegex = /style=["']([^"']+)["']/gi;
    while ((match = inlineStyleRegex.exec(html)) !== null) {
      if (match[1]) blocks.push(match[1]);
    }

    return blocks.join("\n");
  }

  // ─── Color Extraction ─────────────────────────────────────────

  /**
   * Extract color values from CSS custom properties, inline styles,
   * theme-color meta tag, and common CSS patterns.
   */
  private extractColors(html: string, cssText: string): BrandColors {
    const defaults: BrandColors = {
      primary: "#3b82f6",
      secondary: "#6366f1",
      accent: "#f59e0b",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#1e293b",
      textMuted: "#64748b",
    };

    // Collect all color values found in CSS for frequency analysis
    const allColors: string[] = [];

    // Extract hex colors from CSS
    const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;
    let hexMatch: RegExpExecArray | null;
    while ((hexMatch = hexRegex.exec(cssText)) !== null) {
      allColors.push(hexMatch[0]);
    }

    // Extract rgb/rgba colors from CSS
    const rgbRegex = /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?\s*\)/g;
    let rgbMatch: RegExpExecArray | null;
    while ((rgbMatch = rgbRegex.exec(cssText)) !== null) {
      const parsed = parseColor(rgbMatch[0]);
      if (parsed) allColors.push(rgbToHex(parsed));
    }

    // Extract hsl/hsla colors from CSS
    const hslRegex = /hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?(?:\s*,\s*[\d.]+)?\s*\)/g;
    let hslMatch: RegExpExecArray | null;
    while ((hslMatch = hslRegex.exec(cssText)) !== null) {
      const parsed = parseColor(hslMatch[0]);
      if (parsed) allColors.push(rgbToHex(parsed));
    }

    // ─── CSS Variable Patterns ──────────────────────────────────

    const varPatterns: [keyof BrandColors, RegExp[]][] = [
      [
        "primary",
        [
          /--(?:color-)?primary\s*:\s*([^;}\n]+)/i,
          /--(?:brand|theme)-(?:color-)?primary\s*:\s*([^;}\n]+)/i,
          /--primary-color\s*:\s*([^;}\n]+)/i,
        ],
      ],
      [
        "secondary",
        [
          /--(?:color-)?secondary\s*:\s*([^;}\n]+)/i,
          /--(?:brand|theme)-(?:color-)?secondary\s*:\s*([^;}\n]+)/i,
          /--secondary-color\s*:\s*([^;}\n]+)/i,
        ],
      ],
      [
        "accent",
        [
          /--(?:color-)?accent\s*:\s*([^;}\n]+)/i,
          /--(?:brand|theme)-(?:color-)?accent\s*:\s*([^;}\n]+)/i,
          /--accent-color\s*:\s*([^;}\n]+)/i,
        ],
      ],
      [
        "background",
        [
          /--(?:color-)?(?:bg|background)\s*:\s*([^;}\n]+)/i,
          /--(?:brand|theme)-(?:color-)?background\s*:\s*([^;}\n]+)/i,
          /--background-color\s*:\s*([^;}\n]+)/i,
        ],
      ],
      [
        "surface",
        [
          /--(?:color-)?surface\s*:\s*([^;}\n]+)/i,
          /--(?:color-)?card\s*:\s*([^;}\n]+)/i,
          /--(?:color-)?muted\s*:\s*([^;}\n]+)/i,
        ],
      ],
      [
        "text",
        [
          /--(?:color-)?(?:text|foreground)\s*:\s*([^;}\n]+)/i,
          /--(?:brand|theme)-(?:color-)?text\s*:\s*([^;}\n]+)/i,
          /--text-color\s*:\s*([^;}\n]+)/i,
        ],
      ],
      [
        "textMuted",
        [
          /--(?:color-)?(?:text-muted|muted-foreground)\s*:\s*([^;}\n]+)/i,
          /--(?:color-)?(?:text-secondary|text-light)\s*:\s*([^;}\n]+)/i,
        ],
      ],
    ];

    for (const [colorKey, patterns] of varPatterns) {
      for (const pattern of patterns) {
        const m = cssText.match(pattern);
        if (m?.[1]) {
          const value = m[1].trim();
          const parsed = parseColor(value);
          if (parsed) {
            defaults[colorKey] = rgbToHex(parsed);
            break;
          }
          // Check if it's a plain hex
          if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
            defaults[colorKey] = value;
            break;
          }
        }
      }
    }

    // Check <meta name="theme-color"> — often set to the brand primary
    const themeColor = this.extractMetaByName(html, "theme-color");
    if (themeColor) {
      const parsed = parseColor(themeColor);
      if (parsed) {
        defaults.primary = rgbToHex(parsed);
      }
    }

    // Use frequency analysis to potentially find better primary/accent
    if (allColors.length > 5) {
      const dominant = findDominantColors(allColors, 3);
      if (dominant.length > 0) {
        // If the dominant color has good contrast with white, it could be a good primary
        const dominantRgb = parseColor(dominant[0]!);
        if (dominantRgb) {
          const hsl = rgbToHsl(dominantRgb);
          // Saturated, mid-luminance colors are likely brand colors
          if (hsl.s > 20 && hsl.l > 15 && hsl.l < 85) {
            // Only override if we haven't found a primary from CSS variables
            if (defaults.primary === "#3b82f6") {
              defaults.primary = dominant[0]!;
            }
          }
        }
      }
    }

    // Ensure text has sufficient contrast against background
    const textContrast = contrastRatio(defaults.text, defaults.background);
    if (textContrast < 4.5) {
      // If poor contrast, use safe defaults based on background lightness
      if (isLightOrDark(defaults.background) === "light") {
        defaults.text = "#1e293b";
        defaults.textMuted = "#64748b";
      } else {
        defaults.text = "#f8fafc";
        defaults.textMuted = "#94a3b8";
      }
    }

    return defaults;
  }

  // ─── Font Extraction ──────────────────────────────────────────

  /**
   * Extract font families from Google Fonts links, @font-face,
   * CSS variables, and computed font-family properties.
   */
  private extractFonts(html: string, cssText: string): BrandFonts {
    const defaults: BrandFonts = {
      heading: "system-ui",
      body: "system-ui",
      headingWeight: "700",
      bodyWeight: "400",
    };

    const detectedFonts: string[] = [];

    // ─── Google Fonts links ─────────────────────────────────────
    const googleFontRegex = /fonts\.googleapis\.com\/css2?\?[^"'\s>]+/gi;
    let fontLinkMatch: RegExpExecArray | null;
    while ((fontLinkMatch = googleFontRegex.exec(html)) !== null) {
      const link = fontLinkMatch[0];
      const familyMatch = link.match(/family=([^&"']+)/);
      if (familyMatch?.[1]) {
        const families = familyMatch[1].split("|").map((f) =>
          decodeURIComponent(f.split(":")[0]!.replace(/\+/g, " ")),
        );
        detectedFonts.push(...families);
      }
    }

    // ─── @font-face declarations ────────────────────────────────
    const fontFaceRegex = /@font-face\s*\{[^}]*font-family\s*:\s*["']?([^"';}\n]+)/gi;
    let fontFaceMatch: RegExpExecArray | null;
    while ((fontFaceMatch = fontFaceRegex.exec(cssText)) !== null) {
      if (fontFaceMatch[1]) {
        const family = fontFaceMatch[1].trim().replace(/["']/g, "");
        if (
          family &&
          !family.includes("icon") &&
          !family.includes("Icon") &&
          !family.includes("fa-") &&
          !family.includes("Material")
        ) {
          detectedFonts.push(family);
        }
      }
    }

    // ─── CSS custom properties for fonts ────────────────────────
    const fontVarPatterns: [string, RegExp[]][] = [
      [
        "heading",
        [
          /--font-(?:heading|display|title|h1)\s*:\s*["']?([^;}"'\n]+)/i,
          /--(?:heading|display|title)-font(?:-family)?\s*:\s*["']?([^;}"'\n]+)/i,
        ],
      ],
      [
        "body",
        [
          /--font-(?:body|sans|base|text)\s*:\s*["']?([^;}"'\n]+)/i,
          /--(?:body|base|text)-font(?:-family)?\s*:\s*["']?([^;}"'\n]+)/i,
        ],
      ],
      [
        "mono",
        [
          /--font-(?:mono|code)\s*:\s*["']?([^;}"'\n]+)/i,
          /--(?:mono|code)-font(?:-family)?\s*:\s*["']?([^;}"'\n]+)/i,
        ],
      ],
    ];

    for (const [fontKey, patterns] of fontVarPatterns) {
      for (const pattern of patterns) {
        const m = cssText.match(pattern);
        if (m?.[1]) {
          const fontValue = m[1]
            .split(",")[0]!
            .trim()
            .replace(/["']/g, "");
          if (fontValue && fontValue !== "inherit" && fontValue !== "initial") {
            if (fontKey === "heading") defaults.heading = fontValue;
            else if (fontKey === "body") defaults.body = fontValue;
            else if (fontKey === "mono") defaults.mono = fontValue;
            break;
          }
        }
      }
    }

    // ─── Apply detected fonts if CSS variables didn't yield results ──
    // Unique detected fonts, excluding system/generic fonts
    const uniqueFonts = [...new Set(detectedFonts)].filter(
      (f) =>
        !["system-ui", "sans-serif", "serif", "monospace", "cursive"].includes(
          f.toLowerCase(),
        ),
    );

    if (defaults.heading === "system-ui" && uniqueFonts.length >= 1) {
      defaults.heading = uniqueFonts[0]!;
    }
    if (defaults.body === "system-ui" && uniqueFonts.length >= 2) {
      defaults.body = uniqueFonts[1]!;
    } else if (defaults.body === "system-ui" && uniqueFonts.length === 1) {
      defaults.body = uniqueFonts[0]!;
    }

    // ─── Detect font weights ────────────────────────────────────
    const headingWeightMatch = cssText.match(
      /h[1-3][^{]*\{[^}]*font-weight\s*:\s*(\d{3}|bold|bolder|normal|lighter)/i,
    );
    if (headingWeightMatch?.[1]) {
      const w = headingWeightMatch[1];
      defaults.headingWeight =
        w === "bold" ? "700" : w === "bolder" ? "800" : w === "normal" ? "400" : w === "lighter" ? "300" : w;
    }

    const bodyWeightMatch = cssText.match(
      /body[^{]*\{[^}]*font-weight\s*:\s*(\d{3}|bold|normal|lighter)/i,
    );
    if (bodyWeightMatch?.[1]) {
      const w = bodyWeightMatch[1];
      defaults.bodyWeight =
        w === "bold" ? "700" : w === "normal" ? "400" : w === "lighter" ? "300" : w;
    }

    return defaults;
  }

  // ─── Tone Extraction ──────────────────────────────────────────

  /**
   * Analyze page text to infer brand voice/tone keywords.
   */
  private extractTone(html: string): string[] {
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .slice(0, 8000);

    const toneIndicators: [string, string[]][] = [
      [
        "professional",
        [
          "professional",
          "enterprise",
          "solution",
          "platform",
          "industry",
          "leading",
          "expertise",
        ],
      ],
      [
        "friendly",
        [
          "welcome",
          "hello",
          "hey",
          "awesome",
          "love",
          "fun",
          "enjoy",
          "happy",
          "smile",
        ],
      ],
      [
        "technical",
        [
          "api",
          "developer",
          "code",
          "documentation",
          "sdk",
          "integration",
          "framework",
          "deploy",
        ],
      ],
      [
        "casual",
        [
          "cool",
          "check out",
          "awesome",
          "hey",
          "btw",
          "super",
          "gonna",
          "wanna",
        ],
      ],
      [
        "formal",
        [
          "furthermore",
          "therefore",
          "consequently",
          "regarding",
          "pursuant",
          "hereby",
        ],
      ],
      [
        "innovative",
        [
          "cutting-edge",
          "innovative",
          "disruptive",
          "revolutionary",
          "next-gen",
          "breakthrough",
        ],
      ],
      [
        "trustworthy",
        [
          "trusted",
          "secure",
          "reliable",
          "proven",
          "certified",
          "guarantee",
          "privacy",
        ],
      ],
      [
        "playful",
        [
          "fun",
          "exciting",
          "adventure",
          "discover",
          "explore",
          "creative",
          "magic",
        ],
      ],
      [
        "minimalist",
        [
          "simple",
          "clean",
          "minimal",
          "elegant",
          "streamlined",
          "effortless",
        ],
      ],
      [
        "authoritative",
        [
          "expert",
          "authority",
          "definitive",
          "comprehensive",
          "research",
          "study",
          "data",
        ],
      ],
    ];

    const detected: string[] = [];
    for (const [tone, keywords] of toneIndicators) {
      const matchCount = keywords.filter((kw) => text.includes(kw)).length;
      if (matchCount >= 2) {
        detected.push(tone);
      }
    }

    return detected.length > 0
      ? detected.slice(0, 4)
      : ["professional", "informative"];
  }

  // ─── Industry Detection ───────────────────────────────────────

  /**
   * Infer the industry/vertical from page content keywords.
   */
  private inferIndustry(html: string): string | undefined {
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .slice(0, 10000);

    const industries: [string, string[]][] = [
      [
        "Technology",
        ["software", "saas", "api", "developer", "cloud", "ai", "machine learning"],
      ],
      [
        "E-commerce",
        ["shop", "cart", "product", "price", "buy", "order", "shipping"],
      ],
      [
        "Finance",
        ["finance", "banking", "investment", "trading", "crypto", "insurance"],
      ],
      [
        "Healthcare",
        ["health", "medical", "patient", "clinic", "hospital", "wellness"],
      ],
      [
        "Education",
        ["learn", "course", "student", "training", "education", "tutorial"],
      ],
      [
        "Marketing",
        ["marketing", "campaign", "brand", "advertising", "seo", "analytics"],
      ],
      [
        "Real Estate",
        ["property", "real estate", "listing", "rent", "mortgage", "home"],
      ],
      [
        "Food & Beverage",
        ["recipe", "restaurant", "food", "menu", "cooking", "chef"],
      ],
      [
        "Travel",
        ["travel", "hotel", "booking", "flight", "destination", "vacation"],
      ],
      [
        "Media",
        ["news", "article", "journalist", "media", "press", "editorial"],
      ],
    ];

    let bestMatch: string | undefined;
    let bestScore = 0;

    for (const [industry, keywords] of industries) {
      const score = keywords.filter((kw) => text.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = industry;
      }
    }

    return bestScore >= 2 ? bestMatch : undefined;
  }

  // ─── Logo Detection ───────────────────────────────────────────

  /**
   * Attempt to find the site logo from various sources:
   * - OG image meta tag
   * - Images with logo-related class/id/alt/src attributes
   * - Apple touch icon
   */
  private extractLogo(html: string, origin: string): string | undefined {
    // OG image is often the logo or brand image
    const ogImage = this.extractMeta(html, "og:image");
    if (ogImage) {
      return this.resolveUrl(ogImage, origin);
    }

    // Look for <img> tags with logo-related attributes
    const imgRegex =
      /<img[^>]*(?:class|id|alt|src)=["'][^"']*logo[^"']*["'][^>]*>/gi;
    let imgMatch: RegExpExecArray | null;
    while ((imgMatch = imgRegex.exec(html)) !== null) {
      const srcMatch = imgMatch[0].match(/src=["']([^"']+)["']/);
      if (srcMatch?.[1]) {
        return this.resolveUrl(srcMatch[1], origin);
      }
    }

    // Apple touch icon (typically a high-res brand icon)
    const appleTouchIcon = html.match(
      /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i,
    );
    if (appleTouchIcon?.[1]) {
      return this.resolveUrl(appleTouchIcon[1], origin);
    }

    return undefined;
  }

  // ─── Meta & Utility Helpers ───────────────────────────────────

  /**
   * Extract the <title> tag content.
   */
  private extractTitle(html: string): string | null {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match?.[1]?.trim() ?? null;
  }

  /**
   * Extract content of an OG or standard meta tag by property name.
   */
  private extractMeta(html: string, property: string): string | null {
    // Try <meta property="...">
    const ogMatch = html.match(
      new RegExp(
        `<meta[^>]*property=["']${this.escapeRegex(property)}["'][^>]*content=["']([^"']+)["']`,
        "i",
      ),
    );
    if (ogMatch?.[1]) return ogMatch[1];

    // Try <meta content="..." property="...">
    const reverseMatch = html.match(
      new RegExp(
        `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${this.escapeRegex(property)}["']`,
        "i",
      ),
    );
    if (reverseMatch?.[1]) return reverseMatch[1];

    // Fallback to name attribute
    return this.extractMetaByName(html, property);
  }

  /**
   * Extract content of a meta tag by name attribute.
   */
  private extractMetaByName(html: string, name: string): string | null {
    const match = html.match(
      new RegExp(
        `<meta[^>]*name=["']${this.escapeRegex(name)}["'][^>]*content=["']([^"']+)["']`,
        "i",
      ),
    );
    if (match?.[1]) return match[1];

    const reverseMatch = html.match(
      new RegExp(
        `<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${this.escapeRegex(name)}["']`,
        "i",
      ),
    );
    return reverseMatch?.[1] ?? null;
  }

  /**
   * Extract the favicon URL from link tags.
   */
  private extractFavicon(html: string, origin: string): string | undefined {
    // Try standard icon links
    const iconMatch = html.match(
      /<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i,
    );
    if (iconMatch?.[1]) {
      return this.resolveUrl(iconMatch[1], origin);
    }

    // Try reverse attribute order
    const reverseMatch = html.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:icon|shortcut icon)["']/i,
    );
    if (reverseMatch?.[1]) {
      return this.resolveUrl(reverseMatch[1], origin);
    }

    // Default favicon location
    return `${origin}/favicon.ico`;
  }

  /**
   * Resolve a relative URL against an origin.
   */
  private resolveUrl(href: string, origin: string): string {
    if (href.startsWith("http://") || href.startsWith("https://")) return href;
    if (href.startsWith("//")) return `https:${href}`;
    return `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
  }

  /**
   * Escape special regex characters in a string.
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
