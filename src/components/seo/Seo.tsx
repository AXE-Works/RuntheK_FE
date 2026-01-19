import { Helmet } from 'react-helmet-async';
import { SeoProps, JsonLdProps } from '@/lib/seo/types';

function serializeJsonLd(data: JsonLdProps | JsonLdProps[]): string {
  return JSON.stringify(data);
}

export function Seo({
  title,
  description,
  canonical,
  openGraph,
  twitter,
  jsonLd,
  noIndex = false
}: SeoProps) {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      {openGraph && (
        <>
          <meta property="og:type" content={openGraph.type || 'website'} />
          <meta property="og:url" content={openGraph.url} />
          <meta property="og:title" content={openGraph.title} />
          <meta property="og:description" content={openGraph.description} />
          {openGraph.image && <meta property="og:image" content={openGraph.image} />}
        </>
      )}

      {/* Twitter */}
      {twitter && (
        <>
          <meta name="twitter:card" content={twitter.card || 'summary_large_image'} />
          <meta name="twitter:title" content={twitter.title} />
          <meta name="twitter:description" content={twitter.description} />
          {twitter.image && <meta name="twitter:image" content={twitter.image} />}
        </>
      )}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {serializeJsonLd(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
