"use server";

import { EditArtist, serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";

export const updateArtist = async (artist: EditArtist) => {
  const session = await verifySession();

  if (!session.isAuth || !session.jwt) {
    return {
      error: "Could not authenticate user",
    };
  }

  const response = await serverFetch(
    session.jwt,
    `/artists/${session.jwt.artistId}`,
    {
      method: "POST",
      body: JSON.stringify(artist),
    },
  );

  if (!response.ok) {
    return {
      error: "Could not update artist",
    };
  }

  return {
    success: true,
  };
};
