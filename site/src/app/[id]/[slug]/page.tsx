"use server";

import { getArtist } from "@/app/actions/artists";
import { getRelease } from "@/app/actions/releases";
import { ExternalButton } from "@/app/ui/button";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const Page = async ({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) => {
  const { id, slug } = await params;
  const release = await getRelease(id, slug);
  const artist = await getArtist(id);

  const links = release.links.map((link) => {
    return (
      <div key={link.name} className={"w-7/8 flex flex-col text-center p-4"}>
        <ExternalButton href={link.url}>{link.name}</ExternalButton>
      </div>
    );
  });

  const artistLinks = artist.links.map((link) => {
    return (
      <Link
        key={link.name}
        href={link.url}
        className={"hover:text-rose-500 w-fit text-right"}
      >
        {link.name}
      </Link>
    );
  });

  return (
    <main className={"h-screen flex flex-col justify-center items-center"}>
      <Image
        src={release.artwork || ""}
        alt={release.title}
        height={500}
        width={500}
        draggable={false}
        className={"blur-3xl w-full aspect-square fixed -z-10"}
        style={{ transform: "scale(1.25)" }}
      />
      <div
        className={
          "releasegrid bg-gray-50 w-4xl grid grid-cols-2 font-sans rounded-2xl shadow-xl"
        }
      >
        <div
          className={
            "titles align-middle flex flex-col justify-center border-b-2 border-gray-300 border-dashed text-center p-4"
          }
          style={{ lineHeight: "0.5rem" }}
        >
          <h1 className={"text-lg font-bold"}>{release.title}</h1>
          <h3 className={"italic"}>{release.artist_name}</h3>
        </div>
        <div
          className={
            "overflow-hidden border-l-2 border-b-2 border-dashed border-gray-300"
          }
        >
          {repeatDiv(release.artist_id, 8)}
        </div>
        <div
          className={
            "border-b-2 border-dashed border-gray-300 flex flex-col justify-center items-center"
          }
        >
          {links}
        </div>
        <div
          className={
            "border-b-2 flex items-center justify-center p-8 border-l-2 border-dashed border-gray-300"
          }
        >
          <Image
            src={release.artwork || ""}
            alt={`${release.title} artwork`}
            height={500}
            width={500}
            className={"rounded-md"}
          />
        </div>
        <div className={"p-4 flex w-full font-mono text-xs"}>
          <div
            style={{ lineHeight: "0.9rem" }}
            className={"text-black opacity-50"}
          >
            <p>
              {release.release_date}
              <br />
              {release.track_count} track{release.track_count > 1 ? "s" : ""}
              <br />
              {release.upc}
            </p>
          </div>
          <div
            style={{ lineHeight: "0.9rem" }}
            className={"flex flex-col w-full text-right items-end text-black "}
          >
            <p>Find {artist.master_artist_name}</p>
            {artistLinks}
          </div>
        </div>
        <div
          className={"overflow-hidden border-l-2 border-dashed border-gray-300"}
        >
          {repeatDiv(release.slug, 8)}
        </div>
      </div>
    </main>
  );
};

const repeatDiv = (text: string, rows: number) => {
  const out = [];
  for (let i = 0; i < rows; i += 1) {
    out.push(<p key={i}>{text.repeat(100).slice(i)}</p>);
  }

  return (
    <div
      className={"font-mono text-black opacity-25  "}
      style={{
        fontSize: "0.6rem",
        textOverflow: "clip",
        textWrap: "nowrap",
      }}
    >
      {out}
    </div>
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
