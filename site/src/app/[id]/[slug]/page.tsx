"use server";

import { ReleaseGrid } from "@/app/[id]/[slug]/components/release-grid/ReleaseGrid";
import { getArtist } from "@/app/actions/artists";
import { getRelease } from "@/app/actions/releases";
import { Metadata } from "next";
import Image from "next/image";

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
const Page = async ({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) => {
  const { id, slug } = await params;
  const release = await getRelease(id, slug);
  const artist = await getArtist(id);

  return (
    <main className={"min-h-screen flex flex-col justify-center items-center "}>
      <div
        className="absolute top-0 left-0 w-full h-full content-[''] z-10 pointer-events-none bg-[url('https://www.ui-layouts.com/noise.gif')]"
        style={{ opacity: "6%" }}
      ></div>
      <Image
        src={release.artwork || ""}
        alt={release.title}
        height={500}
        width={500}
        draggable={false}
        className={"blur-3xl w-full aspect-square fixed -z-10 "}
        style={{ transform: "scale(1.25)" }}
      />
      <ReleaseGrid release={release} artist={artist} />
    </main>
  );
};

export default Page;
