import { Release } from "@/lib/apihelper";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/app/ui/button";
import { getLinks } from "@/app/actions/getlinks";

export const ReleaseForm = ({ release }: { release?: Release }) => {
  return (
    <form className={"p-4"} onSubmit={(e) => e.preventDefault()}>
      <FormField
        name="upc"
        label="UPC"
        value={release?.upc || ""}
        button={
          <Button
            inline
            secondary
            onClick={async () =>
              console.log(await getLinks(release?.upc || ""))
            }
          >
            Get Links...
          </Button>
        }
      />
      <FormField
        name="release-title"
        label="Release Title"
        value={release?.title || ""}
      />
      <FormField
        name="artist-name"
        label="Artist Name"
        value={release?.artist_name || ""}
      />
      <div className={"grid grid-cols-2 gap-x-4"}>
        <FormField
          name="release-date"
          label="Release Date"
          value={release?.release_date || ""}
        />
        <FormField
          name="track-count"
          label="Track Count"
          value={release?.track_count.toString() || ""}
        />
        <FormField
          name="slug"
          label="Slug"
          value={release?.slug || ""}
          button={
            <Button inline secondary>
              Generate...
            </Button>
          }
        />
        <FormField
          name="artist-id"
          label="Artist ID"
          inactive
          value={release?.artist_id || ""}
        />
      </div>
    </form>
  );
};

const FormField = ({
  name,
  label,
  value,
  button,
  inactive = false,
}: {
  name: string;
  label: string;
  value: string;
  button?: React.JSX.Element;
  inactive?: boolean;
}) => {
  return (
    <div
      key={uuidv4()}
      className={
        "p-1 flex flex-col w-full pb-0 mb-2 border-dashed " +
        (inactive ? "bg-gray-100" : " border-b")
      }
    >
      <label
        className={"text-gray-500 font-light text-sm p-0 m-0"}
        htmlFor={name}
      >
        {label}
      </label>
      <div className={"flex "}>
        <input
          type="text"
          name={name}
          defaultValue={value}
          contentEditable={!inactive}
          disabled={inactive}
          className={
            "flex-2  focus:outline-0 " + (inactive ? "text-gray-400" : "")
          }
        />
        {button}
      </div>
    </div>
  );
};
