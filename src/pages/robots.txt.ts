import type { APIRoute } from "astro";
export const GET: APIRoute = ({ site }) =>
  new Response(
    import.meta.env.RELEASE === "true"
      ? `User-agent: *\nAllow: /\nSitemap: ${new URL(import.meta.env.BASE_URL + "sitemap.xml", site).href}\n`
      : "User-agent: *\nDisallow: /\n",
  );
