"use server";

import {apiDomain} from "./utils";

export const attemptLogin = async (b64Token: string): Promise<boolean> => {
    "use server";
    const loginResp = await fetch(`${apiDomain}/auth/login`, {
        method: "GET",
        headers: {
            "Authorization": `Basic ${b64Token}`
        }
    })
    console.log(loginResp.ok)
    return loginResp.ok;
}
