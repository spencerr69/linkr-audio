"use server";

export type ImageUploadURLResponse = {
  result: { uploadURL: string; id: string };
  success: boolean;
  errors?: unknown[];
  messages?: unknown[];
};

export const getImageUploadURL = async (path: string) => {
  const accountId = process.env.CLOUDFLARE_ID;
  const token = process.env.CLOUDFLARE_TOKEN;

  const formData = new FormData();

  formData.append("id", path);

  const url = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  console.log(url);
  if (!url.ok) {
    console.error(url);
  }

  const result: ImageUploadURLResponse = await url.json();

  return result.result.uploadURL;
};
