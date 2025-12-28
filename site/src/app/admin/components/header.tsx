"use client";

import { logout } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type HeaderProps = {
  artistName: string;
  artistId: string;
};

export const Header = (props: HeaderProps) => {
  const [popup, setPopup] = useState<boolean>(false);

  return (
    <header
      className={
        "bg-rose-500 flex text-white items-center content-between justify-between" +
        " p-2" +
        " py-14" +
        " h-3 "
      }
    >
      <div className={"flex items-center"}>
        <Image
          src={"/linkraudio.svg"}
          alt={"logo"}
          width={100}
          height={100}
          className={" fill-rose-500 "}
        />
        <h1 className={"font-bold font-sans text-4xl"}>
          {props.artistName}
          {"  "}
          <span className={"font-light italic text-2xl opacity-50"}>
            {props.artistId}
          </span>
        </h1>
      </div>

      <div>
        <Link href={"/admin"} className={"mr-4"}>
          Releases
        </Link>
        <Link href={"/admin/artist"} className={"mr-4"}>
          Artist
        </Link>

        <button
          onClick={() => setPopup(!popup)}
          className={"text-4xl -translate-y-2 p-2 hover:bg-rose-300"}
        >
          ...
        </button>
        {popup && <Popup />}
      </div>
    </header>
  );
};

const Popup = () => {
  return (
    <div className={"bg-white  rounded shadow p-4 absolute w-32 right-4"}>
      <a
        className={"cursor-pointer text-black  hover:bg-rose-500 p-2 w-32"}
        onClick={logout}
      >
        Log out
      </a>
    </div>
  );
};
