"use server";

import { ReleaseGrid } from "@/app/[id]/[slug]/components/ReleaseGrid";
import { getArtist } from "@/app/actions/artists";
import { getRelease } from "@/app/actions/releases";
import LinkrAudioLogo from "@/app/ui/LinkrAudioLogo";
import StylingProvider from "@/app/ui/StylingProvider";
import { rootDomain, stylingComp } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id, slug } = await params;

  const release = await getRelease(id, slug);

  return {
    title: `${release.title}`,
    description: `Listen to ${release.title} by ${release.artist_name}.`,
    icons: {
      icon: release.artwork || "",
    },
    alternates: {
      canonical: `${rootDomain}/releases/${id}/${slug}`,
    },
    openGraph: {
      title: `${release.title} | ${release.artist_name}`,
      description: `Listen to ${release.title} by ${release.artist_name}.`,
      images: [
        {
          url: release.artwork || "",
          width: 500,
          height: 500,
          alt: `${release.title} by ${release.artist_name}`,
        },
      ],
      siteName: "linkr.audio",
      url: `${rootDomain}/releases/${id}/${slug}`,
      locale: "en-US",
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    twitter: {
      card: "summary_large_image",
      title: `${release.title} | ${release.artist_name}`,
      description: `Listen to ${release.title} by ${release.artist_name}.`,
      images: [
        {
          url: release.artwork || "",
        },
      ],
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

  const styling = stylingComp(artist.styling || {});

  return (
    <StylingProvider styling={styling}>
      <main
        className={
          "min-h-screen flex flex-col justify-center items-center overflow-x-hidden "
        }
      >
        <div
          className="absolute top-0 left-0 w-full h-full content-[''] z-10 pointer-events-none bg-[url('https://www.ui-layouts.com/noise.gif')]"
          style={{ opacity: "6%" }}
        ></div>

        <ReleaseGrid release={release} artist={artist} />
        <div className={"absolute bottom-4 "}>
          <Link href={`${rootDomain}`}>
            <LinkrAudioLogo
              className={"w-8! h-8! opacity-25 hover:opacity-50 duration-100"}
            />
          </Link>
        </div>
      </main>
    </StylingProvider>
  );
};

export default Page;
