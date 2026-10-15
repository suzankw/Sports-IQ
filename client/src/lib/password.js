// Temporary passwords the Director of Sport reads out or writes down: no look-alike characters (0/O, 1/l/I).
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function temporaryPassword(length = 12) {
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (n) => ALPHABET[n % ALPHABET.length]).join('');
}
