import { ColourPicker } from "@/app/ui/ColourPicker";
import { FormField } from "@/app/ui/FormField";
import { Colours, EditArtist, Link, Styling } from "@/lib/definitions";

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
    <div className={"grid lg:grid-cols-3 gap-4 w-full"}>
      <FormField
        name={"accent-colour"}
        label={"Accent Colour"}
        value={props.editedArtist.styling?.colours?.accent || ""}
        valueUpdater={getColourUpdater("accent")}
        button={
          <ColourPicker
            value={props.editedArtist.styling?.colours?.accent || ""}
            valueUpdaterAction={getColourUpdater("accent")}
          />
        }
      />
      <FormField
        name={"background-colour"}
        label={"Background Colour"}
        value={props.editedArtist.styling?.colours?.background || ""}
        valueUpdater={getColourUpdater("background")}
        button={
          <ColourPicker
            value={props.editedArtist.styling?.colours?.background || ""}
            valueUpdaterAction={getColourUpdater("background")}
          />
        }
      />
      <FormField
        name={"foreground-colour"}
        label={"Foreground Colour"}
        value={props.editedArtist.styling?.colours?.foreground || ""}
        valueUpdater={getColourUpdater("foreground")}
        button={
          <ColourPicker
            value={props.editedArtist.styling?.colours?.foreground || ""}
            valueUpdaterAction={getColourUpdater("foreground")}
          />
        }
      />
    </div>
  );
}
