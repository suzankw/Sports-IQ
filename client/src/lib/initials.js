/** "Otieno Kariuki" → "OK"; used when there's no photo or crest. */
export function initials(name = '', max = 2) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean);
  const picked = words.length > max ? [words[0], words[words.length - 1]] : words;
  return picked.map((w) => w[0].toUpperCase()).join('');
}

const TONES = ['navy', 'red', 'gold', 'neutral'];

/** A stable colour for a name, so the same person always gets the same avatar. */
export function toneOf(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) | 0;
  return TONES[Math.abs(hash) % TONES.length];
}
