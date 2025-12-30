import { ExternalButton } from "@/app/ui/Button";
import { Link } from "@/lib/apihelper";
import React from "react";

interface ReleaseLinksProps {
  links: Link[];
}

export const ReleaseLinks: React.FC<ReleaseLinksProps> = ({ links }) => {
  return (
    <div
      className={
        "border-b-2 border-dashed border-gray-300 flex flex-col justify-center items-center"
      }
    >
      {links.map((link) => (
        <div key={link.name} className={"w-7/8 flex flex-col text-center p-4"}>
          <ExternalButton href={link.url}>{link.name}</ExternalButton>
        </div>
      ))}
    </div>
  );
};
