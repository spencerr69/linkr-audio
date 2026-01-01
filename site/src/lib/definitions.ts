import { components } from "@/lib/schema";
import * as z from "zod";

export const LoginFormSchema = z.object({
  artistid: z.string().trim(),
  password: z.string().trim(),
});

export type LoginFormState =
  | {
      errors?: {
        artistid?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  artistId: string;
};

export enum AdminPages {
  Releases,
  Artist,
}
