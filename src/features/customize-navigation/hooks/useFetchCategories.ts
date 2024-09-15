// hooks/useFetchCategories.ts
import { useState, useEffect } from "react";
import { ICategory } from "../types";
import { getCategorys } from "../actions";

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

  return { categories, loading, error };
};

export default useFetchCategories;
