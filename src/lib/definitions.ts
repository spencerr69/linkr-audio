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
  token: string;
  artistId: string;
};
