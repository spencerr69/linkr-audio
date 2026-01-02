"use client";

import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Link } from "@/lib/definitions";
import { useContext } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export const FormLinks = ({
  links,
  valueUpdateAction,
}: {
  links: Link[];
  valueUpdateAction: (value: Link[]) => void;
}) => {
  const styling = useContext(StylingContext);

  const getLinkUpdater = (i: number, key: keyof Link) => (value: string) => {
    const newLinks = [...links];
    newLinks[i]![key] = value;
    valueUpdateAction(newLinks);
  };

  const linkFields = links.map((link, i) => {
    return (
      <div
        key={i}
        className={"flex flex-col m-2  p-2 rounded-lg"}
        style={{ backgroundColor: styling.colours.background }}
      >
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
              squish
              onClick={() => valueUpdateAction(links.filter((_, j) => j !== i))}
            >
              <RemoveIcon />
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
        className={" font-light text-sm p-0 m-0"}
        style={{ color: styling.colours.foreground + "AA" }}
      >
        Links
      </label>
      <div
        id="links"
        className={" p-1 h-full rounded-md"}
        style={{
          backgroundColor: styling.colours.foreground + "11",
        }}
      >
        {linkFields}
        <div className={"flex justify-center mt-4"}>
          <Button
            squish
            onClick={() => {
              valueUpdateAction([...links, { name: "", url: "" }]);
            }}
          >
            <AddIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
