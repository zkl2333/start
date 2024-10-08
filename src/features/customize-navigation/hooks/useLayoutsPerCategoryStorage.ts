import { useEffect, useState } from "react";
import { getLayoutsAction, saveLayoutsAction } from "../actions";
import { Layouts } from "react-grid-layout";

function useLayoutsPerCategoryStorage() {
  const [layoutsPerCategory, _setLayoutsPerCategory] = useState<
    Record<string, Layouts>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLayouts = async () => {
    try {
      const data = await getLayoutsAction();
      _setLayoutsPerCategory(data);
    } catch (err: any) {
      setError(err.message || "获取布局失败");
    } finally {
      setLoading(false);
    }
  };

  const setLayoutsPerCategory = async (layouts: Record<string, Layouts>) => {
    _setLayoutsPerCategory(layouts);
    await saveLayoutsAction(layouts);
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  return {
    layoutsPerCategory,
    setLayoutsPerCategory,
    loading,
    error,
  };
}

export default useLayoutsPerCategoryStorage;
