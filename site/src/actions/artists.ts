"use server";

import { serverFetch } from "@/lib/apihelper";
import {
  ArtistResponse,
  EditArtist,
  editArtistSchema,
} from "@/lib/definitions";
import { getSession } from "@/lib/session";
import { apiDomain, JSONResult, jsonToResult, resultToJson } from "@/lib/utils";
import { cache } from "react";
import { Err, Ok } from "@scidsgn/std";

export const updateArtist = async (
  artist: EditArtist,
): Promise<JSONResult<boolean, string>> => {
  "use server";

  const validated = editArtistSchema.safeParse(artist);

  if (!validated.success) {
    return resultToJson(Err.of(validated.error.message));
  }

  const validatedArtist = validated.data;

  const sessionRequest = jsonToResult(await getSession());

  if (sessionRequest.isErr) {
    return resultToJson(sessionRequest);
  }

  const session = sessionRequest.get();

  const response = await serverFetch(
    session.raw_token,
    `/artists/${session.jwt.artistId}`,
    {
      method: "POST",
      body: JSON.stringify(validatedArtist),
    },
  );

  if (!response.ok) {
    return resultToJson(Err.of("Could not update artist"));
  }

  return resultToJson(Ok.of(true));
};
export const getArtist = cache(
  async (id: string): Promise<JSONResult<ArtistResponse, string>> => {
    "use server";
    const resp = await fetch(`${apiDomain}/artists/${id}`, {
      cache: "force-cache",
      next: {
        revalidate: 10,
      },
    });

    if (!resp.ok) {
      return resultToJson(Err.of("Artist not found."));
    }

    return resultToJson(Ok.of(await resp.json()));
  },
);
