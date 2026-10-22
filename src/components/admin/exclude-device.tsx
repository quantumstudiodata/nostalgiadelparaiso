"use client";

import { useEffect } from "react";
import { forgetDeviceVisits } from "@/app/actions/stats";
import { NO_TRACK_KEY, VISITOR_KEY } from "@/components/site/page-tracker";

/**
 * Team devices don't count in the statistics: opening the panel marks this browser so its visits to the
 * site are not recorded, and removes the ones recorded before.
 */
export function ExcludeDevice() {
  useEffect(() => {
    let visitorId = "";
    try {
      localStorage.setItem(NO_TRACK_KEY, "1");
      visitorId = localStorage.getItem(VISITOR_KEY) ?? "";
    } catch {}
    if (visitorId) forgetDeviceVisits(visitorId).catch(() => {});
  }, []);

  return null;
}
