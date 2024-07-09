import { createFeature } from "../coreStore";
import { TopSites } from "webextension-polyfill";

const topSitesFeature = createFeature({
  name: "常用网址",
  id: "topSites",
  enabled: false,
  render: () => {
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

    function faviconURL(u: string) {
      // @ts-ignore
      const url = new URL(browser.runtime.getURL("/_favicon/"));
      url.searchParams.set("pageUrl", u);
      url.searchParams.set("size", "32");
      return url.toString();
    }

    return (
      <div className="absolute isolate flex inset-0 flex-col">
        <ul className="container mt-[40vh] flex flex-wrap bg-gray-200/50 rounded-md p-4">
          {urls.map((item) => {
            return (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex flex-col items-center gap-2 justify-center hover:bg-gray-300/60 rounded-md w-24 h-24"
                >
                  <img src={faviconURL(item.url)} alt="" className="w-12 h-12" />
                  <div className="text-sm text-gray-800 truncate w-full text-center">
                    {item.title}
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  },
});

export default topSitesFeature;
