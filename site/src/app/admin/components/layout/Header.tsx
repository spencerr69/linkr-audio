import { logout } from "@/app/actions/auth";
import { HeaderLink } from "@/app/admin/components/layout/HeaderLink";
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
            draggable={false}
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
        <HeaderLink href={"/admin"}>Releases</HeaderLink>
        <HeaderLink href={"/admin/artist"}>Artist</HeaderLink>
        <HeaderLink href="#" onClick={logout}>
          Log out
        </HeaderLink>
      </div>
    </header>
  );
};
