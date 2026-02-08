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

export const uploadImage = async (uploadUrl: string, image: File) => {
  "use server";
  console.log(uploadUrl);

  const data = new FormData();

  data.append("imageFile", image);

  const req = await fetch(uploadUrl, {
    method: "POST",
    body: data,
  });

  if (!req.ok) {
    return {
      success: false,
      error: "Could not upload image.",
    };
  }

  const body = await req.text();

  console.log(`Uploaded! ${body}`);

  return {
    success: true,
    key: body.split("?"),
  };
};
