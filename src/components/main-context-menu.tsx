import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import React, { useEffect } from "react";

// const isMac = /macintosh|mac os x/i.test(navigator?.userAgent || "");
const isMac = false;

export interface MenuItem {
  type:
    | "item"
    | "checkbox"
    | "radio"
    | "separator"
    | "sub"
    | "label"
    | "radioGroup";
  label?: React.ReactNode;
  shortcut?: Array<"meta" | "shift" | "ctrl" | "alt" | string>;
  checked?: boolean;
  value?: string;
  children?: MenuItem[];
  disabled?: boolean;
  inset?: boolean;
  onSelect?: () => void;
}

const renderMenuItems = (items: MenuItem[]) => {
  return items.map((item, index) => {
    const shortcut = item.shortcut
      ?.map((key) => {
        switch (key) {
          case "meta":
            return isMac ? "⌘" : "⊞";
          case "shift":
            return "⇧";
          case "ctrl":
            return isMac ? "⌃" : "Ctrl";
          case "alt":
            return isMac ? "⌥" : "Alt";
          default:
            return key.toUpperCase();
        }
      })
      .join("+");

    switch (item.type) {
      case "item":
        return (
          <ContextMenuItem
            key={index}
            inset={item.inset}
            disabled={item.disabled}
            onSelect={item.onSelect}
          >
            {item.label}
            {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
          </ContextMenuItem>
        );
      case "checkbox":
        return (
          <ContextMenuCheckboxItem
            key={index}
            checked={item.checked}
            onSelect={item.onSelect}
          >
            {item.label}
            {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
          </ContextMenuCheckboxItem>
        );
      case "radio":
        return (
          <ContextMenuRadioItem key={index} value={item.value!}>
            {item.label}
          </ContextMenuRadioItem>
        );
      case "separator":
        return <ContextMenuSeparator key={index} />;
      case "sub":
        return (
          <ContextMenuSub key={index}>
            <ContextMenuSubTrigger inset={item.inset}>
              {item.label}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {renderMenuItems(item.children!)}
            </ContextMenuSubContent>
          </ContextMenuSub>
        );
      case "label":
        return (
          <ContextMenuLabel key={index} inset={item.inset}>
            {item.label}
          </ContextMenuLabel>
        );
      case "radioGroup":
        return (
          <ContextMenuRadioGroup key={index} value={item.value!}>
            <ContextMenuLabel inset>{item.label}</ContextMenuLabel>
            <ContextMenuSeparator />
            {renderMenuItems(item.children!)}
          </ContextMenuRadioGroup>
        );
      default:
        return null;
    }
  });
};

const MainContextMenu = ({
  children,
  menuItems,
}: {
  children: React.ReactNode;
  menuItems: MenuItem[];
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { metaKey, shiftKey, ctrlKey, altKey, key } = event;

      const checkShortcut = (item: MenuItem) => {
        if (item.shortcut) {
          const keys = item.shortcut;
          const meta = keys.includes("meta") === metaKey;
          const shift = keys.includes("shift") === shiftKey;
          const ctrl = keys.includes("ctrl") === ctrlKey;
          const alt = keys.includes("alt") === altKey;
          const k = keys.find(
            (k) => !["meta", "shift", "ctrl", "alt"].includes(k)
          );

          if (
            meta &&
            shift &&
            ctrl &&
            alt &&
            k?.toLowerCase() === key.toLowerCase()
          ) {
            item.onSelect && item.onSelect();
          }
        }

        if (item.children) {
          item.children.forEach(checkShortcut);
        }
      };

      menuItems.forEach(checkShortcut);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuItems]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {renderMenuItems(menuItems)}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MainContextMenu;
