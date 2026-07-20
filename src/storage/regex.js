/**
 * Escapes regular expression special characters in a string.
 * @param {string} string
 * @returns {string}
 */
export default function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
