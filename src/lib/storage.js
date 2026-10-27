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
 * Faz upload de uma imagem para o Supabase Storage
 * @param {File} file - Arquivo de imagem
 * @returns {Promise<string>} URL pública da imagem
 */
export async function uploadImage(file) {
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
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  const filePath = `news/${fileName}`;

  let { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
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
          .upload(filePath, file, {
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
