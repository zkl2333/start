import ogs, { ErrorResult, SuccessResult } from "open-graph-scraper";
import { resolve } from "url";
import * as cheerio from "cheerio";

const userAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";

export interface ISiteMeta {
  title: string;
  description: string;
  url: string;
  ogImage?: SuccessResult["result"]["ogImage"];
  twitterImage?: SuccessResult["result"]["twitterImage"];
  image?: { url: string; width?: number; height?: number };
  favicon?: string;
  favicon_32?: string;
  touchIcons?: string;
  touchIconsPrecomposed?: string;
  itempropImage?: string;
}

const getMoreIcon = (html: string) => {
  const $ = cheerio.load(html);
  const touchIcons = $("link[rel='apple-touch-icon']");
  const touchIconsPrecomposed = $("link[rel='apple-touch-icon-precomposed']");
  const itempropImage = $("meta[itemprop='image']");
  const favicon_32 = $("link[rel='icon'][sizes='32x32']");

  return {
    touchIcons: touchIcons.attr("href"),
    touchIconsPrecomposed: touchIconsPrecomposed.attr("href"),
    itempropImage: itempropImage.attr("content"),
    favicon_32: favicon_32.attr("href"),
  };
};

// 拼接相对路径
const joinPath = (base: string, path?: string) => {
  if (!path) {
    return "";
  }

  return resolve(base, path);
};

// 判断是否为绝对路径
const isAbsolute = (url?: string) => {
  return url?.startsWith("http://") || url?.startsWith("https://");
};

// 获取最好的图片
const getBestImage = (images: SuccessResult["result"]["ogImage"]) => {
  if (!images) {
    return null;
  }

  if (images.length === 1) {
    return images[0];
  }

  // 如果有正方形图片，返回最接近 32 * 32 的图片
  const squareImages = images.filter((image) => image.width === image.height);

  if (squareImages.length) {
    return squareImages.reduce((prev, current) => {
      const prevDiff = Math.abs(prev.width! - 32) + Math.abs(prev.height! - 32);
      const currentDiff =
        Math.abs(current.width! - 32) + Math.abs(current.height! - 32);

      return prevDiff < currentDiff ? prev : current;
    });
  }

  // 返回最接近 32 * 32 的图片
  return images.reduce((prev, current) => {
    const prevDiff = Math.abs(prev.width! - 32) + Math.abs(prev.height! - 32);
    const currentDiff =
      Math.abs(current.width! - 32) + Math.abs(current.height! - 32);

    return prevDiff < currentDiff ? prev : current;
  });
};

const createCardMeta = (requestUrl: string, data: SuccessResult): ISiteMeta => {
  const result = data.result;
  const image = getBestImage(result.ogImage || result.twitterImage);

  const { touchIcons, touchIconsPrecomposed, itempropImage } = getMoreIcon(
    data.html
  );

  const formatUrl = <T extends string | undefined>(url?: T): T => {
    if (!url) {
      return url as T;
    }

    if (url.startsWith("//")) {
      return ("https:" + url) as T;
    }

    return isAbsolute(url) ? url : (joinPath(requestUrl, url) as T);
  };

  return {
    title: result.ogTitle || result.twitterTitle || result.dcTitle || "",
    description:
      result.ogDescription ||
      result.twitterDescription ||
      result.dcDescription ||
      "",
    url: requestUrl,
    ogImage: result.ogImage?.map((image) => ({
      ...image,
      url: formatUrl(image.url),
    })),
    twitterImage: result.twitterImage?.map((image) => ({
      ...image,
      url: formatUrl(image.url),
    })),
    image: { ...image, url: formatUrl(image?.url) },
    favicon: formatUrl(result.favicon),
    touchIcons: formatUrl(touchIcons),
    touchIconsPrecomposed: formatUrl(touchIconsPrecomposed),
    itempropImage: formatUrl(itempropImage),
  };
};

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return Response.json(
      { error: "Missing URL query parameter" },
      { status: 400 }
    );
  }

  const options = {
    url: url,
    fetchOptions: { headers: { "user-agent": userAgent } },
  };

  try {
    const data = await ogs(options);

    if (!data.error) {
      return Response.json(
        {
          success: true,
          result: createCardMeta(url, data),
        },
        {
          headers: {
            "Cache-Control": "max-age=" + 60 * 60 * 24,
          },
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          result: data.result,
        },
        {
          headers: {
            "Cache-Control": "max-age=" + 60 * 60 * 24,
          },
        }
      );
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      return Response.json(
        {
          success: false,
          error: e.message,
        },
        { status: 500 }
      );
    }

    if ((e as ErrorResult)?.result) {
      return Response.json(e, {
        headers: {
          "Cache-Control": "max-age=" + 60 * 60 * 1,
        },
        status: 500,
      });
    }

    return Response.json(
      {
        success: false,
        error: "Unknown error",
      },
      { status: 500 }
    );
  }
}
