"use client";

// 防抖函数
function debounce(fn: Function, delay: number) {
  let timer: number | null = null;

  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

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

export interface MenuItem {
  id?: string;
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
  disabledShortcut?: boolean;
  checked?: boolean;
  value?: string;
  children?: MenuItem[];
  disabled?: boolean;
  inset?: boolean;
  onSelect?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent> | Event,
    item: MenuItem
  ) => Partial<MenuItem> | void;
}

export const getContextMenu = (
  id: MenuItem["id"],
  contextMenus: MenuItem[]
) => {
  for (const contextMenu of contextMenus) {
    if (contextMenu.id === id) {
      return contextMenu;
    }

    if (contextMenu.children) {
      for (const child of contextMenu.children) {
        if (child.id === id) {
          return child;
        }
      }
    }
  }

  return null;
};

const renderMenuItems = (
  items: MenuItem[],
  isMac: boolean,
  updateMenuItem?: (menuItem: MenuItem) => void
) => {
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
            onClick={(e) => item?.onSelect && item.onSelect(e, item)}
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
            onSelect={(e) => {
              if (item?.onSelect) {
                const res = item.onSelect(e, item);
                if (res) {
                  updateMenuItem &&
                    updateMenuItem({
                      ...item,
                      ...res,
                    });
                }
              }
            }}
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
              {renderMenuItems(item.children!, isMac, updateMenuItem)}
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
            {renderMenuItems(item.children!, isMac, updateMenuItem)}
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
  updateMenuItem,
}: {
  children: React.ReactNode;
  menuItems: MenuItem[];
  updateMenuItem?: (menuItem: MenuItem) => void;
}) => {
  const [isMac, setIsMac] = React.useState(false);

  useEffect(() => {
    setIsMac(/macintosh|mac os x/i.test(navigator?.userAgent || ""));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();

      const { metaKey, shiftKey, ctrlKey, altKey, key } = event;

      const checkShortcut = (item: MenuItem) => {
        if (item.shortcut && item.disabledShortcut !== true) {
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
            debounce(() => {
              item.onSelect && item.onSelect(event, item);
            }, 100)();
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
  }, [menuItems, updateMenuItem]);

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {renderMenuItems(menuItems, isMac, updateMenuItem)}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MainContextMenu;
