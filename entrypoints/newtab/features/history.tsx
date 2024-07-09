import { createFeature } from "../coreStore";
import { History } from "webextension-polyfill";

const historyFeature = createFeature({
  name: "历史记录",
  id: "history",
  enabled: false,
  render: () => {
    const [history, setHistory] = useState<History.HistoryItem[]>([]);

    const main = async () => {
      // 检查是否有权限
      const permission = await browser.permissions.contains({
        permissions: ["history"],
      });

      if (!permission) {
        // 请求权限
        const granted = await browser.permissions.request({
          permissions: ["history"],
        });

        if (!granted) {
          return;
        }
      }

      // 获取历史记录
      const history = await browser.history.search({
        text: "",
        maxResults: 20,
      });

      setHistory(history);
    };

    useEffect(() => {
      main();
    }, []);

    return (
      <div className="absolute isolate flex inset-0 flex-col">
        <h1>最近常用</h1>
        <ul>
          {history.map((item) => {
            return <li key={item.id}>{item.title}</li>;
          })}
        </ul>
      </div>
    );
  },
});

export default historyFeature;
