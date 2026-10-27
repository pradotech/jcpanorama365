/**
 * Extrai a lista ordenada de imagens de uma notícia.
 * Suporta:
 * 1. Campo `images` (array do Supabase)
 * 2. Campo `image_url` caso tenha sido serializado em JSON
 * 3. Fallback para `[article.image_url]`
 */
export function getArticleImages(article) {
  if (!article) return [];

  // 1. Se já tiver o array images populado
  if (Array.isArray(article.images) && article.images.length > 0) {
    const valid = article.images.filter(img => typeof img === 'string' && img.trim().length > 0);
    if (valid.length > 0) return valid;
  }

  // 2. Se image_url for string JSON
  if (typeof article.image_url === 'string' && article.image_url.trim().length > 0) {
    const trimmed = article.image_url.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(img => typeof img === 'string' && img.trim().length > 0);
          if (valid.length > 0) return valid;
        }
      } catch (e) {
        // Não é JSON válido, segue para string direta
      }
    }
    return [trimmed];
  }

  return [];
}
