"use server";

import { prisma } from "@/lib/prisma";
import { requireWriter } from "@/lib/permissions";

/** Removes the visits recorded from this device (the team's own browsing) from the statistics. */
export async function forgetDeviceVisits(visitorId: string) {
  await requireWriter();
  const id = visitorId.slice(0, 64);
  if (!id) return 0;
  const { count } = await prisma.pageView.deleteMany({ where: { visitorId: id } });
  return count;
}
