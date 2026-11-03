import { siteConfig } from "@/data/site";

/**
 * Per-page <title> and description. React 19 hoists these tags into <head>
 * wherever they are rendered, so no extra library is needed.
 */
export function PageMeta({ title, description = siteConfig.description, noIndex = false }) {
  const fullTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} | ${siteConfig.tagline}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </>
  );
}
