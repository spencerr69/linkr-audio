"use client";

import { StylingContext } from "@/app/ui/StylingProvider";
import { Link as ApiLink } from "@/lib/definitions";
import Link from "next/link";
import posthog from "posthog-js";
import React, { useContext } from "react";

interface ArtistLinksProps {
  artistName: string;
  links: ApiLink[];
}

export const ArtistLinks: React.FC<ArtistLinksProps> = ({
  artistName,
  links,
}) => {
  const styling = useContext(StylingContext);

  const handleLinkClick = (link: ApiLink) => {
    posthog.capture("artist_link_clicked", {
      artist_name: artistName,
      link_name: link.name,
      link_url: link.url,
    });
  };

  return (
    <div
      style={{ lineHeight: "0.9rem", color: styling.colours.foreground }}
      className={"flex flex-col w-full text-right items-end "}
    >
      <p>Find {artistName}</p>
      <div
        className={"overflow-auto flex flex-col text-right items-end w-full"}
      >
        {links.map((link) => (
          <Link
            key={link.name}
            href={link.url}
            className={" w-fit text-right duration-100"}
            onClick={() => handleLinkClick(link)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = styling.colours.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = styling.colours.foreground;
            }}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
};
