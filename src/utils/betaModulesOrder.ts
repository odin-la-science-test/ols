// Gestion de l'ordre des modules beta

export type SortMode = 'category' | 'manual';

export interface ModuleOrder {
  id: string;
  order: number;
}

const STORAGE_KEY = 'beta_modules_order';
const SORT_MODE_KEY = 'beta_modules_sort_mode';

// Récupérer le mode de tri
export const getSortMode = (): SortMode => {
  const saved = localStorage.getItem(SORT_MODE_KEY);
  return (saved as SortMode) || 'category';
};

// Sauvegarder le mode de tri
export const setSortMode = (mode: SortMode): void => {
  localStorage.setItem(SORT_MODE_KEY, mode);
};

// Récupérer l'ordre personnalisé des modules
export const getModulesOrder = (): ModuleOrder[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing modules order:', e);
    }
  }
  return [];
};

// Sauvegarder l'ordre personnalisé des modules
export const saveModulesOrder = (order: ModuleOrder[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
};

// Réinitialiser l'ordre des modules
export const resetModulesOrder = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Appliquer l'ordre personnalisé à une liste de modules
export const applyCustomOrder = <T extends { id: string }>(modules: T[]): T[] => {
  const customOrder = getModulesOrder();
  
  if (customOrder.length === 0) {
    return modules;
  }

  // Créer un map pour l'ordre personnalisé
  const orderMap = new Map(customOrder.map(o => [o.id, o.order]));

  // Trier selon l'ordre personnalisé
  return [...modules].sort((a, b) => {
    const orderA = orderMap.get(a.id) ?? 999;
    const orderB = orderMap.get(b.id) ?? 999;
    return orderA - orderB;
  });
};

// Appliquer le tri par catégorie (alphabétique)
export const applyCategorySort = <T extends { id: string; name: string; category: string }>(modules: T[]): T[] => {
  return [...modules].sort((a, b) => {
    // Tri par catégorie puis par nom
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category, 'fr');
    }
    return a.name.localeCompare(b.name, 'fr');
  });
};

// Obtenir les modules triés selon le mode actuel
export const getSortedModules = <T extends { id: string; name: string; category: string }>(modules: T[]): T[] => {
  const sortMode = getSortMode();
  
  if (sortMode === 'category') {
    return applyCategorySort(modules);
  } else {
    return applyCustomOrder(modules);
  }
};
