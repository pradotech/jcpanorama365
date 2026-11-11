/**
 * Normaliza um texto para busca insensível a acentos (diacríticos) e maiúsculas/minúsculas.
 * Exemplo: "São Paulo" -> "sao paulo", "POLÍCIA" -> "policia", "Veículo" -> "veiculo"
 */
export function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Converte um texto para caracteres Unicode em Negrito (Sans-Serif Bold).
 * Permite que o texto apareça visualmente em negrito real em plataformas
 * que não suportam Markdown (como Instagram e Facebook).
 * Preserva acentos através de marcas combinantes (NFD).
 * Exemplo: "São Paulo: 12 presos" -> "𝗦𝗮̃𝗼 𝗣𝗮𝘂𝗹𝗼: 𝟭𝟮 𝗽𝗿𝗲𝘀𝗼𝘀"
 */
export function toUnicodeBold(text) {
  if (!text) return '';
  const nfd = String(text).normalize('NFD');
  let result = '';
  for (let i = 0; i < nfd.length; i++) {
    const code = nfd.charCodeAt(i);
    // A-Z: 0x41 - 0x5A -> 0x1D5D4 (Sans-Serif Bold)
    if (code >= 0x41 && code <= 0x5A) {
      result += String.fromCodePoint(0x1D5D4 + (code - 0x41));
    }
    // a-z: 0x61 - 0x7A -> 0x1D5EE (Sans-Serif Bold)
    else if (code >= 0x61 && code <= 0x7A) {
      result += String.fromCodePoint(0x1D5EE + (code - 0x61));
    }
    // 0-9: 0x30 - 0x39 -> 0x1D7EC (Sans-Serif Bold)
    else if (code >= 0x30 && code <= 0x39) {
      result += String.fromCodePoint(0x1D7EC + (code - 0x30));
    }
    // Preserva pontuação, espaços e marcas combinantes de acentos
    else {
      result += nfd[i];
    }
  }
  return result;
}

