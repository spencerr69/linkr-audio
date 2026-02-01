"use server";

import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { Release, releaseFormSchema } from "@/lib/definitions";
import { apiDomain } from "@/lib/utils";
import { notFound } from "next/navigation";
import { cache } from "react";

export async function updateRelease(release: Release) {
  "use server";

  const validated = releaseFormSchema.safeParse(release);

  if (!validated.success) {
    return { error: validated.error.message };
  }

  const validatedRelease = validated.data;

  const session = await verifySession();

  if (!session || !session.jwt) {
    return {
      error: "Not logged in.",
    };
  }

  const resp = await serverFetch(
    session.jwt,
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
    return {
      error: "Could not update release.",
    };
  }

  return {
    success: true,
  };
}

export async function createRelease(release: Release) {
  "use server";

  const validated = releaseFormSchema.safeParse(release);

  if (!validated.success) {
    return { error: validated.error.message };
  }

  const validatedRelease = validated.data;

  const session = await verifySession();

  if (!session || !session.jwt) {
    return {
      error: "Not logged in.",
    };
  }

  const resp = await serverFetch(
    session.jwt,
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
    return {
      error: "Could not update release.",
    };
  }

  return {
    success: true,
  };
}

export async function deleteRelease(release: Release) {
  "use server";

  const session = await verifySession();

  if (!session || !session.jwt) {
    return {
      error: "Not logged in.",
    };
  }

  const req = await serverFetch(
    session.jwt,
    `/releases/${release.artist_id}/${release.slug}`,
    {
      method: "DELETE",
    },
  );

  if (!req.ok) {
    return {
      error: "Could not delete release.",
    };
  }

  return { success: true };
}

export const getRelease = cache(
  async (id: string, slug: string): Promise<Release> => {
    "use server";
    const resp = await fetch(`${apiDomain}/releases/${id}/${slug}`, {
      cache: "force-cache",
      next: {
        revalidate: 10,
      },
    });

    if (!resp.ok) {
      notFound();
    }

    const result: Release = await resp.json();

    return result;
  },
);

export const getLatestRelease = cache(async (id: string): Promise<Release> => {
  "use server";

  const resp = await fetch(`${apiDomain}/releases/${id}?limit=1`, {
    cache: "force-cache",
    next: {
      revalidate: 10,
    },
  });

  if (!resp.ok) {
    notFound();
  }

  const result: Release[] = await resp.json();

  const out = result[0];

  if (out) {
    return out;
  }

  notFound();
});

export const getRecentReleases = cache(async (): Promise<Release[]> => {
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
});
