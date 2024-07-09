import { forwardRef, useImperativeHandle } from "react";
import { storage } from "wxt/storage";

interface WallpaperItem {
  url: string;
  copyright: string;
  copyrightlink: string;
}

type DateString = string;

export interface WallpaperRef {
  next: () => void;
  prev: () => void;
}

const fetchImages = async () => {
  const res = await fetch(
    "https://cdn.jsdelivr.net/gh/asvow/bing-wallpaper@main/bing.json"
  );
  const data = (await res.json()) as Record<string, WallpaperItem>;
  return data;
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
  const [wallpapers, setWallpapers] = useState<Record<
    DateString,
    WallpaperItem
  > | null>(null);
  const [date, setDate] = useState<DateString | null>(null);

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

    fetchImages().then((images) => {
      setWallpapers(images);
    });
  }, []);

  const dates = Object.keys(wallpapers || {});
  const length = dates.length;

  useImperativeHandle(ref, () => ({
    prev() {
      if (!wallpapers || !date) return;
      const index = dates.indexOf(date);
      setDateString(dates[(index + 1) % length]);
    },
    next() {
      if (!wallpapers || !date) return;
      const index = dates.indexOf(date);
      setDateString(dates[(index - 1 + length) % length]);
    },
  }));

  if (!wallpapers || !date) return;

  const currentWallpaper = wallpapers[date];

  return (
    <div className="absolute inset-0">
      {currentWallpaper && (
        <>
          <img
            className="w-full h-full object-cover"
            src={currentWallpaper.url}
            alt={currentWallpaper.copyright}
          />
          <div>
            <div className="absolute bottom-0 right-0 p-4 bg-opacity-50 text-white text-right [text-shadow:_0_0_4px_rgb(0_0_0)]">
              <a
                href={currentWallpaper.copyrightlink}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs"
              >
                {currentWallpaper.copyright}
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default Wallpaper;
