import { getAllArticlesForFeed } from '@/lib/content/news';
import { getSiteSettings } from '@/lib/content/siteSettings';

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export async function GET() {
	const [articles, siteSettings] = await Promise.all([getAllArticlesForFeed(), getSiteSettings()]);

	const siteUrl = siteSettings?.canonicalUrl || 'https://www.williamstownsc.com';
	const siteTitle = siteSettings?.seoDefaults?.siteTitle || siteSettings?.clubName || '';
	const siteDescription = siteSettings?.seoDefaults?.siteDescription || '';

	const feedUrl = `${siteUrl}/feed.xml`;
	const lastBuildDate = articles.length > 0 ? new Date(articles[0].publishedAt) : new Date();

	const rssItems = articles
		.map((article) => {
			const articleUrl = `${siteUrl}/news/${article.slug}`;
			const pubDate = new Date(article.publishedAt).toUTCString();

			return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.excerpt)}</description>${
				article.featuredImage
					? `
      <enclosure url="${escapeXml(article.featuredImage.url)}" type="image/jpeg" />`
					: ''
			}
    </item>`;
		})
		.join('\n');

	const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-AU</language>
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

	return new Response(rssFeed, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
		}
	});
}
