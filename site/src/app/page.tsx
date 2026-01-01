"use client";

import { ExternalButton } from "@/app/ui/Button";
import Image from "next/image";
import posthog from "posthog-js";

export default function Page() {
  return (
    <div className={""}>
      <header
        className={
          "fixed top-0 w-full flex  justify-center font-sans text-white"
        }
      >
        <div className={"flex align-middle items-center w-6xl justify-between"}>
          <div className={"flex align-middle items-center "}>
            <Image
              src={"/linkraudio.svg"}
              alt={"linkr.audio"}
              height={100}
              width={100}
              draggable={false}
            />
            <h3 className={" align-middle font-bold  text-3xl "}>
              linkr.audio
            </h3>
          </div>
          <div>
            <ExternalButton
              secondary
              href={"/apply"}
              className={"m-2"}
              onClick={() => posthog.capture("apply_button_clicked")}
            >
              Apply
            </ExternalButton>
            <ExternalButton
              href={"/admin"}
              className={"m-2 "}
              style={{
                borderColor: "white",
              }}
              onClick={() => posthog.capture("homepage_login_clicked")}
            >
              Log In
            </ExternalButton>
          </div>
        </div>
      </header>
      <div className={"h-[90vh] bg-blue-500"}></div>
      <div className={"recentreleases"}></div>
    </div>
  );
}
