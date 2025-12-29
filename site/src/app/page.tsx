import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className={"h-screen"}>
      <header
        className={
          "w-full flex  justify-center bg-rose-500 font-sans text-white"
        }
      >
        <div className={"flex align-middle items-center w-6xl justify-between"}>
          <div className={"flex align-middle items-center "}>
            <Image
              src={"/linkraudio.svg"}
              alt={"linkr.audio"}
              height={100}
              width={100}
            />
            <h3 className={" align-middle font-bold  text-3xl "}>
              linkr.audio
            </h3>
          </div>
          <div>
            <Link
              href={"/admin"}
              className={"hover:bg-white hover:text-rose-500 p-2"}
            >
              Log In
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div
          className={
            "font-sans font-bold text-black flex flex-col justify-around text-center h-screen"
          }
        >
          <h1 className={"text-8xl"}>Linksites without the bullshit</h1>
        </div>
      </main>
    </div>
  );
}
