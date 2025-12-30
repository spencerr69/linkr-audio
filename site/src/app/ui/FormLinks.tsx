"use client";

import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { Link } from "@/lib/apihelper";

export const FormLinks = ({
  links,
  valueUpdateAction,
}: {
  links: Link[];
  valueUpdateAction: (value: Link[]) => void;
}) => {
  const getLinkUpdater = (i: number, key: keyof Link) => (value: string) => {
    const newLinks = [...links];
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
