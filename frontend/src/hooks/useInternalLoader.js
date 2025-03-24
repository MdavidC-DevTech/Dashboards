// src/hooks/useInternalLoader.js
import { useState, useCallback } from "react";

const useInternalLoader = () => {
  const [internalLoading, setInternalLoading] = useState(false);

  const runWithLoader = useCallback(async (fn) => {
    setInternalLoading(true);
    try {
      await fn();
    } finally {
      setInternalLoading(false);
    }
  }, []);

  return { internalLoading, runWithLoader };
};

export default useInternalLoader;
