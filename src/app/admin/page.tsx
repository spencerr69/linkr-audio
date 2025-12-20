"use client";

import React, {useEffect, useState} from "react";
import {attemptLogin} from "@/lib/auth";

const useAuth = (): [
  boolean,
  React.Dispatch<React.SetStateAction<string | null>>,
] => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      attemptLogin(token).then((r) => {
        r && setIsAuthenticated(true);
      });
    }
  }, [token]);

  return [isAuthenticated, setToken];
};

export default function AdminPage() {
  const [isAuthenticated, setToken] = useAuth();

  return isAuthenticated ? (
    <div>Admin</div>
  ) : (
    <main className={"flex justify-center content-center"}>
      <div className="loginContainer flex flex-col h-screen min-h-screen">
        <h1>Login</h1>
        <form
          // onSubmit={e => e.preventDefault()}
          id={"loginform"}
          action={(data) => {
            const id = data.get("artistid");
            const pw = data.get("password");
            if (id && pw) {
              const token = btoa(`${id.toString()}:${pw.toString()}`);
              setToken(token);
            }
          }}
        >
          <input form={"loginform"} type="text" name={"artistid"} />
          <input form={"loginform"} type="password" name={"password"} />
          <button form={"loginform"}>Submit</button>
        </form>
      </div>
    </main>
  );
}
