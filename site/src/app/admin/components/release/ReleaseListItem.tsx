import { ExternalButton } from "@/app/ui/Button";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Release } from "@/lib/apihelper";
import { baseDomain } from "@/lib/utils";
import Image from "next/image";
import React, { useContext } from "react";

export const ReleaseListItem = ({
  release,
  onClick,
  active = false,
}: {
  release: Release;
  onClick: (release: Release) => void;
  active?: boolean;
}) => {
  const styling = useContext(StylingContext);

  return (
    <div
      className={
        "p-4 flex items-center justify-between border-b cursor-pointer duration-100 border-dashed "
      }
      style={{
        borderColor: `${styling.colours.foreground}22`,
        backgroundColor: active
          ? styling.colours.foreground + "22"
          : "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          styling.colours.foreground + "33";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? styling.colours.foreground + "22"
          : "transparent";
      }}
      onClick={() => onClick(release)}
    >
      <div>
        <div className={"pb-4"}>
          <h2 className={" font-medium text-2xl"}>{release.title}</h2>
          <h4 className={"text-xl italic"}>{release.artist_name}</h4>
          <p>{release.release_date}</p>
          <p>{release.links.length + " links"}</p>
        </div>
        <ExternalButton
          href={
            "//" + release.artist_id + "." + baseDomain + "/" + release.slug
          }
          onClick={(e) => e.stopPropagation()}
        >
          View
        </ExternalButton>
      </div>
      <div className={"flex items-center"}>
        <Image
          src={release.artwork || ""}
          alt={release.title + " Artwork"}
          width={100}
          height={100}
        />
        <p className={"p-4"}>{">"}</p>
      </div>
    </div>
  );
};
