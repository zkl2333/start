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

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableItem(props: {
  id: string;
  children: React.ReactNode;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, disabled: props.disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn({
        "opacity-50 pointer-events-none": isDragging,
      })}
    >
      {props.children}
    </div>
  );
}

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = urls.findIndex((item) => item.id === active.id);
      const newIndex = urls.findIndex((item) => item.id === over.id);

      const newUrls = arrayMove(urls, oldIndex, newIndex);
      setUrls(newUrls);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={urls} strategy={rectSortingStrategy}>
        <div
          ref={contentRef}
          className={cn("p-2 min-h-[19rem]", {
            "bg-gray-100/20 rounded-3xl": isEditing,
          })}
        >
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))]">
            {urls.map((item) => {
              return (
                <SortableItem key={item.id} id={item.id} disabled={!isEditing}>
                  <li>
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
                </SortableItem>
              );
            })}
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
      </SortableContext>
    </DndContext>
  );
};
