import { verifySession } from "@/lib/dal";
import { apiDomain } from "@/lib/utils";
import { ArtistResponse } from "@/lib/apihelper";
import { Releases } from "@/app/admin/components/releases";

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

  return (
    <div>
      dashboard {artist.master_artist_name}
      <Releases />
    </div>
  );
};
