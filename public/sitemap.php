<?php
/**
 * JC Panorama 365 — Sitemap Dinâmico (HostGator / Apache)
 * 
 * Gera sitemap.xml em tempo real consultando as matérias do Supabase.
 */

$supabaseUrl = 'https://toqinygmtdlsoeocftor.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcWlueWdtdGRsc29lb2NmdG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTE3NDksImV4cCI6MjEwMTg4Nzc0OX0.9X9icw9VtUead_w3z-EDYTL9h20r_1t1JPXuVRZ94nU';
$siteUrl = 'https://jcpanorama365.com.br';

$articles = [];
$endpoint = "{$supabaseUrl}/rest/v1/news?select=slug,published_at,created_at&order=published_at.desc.nullslast&limit=1000";

$headers = [
    "apikey: {$supabaseKey}",
    "Authorization: Bearer {$supabaseKey}",
    "Accept: application/json"
];

if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $endpoint);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($response)) {
        $articles = json_decode($response, true) ?: [];
    }
}

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600, s-maxage=7200');

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc><?php echo $siteUrl; ?>/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc><?php echo $siteUrl; ?>/colunistas</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
<?php foreach ($articles as $article): ?>
  <?php if (!empty($article['slug'])): ?>
    <?php 
      $lastMod = !empty($article['published_at']) ? $article['published_at'] : (!empty($article['created_at']) ? $article['created_at'] : date('c'));
      $lastModFormatted = date('c', strtotime($lastMod));
    ?>
  <url>
    <loc><?php echo $siteUrl; ?>/noticia/<?php echo urlencode($article['slug']); ?></loc>
    <lastmod><?php echo $lastModFormatted; ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <?php endif; ?>
<?php endforeach; ?>
</urlset>

