/**
 * Utility functions for working with logged-in user data
 */

/**
 * Validate if user data is complete
 */
export const isValidUserData = (cid: number | null, fid: string | null): boolean => {
  return cid !== null && fid !== null && cid > 0 && fid.trim().length > 0;
};