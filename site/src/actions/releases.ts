"use server";

import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { Release, releaseFormSchema } from "@/lib/definitions";
import { apiDomain, JSONResult, jsonToResult, resultToJson } from "@/lib/utils";
import { Err, Ok, Result } from "@scidsgn/std";
import { notFound } from "next/navigation";
import { cache } from "react";

/**
 * Use Zod to validate release using `releaseFormSchema`
 * @param {Release} release
 * @returns {Result<Release, string>}
 */
const validateReleaseForm = async (
  release: Release,
): Promise<Result<Release, string>> => {
  "use server";

  const validated = releaseFormSchema.safeParse(release);
  if (!validated.success) {
    return Err.of(validated.error.message);
  }
  return Ok.of(validated.data);
};

/**
 * Update an existing release.\n
 * Actually returns Result<boolean, string> but fuckass nextjs needs to stringify it
 * @param {Release} release
 * @returns {Promise<JSONResult<boolean, string>>}
 */
export const updateRelease = async (
  release: Release,
): Promise<JSONResult<boolean, string>> => {
  "use server";

  const validated = await validateReleaseForm(release);
  if (validated.isErr) {
    return resultToJson(validated);
  }
  const validatedRelease = validated.get();

  const sessionRequest = jsonToResult(await verifySession());

  if (sessionRequest.isErr) {
    return resultToJson(Err.of("Not logged in."));
  }

  const session = sessionRequest.get();

  const resp = await serverFetch(
    session.raw_token,
    `/releases/${session.jwt.artistId}/${release.slug}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedRelease),
    },
  );

  if (!resp.ok) {
    return resultToJson(Err.of("Could not update release."));
  }

  return resultToJson(Ok.of(true));
};

/**
 * Create new release for the currently logged in artist.\n
 * Actually returns Result<boolean, string>
 * @param {Release} release
 * @returns {Promise<JSONResult<boolean, string>>}
 */
export async function createRelease(
  release: Release,
): Promise<JSONResult<boolean, string>> {
  "use server";

  const validated = await validateReleaseForm(release);
  if (validated.isErr) {
    return resultToJson(validated);
  }
  const validatedRelease = validated.get();

  const sessionRequest = jsonToResult(await verifySession());

  if (sessionRequest.isErr) {
    return resultToJson(Err.of("Not logged in."));
  }

  const session = sessionRequest.get();

  const resp = await serverFetch(
    session.raw_token,
    `/releases/${session.jwt.artistId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedRelease),
    },
  );

  if (!resp.ok) {
    return resultToJson(Err.of("Could not update release."));
  }

  return resultToJson(Ok.of(true));
}

/**
 * Delete the provided release for the currently logged in artist.
 * @param {string} slug
 * @returns {Promise<JSONResult<boolean, string>>}
 */
export async function deleteRelease(
  slug: string,
): Promise<JSONResult<boolean, string>> {
  "use server";

  const sessionRequest = jsonToResult(await verifySession());

  if (sessionRequest.isErr) {
    return resultToJson(sessionRequest);
  }

  const session = sessionRequest.get();

  const req = await serverFetch(
    session.raw_token,
    `/releases/${session.jwt.artistId}/${slug}`,
    {
      method: "DELETE",
    },
  );

  if (!req.ok) {
    return resultToJson(Err.of(`Could not delete release. ${req.body}`));
  }

  return resultToJson(Ok.of(true));
}

/**
 * Get a release for the given artist and slug. If release is not found, will redirect to 404.
 * @type {(id: string, slug: string) => Promise<Release>}
 */
export const getRelease: (id: string, slug: string) => Promise<Release> = cache(
  async (id: string, slug: string): Promise<Release> => {
    "use server";
    const resp = await fetch(`${apiDomain}/releases/${id}/${slug}`, {
      cache: "force-cache",
      next: {
        revalidate: 60,
      },
    });

    if (!resp.ok) {
      notFound();
    }

    return await resp.json();
  },
);

/**
 * Get recent releases from all artists. Cached 600 seconds.
 * @type {() => Promise<Release[]>}
 */
export const getRecentReleases: () => Promise<Release[]> = cache(
  async (): Promise<Release[]> => {
    "use server";

    const resp = await fetch(`${apiDomain}/releases/recent?limit=9`, {
      cache: "force-cache",
      next: {
        revalidate: 600,
      },
    });

    if (!resp.ok) {
      return [];
    }

    return await resp.json();
  },
);

/**
 * Get releases for the current artist.
 * @param {string} id
 * @returns {Promise<JSONResult<Release[], string>>}
 */
export const getReleasesForArtist = async (
  id: string,
): Promise<JSONResult<Release[], string>> => {
  "use server";

  const sessionRequest = jsonToResult(await verifySession());

  if (sessionRequest.isErr) {
    return resultToJson(Err.of("Could not verify session."));
  }

  const session = sessionRequest.get();

  const releasesReq = await serverFetch(
    session.raw_token,
    `/releases/${id}?showActive=false`,
    {},
  );

  if (!releasesReq.ok) {
    return resultToJson(
      Err.of(`${releasesReq.status} ${releasesReq.statusText}`),
    );
  }

  const releases: Release[] = await releasesReq.json();

  return resultToJson(Ok.of(releases));
};
