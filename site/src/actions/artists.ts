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
import { Err, Ok, Result } from "@scidsgn/std";

export const updateArtist = async (
  artist: EditArtist,
): Promise<Result<boolean, string>> => {
  "use server";

  const validated = editArtistSchema.safeParse(artist);

  if (!validated.success) {
    return Err.of(validated.error.message);
  }

  const validatedArtist = validated.data;

  const session = await verifySession();

  if (!session.isAuth || !session.jwt || !session.raw_token) {
    return Err.of("Could not authenticate user");
  }

  const response = await serverFetch(
    session.raw_token,
    `/artists/${session.jwt.artistId}`,
    {
      method: "POST",
      body: JSON.stringify(validatedArtist),
    },
  );

  if (!response.ok) {
    return Err.of("Could not update artist");
  }

  return Ok.of(true);
};
export const getArtist = cache(
  async (id: string): Promise<Result<ArtistResponse, string>> => {
    "use server";
    const resp = await fetch(`${apiDomain}/artists/${id}`, {
      cache: "force-cache",
      next: {
        revalidate: 10,
      },
    });

    if (!resp.ok) {
      return Err.of("Artist not found.");
    }

    return Ok.of(await resp.json());
  },
);
