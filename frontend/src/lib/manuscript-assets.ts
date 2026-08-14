/**
 * Manuscript-asset registry.
 *
 * Some archive entries have been bundled into the app so they survive without
 * network access and cannot break when an external image host (Wikimedia,
 * museum CDNs, etc.) throttles or moves the file. When the backend document
 * carries a matching `asset_key`, the frontend uses these local `require()`
 * results instead of the remote `image_url`.
 *
 * To bundle another manuscript:
 *   1. Drop the image into /app/frontend/assets/manuscripts/
 *   2. Add an entry below with a stable, lowercase-hyphenated key.
 *   3. On the backend, set `asset_key` on the CURATED_DOCUMENTS entry.
 */
import type { ImageSourcePropType } from 'react-native';

// react-native's require typing accepts any but casting to the ImageSourcePropType
// keeps the call sites clean.
export const MANUSCRIPT_ASSETS: Record<string, ImageSourcePropType> = {
  'jane-austen-cassandra': require('../../assets/manuscripts/jane-austen-cassandra.webp'),
};

/**
 * Return an <Image> source. Prefers a bundled local asset when `assetKey`
 * matches one in the registry; otherwise falls back to the remote URL.
 * Returns `undefined` if neither is available so callers can decide.
 */
export function manuscriptSource(
  assetKey?: string | null,
  imageUrl?: string | null,
): ImageSourcePropType | undefined {
  if (assetKey && MANUSCRIPT_ASSETS[assetKey]) {
    return MANUSCRIPT_ASSETS[assetKey];
  }
  if (imageUrl) {
    return { uri: imageUrl };
  }
  return undefined;
}
