"use client";

import { ExternalButton } from "@/app/ui/Button";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Link } from "@/lib/definitions";
import posthog from "posthog-js";
import React, { useContext } from "react";

interface ReleaseLinksProps {
  links: Link[];
}

export const ReleaseLinks: React.FC<ReleaseLinksProps> = ({ links }) => {
  const styling = useContext(StylingContext);

  const handleLinkClick = (link: Link) => {
    posthog.capture("release_link_clicked", {
      link_name: link.name,
      link_url: link.url,
    });
  };

  return (
    <div
      className={
        "border-b-2 border-dashed py-4 flex flex-col justify-center-safe items-center h-full overflow-auto"
      }
      style={{
        borderColor: `${styling.colours.foreground}22`,
      }}
    >
      {links.map((link) => (
        <div
          key={link.name}
          className={"w-[87.5%] flex flex-col text-center py-3"}
          onClick={() => handleLinkClick(link)}
        >
          <ExternalButton fill href={link.url}>
            {link.name}
          </ExternalButton>
        </div>
      ))}
    </div>
  );
};
