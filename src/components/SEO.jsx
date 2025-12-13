import Head from 'next/head';

const defaultMeta = {
  title: 'PredictHub - Community Prediction Market Platform',
  description: 'Make predictions, compete with friends, and earn rewards in the ultimate prediction market platform. Join thousands of users making accurate forecasts.',
  keywords: 'prediction market, predictions, forecasting, betting, community, rewards, analytics',
  image: '/og-image.jpg',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://predicthub.com',
  type: 'website',
  siteName: 'PredictHub',
};

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  structuredData,
}) {
  const metaTitle = title ? `${title} | PredictHub` : defaultMeta.title;
  const metaDescription = description || defaultMeta.description;
  const metaKeywords = keywords || defaultMeta.keywords;
  const metaImage = image || `${defaultMeta.url}${defaultMeta.image}`;
  const metaUrl = url || defaultMeta.url;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="title" content={metaTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content="PredictHub" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:creator" content="@predicthub" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="PredictHub" />
      <meta name="application-name" content="PredictHub" />
      <meta name="msapplication-TileColor" content="#0ea5e9" />

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}

