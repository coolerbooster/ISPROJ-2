/**
 * Shortens a given ID to the last 5 characters, prefixed with "...".
 * Returns an empty string if the ID is null, undefined, or not a string.
 * @param {string | null | undefined} id The ID to shorten.
 * @returns {string} The shortened ID or an empty string.
 */
export const shortenId = (id) => {
  if (typeof id !== 'string' || id.length <= 5) {
    return id || '';
  }
  return `${id.slice(-5)}`;
};