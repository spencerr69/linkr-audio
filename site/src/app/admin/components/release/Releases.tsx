"use client";

import {
  emptyRelease,
  ReleaseForm,
} from "@/app/admin/components/release/ReleaseForm";
import { ReleaseListItem } from "@/app/admin/components/release/ReleaseListItem";
import { Button } from "@/app/ui/Button";
import { Release } from "@/lib/apihelper";
import React from "react";

export const Releases = ({ releases }: { releases: Release[] }) => {
  const [editingRelease, setEditingRelease] = React.useState<Release | null>();

  const createReleaseForm = (release?: Release) => {
    //TODO: Add confirmation if editingRelease already exists
    setEditingRelease(release || emptyRelease);
  };

  const releasesList = releases.map((release, i) => {
    return (
      <ReleaseListItem onClick={createReleaseForm} release={release} key={i} />
    );
  });

  return (
    <div className={"flex min-h-0 h-full"}>
      <div
        className={
          " w-4xl border-r border-gray-300 border-dashed overflow-y-scroll"
        }
      >
        <ul>
          {releasesList}
          <div className={"flex justify-center m-2"}>
            <Button onClick={() => createReleaseForm()}>+</Button>
          </div>
        </ul>
      </div>
      <div className={"w-full overflow-y-scroll"}>
        {editingRelease && <ReleaseForm release={editingRelease} />}
      </div>
    </div>
  );
};
