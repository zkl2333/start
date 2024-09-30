import { useState, useEffect } from "react";
import { getCategorys } from "../actions";
import { ICategory } from "@/lib/category";

const useFetchCategories = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const data = await getCategorys();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "获取分类失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const reload = () => {
    setLoading(true);
    fetchCategories();
  };

  return { categories, loading, error, reload };
};

export default useFetchCategories;
