"use server";

import { Release, serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";

export async function updateRelease(release: Release) {
  "use server";

  const session = await verifySession();

  if (!session) {
    return {
      error: "Not logged in.",
    };
  }

  const resp = await serverFetch(
    session.token || "",
    `/releases/${session.artistId}/${release.slug}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(release),
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

  const session = await verifySession();

  if (!session) {
    return {
      error: "Not logged in.",
    };
  }

  const resp = await serverFetch(
    session.token || "",
    `/releases/${session.artistId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(release),
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
