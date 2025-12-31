import { ExternalButton } from "@/app/ui/Button";
import { Release } from "@/lib/apihelper";
import { baseDomain } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export const ReleaseListItem = ({
  release,
  onClick,
  active = false,
}: {
  release: Release;
  onClick: (release: Release) => void;
  active?: boolean;
}) => {
  return (
    <div
      className={
        "p-4 flex items-center justify-between border-b cursor-pointer duration-100 border-dashed border-gray-300" +
        " hover:bg-gray-300 " +
        (active ? "bg-gray-200" : "")
      }
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
