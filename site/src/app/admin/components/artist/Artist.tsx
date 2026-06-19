"use client";

import { ArtistForm } from "@/app/admin/components/artist/ArtistForm";
import { StatusPopup, useStatus } from "@/app/ui/StatusPopup";
import { ArtistResponse } from "@/lib/definitions";

export const Artist = ({ artist }: { artist: ArtistResponse }) => {
  const [status, setStatus] = useStatus();

  return (
    <div className={"flex min-h-0 h-full"}>
      <div className={"w-full overflow-y-scroll"}>
        <ArtistForm artist={artist} setStatus={setStatus} />
        <StatusPopup status={status} />
      </div>
    </div>
  );
};
