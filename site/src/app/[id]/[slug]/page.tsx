"use server";

import { ReleaseGrid } from "@/app/[id]/[slug]/components/ReleaseGrid";
import { getArtist } from "@/app/actions/artists";
import { getRelease } from "@/app/actions/releases";
import LinkrAudioLogo from "@/app/ui/LinkrAudioLogo";
import StylingProvider from "@/app/ui/StylingProvider";
import cloudflareLoader from "@/lib/imageLoader";
import { baseDomain, rootDomain, stylingComp } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}): Promise<Metadata> {
  const { id, slug } = await params;

  const release = await getRelease(id, slug);

  const iconImage = cloudflareLoader({
    src: release.artwork || "",
    width: 16,
    quality: 30,
  });

  const socialImage = cloudflareLoader({
    src: release.artwork || "",
    width: 500,
    quality: 80,
  });

  return {
    title: `${release.title}`,
    description: `Listen to ${release.title} by ${release.artist_name}.`,
    icons: {
      icon: iconImage,
    },
    alternates: {
      canonical: `https://${id}.${baseDomain}/${slug}`,
    },
    openGraph: {
      title: `${release.title} | ${release.artist_name}`,
      description: `Listen to ${release.title} by ${release.artist_name}.`,
      images: [
        {
          url: socialImage,
          width: 500,
          height: 500,
          alt: `${release.title} by ${release.artist_name}`,
        },
      ],
      siteName: "linkr.audio",
      url: `https://${id}.${baseDomain}/${slug}`,
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
          url: socialImage,
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
          className="fixed  top-0 left-0 w-full h-full content-[''] z-10 pointer-events-none bg-[url('https://www.ui-layouts.com/noise.gif')]"
          style={{ opacity: "6%" }}
        ></div>

        <ReleaseGrid release={release} artist={artist} />
        <div
          className={
            "fixed bottom-1 sm:bottom-4 opacity-25 hover:opacity-50 duration-100 "
          }
        >
          <Link href={`${rootDomain}`}>
            <LinkrAudioLogo
              className={"w-4! h-4! sm:w-8! sm:h-8!  transition-all"}
            />
          </Link>
        </div>
      </main>
    </StylingProvider>
  );
};

export default Page;
