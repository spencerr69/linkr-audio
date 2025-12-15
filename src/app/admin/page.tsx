"use client";

import React, {useEffect, useState} from "react";
import {apiDomain} from "@/lib/utils";

const api_url = "https://sr-api.aletrispinkroot.workers.dev";


const useAuth = (): [boolean, React.Dispatch<React.SetStateAction<string | null>>] => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setToken(token)

        if (window !== undefined) {
            if (token) {
                fetch(`${apiDomain}/auth/login`, {
                    method: "GET",
                    headers: {
                        Authorization: `Basic ${token}`
                    }
                }).then(r => setIsAuthenticated(r.ok))
            }
        }
    }, [token]);
    return [isAuthenticated, setToken];
}

const attemptLogin = async (artistId: string, pw: string): Promise<boolean> => {
    const loginResp = await fetch(`${api_url}/auth/login`, {
        method: "GET",
        headers: {
            "Authorization": `Basic ${btoa(`${artistId}:${pw}`)}`
        }
    })
    console.log(loginResp.ok)
    return loginResp.ok;
}

export default function AdminPage() {
    const [isAuthenticated, setToken] = useAuth();

    return isAuthenticated ? <div>Admin</div> : <main className={"flex justify-center content-center"}>
        <div className="loginContainer flex flex-col h-screen min-h-screen">
            <h1>Login</h1>
            <form
                // onSubmit={e => e.preventDefault()}
                id={"loginform"} action={
                (data) => {
                    console.log(data);
                    const id = data.get("artistid");
                    const pw = data.get("password");
                    console.log(id, pw);
                    if (id && pw)
                        attemptLogin(id.toString(), pw.toString()).then(r => r && setToken(btoa(`${id.toString}:${pw.toString()}`)))
                }
            }>
                <input form={"loginform"} type="text" name={"artistid"}/>
                <input form={"loginform"} type="password" name={"password"}/>
                <button form={"loginform"}>Submit</button>
            </form>
        </div>
    </main>;
}