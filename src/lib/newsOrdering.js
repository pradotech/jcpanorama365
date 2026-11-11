/**
 * Aplica ordenação posicional real (slots 1, 2, 3...) nas notícias.
 * Se uma notícia tiver home_order = 3, ela ocupará exatamente a 3ª posição da lista (índice 2).
 * As outras posições (1ª, 2ª, 4ª...) serão preenchidas pelas notícias mais recentes de forma contínua.
 */
export function applyCustomSlotOrdering(items, getOrder = (item) => Number(item?.home_order) || 0) {
  if (!items || items.length === 0) return [];

  const fixedItems = [];
  const defaultItems = [];

  for (const item of items) {
    const order = getOrder(item);
    if (order > 0) {
      fixedItems.push({ item, order });
    } else {
      defaultItems.push(item);
    }
  }

  // Notícias padrão (sem ordem fixa ou ordem <= 0): ordenadas por data mais recente
  defaultItems.sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));

  // Se não há nenhum item com ordem fixa, retorna simplesmente a ordenação cronológica
  if (fixedItems.length === 0) {
    return defaultItems;
  }

  // Ordena os itens fixos pela ordem desejada (1, 2, 3...); em caso de empate, a mais recente vem antes
  fixedItems.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return new Date(b.item.published_at || 0) - new Date(a.item.published_at || 0);
  });

  const totalCount = items.length;
  const maxRequestedOrder = Math.max(...fixedItems.map(f => f.order));
  const slotsCount = Math.max(totalCount, maxRequestedOrder);
  const slots = new Array(slotsCount).fill(null);

  // 1. Alocar cada notícia com ordem fixa na sua posição 1-based (slot = order - 1)
  for (const { item, order } of fixedItems) {
    let targetIndex = Math.max(0, order - 1);
    while (targetIndex < slotsCount && slots[targetIndex] !== null) {
      targetIndex++;
    }
    if (targetIndex < slotsCount) {
      slots[targetIndex] = item;
    } else {
      slots.push(item);
    }
  }

  // 2. Preencher os slots vazios (null) sequencialmente com as notícias cronológicas
  let defaultIdx = 0;
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === null) {
      if (defaultIdx < defaultItems.length) {
        slots[i] = defaultItems[defaultIdx++];
      }
    }
  }

  // 3. Adicionar quaisquer notícias cronológicas que sobraram
  while (defaultIdx < defaultItems.length) {
    slots.push(defaultItems[defaultIdx++]);
  }

  // 4. Retornar apenas itens válidos (sem buracos/null)
  return slots.filter(Boolean);
}

