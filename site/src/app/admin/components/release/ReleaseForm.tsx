"use client";

import { getLinks } from "@/app/actions/getlinks";
import {
  createRelease,
  deleteRelease,
  updateRelease,
} from "@/app/actions/releases";
import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { FormLinks } from "@/app/ui/FormLinks";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Link, Release } from "@/lib/definitions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";

export const emptyRelease: Release = {
  artwork: "",
  slug: "",
  artist_id: "",
  upc: "",
  title: "",
  release_date: "",
  artist_name: "",
  links: [],
  track_count: 0,
};

export const ReleaseForm = ({ release }: { release?: Release }) => {
  const [editedRelease, setEditedRelease] = React.useState<Release>(
    release || emptyRelease,
  );

  const styling = useContext(StylingContext);

  const router = useRouter();

  const [status, setStatus] = React.useState<string>("");

  React.useEffect(() => {
    setEditedRelease(release || emptyRelease);
  }, [release]);

  React.useEffect(() => {
    setTimeout(() => {
      setStatus("");
    }, 5000);
  }, [status]);

  const getReleaseUpdater = (field: keyof Release) => {
    return (value: string | number | Link[]) => {
      setEditedRelease((prev) => {
        return {
          ...prev,
          [field]: value,
        } as Release;
      });
    };
  };

  return (
    <div
      className={"flex justify-center max-h-full w-full  "}
      style={{
        color: styling.colours.foreground,
      }}
    >
      <form
        className={"p-4 h-full flex-col flex w-full  "}
        onSubmit={(e) => e.preventDefault()}
      >
        <FormField
          name="upc"
          label="UPC"
          valueUpdater={getReleaseUpdater("upc")}
          value={editedRelease.upc || ""}
          button={
            <Button
              inline
              secondary
              onClick={async () => {
                const newRelease = await getLinks(editedRelease.upc);
                setEditedRelease((prev) => {
                  return {
                    ...prev,
                    ...newRelease,
                  } as Release;
                });
              }}
            >
              Get Links...
            </Button>
          }
        />
        <FormField
          name="release-title"
          label="Release Title"
          valueUpdater={getReleaseUpdater("title")}
          value={editedRelease.title}
        />
        <FormField
          name="artist-name"
          label="Artist Name"
          valueUpdater={getReleaseUpdater("artist_name")}
          value={editedRelease.artist_name || ""}
        />
        <div className={"grid grid-cols-2 gap-x-4 grid-flow-row formgrid"}>
          <FormField
            name="release-date"
            label="Release Date"
            valueUpdater={getReleaseUpdater("release_date")}
            value={editedRelease.release_date || ""}
          />
          <FormField
            name="track-count"
            label="Track Count"
            valueUpdater={getReleaseUpdater("track_count")}
            value={editedRelease.track_count.toString() || ""}
          />
          <FormField
            name="slug"
            label="Slug"
            valueUpdater={getReleaseUpdater("slug")}
            value={editedRelease.slug || ""}
            inactive={!!release?.slug}
            button={
              !release?.slug ? (
                <Button
                  inline
                  secondary
                  onClick={() => {
                    const slug = editedRelease.title
                      .split(" ")
                      .map(
                        (word) => word.toLowerCase().replace(/[()'"]/g, "")[0],
                      )
                      .join("");

                    getReleaseUpdater("slug")(slug);
                  }}
                >
                  Generate...
                </Button>
              ) : (
                <></>
              )
            }
          />
          <FormField
            name="artist-id"
            label="Artist ID"
            inactive
            valueUpdater={getReleaseUpdater("artist_id")}
            value={editedRelease.artist_id || ""}
          />
          <FormLinks
            valueUpdateAction={getReleaseUpdater("links")}
            links={editedRelease.links || []}
          />
          <div>
            <label
              htmlFor="artwork"
              className={" font-light text-sm p-0 m-0"}
              style={{ color: styling.colours.foreground + "AA" }}
            >
              Artwork
            </label>
            <Image
              id={"artwork"}
              src={editedRelease.artwork || "/linkraudio.svg"}
              alt={"Artwork"}
              width={200}
              height={200}
              className={"aspect-square h-fit "}
            />
          </div>
        </div>
        <div className="saveContainer flex-col flex items-end  m-6">
          <div>
            <Button
              secondary
              name={"delete"}
              className={"mr-4"}
              onClick={async () => {
                const result = await deleteRelease(editedRelease);

                if (result.success) {
                  setStatus("Successfully deleted release.");
                } else {
                  setStatus(result.error!);
                }
                router.refresh();
              }}
            >
              Delete
            </Button>
            <Button
              name={"save"}
              onClick={async () => {
                const result = !!release?.slug
                  ? await updateRelease(editedRelease)
                  : await createRelease(editedRelease);
                if (result.success) {
                  setStatus("Successfully saved release.");
                } else {
                  setStatus(result.error!);
                }

                router.refresh();
                return;
              }}
            >
              Save
            </Button>
          </div>
          {status != "" && (
            <p
              className={
                "text-right  rounded-md p-4 m-4 absolute left-4 bottom-0"
              }
              style={{
                backgroundColor: styling.colours.accent,
                color: styling.colours.background,
              }}
            >
              {status}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
