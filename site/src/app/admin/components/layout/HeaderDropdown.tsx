import { logout } from "@/app/actions/auth";
import { HeaderLink } from "@/app/admin/components/layout/HeaderLink";
import { ChangePasswordDialog } from "@/app/ui/Dialogs/ChangePasswordDialog";
import { StylingContext } from "@/app/ui/StylingProvider";
import {
  MenuButton,
  MenuItems,
  MenuSeparator,
  Menu,
  MenuItem,
} from "@headlessui/react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  AnchorHTMLAttributes,
  DetailedHTMLProps,
  useContext,
  useState,
} from "react";

export const HeaderDropdown = () => {
  const styling = useContext(StylingContext);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <>
      <Menu>
        <MenuButton as={HeaderLink} href={"#"}>
          <MoreHorizIcon fontSize={"large"} />
        </MenuButton>
        <MenuItems
          className={
            " absolute top-22 right-5 shadow-lg shadow-black/50 rounded-md z-20"
          }
          style={{
            backgroundColor: styling.colours.background,
            color: styling.colours.foreground,
          }}
        >
          <div className={"w-full flex flex-col"}>
            <MenuItem>
              <MenuA
                onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
              >
                Change Password
              </MenuA>
            </MenuItem>
            <MenuSeparator
              className={"border-b-2 border-accent"}
              style={{
                borderColor: `${styling.colours.background}22`,
              }}
            />
            <MenuItem>
              <MenuA onClick={logout}>Log out</MenuA>
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};

const MenuA = ({
  className,
  onMouseEnter,
  onMouseLeave,
  style,
  ...rest
}: DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>) => {
  const styling = useContext(StylingContext);

  return (
    <a
      className={"w-full cursor-pointer p-2  " + className}
      style={{
        ...style,
        backgroundColor: `transparent`,
        color: `${styling.colours.foreground}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${styling.colours.accent}AA`;
        e.currentTarget.style.color = `${styling.colours.background}`;
        if (onMouseEnter) {
          onMouseEnter(e);
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `transparent`;
        e.currentTarget.style.color = `${styling.colours.foreground}`;
        if (onMouseLeave) {
          onMouseLeave(e);
        }
      }}
      {...rest}
    ></a>
  );
};
