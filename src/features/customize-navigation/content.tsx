import MainContextMenu, {
  getContextMenu,
  MenuItem,
} from "@/components/main-context-menu";
import NavItem from "@/components/nav-item";
import { useState, useEffect } from "react";
import AddLinkBtn from "./addDialog";
import { cn } from "@/lib/utils";

export const Content = ({
  globalMenuItems,
  updateMenuItem,
}: {
  globalMenuItems: MenuItem[];
  updateMenuItem: (id: string, contextMenu: MenuItem) => void;
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
  const isEditing = !!getContextMenu(
    "customizeNavigationEditingMode",
    globalMenuItems
  )?.checked;

  return (
    <div
      className={cn("p-2 min-h-[19rem]", {
        "bg-gray-100/20 rounded-3xl": isEditing,
      })}
    >
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
                    onSelect: () => {
                      fetch(`/api/links/${item.id}`, {
                        method: "DELETE",
                      }).then(() => {
                        main();
                      });
                    },
                  },
                  {
                    type: "item",
                    label: "编辑",
                    inset: true,
                    onSelect: () => {
                      alert("暂未实现");
                    },
                  },
                  {
                    type: "separator",
                  },
                  ...globalMenuItems,
                ]}
                updateMenuItem={(menuItem) =>
                  menuItem.id && updateMenuItem(menuItem.id, menuItem)
                }
              >
                <NavItem
                  url={item.url}
                  title={item.title || ""}
                  isEditing={isEditing}
                />
              </MainContextMenu>
            </li>
          );
        })}
        <li className="w-full"></li>
        {isEditing && (
          <li>
            <AddLinkBtn onReload={main} isEditing={isEditing} />
          </li>
        )}
      </ul>
    </div>
  );
};
