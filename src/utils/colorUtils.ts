export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export const CUSTOMIZABLE_VARIABLES = [
  "--accent-primary",
  "--accent-hover",
  "--accent-light",
  "--accent-gradient",
  "--accent-gradient-hover",
  "--bg-primary",
  "--bg-secondary",
  "--bg-surface",
  "--bg-elevated",
  "--bg-glass",
  "--text-primary",
  "--text-secondary",
];

// Parse hex to RGB
export function hexToRgb(hex: string): RGB | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Convert RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB to HSV
export function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

// Convert HSV to RGB
export function hsvToRgb(h: number, s: number, v: number): RGB {
  h /= 360;
  s /= 100;
  v /= 100;
  let r = 0,
    g = 0,
    b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// Helper: Hex directly to HSV
export function hexToHsv(hex: string): HSV {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, v: 0 };
  return rgbToHsv(rgb.r, rgb.g, rgb.b);
}

// Helper: HSV directly to Hex
export function hsvToHex(h: number, s: number, v: number): string {
  const rgb = hsvToRgb(h, s, v);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Adjust lightness of a hex color
export function adjustColorLightness(hex: string, amount: number): string {
  // Amount is a percentage change: e.g. -10 for 10% darker, +10 for 10% lighter
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  let { r, g, b } = rgb;
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Adjust lightness
  l = Math.max(0, Math.min(1, l + amount / 100));

  // Convert HSL back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let rOut, gOut, bOut;
  if (s === 0) {
    rOut = gOut = bOut = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    rOut = hue2rgb(p, q, h + 1 / 3);
    gOut = hue2rgb(p, q, h);
    bOut = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) => {
    const hexVal = Math.round(c * 255).toString(16);
    return hexVal.length === 1 ? "0" + hexVal : hexVal;
  };
  return `#${toHex(rOut)}${toHex(gOut)}${toHex(bOut)}`;
}

// Save customization config to localStorage
export function saveCustomizations(theme: "light" | "dark", customizations: Record<string, string>) {
  const allConfigsJson = localStorage.getItem("themeCustomizations");
  const allConfigs = allConfigsJson ? JSON.parse(allConfigsJson) : {};
  allConfigs[theme] = customizations;
  localStorage.setItem("themeCustomizations", JSON.stringify(allConfigs));
}

// Load customization config from localStorage
export function loadCustomizations(theme: "light" | "dark"): Record<string, string> {
  const allConfigsJson = localStorage.getItem("themeCustomizations");
  if (!allConfigsJson) return {};
  const allConfigs = JSON.parse(allConfigsJson);
  return allConfigs[theme] || {};
}

// Clear customizations for a theme
export function clearCustomizations(theme: "light" | "dark") {
  const allConfigsJson = localStorage.getItem("themeCustomizations");
  if (!allConfigsJson) return;
  const allConfigs = JSON.parse(allConfigsJson);
  delete allConfigs[theme];
  localStorage.setItem("themeCustomizations", JSON.stringify(allConfigs));
}

// Apply theme custom variables to document
export function applyThemeCustomizations(theme: "light" | "dark") {
  // Clear any existing custom properties
  CUSTOMIZABLE_VARIABLES.forEach((v) => document.documentElement.style.removeProperty(v));

  const customizations = loadCustomizations(theme);

  for (const [variable, value] of Object.entries(customizations)) {
    if (!value) continue;

    document.documentElement.style.setProperty(variable, value);

    // Dependent properties for accent/primary colors
    if (variable === "--accent-primary") {
      const hoverColor = adjustColorLightness(value, theme === "light" ? -8 : 8);
      const evenDarker = adjustColorLightness(value, theme === "light" ? -15 : -5);
      const rgb = hexToRgb(value);

      document.documentElement.style.setProperty("--accent-hover", hoverColor);

      if (rgb) {
        document.documentElement.style.setProperty("--accent-light", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`);
        document.documentElement.style.setProperty("--bg-glass-hover", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
      }

      document.documentElement.style.setProperty("--accent-gradient", `linear-gradient(135deg, ${value}, ${hoverColor})`);
      document.documentElement.style.setProperty("--accent-gradient-hover", `linear-gradient(135deg, ${hoverColor}, ${evenDarker})`);
    }

    // Dependent properties for background secondary
    if (variable === "--bg-secondary") {
      // Set surface as the same
      document.documentElement.style.setProperty("--bg-surface", value);

      // Elevated background is slightly lighter in dark mode, slightly darker in light mode
      const elevatedColor = adjustColorLightness(value, theme === "light" ? -4 : 6);
      document.documentElement.style.setProperty("--bg-elevated", elevatedColor);

      // Glass background
      const rgb = hexToRgb(value);
      if (rgb) {
        const opacity = theme === "light" ? 0.75 : 0.4;
        document.documentElement.style.setProperty("--bg-glass", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
      }
    }
  }
}
