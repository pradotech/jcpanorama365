<?php
/**
 * JC Panorama 365 — Open Graph & Social Share Interceptor (HostGator / Apache)
 * 
 * Atende robôs de redes sociais (WhatsApp, Facebook, Twitter, Telegram, LinkedIn, etc.)
 * consultando o Supabase em tempo real e gerando o HTML com as meta tags e imagem da matéria.
 */

// Configurações do Supabase
$supabaseUrl = 'https://toqinygmtdlsoeocftor.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcWlueWdtdGRsc29lb2NmdG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTE3NDksImV4cCI6MjEwMTg4Nzc0OX0.9X9icw9VtUead_w3z-EDYTL9h20r_1t1JPXuVRZ94nU';
$siteUrl = 'https://jcpanorama365.com.br';

// Obter e limpar o slug da notícia
$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$slug = strtok($slug, '?');
$slug = trim($slug, '/');

if (empty($slug)) {
    header("Location: {$siteUrl}/", true, 302);
    exit;
}

$article = null;

// Consulta a matéria no Supabase via REST API
$endpoint = "{$supabaseUrl}/rest/v1/news?slug=eq." . urlencode($slug) . "&select=*";

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
    // Na HostGator, desativar checagem estrita de SSL para evitar falha de CA desatualizada
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && !empty($response)) {
        $data = json_decode($response, true);
        if (is_array($data) && count($data) > 0) {
            $article = $data[0];
        }
    }
} else {
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => implode("\r\n", $headers) . "\r\n",
            'timeout' => 6,
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ]
    ]);
    $response = @file_get_contents($endpoint, false, $context);
    if (!empty($response)) {
        $data = json_decode($response, true);
        if (is_array($data) && count($data) > 0) {
            $article = $data[0];
        }
    }
}

// Extração dos dados da matéria (ou fallback seguro)
$title = !empty($article['title']) ? $article['title'] : 'JC Panorama 365';
$pageTitle = "{$title} | JC Panorama 365";
$description = !empty($article['subtitle']) ? $article['subtitle'] : '';

if (empty($description) && !empty($article['content'])) {
    $cleanContent = strip_tags($article['content']);
    $description = mb_substr($cleanContent, 0, 160, 'UTF-8');
}
if (empty($description)) {
    $description = 'Notícias de Jundiaí e Região em tempo real no JC Panorama 365.';
}

// Extração e normalização da imagem da matéria (compatível com array, JSON string ou URL direta)
$rawImage = '';

if (!empty($article['images'])) {
    $imgs = is_array($article['images']) ? $article['images'] : json_decode($article['images'], true);
    if (is_array($imgs) && !empty($imgs[0])) {
        $rawImage = $imgs[0];
    }
}

if (empty($rawImage) && !empty($article['image_url'])) {
    $trimmed = trim($article['image_url']);
    if (strpos($trimmed, '[') === 0) {
        $parsed = json_decode($trimmed, true);
        if (is_array($parsed) && !empty($parsed[0])) {
            $rawImage = $parsed[0];
        }
    }
    if (empty($rawImage)) {
        $rawImage = $trimmed;
    }
}

$imageUrl = "{$siteUrl}/logo-full.jpg";
if (!empty($rawImage)) {
    if (strpos($rawImage, 'http://') === 0 || strpos($rawImage, 'https://') === 0) {
        $imageUrl = $rawImage;
    } else {
        $imageUrl = rtrim($siteUrl, '/') . '/' . ltrim($rawImage, '/');
    }
}

$canonicalUrl = "{$siteUrl}/noticia/" . urlencode($slug);
$publishedTime = !empty($article['published_at']) ? $article['published_at'] : (!empty($article['created_at']) ? $article['created_at'] : date('c'));
$authorName = !empty($article['columnist_name']) ? $article['columnist_name'] : (!empty($article['author']) ? $article['author'] : 'Redação JC Panorama 365');

// Schema.org NewsArticle em JSON-LD
$schemaData = [
    '@context' => 'https://schema.org',
    '@type' => 'NewsArticle',
    'headline' => $title,
    'description' => $description,
    'image' => [$imageUrl],
    'datePublished' => $publishedTime,
    'dateModified' => !empty($article['updated_at']) ? $article['updated_at'] : $publishedTime,
    'author' => [
        '@type' => 'Person',
        'name' => $authorName,
    ],
    'publisher' => [
        '@type' => 'NewsMediaOrganization',
        'name' => 'JC Panorama 365',
        'url' => $siteUrl,
        'logo' => [
            '@type' => 'ImageObject',
            'url' => "{$siteUrl}/logo-full.jpg",
        ],
    ],
    'mainEntityOfPage' => [
        '@type' => 'WebPage',
        '@id' => $canonicalUrl,
    ],
];

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: public, max-age=300, s-maxage=600');
?>
<!DOCTYPE html>
<html lang="pt-BR" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
  <meta name="description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">
  <meta name="google-site-verification" content="tcHSM_-VUwLLq_1-2afhEkpP-InydMX2LqyEXD8W1lk">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="JC Panorama 365">
  <meta property="og:title" content="<?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="og:description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="og:image" content="<?php echo htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="og:image:secure_url" content="<?php echo htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="<?php echo htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="article:published_time" content="<?php echo htmlspecialchars($publishedTime, ENT_QUOTES, 'UTF-8'); ?>">
  <meta property="article:author" content="<?php echo htmlspecialchars($authorName, ENT_QUOTES, 'UTF-8'); ?>">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="<?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?>">
  <meta name="twitter:description" content="<?php echo htmlspecialchars($description, ENT_QUOTES, 'UTF-8'); ?>">
  <meta name="twitter:image" content="<?php echo htmlspecialchars($imageUrl, ENT_QUOTES, 'UTF-8'); ?>">

  <!-- Canonical -->
  <link rel="canonical" href="<?php echo htmlspecialchars($canonicalUrl, ENT_QUOTES, 'UTF-8'); ?>">

  <!-- Schema.org NewsArticle -->
  <script type="application/ld+json">
    <?php echo json_encode($schemaData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT); ?>
  </script>

  <!-- Redirecionamento instantâneo se um usuário humano acessar essa URL -->
  <meta http-equiv="refresh" content="0;url=/noticia/<?php echo urlencode($slug); ?>">
  <script>
    window.location.replace('/noticia/<?php echo urlencode($slug); ?>');
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; color: #0F1A2E; background: #f8fafc;">
  <p style="font-size: 14px; color: #64748b;">Carregando matéria no JC Panorama 365...</p>
  <h1 style="font-size: 20px; font-weight: bold; margin-top: 12px;"><?php echo htmlspecialchars($title, ENT_QUOTES, 'UTF-8'); ?></h1>
  <p style="margin-top: 24px;">
    <a href="/noticia/<?php echo urlencode($slug); ?>" style="color: #1E56A0; text-decoration: underline;">
      Clique aqui se não for redirecionado automaticamente
    </a>
  </p>
</body>
</html>
