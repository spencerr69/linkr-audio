"use client";

import {
  emptyRelease,
  ReleaseForm,
} from "@/app/admin/components/release/ReleaseForm";
import { ReleaseListItem } from "@/app/admin/components/release/ReleaseListItem";
import { Button } from "@/app/ui/Button";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Release } from "@/lib/definitions";
import React, { useContext } from "react";

import AddIcon from "@mui/icons-material/Add";

export const Releases = ({ releases }: { releases: Release[] }) => {
  const [editingRelease, setEditingRelease] = React.useState<Release | null>();

  const styling = useContext(StylingContext);

  const createReleaseForm = (release?: Release) => {
    //TODO: Add confirmation if editingRelease already exists
    setEditingRelease(release || emptyRelease);
  };

  const releasesList = releases.map((release, i) => {
    return (
      <ReleaseListItem
        onClick={createReleaseForm}
        release={release}
        key={i}
        active={editingRelease?.slug == release.slug}
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
          " lg:w-xl border-r border-dashed overflow-x-auto lg:overflow-y-auto shrink-0"
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
            <Button squish onClick={() => createReleaseForm()}>
              <AddIcon />
            </Button>
          </div>
        </ul>
      </div>
      <div className={"w-full overflow-y-auto"}>
        {editingRelease && <ReleaseForm release={editingRelease} />}
      </div>
    </div>
  );
};
