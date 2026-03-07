type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${K}.${NestedKeyOf<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

type Dictionary = Record<string, unknown>;

let currentDictionary: Dictionary = {};
let currentLocale = "en";

export async function loadDictionary(locale: string): Promise<Dictionary> {
  try {
    const dict = await import(`../dictionaries/${locale}.json`, {
      with: { type: "json" },
    });
    currentDictionary = dict.default ?? dict;
    currentLocale = locale;
    return currentDictionary;
  } catch {
    // Fallback to English
    const dict = await import("../dictionaries/en.json", {
      with: { type: "json" },
    });
    currentDictionary = dict.default ?? dict;
    currentLocale = "en";
    return currentDictionary;
  }
}

export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const keys = key.split(".");
  let value: unknown = currentDictionary;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key as fallback
    }
  }

  if (typeof value !== "string") return key;

  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey: string) =>
      String(params[paramKey] ?? `{${paramKey}}`),
    );
  }

  return value;
}

export function getLocale(): string {
  return currentLocale;
}

export function getDictionary(): Dictionary {
  return currentDictionary;
}

export const SUPPORTED_LOCALES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Espa\u00f1ol" },
  { code: "fr", name: "French", nativeName: "Fran\u00e7ais" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "ja", name: "Japanese", nativeName: "\u65e5\u672c\u8a9e" },
  { code: "pt-BR", name: "Portuguese (Brazil)", nativeName: "Portugu\u00eas" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["code"];
