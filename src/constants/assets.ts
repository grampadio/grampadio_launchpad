export const DEFAULT_PROJECT_LOGO = '/logo.webp?v=1';
export const DEFAULT_PROJECT_BANNER = '/default-project-banner.svg';

const LEGACY_PLACEHOLDER_ASSETS = [
  'https://images.unsplash.com/photo-1621761191319-c6fb62004040',
  'https://images.unsplash.com/photo-1640826514546-63d12d6a59b6',
];

export const projectAssetOrDefault = (
  value: string | null | undefined,
  fallback: string,
) => {
  const asset = value?.trim();
  if (!asset || LEGACY_PLACEHOLDER_ASSETS.some(placeholder => asset.startsWith(placeholder))) {
    return fallback;
  }
  return asset;
};
