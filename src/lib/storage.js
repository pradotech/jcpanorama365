import { supabase } from './supabase';

const BUCKET_NAME = 'news-images';

/**
 * Trata erros do Supabase Storage retornando mensagens amigáveis
 */
export function formatStorageError(error) {
  if (!error) return 'Erro desconhecido no upload.';
  const msg = error.message || error.toString();

  if (/exp.*claim|timestamp.*check|jwt expired|invalid jwt/i.test(msg)) {
    return 'Sua sessão expirou ou o relógio do seu computador está desregulado. Por favor, verifique a hora do Windows e faça login novamente.';
  }

  if (/row-level security|unauthorized|not authorized|permission denied/i.test(msg)) {
    return 'Sem permissão para enviar arquivos. Por favor, faça login novamente.';
  }

  if (/payload too large|file size/i.test(msg)) {
    return 'O arquivo enviado é maior do que o tamanho máximo permitido (5MB).';
  }

  return msg;
}

/**
 * Otimiza e comprime uma imagem no navegador antes do upload.
 * Reduz fotos de câmeras/celulares (que chegam com 3MB - 10MB) para a faixa de 100KB - 250KB,
 * garantindo compatibilidade total com os limites rígidos do WhatsApp e Facebook (og:image).
 * 
 * @param {File} file - Arquivo original selecionado pelo usuário
 * @param {number} maxWidth - Largura máxima permitida (padrão: 1600px)
 * @param {number} maxHeight - Altura máxima permitida (padrão: 1600px)
 * @param {number} quality - Qualidade JPEG (padrão: 0.82)
 * @returns {Promise<File>} Arquivo otimizado pronto para upload
 */
export async function optimizeImageForWeb(file, maxWidth = 1600, maxHeight = 1600, quality = 0.82) {
  if (!file || !file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // Se já for bem pequena (menos de 200KB) e formato leve, mantém
  if (file.size <= 200 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calcular novas dimensões mantendo aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file);
      }

      // Preenchimento branco caso a imagem original tenha transparência PNG antes de converter para JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          const baseName = file.name.replace(/\.[^.]+$/, '');
          const optimizedFileName = `${baseName}.jpg`;
          const optimizedFile = new File([blob], optimizedFileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          // Se o arquivo original for menor que o comprimido por algum motivo raro, usa o original
          if (file.size < optimizedFile.size && file.size < 350 * 1024) {
            resolve(file);
          } else {
            resolve(optimizedFile);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Faz upload de uma imagem para o Supabase Storage com otimização automática para web
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<string>} URL pública da imagem
 */
export async function uploadImage(file) {
  // Comprime e redimensiona a imagem automaticamente (mantém < 300KB para o WhatsApp)
  const fileToUpload = await optimizeImageForWeb(file);

  // Tentar garantir que a sessão esteja ativa antes do upload
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const now = Math.floor(Date.now() / 1000);
    if (!session || (session.expires_at && session.expires_at - now < 120)) {
      await supabase.auth.refreshSession();
    }
  } catch {
    // Segue para a tentativa de upload caso o refresh automático falhe
  }

  // Gerar nome único para o arquivo
  const fileExt = fileToUpload.name.split('.').pop();
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  const filePath = `news/${fileName}`;

  let { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });

  // Se falhou por token/expiração, tenta renovar a sessão e repetir uma vez
  if (error && /exp.*claim|timestamp.*check|jwt expired/i.test(error.message)) {
    try {
      const { error: refreshErr } = await supabase.auth.refreshSession();
      if (!refreshErr) {
        const retryResult = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, fileToUpload, {
            cacheControl: '3600',
            upsert: false,
          });
        error = retryResult.error;
      }
    } catch {
      // Ignora erro no retry e trata abaixo
    }
  }

  if (error) {
    throw new Error(formatStorageError(error));
  }

  // Retornar URL pública
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Remove uma imagem do Supabase Storage
 * @param {string} imageUrl - URL pública da imagem
 */
export async function deleteImage(imageUrl) {
  if (!imageUrl || !imageUrl.includes(BUCKET_NAME)) return;

  // Extrair o path do arquivo da URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split(`${BUCKET_NAME}/`);
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Erro ao deletar imagem:', error.message);
  }
}
