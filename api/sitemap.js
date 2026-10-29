/**
 * Vercel Serverless Function: Sitemap Dinâmico (sitemap.xml)
 * 
 * Gera sitemap.xml atualizado em tempo real a partir das matérias publicadas no Supabase.
 */

const DEFAULT_SUPABASE_URL = 'https://toqinygmtdlsoeocftor.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcWlueWdtdGRsc29lb2NmdG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTE3NDksImV4cCI6MjEwMTg4Nzc0OX0.9X9icw9VtUead_w3z-EDYTL9h20r_1t1JPXuVRZ94nU';

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  let articles = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const endpoint = `${supabaseUrl}/rest/v1/news?select=slug,published_at,created_at&order=published_at.desc.nullslast&limit=1000`;
      const response = await fetch(endpoint, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        articles = await response.json();
      }
    } catch (e) {
      console.error('Erro ao consultar Supabase para sitemap:', e);
    }
  }

  const siteUrl = 'https://jcpanorama365.com.br';

  const urlsXml = (Array.isArray(articles) ? articles : [])
    .filter(a => a && a.slug)
    .map(article => {
      const lastMod = article.published_at || article.created_at || new Date().toISOString();
      return `  <url>
    <loc>${siteUrl}/noticia/${encodeURIComponent(article.slug)}</loc>
    <lastmod>${new Date(lastMod).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/colunistas</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
${urlsXml}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
  return res.status(200).send(xml);
}
