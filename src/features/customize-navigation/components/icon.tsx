import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface IIcon {
  url?: string;
  alt?: string;
  wrapper?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}

const keyStr =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

const triplet = (e1: number, e2: number, e3: number) =>
  keyStr.charAt(e1 >> 2) +
  keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
  keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
  keyStr.charAt(e3 & 63);

const rgbDataURL = (r: number, g: number, b: number) =>
  `data:image/gif;base64,R0lGODlhAQABAPAA${
    triplet(0, r, g) + triplet(b, 255, 255)
  }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

const SiteIcon = ({ url, alt, wrapper, icon, active }: IIcon) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-xl overflow-hidden",
        {
          "bg-gray-200/80": loaded && wrapper,
          "outline outline-primary": active,
        }
      )}
    >
      {icon
        ? icon
        : url && (
            <Image
              src={url}
              alt={alt || ""}
              title={alt}
              className={cn("w-full h-full rounded-sm", {
                "w-7 h-7": loaded && wrapper,
              })}
              width={40}
              height={40}
              placeholder="blur"
              blurDataURL={rgbDataURL(216, 218, 221)}
              onLoad={() => setLoaded(true)}
            />
          )}
    </div>
  );
};

export default SiteIcon;
