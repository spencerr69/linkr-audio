import React from "react";
import Link from "next/link";
import { Link as ApiLink } from "@/lib/apihelper";

interface ArtistLinksProps {
  artistName: string;
  links: ApiLink[];
}

export const ArtistLinks: React.FC<ArtistLinksProps> = ({
  artistName,
  links,
}) => {
  return (
    <div
      style={{ lineHeight: "0.9rem" }}
      className={"flex flex-col w-full text-right items-end text-black "}
    >
      <p>Find {artistName}</p>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.url}
          className={"hover:text-rose-500 w-fit text-right"}
        >
          {link.name}
        </Link>
      ))}
    </div>
  );
};
