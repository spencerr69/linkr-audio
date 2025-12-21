import Link from "next/link";

const classes =
  "bg-rose-500    rounded-md  hover:text-rose-500 border-2" +
  " border-rose-500 cursor-pointer";

const getClasses = (inline: boolean, secondary: boolean) => {
  let inner_classes = inline
    ? classes + " px-4 -translate-y-2"
    : classes + " p-1 px-6";

  inner_classes = secondary
    ? inner_classes +
      " bg-white text-rose-500 hover:bg-rose-500 hover:text-white"
    : inner_classes + " bg-rose-500 text-white hover:bg-white";
  return inner_classes;
};

interface ButtonProps extends React.ComponentProps<"button"> {
  inline?: boolean;
  secondary?: boolean;
}

interface ExternalButtonProps extends React.ComponentProps<typeof Link> {
  inline?: boolean;
  secondary?: boolean;
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      className={
        getClasses(!!props.inline, !!props.secondary) + " " + props.className
      }
      type={"button"}
      {...props}
    >
      {props.children}
    </button>
  );
};

export const ExternalButton = (props: ExternalButtonProps) => {
  return (
    <Link
      className={
        getClasses(!!props.inline, !!props.secondary) + " " + props.className
      }
      {...props}
    />
  );
};
