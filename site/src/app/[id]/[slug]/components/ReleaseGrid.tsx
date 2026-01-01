"use client";

import { ArtistLinks } from "@/app/[id]/[slug]/components/ArtistLinks";
import { ReleaseArtwork } from "@/app/ui/ReleaseArtwork";
import { ReleaseHeader } from "@/app/[id]/[slug]/components/ReleaseHeader";
import { ReleaseInfo } from "@/app/[id]/[slug]/components/ReleaseInfo";
import { ReleaseLinks } from "@/app/[id]/[slug]/components/ReleaseLinks";
import { ScrollingBackground } from "@/app/[id]/[slug]/components/ScrollingBackground";
import { StylingContext } from "@/app/ui/StylingProvider";
import { ArtistResponse, Release } from "@/lib/definitions";
import Image from "next/image";
import { useContext } from "react";
import { useMediaQuery } from "react-responsive";

export const ReleaseGrid = (props: {
  release: Release;
  artist: ArtistResponse;
}) => {
  const isMobileLayout = useMediaQuery({
    query: "(max-width: 923px)",
  });

  const styling = useContext(StylingContext);

  return !isMobileLayout ? (
    <>
      <Image
        src={props.release.artwork || ""}
        alt={props.release.title}
        height={500}
        width={500}
        draggable={false}
        className={"blur-3xl w-full aspect-square fixed -z-10 "}
        style={{ transform: "scale(1.35)" }}
      />
      <div
        className={
          "m-16 releasegrid  w-4xl grid grid-cols-2 font-sans rounded-2xl shadow-2xl drop-shadow-2xl z-20 "
        }
        style={{
          backgroundColor: styling.colours.background,
        }}
      >
        <ReleaseHeader
          title={props.release.title}
          artistName={props.release.artist_name}
        />
        <div
          className={
            " overflow-hidden border-l-2 border-b-2 border-dashed  select-none"
          }
          style={{
            borderColor: `${styling.colours.foreground}22`,
          }}
        >
          <ScrollingBackground text={props.release.artist_id || ""} />
        </div>
        <ReleaseLinks links={props.release.links} />
        <ReleaseArtwork
          artwork={props.release.artwork}
          title={props.release.title}
        />
        <div className={"p-4 flex w-full font-mono text-xs h-28"}>
          <ReleaseInfo
            releaseDate={props.release.release_date}
            trackCount={props.release.track_count}
            upc={props.release.upc}
          />
          <ArtistLinks
            artistName={props.artist.master_artist_name}
            links={props.artist.links}
          />
        </div>
        <div
          className={"overflow-hidden border-l-2 border-dashed select-none"}
          style={{
            borderColor: `${styling.colours.foreground}22`,
          }}
        >
          <ScrollingBackground text={props.release.slug || ""} />
        </div>
      </div>
    </>
  ) : (
    <>
      <Image
        src={props.release.artwork || ""}
        alt={props.release.title}
        height={500}
        width={500}
        draggable={false}
        className={
          "blur-3xl w-full aspect-square fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 "
        }
        style={{ transform: "scale(3)" }}
      />
      <div
        className={
          "mx-4 my-8 releasegridmob  max-w-2xl grid grid-cols-1 font-sans rounded-2xl shadow-xl z-20 "
        }
        style={{
          backgroundColor: styling.colours.background,
        }}
      >
        <ReleaseHeader
          title={props.release.title}
          artistName={props.release.artist_name}
        />
        <div className={"grid w-full mob-cont overflow-hidden min-w-0"}>
          <div
            className={
              "w-full z-10 flex items-center justify-center mob-art overflow-hidden min-w-0"
            }
          >
            <Image
              src={props.release.artwork || ""}
              alt={`${props.release.title} artwork`}
              height={500}
              width={500}
              className={
                "aspect-square rounded-md w-full max-w-[80%] h-auto object-cover"
              }
              draggable={false}
            />
          </div>
          <div className={"flex w-full mob-flavour overflow-hidden min-w-0"}>
            <div className={"overflow-hidden flex-1"}>
              <ScrollingBackground
                text={props.release.artist_id || ""}
                rows={40}
                speed={0.5}
              />
            </div>
            <div className={"overflow-hidden flex-1"}>
              <ScrollingBackground
                text={props.release.slug || ""}
                rows={40}
                speed={0.5}
              />
            </div>
          </div>
        </div>
        <div className={"max-h-90 "}>
          <ReleaseLinks links={props.release.links} />
        </div>
        <div className={"p-4 flex w-full font-mono text-xs"}>
          <ReleaseInfo
            releaseDate={props.release.release_date}
            trackCount={props.release.track_count}
            upc={props.release.upc}
          />
          <ArtistLinks
            artistName={props.release.artist_name}
            links={props.artist.links}
          />
        </div>
      </div>
    </>
  );
};
