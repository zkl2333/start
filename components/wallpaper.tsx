import { forwardRef, useImperativeHandle } from "react";

const bingUrl =
  "https://cn.bing.com/HPImageArchive.aspx?format=js&n=8&uhd=1&uhdwidth=3840&uhdheight=2160";

interface WallpaperItem {
  url: string;
}

export interface WallpaperRef {
  next: () => void;
  prev: () => void;
}

const Wallpaper = forwardRef<WallpaperRef>((_, ref) => {
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch(bingUrl)
      .then((res) => res.json())
      .then((data) => {
        setWallpapers(data.images);
      });
  }, []);

  useImperativeHandle(ref, () => ({
    next() {
      console.log("next");
      setIndex((index) => (index + 1) % wallpapers.length);
    },
    prev() {
      console.log("prev");
      setIndex((index) => (index - 1 + wallpapers.length) % wallpapers.length);
    },
  }));

  useEffect(() => {
    console.log("index", index);
  }, [index]);

  return (
    <div className="absolute inset-0">
      {wallpapers[index] && (
        <img
          className="w-full h-full object-cover"
          src={`https://cn.bing.com${wallpapers[index].url}`}
          alt={wallpapers[index].url}
        />
      )}
    </div>
  );
});

export default Wallpaper;
