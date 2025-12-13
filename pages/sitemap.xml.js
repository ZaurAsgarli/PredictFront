function Sitemap() {
  // This component will never be rendered
  return null;
}

export async function getServerSideProps({ res }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://predicthub.com';
  const currentDate = new Date().toISOString();
  
  // Static pages with their priorities and change frequencies
  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/events', priority: '0.9', changefreq: 'daily' },
    { path: '/leaderboard', priority: '0.8', changefreq: 'daily' },
    { path: '/login', priority: '0.5', changefreq: 'monthly' },
    { path: '/signup', priority: '0.5', changefreq: 'monthly' },
    { path: '/predictions', priority: '0.7', changefreq: 'daily' },
    { path: '/profile', priority: '0.6', changefreq: 'weekly' },
  ];

  // Fetch dynamic pages (events) from API
  let dynamicPages = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/markets/`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const events = Array.isArray(data) ? data : (data.results || []);
      dynamicPages = events.map((event) => ({
        path: `/events/${event.id}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: event.updated_at || event.created_at || currentDate,
      }));
    }
  } catch (error) {
    console.error('Error fetching events for sitemap:', error);
    // Continue without dynamic pages if API fails
  }

  // Combine all pages
  const allPages = [
    ...staticPages.map(page => ({ ...page, lastmod: currentDate })),
    ...dynamicPages,
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages
  .map((page) => {
    const url = `${baseUrl}${page.path}`;
    const lastmod = page.lastmod || currentDate;
    
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default Sitemap;

