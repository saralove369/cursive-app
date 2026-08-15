/**
 * Manuscript-asset registry.
 *
 * All archive manuscripts are bundled locally so the Codexia archive works
 * offline and cannot break when an external image host (Wikimedia, museum
 * CDNs, etc.) throttles or moves the file.
 *
 * To bundle another manuscript:
 *   1. Drop the image into /app/frontend/assets/manuscripts/
 *   2. Add an entry below with a stable, lowercase-hyphenated key.
 *   3. On the backend, set `asset_key` on the CURATED_DOCUMENTS entry.
 */
import type { ImageSourcePropType } from 'react-native';

export const MANUSCRIPT_ASSETS: Record<string, ImageSourcePropType> = {
  'jane-austen-cassandra': require('../../assets/manuscripts/jane-austen-cassandra.webp'),
  'dickinson-wild-nights': require('../../assets/manuscripts/dickinson-wild-nights.jpg'),
  'van-gogh-bernard': require('../../assets/manuscripts/van-gogh-bernard.webp'),
  'louis-noisette': require('../../assets/manuscripts/louis-noisette.webp'),
  'receipt-book': require('../../assets/manuscripts/receipt-book.webp'),
  'frederick-douglass': require('../../assets/manuscripts/frederick-douglass.webp'),
  'susan-b-anthony-1': require('../../assets/manuscripts/susan-b-anthony-1.webp'),
  'susan-b-anthony-2': require('../../assets/manuscripts/susan-b-anthony-2.webp'),
  'eadweard-muybridge': require('../../assets/manuscripts/eadweard-muybridge.webp'),
  'deborah-haddock': require('../../assets/manuscripts/deborah-haddock.jpg'),
  'bridget-hyde': require('../../assets/manuscripts/bridget-hyde.jpg'),
  'vmail-francis-envelope': require('../../assets/manuscripts/vmail-francis-envelope.webp'),
  'vmail-francis-letter': require('../../assets/manuscripts/vmail-francis-letter.webp'),
  'vmail-lucille-reply': require('../../assets/manuscripts/vmail-lucille-reply.webp'),
  'joseph-delaplaine': require('../../assets/manuscripts/joseph-delaplaine.webp'),
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
