"use client";

import { Button } from "@/app/ui/Button";
import { ApplyDialog } from "@/app/ui/Dialogs/ApplyDialog";
import { useState } from "react";

export function ApplyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className={"m-2"} onClick={() => setOpen(!open)}>
        Apply
      </Button>

      <ApplyDialog isOpen={open} onCloseAction={() => setOpen(!open)} />
    </>
  );
}
