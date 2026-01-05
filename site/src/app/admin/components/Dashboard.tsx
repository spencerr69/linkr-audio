import { getArtist } from "@/actions/artists";
import { Artist } from "@/app/admin/components/artist/Artist";
import StylingProvider from "@/app/ui/StylingProvider";
import { Header } from "./Header";
import { Releases } from "@/app/admin/components/release/Releases";
import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { AdminPages, Release } from "@/lib/definitions";
import { stylingComp } from "@/lib/utils";

export const Dashboard = async ({
  currentPage,
}: {
  currentPage: AdminPages;
}) => {
  const session = await verifySession();

  if (!session || !session.jwt) {
    return <></>;
  }

  const artist = await getArtist(`${session.jwt?.artistId}`);

  const styling = stylingComp(artist.styling || {});

  const req_releases = await serverFetch(
    session.jwt,
    `/releases/${session.jwt.artistId}?showActive=false`,
    {},
  );

  if (!req_releases.ok) {
    return <div>Error</div>;
  }

  let releases: Release[] = await req_releases.json();

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
      <StylingProvider styling={styling}>
        <Header
          currentPage={currentPage}
          artistName={artist.master_artist_name}
          artistId={artist.artist_id}
        />
        <div className={"flex-1 min-h-0"}>
          {currentPage == AdminPages.Releases && (
            <Releases releases={releases} artistId={artist.artist_id} />
          )}
          {currentPage == AdminPages.Artist && <Artist artist={artist} />}
        </div>
      </StylingProvider>
    </div>
  );
};
