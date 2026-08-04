const LIGHT_TEXT = "#FFFFFF";
const DARK_TEXT = "#0B1220";

const normalizeHex = (value) => {
  if (typeof value !== "string") return null;
  const hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return hex.split("").map((part) => part + part).join("");
  }
  return /^[0-9a-f]{6}$/i.test(hex) ? hex : null;
};

const relativeLuminance = (value) => {
  const hex = normalizeHex(value);
  if (!hex) return null;
  const channels = hex.match(/.{2}/g).map((part) => Number.parseInt(part, 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
};

export const getContrastRatio = (foreground, background) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  if (foregroundLuminance === null || backgroundLuminance === null) return 1;
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

export const getContrastingTextColor = (background) => {
  const lightContrast = getContrastRatio(LIGHT_TEXT, background);
  const darkContrast = getContrastRatio(DARK_TEXT, background);
  return darkContrast > lightContrast ? DARK_TEXT : LIGHT_TEXT;
};

