import React from "react";
import { Responsive, WidthProvider, Layouts, Layout } from "react-grid-layout";
import MainContextMenu, { MenuItem } from "@/components/main-context-menu";
import NavItem from "./nav-item";
import { INavItem } from "../types";
import { PlusIcon } from "@radix-ui/react-icons";
import { useModal } from "@ebay/nice-modal-react";
import AddLinkModal from "../addDialog";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface NavGridProps {
  urls: INavItem[];
  isEditing: boolean;
  layouts: Layouts;
  onLayoutChange: (currentLayout: Layout[], allLayouts: Layouts) => void;
  getContextMenuItems: (item: INavItem) => MenuItem[];
  updateMenuItem: (id: string, contextMenu: MenuItem) => void;
  fetchUrls: () => void;
  breakpoints: Record<string, number>;
  cols: Record<string, number>;
}

const NavGrid: React.FC<NavGridProps> = ({
  urls,
  isEditing,
  layouts,
  onLayoutChange,
  getContextMenuItems,
  updateMenuItem,
  fetchUrls,
  breakpoints,
  cols,
}) => {
  const addLinkModal = useModal(AddLinkModal);
  const [breakpoint, setBreakpoint] = React.useState("lg");

  const getGridData = (id: string) => {
    const layout = layouts[breakpoint];
    const data = layout.find((item) => item.i === id);
    return data;
  };

  return (
    <>
      <ResponsiveGridLayout
        className="layout"
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={100}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={onLayoutChange}
        compactType="horizontal"
        onBreakpointChange={(newBreakpoint) => setBreakpoint(newBreakpoint)}
      >
        {urls.map((item) => (
          <div
            key={item.id}
            className="hover:bg-gray-300/10 hover:backdrop-blur-sm rounded-xl"
            data-grid={layouts && getGridData(item.id)}
          >
            <MainContextMenu
              menuItems={getContextMenuItems(item)}
              updateMenuItem={(menuItem) =>
                menuItem.id && updateMenuItem(menuItem.id, menuItem)
              }
            >
              <NavItem item={item} isEditing={isEditing} />
            </MainContextMenu>
          </div>
        ))}
      </ResponsiveGridLayout>
      <div>
        {isEditing && (
          <div
            key="add-button"
            className="bg-gray-300/10 hover:backdrop-blur-sm rounded-xl w-20 p-2 m-4 text-gray-200 flex items-center justify-center cursor-pointer"
          >
            <PlusIcon className="w-6 h-6" />
            <div
              onClick={() => {
                addLinkModal
                  .show()
                  .then(() => {
                    fetchUrls();
                  })
                  .catch(() => {
                    alert("添加失败");
                  });
              }}
            >
              添加
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NavGrid;
