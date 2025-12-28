import { Artist } from "@/app/admin/components/artist";
import { Header } from "@/app/admin/components/header";
import { Releases } from "@/app/admin/components/releases";
import { ArtistResponse, Release, serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { AdminPages } from "@/lib/definitions";
import { apiDomain } from "@/lib/utils";

export const Dashboard = async ({
  currentPage,
}: {
  currentPage: AdminPages;
}) => {
  const session = await verifySession();

  if (!session || !session.jwt) {
    return <></>;
  }

  const req_artist = await fetch(
    `${apiDomain}/artists/${session.jwt.artistId}`,
  );

  if (!req_artist.ok) {
    return <div>stinky error</div>;
  }

  const artist: ArtistResponse = await req_artist.json();

  const req_releases = await serverFetch(
    session.jwt,
    `/releases/${session.jwt.artistId}`,
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
    <div className={"flex flex-col h-full  text-black"}>
      <Header
        artistName={artist.master_artist_name}
        artistId={artist.artist_id}
      />
      <div className={"flex-1 min-h-0"}>
        {currentPage == AdminPages.Releases && <Releases releases={releases} />}
        {currentPage == AdminPages.Artist && <Artist artist={artist} />}
      </div>
    </div>
  );
};
