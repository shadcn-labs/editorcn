"use client";

import { useEffect, useRef, useState } from "react";

export const usePresence = (open: boolean, duration: number): boolean => {
  const [mounted, setMounted] = useState(open);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
      setMounted(true);
      return;
    }

    timer.current = setTimeout(() => {
      setMounted(false);
      timer.current = null;
    }, duration);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [duration, open]);

  return mounted;
};
