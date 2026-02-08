"use server";

export type ImageUploadURLResponse = {
  result: { uploadURL: string; id: string };
  success: boolean;
  errors?: unknown[];
  messages?: unknown[];
};

export const getImageUploadURL = async (path: string) => {
  "use server";
  const url = `https://linkr.audio/images/upload?key=${path}`;
  console.log(url);

  return url;
};
