import { getSiteBlock } from "@/lib/site-blocks";

export type SocialLinks = { instagram: string; tiktok: string; facebook: string };

export async function getSocialLinks(): Promise<SocialLinks> {
  const fields = await getSiteBlock<Partial<SocialLinks>>("site.social");
  return {
    instagram: fields.instagram ?? "",
    tiktok: fields.tiktok ?? "",
    facebook: fields.facebook ?? "",
  };
}
