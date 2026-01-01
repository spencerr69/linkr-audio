import { FormField } from "@/app/ui/FormField";
import { Colours, EditArtist, Link, Styling } from "@/lib/definitions";
import React from "react";

export function FormStyling(props: {
  editedArtist: EditArtist;
  // this edits the Styling object vv
  artistUpdater: (value: string | Link[] | Styling) => void;
}) {
  const getColourUpdater = (field: keyof Colours) => (value: string) => {
    const newColours: Colours = props.editedArtist.styling?.colours || {};
    newColours[field] = value;
    props.artistUpdater({ ...props.editedArtist.styling, colours: newColours });
  };

  return (
    <div className={"grid grid-cols-3 gap-4 w-full"}>
      <FormField
        name={"accent-colour"}
        label={"Accent Colour"}
        value={props.editedArtist.styling?.colours?.accent || ""}
        valueUpdater={getColourUpdater("accent")}
        button={
          <div
            style={{
              backgroundColor: `${props.editedArtist.styling?.colours?.accent}`,
            }}
            className={"w-4 h-4 rounded-full border border-black"}
          ></div>
        }
      />
      <FormField
        name={"background-colour"}
        label={"Background Colour"}
        value={props.editedArtist.styling?.colours?.background || ""}
        valueUpdater={getColourUpdater("background")}
        button={
          <div
            style={{
              backgroundColor: `${props.editedArtist.styling?.colours?.background}`,
            }}
            className={"w-4 h-4 rounded-full border border-black"}
          ></div>
        }
      />
      <FormField
        name={"foreground-colour"}
        label={"Foreground Colour"}
        value={props.editedArtist.styling?.colours?.foreground || ""}
        valueUpdater={getColourUpdater("foreground")}
        button={
          <div
            style={{
              backgroundColor: `${props.editedArtist.styling?.colours?.foreground}`,
            }}
            className={"w-4 h-4 rounded-full border border-black"}
          ></div>
        }
      />
    </div>
  );
}
