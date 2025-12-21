"use client";

import { Release } from "@/lib/apihelper";
import { baseDomain } from "@/lib/utils";
import Image from "next/image";
import { ExternalButton } from "@/app/ui/button";
import React from "react";
import { ReleaseForm } from "@/app/admin/components/release-form";

export const Releases = ({ releases }: { releases: Release[] }) => {
  const [editingRelease, setEditingRelease] = React.useState<Release | null>();

  const createReleaseForm = (release?: Release) => {
    //TODO: Add confirmation if editingRelease already exists
    setEditingRelease(release || null);
  };

  const releasesList = releases.map((release, i) => {
    return (
      <ReleaseListItem onClick={createReleaseForm} release={release} key={i} />
    );
  });

  return (
    <div className={"flex h-full"}>
      <div className={" h-full w-4xl border-r border-gray-300 border-dashed"}>
        <ul>{releasesList}</ul>
      </div>
      <div className={"w-full"}>
        {editingRelease && <ReleaseForm release={editingRelease} />}
      </div>
    </div>
  );
};

const ReleaseListItem = ({
  release,
  onClick,
}: {
  release: Release;
  onClick: (release: Release) => void;
}) => {
  return (
    <div
      className={
        "p-4 flex items-center justify-between border-b border-dashed border-gray-300 hover:bg-gray-200"
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
