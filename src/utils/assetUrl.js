// Utility for resolving static asset URLs correctly in local dev and GitHub Pages base paths

export function getAssetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = import.meta.env.BASE_URL || './';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return `${cleanBase}${cleanUrl}`;
}
