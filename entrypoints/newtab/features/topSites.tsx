import NavItem from "@/components/nav-item";
import { createFeature, useCoreStore } from "../coreStore";
import { TopSites } from "webextension-polyfill";

const topSitesFeature = createFeature({
  name: "常用网址",
  id: "topSites",
  enabled: true,
  content: () => {
    const [urls, setUrls] = useState<TopSites.MostVisitedURL[]>([]);

    const main = async () => {
      // 检查是否有权限
      const permission = await browser.permissions.contains({
        permissions: ["topSites"],
      });

      if (!permission) {
        // 请求权限
        const granted = await browser.permissions.request({
          permissions: ["topSites"],
        });

        if (!granted) {
          return;
        }
      }

      const urls = await browser.topSites.get();
      console.log(urls);

      setUrls(urls);
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
  },
});

export default topSitesFeature;
