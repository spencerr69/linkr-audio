"use server";

import Image from "next/image";
import { Metadata } from "next";
import { apiDomain } from "@/lib/utils";
import { cache } from "react";
import { Release } from "@/lib/apihelper";
import { ExternalButton } from "@/app/ui/button";

const BASE_API_URL = apiDomain;

const getRelease = cache(async (id: string, slug: string): Promise<Release> => {
  const resp = await fetch(`${BASE_API_URL}/releases/${id}/${slug}`, {
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

const Page = async ({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) => {
  const { id, slug } = await params;

  const release = await getRelease(id, slug);

  const links = release.links.map((link) => {
    return (
      <div key={link.name} className={"w-full text-center p-4"}>
        <ExternalButton href={link.url}>{link.name}</ExternalButton>
      </div>
    );
  });

  return (
    <main
      className={
        "p-8 flex font-sans flex-col items-center w-screen h-screen bg-gray-100"
      }
    >
      <Image
        src={release.artwork || ""}
        alt={release.title}
        width={500}
        height={500}
      />
      <div
        className={
          "font-sans text-center text-2xl text-black bg-white p-8 m-4 w-3/4"
        }
      >
        <h1 className={"font-bold"}>{release.title}</h1>
        <h3 className={"font-normal italic text-xl"}>{release.artist_name}</h3>
      </div>
      <div className={"flex flex-col w-3/4"}>{links}</div>
    </main>
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
    icons: {
      icon: release.artwork || "",
    },
  };
}
