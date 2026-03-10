/**
 * MUNIN ATLAS - MASSIVE DATA COLLECTION SCRIPT
 * Script pour collecter massivement des données scientifiques
 */

import { scientificDataAggregator } from '../src/services/scientificDataAggregator';
import { scientificDatabaseManager } from '../src/services/scientificDatabaseManager';
import type { DataSource } from '../src/types/scientific-database';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DOMAINS = [
  // Sciences de la Vie
  'bacteriology', 'biochemistry', 'genetics', 'molecular biology', 'cell biology',
  'microbiology', 'immunology', 'virology', 'biotechnology', 'bioinformatics',
  
  // Médecine
  'medicine', 'cardiology', 'oncology', 'neurology', 'pediatrics',
  'surgery', 'radiology', 'psychiatry', 'pharmacology', 'epidemiology',
  
  // Sciences Physiques
  'physics', 'quantum physics', 'astrophysics', 'nuclear physics', 'particle physics',
  'optics', 'thermodynamics', 'electromagnetism', 'mechanics', 'relativity',
  
  // Chimie
  'chemistry', 'organic chemistry', 'inorganic chemistry', 'physical chemistry',
  'analytical chemistry', 'biochemistry', 'electrochemistry', 'quantum chemistry',
  
  // Mathématiques
  'mathematics', 'algebra', 'geometry', 'calculus', 'statistics',
  'probability', 'number theory', 'topology', 'graph theory', 'logic',
  
  // Informatique
  'computer science', 'artificial intelligence', 'machine learning', 'algorithms',
  'data structures', 'databases', 'networks', 'cybersecurity', 'software engineering',
  
  // Sciences de la Terre
  'geology', 'geophysics', 'climatology', 'oceanography', 'meteorology',
  'seismology', 'volcanology', 'paleontology', 'mineralogy', 'petrology',
  
  // Sciences de l'Ingénieur
  'engineering', 'mechanical engineering', 'electrical engineering', 'civil engineering',
  'chemical engineering', 'biomedical engineering', 'aerospace engineering', 'robotics',
  
  // Sciences Humaines
  'psychology', 'sociology', 'anthropology', 'linguistics', 'archaeology',
  'history', 'economics', 'political science', 'geography', 'demography'
];

const SOURCES: DataSource[] = [
  'pubmed',
  'arxiv',
  'crossref',
  'semantic-scholar',
  'openalex'
];

const PUBLICATIONS_PER_DOMAIN = 10000; // Target
const BATCH_SIZE = 100; // Publications per batch
const DELAY_BETWEEN_BATCHES = 1000; // ms

// ============================================================================
// COLLECTION FUNCTIONS
// ============================================================================

/**
 * Collect data for a single domain from all sources
 */
async function collectDomainData(domain: string): Promise<void> {
  console.log(`\n🔍 Starting collection for domain: ${domain}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  let totalCollected = 0;
  const startTime = Date.now();

  for (const source of SOURCES) {
    try {
      console.log(`\n📡 Collecting from ${source}...`);
      
      // Collect in batches
      let offset = 0;
      let batchNumber = 1;
      
      while (totalCollected < PUBLICATIONS_PER_DOMAIN) {
        const remaining = PUBLICATIONS_PER_DOMAIN - totalCollected;
        const batchSize = Math.min(BATCH_SIZE, remaining);
        
        console.log(`  Batch ${batchNumber}: Fetching ${batchSize} publications...`);
        
        try {
          const publications = await scientificDataAggregator.searchSource(
            source,
            domain,
            batchSize
          );
          
          if (publications.length === 0) {
            console.log(`  ⚠️  No more results from ${source}`);
            break;
          }
          
          // Add to database
          await scientificDatabaseManager.addPublications(publications);
          
          totalCollected += publications.length;
          console.log(`  ✅ Added ${publications.length} publications (Total: ${totalCollected})`);
          
          // Delay between batches to respect rate limits
          await delay(DELAY_BETWEEN_BATCHES);
          
          batchNumber++;
          offset += batchSize;
          
        } catch (error) {
          console.error(`  ❌ Error in batch ${batchNumber}:`, error);
          // Continue with next batch
        }
      }
      
    } catch (error) {
      console.error(`❌ Error collecting from ${source}:`, error);
      // Continue with next source
    }
  }
  
  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n✅ Domain "${domain}" completed:`);
  console.log(`   - Total publications: ${totalCollected}`);
  console.log(`   - Duration: ${duration.toFixed(2)}s`);
  console.log(`   - Rate: ${(totalCollected / duration).toFixed(2)} pub/s`);
}

/**
 * Collect data for all domains
 */
async function collectAllDomains(): Promise<void> {
  console.log(`\n🚀 MUNIN ATLAS - MASSIVE DATA COLLECTION`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Configuration:`);
  console.log(`   - Domains: ${DOMAINS.length}`);
  console.log(`   - Sources: ${SOURCES.join(', ')}`);
  console.log(`   - Target per domain: ${PUBLICATIONS_PER_DOMAIN} publications`);
  console.log(`   - Total target: ${DOMAINS.length * PUBLICATIONS_PER_DOMAIN} publications`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  const globalStartTime = Date.now();
  
  // Initialize database
  await scientificDatabaseManager.initialize();
  
  // Collect for each domain
  for (let i = 0; i < DOMAINS.length; i++) {
    const domain = DOMAINS[i];
    console.log(`\n[${i + 1}/${DOMAINS.length}] Processing domain: ${domain}`);
    
    try {
      await collectDomainData(domain);
    } catch (error) {
      console.error(`❌ Failed to collect domain "${domain}":`, error);
      // Continue with next domain
    }
    
    // Print progress
    const stats = scientificDatabaseManager.getStats();
    console.log(`\n📈 Global Progress:`);
    console.log(`   - Total publications: ${stats.publications}`);
    console.log(`   - Domains processed: ${i + 1}/${DOMAINS.length}`);
    console.log(`   - Completion: ${((i + 1) / DOMAINS.length * 100).toFixed(1)}%`);
    
    // Save checkpoint
    if ((i + 1) % 10 === 0) {
      console.log(`\n💾 Saving checkpoint...`);
      const exportData = await scientificDatabaseManager.exportToJSON();
      // In production, save to file or cloud storage
      console.log(`✅ Checkpoint saved`);
    }
  }
  
  const globalDuration = (Date.now() - globalStartTime) / 1000 / 60; // minutes
  const finalStats = scientificDatabaseManager.getStats();
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎉 COLLECTION COMPLETED!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Final Statistics:`);
  console.log(`   - Total publications: ${finalStats.publications}`);
  console.log(`   - Unique authors: ${finalStats.authors}`);
  console.log(`   - Keywords indexed: ${finalStats.keywords}`);
  console.log(`   - Years covered: ${finalStats.years}`);
  console.log(`   - Duration: ${globalDuration.toFixed(2)} minutes`);
  console.log(`   - Average rate: ${(finalStats.publications / globalDuration).toFixed(2)} pub/min`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // Export final database
  console.log(`💾 Exporting final database...`);
  const finalExport = await scientificDatabaseManager.exportToJSON();
  console.log(`✅ Database exported (${(finalExport.length / 1024 / 1024).toFixed(2)} MB)`);
}

/**
 * Collect data for specific domains
 */
async function collectSpecificDomains(domains: string[]): Promise<void> {
  console.log(`\n🎯 Collecting data for specific domains: ${domains.join(', ')}`);
  
  await scientificDatabaseManager.initialize();
  
  for (const domain of domains) {
    await collectDomainData(domain);
  }
  
  const stats = scientificDatabaseManager.getStats();
  console.log(`\n✅ Collection completed: ${stats.publications} publications`);
}

/**
 * Resume collection from checkpoint
 */
async function resumeCollection(checkpointData: string): Promise<void> {
  console.log(`\n🔄 Resuming collection from checkpoint...`);
  
  await scientificDatabaseManager.initialize();
  await scientificDatabaseManager.importFromJSON(checkpointData);
  
  const stats = scientificDatabaseManager.getStats();
  console.log(`✅ Checkpoint loaded: ${stats.publications} publications`);
  
  // Continue collection
  await collectAllDomains();
}

/**
 * Utility: Delay function
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Display collection statistics
 */
async function displayStats(): Promise<void> {
  await scientificDatabaseManager.initialize();
  
  const stats = await scientificDatabaseManager.getAggregationStats();
  
  console.log(`\n📊 MUNIN ATLAS DATABASE STATISTICS`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📚 Publications: ${stats.totalPublications.toLocaleString()}`);
  console.log(`👥 Authors: ${stats.totalAuthors.toLocaleString()}`);
  console.log(`🏛️  Institutions: ${stats.totalInstitutions.toLocaleString()}`);
  console.log(`📖 Citations: ${stats.totalCitations.toLocaleString()}`);
  console.log(`🔬 Domains: ${stats.domainsCount}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  
  console.log(`\n📈 Top 10 Domains by Publication Count:`);
  const topDomains = stats.byDomain
    .sort((a, b) => b.publicationCount - a.publicationCount)
    .slice(0, 10);
  
  topDomains.forEach((domain, index) => {
    console.log(`   ${index + 1}. ${domain.domainName}: ${domain.publicationCount.toLocaleString()} publications`);
  });
  
  console.log(`\n📅 Publications by Year (Last 10 years):`);
  const recentYears = stats.byYear
    .sort((a, b) => b.year - a.year)
    .slice(0, 10);
  
  recentYears.forEach(yearStat => {
    console.log(`   ${yearStat.year}: ${yearStat.publicationCount.toLocaleString()} publications`);
  });
  
  console.log(`\n🤝 Collaboration Metrics:`);
  console.log(`   - Avg authors per paper: ${stats.collaborationMetrics.averageAuthorsPerPaper.toFixed(2)}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  switch (command) {
    case 'collect-all':
      await collectAllDomains();
      break;
      
    case 'collect-domains':
      if (args.length === 0) {
        console.error('❌ Please specify domains to collect');
        process.exit(1);
      }
      await collectSpecificDomains(args);
      break;
      
    case 'stats':
      await displayStats();
      break;
      
    case 'resume':
      if (args.length === 0) {
        console.error('❌ Please provide checkpoint file path');
        process.exit(1);
      }
      const checkpointData = require('fs').readFileSync(args[0], 'utf-8');
      await resumeCollection(checkpointData);
      break;
      
    default:
      console.log(`
🚀 MUNIN ATLAS - DATA COLLECTION TOOL

Usage:
  npm run collect-data <command> [options]

Commands:
  collect-all              Collect data for all domains
  collect-domains <d1> <d2>  Collect data for specific domains
  stats                    Display database statistics
  resume <checkpoint>      Resume from checkpoint file

Examples:
  npm run collect-data collect-all
  npm run collect-data collect-domains bacteriology genetics
  npm run collect-data stats
  npm run collect-data resume checkpoint.json
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export {
  collectAllDomains,
  collectSpecificDomains,
  collectDomainData,
  displayStats
};
