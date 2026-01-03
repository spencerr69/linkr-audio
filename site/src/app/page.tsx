import { getArtist } from "@/app/actions/artists";
import { getRecentReleases } from "@/app/actions/releases";
import { ApplyButton } from "@/app/ui/ApplyButton";
import { ExternalButton } from "@/app/ui/Button";
import LinkrAudioLogo from "@/app/ui/LinkrAudioLogo";
import { RecentRelease } from "@/app/ui/RecentRelease";
import StylingProvider from "@/app/ui/StylingProvider";
import { verifySession } from "@/lib/dal";
import { stylingComp } from "@/lib/utils";
import { LoginButton } from "@/app/ui/LoginButton";
import { Metadata } from "next";
import Link from "next/link";

export default async function Page() {
  const session = await verifySession();

  const recentReleases = await getRecentReleases();

  const recentArtist = await getArtist(recentReleases[0]?.artist_id || "");

  const styling = stylingComp(recentArtist.styling || {});

  const releasesList = recentReleases.map((release) => {
    return <RecentRelease key={release.slug} release={release} />;
  });

  return (
    <StylingProvider styling={styling}>
      <div className={"w-full"}>
        <header
          className={"fixed top-0 w-full flex  justify-center font-sans z-10"}
          style={{
            color: styling.colours.background,
            backgroundColor: styling.colours.accent,
          }}
        >
          <div
            className={"flex align-middle items-center w-6xl justify-between"}
          >
            <div className={"flex align-middle items-center "}>
              <LinkrAudioLogo
                style={{
                  width: "100px",
                  height: "100px",
                }}
              />
              <h3 className={" align-middle font-bold  text-3xl "}>
                linkr.audio
              </h3>
            </div>
            <div>
              {session.isAuth ? (
                <ExternalButton secondary href={"/admin"}>
                  Admin
                </ExternalButton>
              ) : (
                <>
                  <ApplyButton />
                  <LoginButton />
                </>
              )}
            </div>
          </div>
        </header>
        <div
          className={"h-[90vh] w-full "}
          style={{
            backgroundColor: styling.colours.accent,
          }}
        >
          <div className={"flex justify-center items-center h-full"}>
            <h1
              className={"font-sans font-bold text-3xl"}
              style={{
                color: styling.colours.background,
              }}
            >
              linkr.audio
            </h1>
          </div>
        </div>
        <div
          className={
            "text-center flex flex-col items-center w-full p-8 font-sans"
          }
          style={{
            backgroundColor: styling.colours.background,
            color: styling.colours.foreground,
          }}
        >
          <h1 className={"font-bold text-3xl mb-4"}>Recent Releases</h1>
          <div className={"w-6xl overflow-hidden z-0"}>
            <div className={" grid grid-cols-3 gap-4 w-full "}>
              {releasesList}
            </div>
          </div>
        </div>
        <footer
          className={"bottom-0 w-full h-24 border-dashed border-t-2 "}
          style={{
            backgroundColor: styling.colours.background,
            borderColor: `${styling.colours.foreground}22`,
            color: styling.colours.foreground,
          }}
        >
          <div className={"flex justify-center items-center h-full"}>
            <Link href="/">
              <LinkrAudioLogo style={{ width: "75px", height: "75px" }} />
            </Link>
            <div>
              <p className={"font-sans text-sm"}>homepage wip</p>
            </div>
          </div>
        </footer>
      </div>
    </StylingProvider>
  );
}

export const metadata: Metadata = {
  title: "linkr.audio",
  description: "A customisable and free linksite for music releases.",
};
