import { Release, serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";

export const Releases = async () => {
  const session = await verifySession();
  const token = session.token || "";
  const artistId = session.artistId || "";

  const req_releases = await serverFetch(token, `/releases/${artistId}`, {});

  if (!req_releases.ok) {
    return <div>Error</div>;
  }

  const releases: Release[] = await req_releases.json();

  const releasesList = releases.map((release, i) => {
    return <li key={i}>{release.title}</li>;
  });

  return (
    <div>
      <h3>Releases</h3>
      <ul>{releasesList}</ul>
    </div>
  );
};
