"use client";

import { useEffect } from "react";
import { trpc } from "@/trpc/client";

export function HelpzenIdentify() {
  const { data: me } = trpc.user.me.useQuery(undefined, {
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!me?.email) return;
    const w = window as unknown as { Helpzen?: { identify: (email: string, name: string) => void } };
    function tryIdentify() {
      if (w.Helpzen) {
        w.Helpzen.identify(me.email, me.name || "");
      } else {
        setTimeout(tryIdentify, 1000);
      }
    }
    tryIdentify();
  }, [me?.email, me?.name]);

  return null;
}
