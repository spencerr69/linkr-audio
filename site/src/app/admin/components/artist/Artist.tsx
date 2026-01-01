import { ArtistForm } from "@/app/admin/components/artist/ArtistForm";
import { ArtistResponse } from "@/lib/definitions";

export const Artist = ({ artist }: { artist: ArtistResponse }) => {
  return (
    <div className={"flex min-h-0 h-full"}>
      <div className={"w-full overflow-y-scroll"}>
        <ArtistForm artist={artist} />
      </div>
    </div>
  );
};
