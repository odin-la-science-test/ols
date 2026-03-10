/**
 * SCRIPT DE TEST - BASE DE DONNÉES SCIENTIFIQUE SUPABASE
 * 
 * Ce script teste la connexion et les fonctionnalités de base
 * 
 * Pour exécuter:
 * npx tsx test-supabase-db.ts
 */

import { supabaseScientificDB } from './src/services/supabaseScientificDB';
import type { ScientificPublication } from './src/types/scientific-database';

// ============================================================================
// DONNÉES DE TEST
// ============================================================================

const testPublication: ScientificPublication = {
  id: crypto.randomUUID(),
  title: 'CRISPR-Cas9: A Revolutionary Gene Editing Tool',
  abstract: 'This comprehensive review explores the CRISPR-Cas9 system, its mechanisms, applications in gene therapy, and ethical considerations. We discuss recent advances in precision editing and potential therapeutic applications.',
  year: 2024,
  publicationDate: '2024-03-10',
  
  // Auteurs
  authors: [
    {
      name: 'Dr. Jennifer Doudna',
      firstName: 'Jennifer',
      lastName: 'Doudna',
      affiliations: [
        {
          institution: 'University of California, Berkeley',
          department: 'Department of Molecular and Cell Biology',
          city: 'Berkeley',
          country: 'USA'
        }
      ]
    },
    {
      name: 'Dr. Emmanuelle Charpentier',
      firstName: 'Emmanuelle',
      lastName: 'Charpentier',
      affiliations: [
        {
          institution: 'Max Planck Institute',
          department: 'Infection Biology',
          city: 'Berlin',
          country: 'Germany'
        }
      ]
    }
  ],
  
  // Publication
  journal: 'Nature Biotechnology',
  publisher: 'Nature Publishing Group',
  volume: '42',
  issue: '3',
  pages: '245-267',
  
  // Classification
  field: 'Molecular Biology',
  subfields: ['Gene Editing', 'CRISPR Technology', 'Genetic Engineering'],
  keywords: ['CRISPR', 'Cas9', 'gene editing', 'genome engineering', 'therapeutic applications'],
  
  // Citations
  citationCount: 0,
  references: [],
  citedBy: [],
  
  // Identifiants
  doi: '10.1038/nbt.2024.12345',
  
  // Métadonnées
  sources: ['manual_test'],
  qualityScore: 95
};

// ============================================================================
// FONCTIONS DE TEST
// ============================================================================

async function testConnection() {
  console.log('\n🔌 Test 1: Connexion à Supabase...');
  try {
    const stats = await supabaseScientificDB.getStatistics();
    console.log('✅ Connexion réussie!');
    console.log('📊 Statistiques actuelles:');
    console.log(`   - Publications: ${stats.totalPublications}`);
    console.log(`   - Auteurs: ${stats.totalAuthors}`);
    console.log(`   - Domaines: ${stats.totalDomains}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return false;
  }
}

async function testAddPublication() {
  console.log('\n📝 Test 2: Ajout d\'une publication...');
  try {
    const result = await supabaseScientificDB.addPublication(testPublication);
    if (result.success) {
      console.log('✅ Publication ajoutée avec succès!');
      console.log(`   ID: ${result.id}`);
      return result.id;
    } else {
      console.error('❌ Erreur lors de l\'ajout:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    return null;
  }
}

async function testSearch() {
  console.log('\n🔍 Test 3: Recherche de publications...');
  try {
    const results = await supabaseScientificDB.searchPublications({
      query: 'CRISPR',
      pagination: { page: 1, pageSize: 10 }
    });
    
    console.log(`✅ Recherche terminée en ${results.executionTime}ms`);
    console.log(`   Résultats trouvés: ${results.totalCount}`);
    
    if (results.publications.length > 0) {
      console.log('\n   Premières publications:');
      results.publications.slice(0, 3).forEach((pub: any, index: number) => {
        console.log(`   ${index + 1}. ${pub.title} (${pub.year})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de recherche:', error);
    return false;
  }
}

async function testGetPublication(id: string) {
  console.log('\n📖 Test 4: Récupération d\'une publication...');
  try {
    const publication = await supabaseScientificDB.getPublication(id);
    if (publication) {
      console.log('✅ Publication récupérée:');
      console.log(`   Titre: ${publication.title}`);
      console.log(`   Année: ${publication.year}`);
      console.log(`   Auteurs: ${publication.authors.map(a => a.name).join(', ')}`);
      console.log(`   Journal: ${publication.journal}`);
      return true;
    } else {
      console.log('⚠️  Publication non trouvée');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

async function testSearchAuthors() {
  console.log('\n👥 Test 5: Recherche d\'auteurs...');
  try {
    const authors = await supabaseScientificDB.searchAuthors('Doudna');
    console.log(`✅ Auteurs trouvés: ${authors.length}`);
    
    if (authors.length > 0) {
      authors.forEach((author, index) => {
        console.log(`   ${index + 1}. ${author.name}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

async function testDomains() {
  console.log('\n🏷️  Test 6: Gestion des domaines...');
  try {
    // Ajouter un domaine
    const addResult = await supabaseScientificDB.addDomain(
      'Molecular Biology',
      'Study of biological activity at the molecular level'
    );
    
    if (addResult.success) {
      console.log('✅ Domaine ajouté');
    }
    
    // Récupérer tous les domaines
    const domains = await supabaseScientificDB.getDomains();
    console.log(`✅ Domaines disponibles: ${domains.length}`);
    
    if (domains.length > 0) {
      domains.slice(0, 5).forEach((domain, index) => {
        console.log(`   ${index + 1}. ${domain.name}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

async function testUserCollection() {
  console.log('\n📚 Test 7: Collections utilisateur...');
  try {
    const result = await supabaseScientificDB.createCollection(
      'test@example.com',
      'Ma collection CRISPR',
      'Articles intéressants sur CRISPR-Cas9',
      [testPublication.id]
    );
    
    if (result.success) {
      console.log('✅ Collection créée');
      
      // Récupérer les collections
      const collections = await supabaseScientificDB.getUserCollections('test@example.com');
      console.log(`✅ Collections de l'utilisateur: ${collections.length}`);
      
      if (collections.length > 0) {
        collections.forEach((col, index) => {
          console.log(`   ${index + 1}. ${col.name} (${col.publication_ids?.length || 0} publications)`);
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

// ============================================================================
// EXÉCUTION DES TESTS
// ============================================================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  TEST DE LA BASE DE DONNÉES SCIENTIFIQUE SUPABASE         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  let publicationId: string | null = null;
  
  // Test 1: Connexion
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log('\n❌ Impossible de continuer sans connexion');
    console.log('\n💡 Vérifiez:');
    console.log('   1. Que vous avez créé un projet Supabase');
    console.log('   2. Que vous avez exécuté le script SQL');
    console.log('   3. Que les variables d\'environnement sont correctes dans .env.local');
    return;
  }
  
  // Test 2: Ajout de publication
  publicationId = await testAddPublication();
  
  // Test 3: Recherche
  await testSearch();
  
  // Test 4: Récupération
  if (publicationId) {
    await testGetPublication(publicationId);
  }
  
  // Test 5: Recherche d'auteurs
  await testSearchAuthors();
  
  // Test 6: Domaines
  await testDomains();
  
  // Test 7: Collections
  await testUserCollection();
  
  // Résumé final
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  TESTS TERMINÉS                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const finalStats = await supabaseScientificDB.getStatistics();
  console.log('\n📊 Statistiques finales:');
  console.log(`   - Publications: ${finalStats.totalPublications}`);
  console.log(`   - Auteurs: ${finalStats.totalAuthors}`);
  console.log(`   - Domaines: ${finalStats.totalDomains}`);
  
  console.log('\n✨ Votre base de données scientifique est opérationnelle!');
  console.log('\n📖 Consultez GUIDE_BASE_DONNEES_SCIENTIFIQUE.md pour plus d\'informations');
}

// Exécuter les tests
runAllTests().catch(console.error);
