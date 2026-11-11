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

