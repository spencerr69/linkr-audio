"use client";

import React from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

type ColourPickerProps = {
  value: string;
  valueUpdaterAction: (value: string) => void;
};

export const ColourPicker = ({
  value,
  valueUpdaterAction,
}: ColourPickerProps) => {
  const [colour, setColour] = useColor(value);

  return (
    <>
      <Popover>
        <PopoverButton
          style={{
            backgroundColor: `${value}`,
          }}
          className={"w-4 h-4 rounded-full border border-black cursor-pointer"}
        ></PopoverButton>
        <PopoverPanel anchor={"bottom end"} className={"absolute"}>
          <div>
            <ColorPicker
              hideInput={["hsv", "rgb"]}
              hideAlpha
              color={colour}
              onChange={setColour}
              onChangeComplete={(value) => valueUpdaterAction(value.hex)}
            />
          </div>
        </PopoverPanel>
      </Popover>
    </>
  );
};
