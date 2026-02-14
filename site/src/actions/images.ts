"use server";

export const getImageUploadURL = async (path: string) => {
  "use server";
  const url = `https://linkr.audio/images/upload?key=${path}`;

  return url;
};
