"use server";

/**
 * Basically useless function this should be cleaned up
 * TODO: make it not shit
 * @param {string} path
 * @returns {Promise<string>}
 */
export const getImageUploadURL = async (path: string): Promise<string> => {
  "use server";
  return `https://linkr.audio/images/upload?key=${path}`;
};
