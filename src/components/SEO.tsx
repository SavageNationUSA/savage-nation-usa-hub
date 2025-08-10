import { Helmet } from "react-helmet-async";
import { useMemo } from "react";

type SEOProps = {
  title: string;
  description?: string;
  path?: string;
  structuredData?: Record<string, unknown>;
};

export const SEO = ({ title, description, path, structuredData }: SEOProps) => {
  const canonical = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = path ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    return `${origin}${pathname}`;
  }, [path]);

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
};
