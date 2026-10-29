/**
 * Vercel Serverless Function: Open Graph & Meta Tags Interceptor
 * 
 * Atende robôs e crawlers de redes sociais (WhatsApp, Facebook, Twitter, Telegram,
 * LinkedIn, Googlebot) servindo um HTML com Open Graph, Twitter Cards e Schema.org
 * completo com título, subtítulo e imagem da matéria direto do Supabase.
 */

const DEFAULT_SUPABASE_URL = 'https://toqinygmtdlsoeocftor.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcWlueWdtdGRsc29lb2NmdG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTE3NDksImV4cCI6MjEwMTg4Nzc0OX0.9X9icw9VtUead_w3z-EDYTL9h20r_1t1JPXuVRZ94nU';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.redirect(302, '/');
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  let article = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const cleanSlug = encodeURIComponent(String(slug).replace(/^\//, '').trim());
      const endpoint = `${supabaseUrl}/rest/v1/news?slug=eq.${cleanSlug}&select=*`;
      const response = await fetch(endpoint, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        article = Array.isArray(data) ? data[0] : null;
      }
    } catch (e) {
      console.error('Erro ao consultar Supabase em api/og:', e);
    }
  }

  // Se não encontrar matéria no banco, redireciona para a página no SPA
  if (!article) {
    return res.redirect(302, `/noticia/${slug}`);
  }

  const siteUrl = 'https://jcpanorama365.com.br';
  const title = article.title ? `${article.title} | JC Panorama 365` : 'JC Panorama 365';
  const description = article.subtitle || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) : 'Notícias de Jundiaí e Região em tempo real.');

  // Extração de imagem principal com garantia de URL absoluta com https://
  let rawImage = '';
  if (Array.isArray(article.images) && article.images.length > 0 && article.images[0]) {
    rawImage = article.images[0];
  } else if (article.image_url) {
    rawImage = article.image_url;
  }

  let imageUrl = `${siteUrl}/logo-full.jpg`;
  if (rawImage) {
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      imageUrl = rawImage;
    } else if (rawImage.startsWith('/')) {
      imageUrl = `${siteUrl}${rawImage}`;
    } else {
      imageUrl = `${siteUrl}/${rawImage}`;
    }
  }

  const pageUrl = `${siteUrl}/noticia/${encodeURIComponent(article.slug)}`;
  const publishedTime = article.published_at || article.created_at || new Date().toISOString();
  const authorName = article.columnist_name || article.author || 'Redação JC Panorama 365';

  // Schema.org NewsArticle em JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': article.title,
    'description': description,
    'image': [imageUrl],
    'datePublished': publishedTime,
    'dateModified': article.updated_at || publishedTime,
    'author': {
      '@type': 'Person',
      'name': authorName,
    },
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'JC Panorama 365',
      'url': siteUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/logo-full.jpg`,
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
  };

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="JC Panorama 365">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${escapeHtml(pageUrl)}">
  <meta property="article:published_time" content="${publishedTime}">
  <meta property="article:author" content="${escapeHtml(authorName)}">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

  <!-- Canonical -->
  <link rel="canonical" href="${escapeHtml(pageUrl)}">

  <!-- Schema.org NewsArticle -->
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>

  <!-- Redirecionamento instantâneo se um leitor humano abrir este link -->
  <meta http-equiv="refresh" content="0;url=/noticia/${encodeURIComponent(article.slug)}">
  <script>
    window.location.replace('/noticia/${encodeURIComponent(article.slug)}');
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; color: #0F1A2E; background: #f8fafc;">
  <p style="font-size: 14px; color: #64748b;">Carregando matéria no JC Panorama 365...</p>
  <h1 style="font-size: 20px; font-weight: bold; margin-top: 12px;">${escapeHtml(article.title)}</h1>
  <p style="margin-top: 24px;">
    <a href="/noticia/${encodeURIComponent(article.slug)}" style="color: #1E56A0; text-decoration: underline;">
      Clique aqui se não for redirecionado automaticamente
    </a>
  </p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).send(html);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
