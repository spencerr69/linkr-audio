import { getArtist } from "@/actions/artists";
import { getReleasesForArtist } from "@/actions/releases";
import { Artist } from "@/app/admin/components/artist/Artist";
import { Releases } from "@/app/admin/components/release/Releases";
import StylingProvider from "@/app/ui/StylingProvider";
import { verifySession } from "@/lib/dal";
import { AdminPages } from "@/lib/definitions";
import { jsonToResult, stylingComp } from "@/lib/utils";
import { Toaster } from "sonner";
import { Header } from "./header/Header";

export const Dashboard = async ({
  currentPage,
}: {
  currentPage: AdminPages;
}) => {
  const sessionRequest = jsonToResult(await verifySession());

  if (sessionRequest.isErr) {
    return <></>;
  }

  const session = sessionRequest.get();

  const artist = jsonToResult(
    await getArtist(`${session.jwt?.artistId}`),
  ).get();

  const styling = stylingComp(artist.styling || {});

  let releases =
    currentPage === AdminPages.Releases
      ? jsonToResult(await getReleasesForArtist(artist.artist_id)).get()
      : [];

  releases = releases.sort((b, a) =>
    a.release_date.localeCompare(b.release_date),
  );

  return (
    <div
      className={"flex flex-col h-full  "}
      style={{
        color: styling.colours.foreground,
        backgroundColor: styling.colours.background,
      }}
    >
      <Toaster
        toastOptions={{
          style: {
            backgroundColor: styling.colours.accent,
            color: styling.colours.background,
            border: "none",
          },
        }}
      />
      <StylingProvider styling={styling}>
        <Header currentPage={currentPage} artist={artist} />
        <div className={"flex-1 min-h-0"}>
          {currentPage == AdminPages.Releases && (
            <Releases releases={releases} artist={artist} />
          )}
          {currentPage == AdminPages.Artist && <Artist artist={artist} />}
        </div>
      </StylingProvider>
    </div>
  );
};
