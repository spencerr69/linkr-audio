export const FormField = ({
  name,
  label,
  value,
  button,
  inactive = false,
  valueUpdater,
}: {
  name: string;
  label: string;
  value: string;
  button?: React.JSX.Element;
  inactive?: boolean;
  valueUpdater?: (value: string) => void;
}) => {
  return (
    <div
      // key={uuidv4()}
      className={
        "p-1 flex flex-col w-full pb-0 mb-2 border-dashed " +
        (inactive ? "bg-gray-100" : " border-b")
      }
    >
      <label
        className={"text-gray-500 font-light text-sm p-0 m-0"}
        htmlFor={name}
      >
        {label}
      </label>
      <div className={"flex "}>
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          contentEditable={!inactive}
          disabled={inactive}
          className={
            "flex-2  focus:outline-0 " + (inactive ? "text-gray-400" : "")
          }
          onInput={(e) => valueUpdater && valueUpdater(e.currentTarget.value)}
        />
        {button}
      </div>
    </div>
  );
};
