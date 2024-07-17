import { cn } from "@/lib/utils";
import { useCoreStore } from "@/providers/core-store-provider";
import { createFeature } from "@/stores/core-store";
import { useState, useEffect } from "react";

const getTime = () => {
  const date = new Date();
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const Content = () => {
  const hasImage = useCoreStore((state) =>
    state.features.some((f) => f.id === "wallpaper" && f.enabled)
  );

  const [time, setTime] = useState(getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTime());
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={cn("select-none font-mono text-7xl sm:text-9xl text-center", {
        "text-shadow": hasImage,
        "text-white": hasImage,
      })}
    >
      {time}
    </div>
  );
};

const clock = createFeature({
  name: "时钟",
  id: "clock",
  enabled: true,
  content: Content,
});

export default clock;
