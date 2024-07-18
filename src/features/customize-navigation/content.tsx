import MainContextMenu, {
  getContextMenu,
  MenuItem,
} from "@/components/main-context-menu";
import NavItem from "@/components/nav-item";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AddLinkModal from "./addDialog";
import { cn } from "@/lib/utils";
import { useModal } from "@ebay/nice-modal-react";
import { PlusIcon } from "@radix-ui/react-icons";

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

  const fetchUrls = async () => {
    const res = await fetch("/api/links").then((res) => res.json());
    setUrls(res.data);
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const contextMenu = useMemo<MenuItem | null>(
    () => getContextMenu("customizeNavigationEditingMode", globalMenuItems),
    [globalMenuItems]
  );

  // 是否编辑模式
  const isEditing = !!contextMenu?.checked;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (!contextMenu) {
        return;
      }
      console.log("click outside", isEditing);

      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        isEditing
      ) {
        updateMenuItem("customizeNavigationEditingMode", {
          ...contextMenu,
          checked: false,
        });
      }
    },
    [contextMenu, isEditing, updateMenuItem]
  );

  useEffect(() => {
    const mainContent = document.querySelector(".main-content") as HTMLElement;
    mainContent?.addEventListener("click", handleClickOutside);
    return () => {
      mainContent?.removeEventListener("click", handleClickOutside);
    };
  }, [handleClickOutside]);

  const addLinkmodal = useModal(AddLinkModal);

  return (
    <div
      ref={contentRef}
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
                      fetch(`/api/links?id=${item.id}`, {
                        method: "DELETE",
                      }).then(() => {
                        fetchUrls();
                      });
                    },
                  },
                  {
                    type: "item",
                    label: "编辑",
                    inset: true,
                    onSelect: () => {
                      addLinkmodal
                        .show(item)
                        .then(() => {
                          fetchUrls();
                        })
                        .catch(() => {
                          alert("编辑失败");
                        });
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
            <NavItem
              onClick={() => {
                addLinkmodal
                  .show()
                  .then(() => {
                    fetchUrls();
                  })
                  .catch(() => {
                    alert("添加失败");
                  });
              }}
              title="添加"
              icon={<PlusIcon className="w-6 h-6" />}
              isEditing={isEditing}
            />
          </li>
        )}
      </ul>
    </div>
  );
};
