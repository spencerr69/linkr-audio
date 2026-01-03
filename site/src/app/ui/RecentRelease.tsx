"use client";

import { ReleaseArtwork } from "@/app/ui/ReleaseArtwork";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Release } from "@/lib/definitions";
import { baseDomain } from "@/lib/utils";
import Link from "next/link";
import { useContext } from "react";

export function RecentRelease(props: { release: Release }) {
  const styling = useContext(StylingContext);

  return (
    <div
      className={"w-full  pb-8 transition duration-300 ease-in-out rounded-lg "}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${styling.colours.foreground}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Link
        href={`//${props.release.artist_id}.${baseDomain}/${props.release.slug}`}
      >
        <ReleaseArtwork
          small
          artwork={props.release.artwork}
          title={props.release.title}
        />
        <h3 className={"font-bold text-xl"}>{props.release.title}</h3>
        <h4 className={"italic"} style={{ lineHeight: "0.8em" }}>
          {props.release.artist_name}
        </h4>
      </Link>
    </div>
  );
}
