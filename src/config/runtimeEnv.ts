declare global {
  interface Window {
    __GRAMPAD_ENV__?: Record<string, string>;
  }
}

export const runtimeEnv = (key: string, fallback = '') => {
  const runtimeValue = typeof window !== 'undefined'
    ? window.__GRAMPAD_ENV__?.[key]
    : undefined;
  const buildValue = (import.meta as any).env?.[key];
  return String(runtimeValue || buildValue || fallback);
};

export const runtimeEnvNumber = (key: string, fallback: number) => {
  const value = Number(runtimeEnv(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
};

