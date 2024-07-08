import { forwardRef, useImperativeHandle } from "react";
import { storage } from "wxt/storage";

interface WallpaperItem {
  startdate: string;
  fullstartdate: string;
  enddate: string;
  url: string;
  urlbase: string;
  copyright: string;
  copyrightlink: string;
  title: string;
}

export interface WallpaperRef {
  next: () => void;
  prev: () => void;
}

const fetchImages = async (idx: number, n: number) => {
  const res = await fetch(
    `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=${idx}&n=${n}&uhd=1&uhdwidth=3840&uhdheight=2160&mkt=zh-CN`
  );
  const data = await res.json();
  return data.images;
};

const fetchAllImages = async () => {
  const images1 = await fetchImages(0, 7);
  const images2 = await fetchImages(8, 8);
  return images1.concat(images2);
};

const getTodayDate = () => {
  const date = new Date();
  return (
    date.getFullYear() +
    "" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    date.getDate().toString().padStart(2, "0")
  );
};

const Wallpaper = forwardRef<WallpaperRef>((_, ref) => {
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [date, setDate] = useState<string | null>(null);

  const setDateString = async (date: string) => {
    storage.setItem("sync:wallpaperDate", date);
    setDate(date);
  };

  useEffect(() => {
    storage.getItem<string>("sync:wallpaperDate").then((date) => {
      if (date) {
        setDate(date);
      } else {
        setDate(getTodayDate());
      }
    });

    fetchAllImages().then((images) => {
      setWallpapers(images);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    prev() {
      const index = wallpapers.findIndex((image) => image.enddate === date);
      const nextIndex = (index + 1) % wallpapers.length;
      setDateString(wallpapers[nextIndex].enddate);
    },
    next() {
      const index = wallpapers.findIndex((image) => image.enddate === date);
      const prevIndex = (index - 1 + wallpapers.length) % wallpapers.length;
      setDateString(wallpapers[prevIndex].enddate);
    },
  }));

  const currentWallpaper =
    wallpapers.find((image) => image.enddate === date) || wallpapers[0];

  return (
    <div className="absolute inset-0">
      {currentWallpaper && (
        <>
          <img
            className="w-full h-full object-cover"
            src={`https://cn.bing.com${currentWallpaper.url}`}
            alt={currentWallpaper.url}
          />
          <div>
            <div className="absolute bottom-0 right-0 p-4 bg-opacity-50 text-white text-right [text-shadow:_0_0_4px_rgb(0_0_0)]">
              <div className="text-sm">
                {currentWallpaper.title} - {currentWallpaper.enddate}
              </div>
              <div className="text-xs">{currentWallpaper.copyright}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default Wallpaper;
