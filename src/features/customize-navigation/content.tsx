import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import NavItem from "@/components/nav-item";
import { useState, useEffect } from "react";
import AddLinkBtn from "./addDialog";

export const Content = ({
  globalMenuItems,
}: {
  globalMenuItems: MenuItem[];
}) => {
  const [urls, setUrls] = useState<
    {
      id: string;
      url: string;
      title?: string;
    }[]
  >([]);

  const main = async () => {
    const res = await fetch("/api/links").then((res) => res.json());

    setUrls(res.data);
  };

  useEffect(() => {
    main();
  }, []);

  // 是否编辑模式
  const [isEditing, setIsEditing] = useState(false);
  // 内网模式
  const [isIntranet, setIsIntranet] = useState(false);

  const menuItems = [
    {
      type: "checkbox",
      label: "编辑模式",
      shortcut: ["alt", "e"],
      checked: isEditing,
      onSelect: () => {
        setIsEditing(!isEditing);
      },
    },
    {
      type: "checkbox",
      label: "内网模式",
      shortcut: ["alt", "a"],
      inset: true,
      checked: isIntranet,
      onSelect: () => {
        setIsIntranet(!isIntranet);
      },
    },
    {
      type: "separator",
    },
    ...globalMenuItems,
  ] as MenuItem[];

  return (
    <div className="p-2 min-h-[19rem]">
      <MainContextMenu menuItems={menuItems}>
        <ul className="flex flex-wrap justify-center">
          {urls.map((item) => {
            return (
              <li key={item.url}>
                <MainContextMenu
                  menuItems={[
                    {
                      type: "item",
                      label: "删除",
                      inset: true,
                      onSelect: async () => {
                        await fetch(`/api/links?id=${item.id}`, {
                          method: "DELETE",
                        });
                        main();
                      },
                    },
                    ...menuItems,
                  ]}
                >
                  <NavItem url={item.url} title={item.title || ""} />
                </MainContextMenu>
              </li>
            );
          })}
          {isEditing && (
            <li>
              <AddLinkBtn onReload={main} />
            </li>
          )}
        </ul>
      </MainContextMenu>
    </div>
  );
};
