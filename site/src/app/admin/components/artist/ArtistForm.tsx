"use client";

import { updateArtist } from "@/app/actions/artists";
import { FormStyling } from "@/app/admin/components/artist/FormStyling";
import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { FormLinks } from "@/app/ui/FormLinks";
import { ArtistResponse, EditArtist, Link, Styling } from "@/lib/apihelper";
import { stylingComp } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React from "react";

const editArtistFromArtist = (artist: ArtistResponse) => {
  return {
    links: artist.links,
    master_artist_name: artist.master_artist_name,
    styling: stylingComp(artist.styling || {}),
  } as EditArtist;
};

export const ArtistForm = ({ artist }: { artist: ArtistResponse }) => {
  const [editedArtist, setEditedArtist] = React.useState<EditArtist>(
    editArtistFromArtist(artist),
  );

  const router = useRouter();

  const [status, setStatus] = React.useState<string>("");

  React.useEffect(() => {
    setEditedArtist(editArtistFromArtist(artist));
  }, [artist]);

  React.useEffect(() => {
    setTimeout(() => {
      setStatus("");
    }, 5000);
  }, [status]);

  const getArtistUpdater = (field: keyof EditArtist) => {
    return (value: string | Link[] | Styling) => {
      setEditedArtist((prev) => {
        return {
          ...prev,
          [field]: value,
        } as EditArtist;
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
          name={"master-artist-name"}
          label={"Master Artist Name"}
          value={editedArtist.master_artist_name}
          valueUpdater={getArtistUpdater("master_artist_name")}
        />
        <div className={"flex "}>
          <FormStyling
            editedArtist={editedArtist}
            artistUpdater={getArtistUpdater("styling")}
          />
        </div>
        <FormLinks
          valueUpdateAction={getArtistUpdater("links")}
          links={editedArtist.links || []}
        />
        <div className={"justify-end w-full flex"}>
          <Button
            name={"save"}
            onClick={async () => {
              const result = await updateArtist(editedArtist);
              if (result.success) {
                setStatus("Successfully saved artist.");
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
        <p>{status}</p>
      </form>
    </div>
  );
};
