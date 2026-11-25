export const CONSENT_KEY = "turbomastin:privacy:v1";
export const CONSENT_VERSION = 1;
export interface ConsentChoice {
  version: number;
  maps: boolean;
  updatedAt: number;
  expiresAt: number;
}
export function createChoice(maps: boolean, now = Date.now()): ConsentChoice {
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + 6);
  return {
    version: CONSENT_VERSION,
    maps,
    updatedAt: now,
    expiresAt: expiry.getTime(),
  };
}
export function parseChoice(
  raw: string | null,
  now = Date.now(),
): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    if (
      value.version !== CONSENT_VERSION ||
      typeof value.maps !== "boolean" ||
      !Number.isFinite(value.updatedAt) ||
      !Number.isFinite(value.expiresAt) ||
      value.updatedAt > now ||
      value.updatedAt < 0 ||
      value.expiresAt <= now ||
      value.expiresAt > createChoice(false, value.updatedAt).expiresAt
    )
      return null;
    return {
      version: value.version,
      maps: value.maps,
      updatedAt: value.updatedAt,
      expiresAt: value.expiresAt,
    };
  } catch {
    return null;
  }
}
