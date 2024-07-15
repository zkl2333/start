import { createFeature } from "@/app/coreStore";
import NavItem from "@/components/nav-item";
import { useState, useEffect } from "react";

const Content = () => {
  const [urls, setUrls] = useState<
    {
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

  return (
    <div className="p-2">
      <ul className="flex flex-wrap">
        {urls.map((item) => {
          return (
            <li key={item.url}>
              <NavItem url={item.url} title={item.title || ""} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const customizeNavigation = createFeature({
  name: "自定义导航",
  id: "customizeNavigation",
  enabled: true,
  contextMenus: [
    {
      type: "item",
      label: "切换内外网",
      shortcut: ["alt", "a"],
      inset: true,
      onSelect: () => {
        console.log("切换内外网");
      },
    },
  ],
  content: Content,
});

export default customizeNavigation;
