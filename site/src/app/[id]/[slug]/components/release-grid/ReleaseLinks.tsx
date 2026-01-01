import { ExternalButton } from "@/app/ui/Button";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Link } from "@/lib/definitions";
import React, { useContext } from "react";

interface ReleaseLinksProps {
  links: Link[];
}

export const ReleaseLinks: React.FC<ReleaseLinksProps> = ({ links }) => {
  const styling = useContext(StylingContext);

  return (
    <div
      className={
        "border-b-2 border-dashed  flex flex-col justify-center items-center"
      }
      style={{
        borderColor: `${styling.colours.foreground}22`,
      }}
    >
      {links.map((link) => (
        <div key={link.name} className={"w-7/8 flex flex-col text-center p-4"}>
          <ExternalButton href={link.url}>{link.name}</ExternalButton>
        </div>
      ))}
    </div>
  );
};
