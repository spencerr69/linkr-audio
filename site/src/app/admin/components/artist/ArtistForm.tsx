import { updateArtist } from "@/actions/artists";
import { FormStyling } from "@/app/admin/components/artist/FormStyling";
import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { FormLinks } from "@/app/ui/FormLinks";
import { ArtistResponse } from "@/lib/definitions";
import { components } from "@/lib/schema";
import { jsonToResult } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";

interface ArtistFormInput {
  master_artist_name: string;
  links: components["schemas"]["Link"][];
  styling: components["schemas"]["Styling"];
}

const editArtistFromArtist = (artist: ArtistResponse) => {
  return {
    links: artist.links,
    master_artist_name: artist.master_artist_name,
    styling: artist.styling || {},
  } as ArtistFormInput;
};

export const ArtistForm = ({
  artist,
  setStatus,
}: {
  artist: ArtistResponse;
  setStatus: (s: string) => void;
}) => {
  const router = useRouter();

  const { register, control, handleSubmit, setValue, getValues } =
    useForm<ArtistFormInput>({
      defaultValues: editArtistFromArtist(artist),
    });

  const onSubmit: SubmitHandler<ArtistFormInput> = async (data) => {
    const result = jsonToResult(await updateArtist(data));

    if (result.isErr) {
      setStatus(result.error());
    } else {
      setStatus("Artist updated!");
      router.refresh();
    }
  };

  return (
    <div className={"flex justify-center max-h-full w-full  text-black "}>
      <form
        className={"p-4 h-full flex-col flex w-full  "}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          title={"Master Artist Name"}
          register={register}
          label={"master_artist_name"}
        />
        <div className={"flex "}>
          <FormStyling
            register={register}
            setValue={setValue}
            getValues={getValues}
            topLabel={"styling"}
          />
        </div>
        <FormLinks register={register} control={control} name={"links"} />
        <div className={"justify-center lg:justify-end w-full my-4 flex"}>
          <Button type={"submit"}>Save</Button>
        </div>
      </form>
    </div>
  );
};
