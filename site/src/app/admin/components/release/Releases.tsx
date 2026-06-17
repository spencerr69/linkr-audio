"use client";

import { ReleaseForm } from "@/app/admin/components/release/ReleaseForm";
import { ReleaseListItem } from "@/app/admin/components/release/ReleaseListItem";
import { Button } from "@/app/ui/Button";
import { StylingContext } from "@/app/ui/StylingProvider";
import { ArtistResponse, Release } from "@/lib/definitions";
import { useContext, useState } from "react";

import AddIcon from "@mui/icons-material/Add";

export enum DialogState {
  None,
  Confirm,
  Delete,
}
export const Releases = ({
  releases,
  artist,
}: {
  releases: Release[];
  artist: ArtistResponse;
}) => {
  // activeSlug === null: no release selected, form should not be visible
  // activeSlug === "": new release in creation
  // activeSlug === "xxyy": editing release
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [isDirty, setDirty] = useState(false);
  const [dialog, setDialog] = useState(DialogState.None);

  const releaseMap = new Map(
    releases.map((release) => [release.slug!, release]),
  );

  const createReleaseForm = (slug: string | null) => {
    if (!isDirty) {
      setActiveSlug(slug);
    } else {
      setDialog(DialogState.Confirm);
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
            release={releaseMap.get(activeSlug)}
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
