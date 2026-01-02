import { ExternalButton } from "@/app/ui/Button";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Release } from "@/lib/definitions";
import { baseDomain } from "@/lib/utils";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Image from "next/image";
import { useContext } from "react";

export const ReleaseListItem = ({
  release,
  onClick,
  active = false,
}: {
  release: Release;
  onClick: (release: Release) => void;
  active?: boolean;
}) => {
  const styling = useContext(StylingContext);

  return (
    <div
      className={
        "p-2 lg:p-4 flex items-center justify-between border-b cursor-pointer duration-100 border-dashed "
      }
      style={{
        borderColor: `${styling.colours.foreground}22`,
        backgroundColor: active
          ? styling.colours.foreground + "22"
          : "transparent",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          styling.colours.foreground + "33";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? styling.colours.foreground + "22"
          : "transparent";
      }}
      onClick={() => onClick(release)}
    >
      <div
        className={
          "flex flex-col-reverse lg:flex-row justify-between w-full items-center min-w-30"
        }
      >
        <div className={"flex-3 text-center lg:text-left"}>
          <div className={"pb-4"}>
            <h2
              className={
                " font-medium lg:text-2xl truncate max-w-30 sm:max-w-50 lg:max-w-90"
              }
            >
              {release.title}
            </h2>
            <h4 className={"hidden lg:block lg:text-xl italic"}>
              {release.artist_name}
            </h4>
            <p className="text-xs lg:text-base">{release.release_date}</p>
            <p className="text-xs lg:text-base">
              {release.links.length + " links"}
            </p>
          </div>
          <ExternalButton
            squish
            inline
            secondary
            className={"p-1"}
            href={
              "//" + release.artist_id + "." + baseDomain + "/" + release.slug
            }
            onClick={(e) => e.stopPropagation()}
          >
            <VisibilityIcon />
          </ExternalButton>
        </div>
        <div
          className={
            "flex flex-1 lg:items-center justify-center lg:justify-start"
          }
        >
          <div className="relative w-16 h-16 lg:w-[100px] lg:h-[100px]">
            <Image
              src={release.artwork || ""}
              alt={release.title + " Artwork"}
              fill
              className={"rounded-md object-cover"}
            />
          </div>
          <p className={"p-4 hidden lg:block"}>
            <ChevronRightIcon
              style={{ color: styling.colours.foreground + "44" }}
            />
          </p>
        </div>
      </div>
    </div>
  );
};
