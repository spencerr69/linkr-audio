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
    <div className={"flex min-h-0 h-full"}>
      <div
        className={" w-4xl border-r border-dashed overflow-y-auto"}
        style={{
          borderColor: `${styling.colours.foreground}22`,
        }}
      >
        <ul>
          {releasesList}
          <div className={"flex justify-center m-2"}>
            <Button onClick={() => createReleaseForm()}>+</Button>
          </div>
        </ul>
      </div>
      <div className={"w-full overflow-y-auto"}>
        {editingRelease && <ReleaseForm release={editingRelease} />}
      </div>
    </div>
  );
};
