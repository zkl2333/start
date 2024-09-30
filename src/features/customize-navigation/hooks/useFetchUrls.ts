import { useState, useEffect } from "react";
import { INavItem } from "../types";

const useFetchUrls = () => {
  const [urls, setUrls] = useState<INavItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = async () => {
    try {
      const res = await fetch("/api/links");
      if (!res.ok) throw new Error("网络错误");
      const data = await res.json();
      setUrls(data.data);
    } catch (err: any) {
      setError(err.message || "获取链接失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUrls();
  }, []);

  return { urls, loading, error, refetch: fetchUrls };
};

export default useFetchUrls;
