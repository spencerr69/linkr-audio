import { components } from "@/lib/schema";
import * as z from "zod";

export const LoginFormSchema = z.object({
  artistid: z.string().trim(),
  password: z.string().trim(),
});

export enum AdminPages {
  Releases,
  Artist,
}

const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

export const releaseFormSchema = z.object({
  upc: z
    .string()
    .trim()
    .regex(/^[0-9]*$/),
  title: z.string().trim(),
  artist_name: z.string().trim(),
  release_date: z.iso.date(),
  artwork: z.url(),
  links: z.array(
    z.object({ name: z.string().trim(), url: z.httpUrl().trim() }),
  ),
  artist_id: z.string(),
  slug: z.string(),
  track_count: z.number().min(1),
  active: z.boolean(),
});

export const editArtistSchema = z.object({
  master_artist_name: z.string().trim(),
  links: z.array(
    z.object({ name: z.string().trim(), url: z.httpUrl().trim() }),
  ),
  styling: z.object({
    colours: z.object({
      background: z.string().regex(hexRegex).nullable(),
      accent: z.string().regex(hexRegex).nullable(),
      foreground: z.string().regex(hexRegex).nullable(),
    }),
  }),
});

export type Release = components["schemas"]["Release"];
export type Link = components["schemas"]["Link"];
export type LinkResponse = components["schemas"]["LinkResponse"];
export type ArtistResponse = components["schemas"]["Artist"];
export type EditArtist = {
  master_artist_name: string;
  links: components["schemas"]["Link"][];
  styling: Styling;
};
export type Styling = components["schemas"]["Styling"];
export type Colours = components["schemas"]["Colours"];
export type StylingGuaranteed = {
  colours: Required<Colours>;
};
