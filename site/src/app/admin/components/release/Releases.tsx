"use client";

import { ReleaseForm } from "@/app/admin/components/release/ReleaseForm";
import { ReleaseListItem } from "@/app/admin/components/release/ReleaseListItem";
import { Button } from "@/app/ui/Button";
import { StylingContext } from "@/app/ui/StylingProvider";
import { ArtistResponse, Release } from "@/lib/definitions";
import { useContext, useState } from "react";
import * as crypto from "crypto";

import AddIcon from "@mui/icons-material/Add";

export type DialogState =
  | null
  | { type: "confirm"; nextSlug: string }
  | { type: "delete" };

type ActiveSlug = null | { type: "new" } | { type: "edit"; slug: string };
export const Releases = ({
  releases,
  artist,
}: {
  releases: Release[];
  artist: ArtistResponse;
}) => {
  const [activeSlug, setActiveSlug] = useState<ActiveSlug>(null);
  const [isDirty, setDirty] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  const releaseMap = new Map(
    releases.map((release) => [
      release.slug!,
      {
        hash: crypto
          .createHash("md5")
          .update(JSON.stringify(release))
          .digest("hex"),
        ...release,
      },
    ]),
  );

  const createReleaseForm = (slug: string | null, force?: boolean) => {
    if (!isDirty || force) {
      setActiveSlug(slug ? { type: "edit", slug } : { type: "new" });
    } else {
      setDialog({ type: "confirm", nextSlug: slug || "" });
    }
  };

  const styling = useContext(StylingContext);

  const releasesList = releases.map((release) => {
    return (
      <ReleaseListItem
        release={release}
        onClick={() => createReleaseForm(release.slug!)}
        key={release.slug}
      />
    );
  });

  return (
    <div
      className={"flex flex-col lg:flex-row min-h-0 h-full overflow-hidden"}
      style={{
        scrollbarColor: `${styling.colours.foreground}22, ${styling.colours.background}`,
      }}
    >
      <div
        className={
          " lg:w-xl border-r border-dashed overflow-x-auto lg:overflow-x-clip lg:overflow-y-auto shrink-0"
        }
        style={{
          borderColor: `${styling.colours.foreground}22`,
          scrollbarColor: `${styling.colours.foreground}22, ${styling.colours.background}`,
        }}
      >
        <ul
          className={"flex lg:flex-col"}
          style={{
            scrollbarColor: `${styling.colours.foreground}22, ${styling.colours.background}`,
          }}
        >
          {releasesList}
          <div className={"flex justify-center m-2"}>
            <Button squish onClick={() => createReleaseForm("")}>
              <AddIcon />
            </Button>
          </div>
        </ul>
      </div>
      <div className={"w-full overflow-y-auto"}>
        {activeSlug !== null && (
          <ReleaseForm
            release={
              activeSlug.type !== "new"
                ? releaseMap.get(activeSlug.slug)
                : undefined
            }
            key={
              activeSlug.type !== "new"
                ? releaseMap.get(activeSlug.slug)?.hash
                : ""
            }
            artist={artist}
            createReleaseForm={createReleaseForm}
            isDirty={isDirty}
            setDirty={setDirty}
            dialog={dialog}
            setDialog={setDialog}
          />
        )}
      </div>
    </div>
  );
};
