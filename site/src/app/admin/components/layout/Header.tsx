"use client";

import { HeaderDropdown } from "@/app/admin/components/layout/HeaderDropdown";
import { HeaderLink } from "@/app/admin/components/layout/HeaderLink";
import { StylingContext } from "@/app/ui/StylingProvider";
import { AdminPages } from "@/lib/definitions";
import Link from "next/link";
import { useContext } from "react";
import AlbumIcon from "@mui/icons-material/Album";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

type HeaderProps = {
  artistName: string;
  artistId: string;
  currentPage: AdminPages;
};

export const Header = (props: HeaderProps) => {
  const styling = useContext(StylingContext);

  return (
    <header
      className={
        " flex items-center content-between justify-between" +
        " p-4 lg:p-2" +
        " py-8 lg:py-14" +
        " h-3 "
      }
      style={{
        backgroundColor: styling.colours.accent,
        color: styling.colours.background,
      }}
    >
      <div className={"flex items-center"}>
        <Link href={"/"}>
          <i
            className={"logo block scale-50 lg:scale-100"}
            style={{
              backgroundColor: styling.colours.background,
            }}
          />
        </Link>
        <h1 className={"font-bold font-sans text-xl lg:text-4xl ml-2"}>
          {props.artistName}
          {"  "}
          <span className={"font-light italic text-sm lg:text-2xl opacity-50"}>
            {props.artistId}
          </span>
        </h1>
      </div>

      <div className={"flex items-center"} style={{}}>
        <HeaderLink
          href={"/admin"}
          active={props.currentPage == AdminPages.Releases}
        >
          <AlbumIcon fontSize={"large"} />
        </HeaderLink>
        <HeaderLink
          href={"/admin/artist"}
          active={props.currentPage == AdminPages.Artist}
        >
          <AccountCircleIcon fontSize={"large"} />
        </HeaderLink>
        <HeaderDropdown />
      </div>
    </header>
  );
};
