import { verifySession } from "@/lib/dal";
import { apiDomain } from "@/lib/utils";
import { ArtistResponse, Release, serverFetch } from "@/lib/apihelper";
import { Releases } from "@/app/admin/components/releases";
import { Header } from "@/app/admin/components/header";

export const Dashboard = async () => {
  const session = await verifySession();

  if (!session) {
    return <></>;
  }

  const req_artist = await fetch(`${apiDomain}/artists/${session.artistId}`);

  if (!req_artist.ok) {
    return <div>stinky error</div>;
  }

  const artist: ArtistResponse = await req_artist.json();

  const req_releases = await serverFetch(
    session.token || "",
    `/releases/${session.artistId}`,
    {},
  );

  if (!req_releases.ok) {
    return <div>Error</div>;
  }

  const releases: Release[] = await req_releases.json();

  return (
    <div className={"flex flex-col h-screen max-h-screen"}>
      <Header
        artistName={artist.master_artist_name}
        artistId={artist.artist_id}
      />
      <Releases releases={releases} />
    </div>
  );
};
