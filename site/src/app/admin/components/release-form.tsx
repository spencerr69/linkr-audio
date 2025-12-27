"use client";

import { Link, Release } from "@/lib/apihelper";
import { Button } from "@/app/ui/button";
import { getLinks } from "@/app/actions/getlinks";
import { FormField } from "@/app/ui/form-field";
import Image from "next/image";
import React from "react";
import { createRelease, deleteRelease, updateRelease } from "@/app/actions/updateRelease";
import { useRouter } from "next/navigation";

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
    <div className={"flex justify-center max-h-full w-full  text-black "}>
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
              className={"text-gray-500 font-light text-sm p-0 m-0"}
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
                "text-right bg-rose-50 rounded-md p-4 m-4 absolute left-4 bottom-0"
              }
            >
              {status}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export const FormLinks = ({
  links,
  valueUpdateAction,
}: {
  links: Link[];
  valueUpdateAction: (value: Link[]) => void;
}) => {
  const getLinkUpdater = (i: number, key: keyof Link) => (value: string) => {
    const newLinks = links;
    newLinks[i][key] = value;
    valueUpdateAction(newLinks);
  };

  const linkFields = links.map((link, i) => {
    return (
      <div key={i} className={"flex flex-col m-2  p-2 bg-gray-50 rounded-lg"}>
        <FormField
          name={"name" + i}
          label={"Name"}
          valueUpdater={getLinkUpdater(i, "name")}
          value={link.name}
          button={
            <Button
              className={""}
              inline
              secondary
              onClick={() => valueUpdateAction(links.filter((_, j) => j !== i))}
            >
              Remove
            </Button>
          }
        />
        <FormField
          name={"url" + i}
          label={"URL"}
          valueUpdater={getLinkUpdater(i, "url")}
          value={link.url}
        />
      </div>
    );
  });

  return (
    <div className={""}>
      <label
        htmlFor="links"
        className={"text-gray-500 font-light text-sm p-0 m-0"}
      >
        Links
      </label>
      <div id="links" className={"bg-gray-100 p-1 h-full"}>
        {linkFields}
        <Button
          onClick={() => {
            valueUpdateAction([...links, { name: "", url: "" }]);
          }}
        >
          +
        </Button>
      </div>
    </div>
  );
};
