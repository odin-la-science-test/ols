/**
 * Système de migration des données Beta vers Production
 * Utilisé lors du déploiement d'un module beta en production
 */

interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
  details: string[];
}

/**
 * Migre les protocoles du Protocol Builder Beta vers la version production
 */
export const migrateProtocolBuilderToProduction = (): MigrationResult => {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
    details: []
  };

  try {
    // Récupérer les protocoles beta
    const betaProtocols = localStorage.getItem('beta_protocols');
    
    if (!betaProtocols) {
      result.details.push('Aucun protocole beta trouvé');
      result.success = true;
      return result;
    }

    const betaData = JSON.parse(betaProtocols);
    
    if (!Array.isArray(betaData) || betaData.length === 0) {
      result.details.push('Aucun protocole à migrer');
      result.success = true;
      return result;
    }

    // Récupérer les protocoles production existants
    const productionProtocols = localStorage.getItem('protocols');
    const productionData = productionProtocols ? JSON.parse(productionProtocols) : [];

    // Créer un Set des IDs existants pour éviter les doublons
    const existingIds = new Set(productionData.map((p: any) => p.id));

    // Migrer chaque protocole
    let migratedCount = 0;
    betaData.forEach((protocol: any) => {
      if (!existingIds.has(protocol.id)) {
        // Ajouter un marqueur de migration
        const migratedProtocol = {
          ...protocol,
          migratedFromBeta: true,
          migrationDate: new Date().toISOString()
        };
        productionData.push(migratedProtocol);
        migratedCount++;
        result.details.push(`Protocole migré: ${protocol.name} (v${protocol.version})`);
      } else {
        result.details.push(`Protocole ignoré (doublon): ${protocol.name}`);
      }
    });

    // Sauvegarder les protocoles production mis à jour
    localStorage.setItem('protocols', JSON.stringify(productionData));
    
    // Archiver les protocoles beta (ne pas supprimer pour sécurité)
    const archiveKey = `beta_protocols_archive_${Date.now()}`;
    localStorage.setItem(archiveKey, betaProtocols);
    
    // Supprimer la clé beta active
    localStorage.removeItem('beta_protocols');

    result.success = true;
    result.migratedCount = migratedCount;
    result.details.push(`Migration terminée: ${migratedCount} protocole(s) migré(s)`);
    result.details.push(`Archive créée: ${archiveKey}`);

  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur lors de la migration: ${error}`);
  }

  return result;
};

/**
 * Migre les entrées du Lab Notebook Beta vers la version production
 */
export const migrateLabNotebookToProduction = (): MigrationResult => {
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    errors: [],
    details: []
  };

  try {
    const betaEntries = localStorage.getItem('beta_lab_notebook_entries');
    
    if (!betaEntries) {
      result.details.push('Aucune entrée beta trouvée');
      result.success = true;
      return result;
    }

    const betaData = JSON.parse(betaEntries);
    
    if (!Array.isArray(betaData) || betaData.length === 0) {
      result.details.push('Aucune entrée à migrer');
      result.success = true;
      return result;
    }

    const productionEntries = localStorage.getItem('lab_notebook_entries');
    const productionData = productionEntries ? JSON.parse(productionEntries) : [];

    const existingIds = new Set(productionData.map((e: any) => e.id));

    let migratedCount = 0;
    betaData.forEach((entry: any) => {
      if (!existingIds.has(entry.id)) {
        const migratedEntry = {
          ...entry,
          migratedFromBeta: true,
          migrationDate: new Date().toISOString()
        };
        productionData.push(migratedEntry);
        migratedCount++;
        result.details.push(`Entrée migrée: ${entry.title}`);
      } else {
        result.details.push(`Entrée ignorée (doublon): ${entry.title}`);
      }
    });

    localStorage.setItem('lab_notebook_entries', JSON.stringify(productionData));
    
    const archiveKey = `beta_lab_notebook_archive_${Date.now()}`;
    localStorage.setItem(archiveKey, betaEntries);
    localStorage.removeItem('beta_lab_notebook_entries');

    result.success = true;
    result.migratedCount = migratedCount;
    result.details.push(`Migration terminée: ${migratedCount} entrée(s) migrée(s)`);

  } catch (error) {
    result.success = false;
    result.errors.push(`Erreur lors de la migration: ${error}`);
  }

  return result;
};

/**
 * Migre toutes les données beta vers production
 */
export const migrateAllBetaData = (): { [key: string]: MigrationResult } => {
  const results: { [key: string]: MigrationResult } = {};

  // Migrer Protocol Builder
  results.protocolBuilder = migrateProtocolBuilderToProduction();

  // Migrer Lab Notebook
  results.labNotebook = migrateLabNotebookToProduction();

  // Ajouter d'autres migrations ici au besoin
  // results.chemicalInventory = migrateChemicalInventoryToProduction();
  // results.equipFlow = migrateEquipFlowToProduction();

  return results;
};

/**
 * Vérifie s'il y a des données beta à migrer
 */
export const hasBetaDataToMigrate = (): boolean => {
  const betaKeys = [
    'beta_protocols',
    'beta_lab_notebook_entries',
    // Ajouter d'autres clés beta ici
  ];

  return betaKeys.some(key => {
    const data = localStorage.getItem(key);
    if (!data) return false;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  });
};

/**
 * Obtient un résumé des données beta disponibles
 */
export const getBetaDataSummary = (): { [key: string]: number } => {
  const summary: { [key: string]: number } = {};

  const checkKey = (key: string, label: string) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          summary[label] = parsed.length;
        }
      } catch {
        summary[label] = 0;
      }
    } else {
      summary[label] = 0;
    }
  };

  checkKey('beta_protocols', 'Protocoles');
  checkKey('beta_lab_notebook_entries', 'Entrées Lab Notebook');

  return summary;
};
