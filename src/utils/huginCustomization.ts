// Système de personnalisation de Hugin Lab par utilisateur

export interface ModuleOrder {
  id: string;
  order: number;
  visible: boolean;
}

export interface HuginCustomization {
  modules: ModuleOrder[];
  betaModules: ModuleOrder[]; // Pour super admins uniquement
  lastUpdated: string;
}

// Obtenir l'email de l'utilisateur actuel
export const getCurrentUserEmail = (): string => {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) return 'guest';
  
  try {
    if (currentUser.includes('@')) {
      return currentUser.toLowerCase();
    }
    const user = JSON.parse(currentUser);
    return (user.email || user.username || currentUser).toLowerCase();
  } catch {
    return currentUser.toLowerCase();
  }
};

// Charger la personnalisation de l'utilisateur
export const loadUserCustomization = (): HuginCustomization | null => {
  const email = getCurrentUserEmail();
  const key = `hugin_customization_${email}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Sauvegarder la personnalisation de l'utilisateur
export const saveUserCustomization = (customization: HuginCustomization): void => {
  const email = getCurrentUserEmail();
  const key = `hugin_customization_${email}`;
  
  customization.lastUpdated = new Date().toISOString();
  localStorage.setItem(key, JSON.stringify(customization));
};

// Obtenir l'ordre des modules Hugin
export const getHuginModulesOrder = (): ModuleOrder[] => {
  const customization = loadUserCustomization();
  return customization?.modules || [];
};

// Obtenir l'ordre des modules Beta (pour super admins)
export const getBetaModulesOrder = (): ModuleOrder[] => {
  const customization = loadUserCustomization();
  return customization?.betaModules || [];
};

// Sauvegarder l'ordre des modules Hugin
export const saveHuginModulesOrder = (modules: ModuleOrder[]): void => {
  const customization = loadUserCustomization() || {
    modules: [],
    betaModules: [],
    lastUpdated: new Date().toISOString()
  };
  
  customization.modules = modules;
  saveUserCustomization(customization);
};

// Sauvegarder l'ordre des modules Beta
export const saveBetaModulesOrder = (modules: ModuleOrder[]): void => {
  const customization = loadUserCustomization() || {
    modules: [],
    betaModules: [],
    lastUpdated: new Date().toISOString()
  };
  
  customization.betaModules = modules;
  saveUserCustomization(customization);
};

// Réinitialiser la personnalisation
export const resetCustomization = (): void => {
  const email = getCurrentUserEmail();
  const key = `hugin_customization_${email}`;
  localStorage.removeItem(key);
};

// Appliquer l'ordre personnalisé aux modules
export const applySortOrder = <T extends { id: string }>(
  modules: T[],
  order: ModuleOrder[]
): T[] => {
  if (order.length === 0) return modules;
  
  const orderMap = new Map(order.map(o => [o.id, o]));
  
  return [...modules].sort((a, b) => {
    const orderA = orderMap.get(a.id)?.order ?? 999;
    const orderB = orderMap.get(b.id)?.order ?? 999;
    return orderA - orderB;
  });
};

// Filtrer les modules cachés
export const filterVisibleModules = <T extends { id: string }>(
  modules: T[],
  order: ModuleOrder[]
): T[] => {
  if (order.length === 0) return modules;
  
  const orderMap = new Map(order.map(o => [o.id, o]));
  
  return modules.filter(m => {
    const moduleOrder = orderMap.get(m.id);
    return moduleOrder === undefined || moduleOrder.visible !== false;
  });
};
