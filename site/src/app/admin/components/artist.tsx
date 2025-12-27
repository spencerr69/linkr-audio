import { ArtistResponse } from "@/lib/apihelper";
import { ArtistForm } from "@/app/admin/components/artist-form";

export const Artist = ({ artist }: { artist: ArtistResponse }) => {
  return (
    <div className={"flex min-h-0 h-full"}>
      <div className={"w-full overflow-y-scroll"}>
        <ArtistForm artist={artist} />
      </div>
    </div>
  );
};
