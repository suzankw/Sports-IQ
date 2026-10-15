/** "First XI" → "first-xi", "2027/2028" → "2027-2028" (the API's Slug pattern). */
export const slugify = (text) =>
  text
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
