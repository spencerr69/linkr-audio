"use server";

import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import {
  ArtistResponse,
  EditArtist,
  editArtistSchema,
} from "@/lib/definitions";
import { apiDomain } from "@/lib/utils";
import { cache } from "react";

export const updateArtist = async (artist: EditArtist) => {
  "use server";

  const validated = editArtistSchema.safeParse(artist);

  if (!validated.success) {
    return { error: validated.error.message };
  }

  const validatedArtist = validated.data;

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
      body: JSON.stringify(validatedArtist),
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
export const getArtist = cache(async (id: string): Promise<ArtistResponse> => {
  "use server";
  const resp = await fetch(`${apiDomain}/artists/${id}`, {
    cache: "force-cache",
    next: {
      revalidate: 10,
    },
  });

  if (!resp.ok) {
    throw new Error("Could not find release");
  }

  return await resp.json();
});
