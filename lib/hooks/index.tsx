import { useEffect, useCallback } from "react";

export const useDebounce = (
  callback: () => Promise<void>,
  delay: number,
  value: string
) => {
  const debouncedCallback = useCallback(
    () => callback().then((res) => res),
    [value]
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedCallback();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedCallback, delay]);
};
