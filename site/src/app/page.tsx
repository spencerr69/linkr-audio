import { getRecentReleases } from "@/app/actions/releases";
import { ExternalButton } from "@/app/ui/Button";
import { ReleaseArtwork } from "@/app/ui/ReleaseArtwork";
import { baseDomain } from "@/lib/utils";
import { LoginButton } from "@/app/ui/LoginButton";
import Image from "next/image";
import Link from "next/link";

export default async function Page() {
  const recentReleases = await getRecentReleases();

  const releasesList = recentReleases.map((release) => {
    return (
      <div key={release.slug} className={"w-full "}>
        <Link href={`//${release.artist_id}.${baseDomain}/${release.slug}`}>
          <ReleaseArtwork
            small
            artwork={release.artwork}
            title={release.title}
          />
          <h3 className={"font-bold text-xl"}>{release.title}</h3>
          <h4 className={"italic"} style={{ lineHeight: "0.8em" }}>
            {release.artist_name}
          </h4>
        </Link>
      </div>
    );
  });

  return (
    <div className={"w-full"}>
      <header
        className={
          "fixed top-0 w-full flex  justify-center font-sans text-white"
        }
      >
        <div className={"flex align-middle items-center w-6xl justify-between"}>
          <div className={"flex align-middle items-center "}>
            <Image
              src={"/linkraudio.svg"}
              alt={"linkr.audio"}
              height={100}
              width={100}
              draggable={false}
            />
            <h3 className={" align-middle font-bold  text-3xl "}>
              linkr.audio
            </h3>
          </div>
          <div>
            <ExternalButton secondary href={"/apply"} className={"m-2"}>
              Apply
            </ExternalButton>
            <LoginButton />
          </div>
        </div>
      </header>
      <div className={"h-[90vh] w-full bg-blue-500"}>
        <div className={"flex justify-center items-center h-full"}>
          <h1>linkr.audio</h1>
        </div>
      </div>
      <div
        className={
          "text-center flex flex-col items-center w-full p-4 font-sans"
        }
      >
        <h1>Recent Releases</h1>
        <div className={"w-6xl overflow-hidden"}>
          <div className={" grid grid-cols-3 w-full "}>{releasesList}</div>
        </div>
      </div>
      <div className={"w-6xl"}>
        <h1>The story</h1>
        <p>
          linkr.audio is a site i made for me and my friends to share new
          releases with the world ! i plan to keep the amount of artists on this
          site fairly small, but i will also make this website open source, so
          you can easily self host or fork the site.
        </p>
      </div>
    </div>
  );
}
