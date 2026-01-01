import { ReleaseArtwork } from "@/app/ui/ReleaseArtwork";
import { getRecentReleases } from "@/app/actions/releases";
import { ExternalButton } from "@/app/ui/Button";
import { baseDomain, rootDomain } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

export default async function Page() {
  const recentReleases = await getRecentReleases();

  const releasesList = recentReleases.map((release) => {
    return (
      <div key={release.slug} className={"w-4xl "}>
        <Link href={`//${release.artist_id}.${baseDomain}/${release.slug}`}>
          <ReleaseArtwork
            small
            artwork={release.artwork}
            title={release.title}
          />
          <h3>{release.title}</h3>
          <h4>{release.artist_name}</h4>
        </Link>
      </div>
    );
  });

  return (
    <div className={"w-screen"}>
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
            <ExternalButton
              href={"/admin"}
              className={"m-2 "}
              style={{
                borderColor: "white",
              }}
            >
              Log In
            </ExternalButton>
          </div>
        </div>
      </header>
      <div className={"h-[90vh] bg-blue-500"}></div>
      <div className={"recentreleases w-full overflow-x-auto"}>
        <h1>Recent Releases</h1>
        <div className={"flex "} style={{ width: "200%" }}>
          {releasesList}
        </div>
      </div>
    </div>
  );
}
