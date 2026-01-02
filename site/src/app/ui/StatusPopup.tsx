import { StylingContext } from "@/app/ui/StylingProvider";
import { useContext, useEffect, useState } from "react";

export type StatusState = {
  message: string;
  show: boolean;
};

export const useStatus = (): [StatusState, (message: string) => void] => {
  const [status, setStatus] = useState<StatusState>({
    message: "",
    show: false,
  });

  useEffect(() => {
    setTimeout(() => {
      setStatus((old) => {
        return {
          ...old,
          show: false,
        } as StatusState;
      });
    }, 5000);
  }, [status]);

  const updateStatus = (message: string) => {
    setStatus({
      message,
      show: true,
    });
  };

  return [status, updateStatus];
};

export const StatusPopup = ({ status }: { status: StatusState }) => {
  const styling = useContext(StylingContext);

  return (
    <>
      <p
        className={
          "text-right font-sans  rounded-md p-4 m-4 absolute right-0 bottom-0 duration-200"
        }
        style={{
          backgroundColor: styling.colours.accent || "",
          color: styling.colours.background || "",
          opacity: status.show ? 100 : 0,
        }}
      >
        {status.message}
      </p>
    </>
  );
};
