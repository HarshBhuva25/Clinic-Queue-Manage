"use client";

import { Dispatch,SetStateAction,useEffect } from "react";

export function useAutoClearMessage(
  message: string | null,
  setMessage: Dispatch<SetStateAction<string | null>>,
  delay = 3500,
) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timeoutId= window.setTimeout(() => {
      setMessage(null);
    }, delay);

   return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, message, setMessage]);
}
