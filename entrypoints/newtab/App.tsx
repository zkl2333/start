import MainContextMenu, { MenuItem } from "@/components/main-context-menu";

const menuItems: MenuItem[] = [
  {
    type: "item",
    label: "Back",
    shortcut: ['alt', '['],
    inset: true,
    onSelect: () => console.log("Back"),
  },
  {
    type: "item",
    label: "Forward",
    shortcut: ['alt', ']'],
    inset: true,
    disabled: true,
    onSelect: () => console.log("Forward"),
  },
  {
    type: "item",
    label: "Reload",
    shortcut: ['alt', 'r'],
    inset: true,
    onSelect: () => console.log("Reload"),
  },
  {
    type: "sub",
    label: "More Tools",
    inset: true,
    children: [
      {
        type: "item",
        label: "Save Page As...",
        shortcut: ['shift', 'ctrl', 's'],
        onSelect: () => console.log("Save Page As..."),
      },
      {
        type: "item",
        label: "Create Shortcut...",
        onSelect: () => console.log("Create Shortcut..."),
      },
      {
        type: "item",
        label: "Name Window...",
        onSelect: () => console.log("Name Window..."),
      },
      {
        type: "separator",
      },
      {
        type: "item",
        label: "Developer Tools",
        onSelect: () => console.log("Developer Tools"),
      },
    ],
  },
  {
    type: "separator",
  },
  {
    type: "checkbox",
    label: "Show Bookmarks Bar",
    shortcut: ['ctrl', 'shift', 'b'],
    checked: true,
    onSelect: () => console.log("Show Bookmarks Bar"),
  },
  {
    type: "checkbox",
    label: "Show Full URLs",
    onSelect: () => console.log("Show Full URLs"),
  },
  {
    type: "separator",
  },
  {
    type: "radioGroup",
    label: "People",
    value: "pedro", // 默认选中的项
    children: [
      {
        type: "radio",
        label: "Pedro Duarte",
        value: "pedro",
        onSelect: () => console.log("Pedro Duarte"),
      },
      {
        type: "radio",
        label: "Colm Tuite",
        value: "colm",
        onSelect: () => console.log("Colm Tuite"),
      },
    ],
  },
];

function APP() {
  return (
    <MainContextMenu menuItems={menuItems}>
      <div className="relative isolate flex min-h-svh w-full flex-col"></div>
    </MainContextMenu>
  );
}

export default APP;
