"use server";

import Image from "next/image";
import { Metadata } from "next";
import { apiDomain } from "@/lib/utils";
import { cache } from "react";
import { Release } from "@/lib/apihelper";

const BASE_API_URL = apiDomain;

const getRelease = cache(async (id: string, slug: string): Promise<Release> => {
  const resp = await fetch(`${BASE_API_URL}/releases/${id}/${slug}`);

  if (!resp.ok) {
    throw new Error("Could not find release");
  }

  return await resp.json();
});

const Page = async ({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) => {
  const { id, slug } = await params;

  const release = await getRelease(id, slug);

  return (
    <>
      <h1>{release.title}</h1>
      <h3>{release.artist_name}</h3>
      <Image
        src={release.artwork || ""}
        alt={release.title}
        width={750}
        height={750}
      />
      {/*//TODO: Add release links*/}
    </>
  );
};

export default Page;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id, slug } = await params;

  const release = await getRelease(id, slug);

  return {
    title: release.title,
    description: release.artist_name,
  };
}
