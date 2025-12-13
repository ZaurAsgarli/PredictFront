# SEO Setup Documentation

This document outlines the SEO implementation for PredictHub, including meta tags, Open Graph tags, structured data, sitemap, and robots.txt.

## 📋 What's Included

### 1. **Meta Tags & OG Tags**
- ✅ Primary meta tags (title, description, keywords)
- ✅ Open Graph tags for social media sharing
- ✅ Twitter Card tags
- ✅ Mobile optimization tags
- ✅ Canonical URLs

### 2. **Structured Data (Schema.org)**
- ✅ Homepage: WebApplication schema
- ✅ Events page: CollectionPage with ItemList
- ✅ Event detail pages: Event schema
- ✅ Leaderboard: WebPage with ItemList

### 3. **Dynamic Sitemap**
- ✅ Automatically generates sitemap.xml
- ✅ Includes all static pages
- ✅ Dynamically fetches and includes event pages
- ✅ Sets appropriate priorities and change frequencies

### 4. **Robots.txt**
- ✅ Allows all search engines
- ✅ Blocks admin and API routes
- ✅ References sitemap location

## 🚀 Usage

### Environment Variables

Add to your `.env.local` or `.env`:

```env
NEXT_PUBLIC_SITE_URL=https://predicthub.com
NEXT_PUBLIC_API_URL=https://api.predicthub.com
```

### Using SEO Component

Import and use the SEO component in any page:

```jsx
import SEO from '../src/components/SEO';

export default function MyPage() {
  return (
    <>
      <SEO
        title="Page Title"
        description="Page description"
        keywords="keyword1, keyword2"
        url="https://predicthub.com/my-page"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          // ... your schema
        }}
      />
      {/* Your page content */}
    </>
  );
}
```

### SEO Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | No | Page title (defaults to "PredictHub") |
| `description` | string | No | Meta description |
| `keywords` | string | No | Meta keywords |
| `image` | string | No | OG image URL |
| `url` | string | No | Canonical URL |
| `type` | string | No | OG type (default: "website") |
| `noindex` | boolean | No | Set to true to prevent indexing |
| `structuredData` | object | No | JSON-LD structured data |

## 📍 Sitemap & Robots.txt

### Sitemap
- **URL**: `/sitemap.xml`
- Automatically generated on each request
- Includes static pages and dynamic event pages
- Cached for 1 hour, stale-while-revalidate for 24 hours

### Robots.txt
- **URL**: `/robots.txt`
- Blocks admin routes and API endpoints
- References sitemap location
- Cached for 24 hours

## 📄 Pages with SEO

✅ **Homepage** (`/`)
- WebApplication schema
- Full meta tags and OG tags

✅ **Events Page** (`/events`)
- CollectionPage schema with ItemList
- Dynamic event listings

✅ **Event Detail** (`/events/[id]`)
- Event schema
- Dynamic meta tags based on event data

✅ **Leaderboard** (`/leaderboard`)
- WebPage schema with ItemList
- User rankings data

## 🔍 Testing

### Validate Structured Data
1. Use [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Use [Schema.org Validator](https://validator.schema.org/)

### Test Meta Tags
1. Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Use [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Test Sitemap
- Visit: `https://yourdomain.com/sitemap.xml`
- Should return valid XML

### Test Robots.txt
- Visit: `https://yourdomain.com/robots.txt`
- Should return text file with rules

## 🎨 Customization

### Update Default Meta Tags
Edit `src/components/SEO.jsx` to change default values.

### Add More Structured Data Types
Add new schema types in the SEO component or create page-specific structured data.

### Customize Sitemap
Edit `pages/sitemap.xml.js` to:
- Add more static pages
- Change priorities
- Modify change frequencies
- Add more dynamic routes

## 📝 Notes

- All meta tags are responsive and work on mobile devices
- OG images should be at least 1200x630px for best results
- Structured data helps search engines understand your content
- Sitemap helps search engines discover all pages
- Robots.txt controls what search engines can crawl

## 🔗 Resources

- [Next.js SEO Guide](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

