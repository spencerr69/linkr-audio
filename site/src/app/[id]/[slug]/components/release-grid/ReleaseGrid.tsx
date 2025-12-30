import { ArtistLinks } from "@/app/[id]/[slug]/components/release-grid/ArtistLinks";
import { ReleaseArtwork } from "@/app/[id]/[slug]/components/release-grid/ReleaseArtwork";
import { ReleaseHeader } from "@/app/[id]/[slug]/components/release-grid/ReleaseHeader";
import { ReleaseInfo } from "@/app/[id]/[slug]/components/release-grid/ReleaseInfo";
import { ReleaseLinks } from "@/app/[id]/[slug]/components/release-grid/ReleaseLinks";
import { ScrollingBackground } from "@/app/ui/ScrollingBackground";
import { ArtistResponse, Release } from "@/lib/apihelper";

export const ReleaseGrid = (props: {
  release: Release;
  artist: ArtistResponse;
}) => {
  return (
    <div
      className={
        "m-16 releasegrid bg-gray-50 w-4xl grid grid-cols-2 font-sans rounded-2xl shadow-xl z-20 "
      }
    >
      <ReleaseHeader
        title={props.release.title}
        artistName={props.release.artist_name}
      />
      <div
        className={
          "overflow-hidden border-l-2 border-b-2 border-dashed border-gray-300 select-none"
        }
      >
        <ScrollingBackground text={props.release.artist_id} />
      </div>
      <ReleaseLinks links={props.release.links} />
      <ReleaseArtwork
        artwork={props.release.artwork}
        title={props.release.title}
      />
      <div className={"p-4 flex w-full font-mono text-xs"}>
        <ReleaseInfo
          releaseDate={props.release.release_date}
          trackCount={props.release.track_count}
          upc={props.release.upc}
        />
        <ArtistLinks
          artistName={props.artist.master_artist_name}
          links={props.artist.links}
        />
      </div>
      <div
        className={
          "overflow-hidden border-l-2 border-dashed border-gray-300 select-none"
        }
      >
        <ScrollingBackground text={props.release.slug} />
      </div>
    </div>
  );
};
