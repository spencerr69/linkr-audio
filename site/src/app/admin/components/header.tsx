import { logout } from "@/app/actions/auth";
import Image from "next/image";
import Link from "next/link";

type HeaderProps = {
  artistName: string;
  artistId: string;
};

export const Header = (props: HeaderProps) => {
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
        <Link href={"/"}>
          <Image
            src={"/linkraudio.svg"}
            alt={"logo"}
            width={100}
            height={100}
            className={" fill-rose-500 "}
          />
        </Link>
        <h1 className={"font-bold font-sans text-4xl"}>
          {props.artistName}
          {"  "}
          <span className={"font-light italic text-2xl opacity-50"}>
            {props.artistId}
          </span>
        </h1>
      </div>

      <div>
        <Link
          href={"/admin"}
          className={"mr-4 hover:bg-white hover:text-rose-500 p-2"}
        >
          Releases
        </Link>
        <Link
          href={"/admin/artist"}
          className={"mr-4 hover:bg-white hover:text-rose-500 p-2"}
        >
          Artist
        </Link>
        <a
          href="#"
          className={"mr-4 hover:bg-white hover:text-rose-500 p-2"}
          onClick={logout}
        >
          Log out
        </a>
      </div>
    </header>
  );
};
