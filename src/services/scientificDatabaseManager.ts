/**
 * MUNIN ATLAS - SCIENTIFIC DATABASE MANAGER
 * Gestion du stockage et de l'indexation de la base de données scientifique
 */

import type {
  ScientificPublication,
  ScientificDomain,
  SearchQuery,
  SearchResult,
  AggregationStats,
  CitationNetwork
} from '../types/scientific-database';

// ============================================================================
// DATABASE MANAGER
// ============================================================================

export class ScientificDatabaseManager {
  private publications: Map<string, ScientificPublication> = new Map();
  private domains: Map<string, ScientificDomain> = new Map();
  private citationIndex: Map<string, Set<string>> = new Map(); // publicationId -> citing publications
  private authorIndex: Map<string, Set<string>> = new Map(); // authorName -> publication IDs
  private keywordIndex: Map<string, Set<string>> = new Map(); // keyword -> publication IDs
  private yearIndex: Map<number, Set<string>> = new Map(); // year -> publication IDs
  private domainIndex: Map<string, Set<string>> = new Map(); // domain -> publication IDs

  /**
   * Initialize the database with existing data
   */
  async initialize(): Promise<void> {
    // Load from localStorage or IndexedDB
    await this.loadFromStorage();
    console.log(`📚 Database initialized with ${this.publications.size} publications`);
  }

  /**
   * Add a publication to the database
   */
  async addPublication(publication: ScientificPublication): Promise<void> {
    // Store publication
    this.publications.set(publication.id, publication);

    // Update indices
    this.updateIndices(publication);

    // Persist to storage
    await this.saveToStorage();
  }

  /**
   * Add multiple publications in batch
   */
  async addPublications(publications: ScientificPublication[]): Promise<void> {
    for (const pub of publications) {
      this.publications.set(pub.id, pub);
      this.updateIndices(pub);
    }

    await this.saveToStorage();
    console.log(`✅ Added ${publications.length} publications to database`);
  }

  /**
   * Update indices for a publication
   */
  private updateIndices(publication: ScientificPublication): void {
    // Citation index
    for (const citedId of publication.references) {
      if (!this.citationIndex.has(citedId)) {
        this.citationIndex.set(citedId, new Set());
      }
      this.citationIndex.get(citedId)!.add(publication.id);
    }

    // Author index
    for (const author of publication.authors) {
      const authorKey = author.name.toLowerCase();
      if (!this.authorIndex.has(authorKey)) {
        this.authorIndex.set(authorKey, new Set());
      }
      this.authorIndex.get(authorKey)!.add(publication.id);
    }

    // Keyword index
    for (const keyword of publication.keywords) {
      const keywordKey = keyword.toLowerCase();
      if (!this.keywordIndex.has(keywordKey)) {
        this.keywordIndex.set(keywordKey, new Set());
      }
      this.keywordIndex.get(keywordKey)!.add(publication.id);
    }

    // Year index
    if (!this.yearIndex.has(publication.year)) {
      this.yearIndex.set(publication.year, new Set());
    }
    this.yearIndex.get(publication.year)!.add(publication.id);

    // Domain index
    const domainKey = publication.field.toLowerCase();
    if (!this.domainIndex.has(domainKey)) {
      this.domainIndex.set(domainKey, new Set());
    }
    this.domainIndex.get(domainKey)!.add(publication.id);
  }

  /**
   * Search publications
   */
  async search(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    let results: ScientificPublication[] = [];

    // Simple text search in title and abstract
    const searchTerm = query.query.toLowerCase();
    
    for (const pub of this.publications.values()) {
      const titleMatch = pub.title.toLowerCase().includes(searchTerm);
      const abstractMatch = pub.abstract?.toLowerCase().includes(searchTerm);
      
      if (titleMatch || abstractMatch) {
        // Apply filters
        if (this.matchesFilters(pub, query.filters)) {
          results.push(pub);
        }
      }
    }

    // Sort results
    results = this.sortResults(results, query.sort);

    // Paginate
    const page = query.pagination?.page || 1;
    const pageSize = query.pagination?.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const paginatedResults = results.slice(startIndex, startIndex + pageSize);

    const executionTime = Date.now() - startTime;

    return {
      publications: paginatedResults,
      totalCount: results.length,
      query,
      executionTime
    };
  }

  /**
   * Check if publication matches filters
   */
  private matchesFilters(pub: ScientificPublication, filters?: any): boolean {
    if (!filters) return true;

    // Domain filter
    if (filters.domains && filters.domains.length > 0) {
      if (!filters.domains.includes(pub.field)) return false;
    }

    // Year filter
    if (filters.years) {
      const [minYear, maxYear] = filters.years;
      if (pub.year < minYear || pub.year > maxYear) return false;
    }

    // Author filter
    if (filters.authors && filters.authors.length > 0) {
      const hasAuthor = pub.authors.some(author =>
        filters.authors.some((filterAuthor: string) =>
          author.name.toLowerCase().includes(filterAuthor.toLowerCase())
        )
      );
      if (!hasAuthor) return false;
    }

    // Citation filter
    if (filters.minCitations !== undefined) {
      if (pub.citationCount < filters.minCitations) return false;
    }

    // Full text filter
    if (filters.hasFullText && !pub.fullText) return false;

    // Dataset filter
    if (filters.hasDataset && (!pub.datasets || pub.datasets.length === 0)) return false;

    // Code filter
    if (filters.hasCode && (!pub.codeRepositories || pub.codeRepositories.length === 0)) return false;

    return true;
  }

  /**
   * Sort results
   */
  private sortResults(results: ScientificPublication[], sort?: any): ScientificPublication[] {
    if (!sort) return results;

    const field = sort.field || 'relevance';
    const order = sort.order || 'desc';

    return results.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'date':
          comparison = a.year - b.year;
          break;
        case 'citations':
          comparison = a.citationCount - b.citationCount;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = a.qualityScore - b.qualityScore;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Get publication by ID
   */
  async getPublication(id: string): Promise<ScientificPublication | null> {
    return this.publications.get(id) || null;
  }

  /**
   * Get publications by domain
   */
  async getPublicationsByDomain(domainId: string): Promise<ScientificPublication[]> {
    const pubIds = this.domainIndex.get(domainId.toLowerCase()) || new Set();
    return Array.from(pubIds).map(id => this.publications.get(id)!).filter(Boolean);
  }

  /**
   * Get publications by author
   */
  async getPublicationsByAuthor(authorName: string): Promise<ScientificPublication[]> {
    const pubIds = this.authorIndex.get(authorName.toLowerCase()) || new Set();
    return Array.from(pubIds).map(id => this.publications.get(id)!).filter(Boolean);
  }

  /**
   * Get publications by year
   */
  async getPublicationsByYear(year: number): Promise<ScientificPublication[]> {
    const pubIds = this.yearIndex.get(year) || new Set();
    return Array.from(pubIds).map(id => this.publications.get(id)!).filter(Boolean);
  }

  /**
   * Get citation network for a publication
   */
  async getCitationNetwork(publicationId: string, depth: number = 2): Promise<CitationNetwork> {
    const nodes: any[] = [];
    const edges: any[] = [];
    const visited = new Set<string>();

    const traverse = (pubId: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(pubId)) return;
      visited.add(pubId);

      const pub = this.publications.get(pubId);
      if (!pub) return;

      // Add node
      nodes.push({
        publicationId: pub.id,
        title: pub.title,
        year: pub.year,
        authors: pub.authors.map(a => a.name),
        citationCount: pub.citationCount
      });

      // Add edges for references
      for (const refId of pub.references) {
        edges.push({
          source: pub.id,
          target: refId,
          weight: 1,
          year: pub.year
        });
        traverse(refId, currentDepth + 1);
      }

      // Add edges for citations
      const citingPubs = this.citationIndex.get(pubId) || new Set();
      for (const citingId of citingPubs) {
        const citingPub = this.publications.get(citingId);
        if (citingPub) {
          edges.push({
            source: citingId,
            target: pub.id,
            weight: 1,
            year: citingPub.year
          });
          traverse(citingId, currentDepth + 1);
        }
      }
    };

    traverse(publicationId, 0);

    return {
      nodes,
      edges,
      metrics: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        density: edges.length / (nodes.length * (nodes.length - 1)),
        averageDegree: (2 * edges.length) / nodes.length
      }
    };
  }

  /**
   * Get aggregation statistics
   */
  async getAggregationStats(): Promise<AggregationStats> {
    const publications = Array.from(this.publications.values());
    
    // Calculate statistics
    const totalPublications = publications.length;
    const totalCitations = publications.reduce((sum, pub) => sum + pub.citationCount, 0);
    
    // Unique authors
    const uniqueAuthors = new Set<string>();
    publications.forEach(pub => {
      pub.authors.forEach(author => uniqueAuthors.add(author.name.toLowerCase()));
    });

    // Unique institutions
    const uniqueInstitutions = new Set<string>();
    publications.forEach(pub => {
      pub.authors.forEach(author => {
        author.affiliations.forEach(aff => uniqueInstitutions.add(aff.institution));
      });
    });

    // By year
    const byYear: any[] = [];
    for (const [year, pubIds] of this.yearIndex.entries()) {
      const yearPubs = Array.from(pubIds).map(id => this.publications.get(id)!).filter(Boolean);
      byYear.push({
        year,
        publicationCount: yearPubs.length,
        citationCount: yearPubs.reduce((sum, pub) => sum + pub.citationCount, 0),
        newAuthors: 0 // TODO: Calculate
      });
    }
    byYear.sort((a, b) => a.year - b.year);

    // By domain
    const byDomain: any[] = [];
    for (const [domain, pubIds] of this.domainIndex.entries()) {
      const domainPubs = Array.from(pubIds).map(id => this.publications.get(id)!).filter(Boolean);
      byDomain.push({
        domainId: domain,
        domainName: domain,
        publicationCount: domainPubs.length,
        citationCount: domainPubs.reduce((sum, pub) => sum + pub.citationCount, 0),
        authorCount: new Set(domainPubs.flatMap(pub => pub.authors.map(a => a.name))).size,
        growthRate: 0 // TODO: Calculate
      });
    }

    return {
      totalPublications,
      totalAuthors: uniqueAuthors.size,
      totalInstitutions: uniqueInstitutions.size,
      totalCitations,
      domainsCount: this.domainIndex.size,
      byYear,
      byDomain,
      byCountry: [],
      byInstitution: [],
      topAuthors: [],
      topJournals: [],
      topKeywords: [],
      growthRate: {
        overall: 0,
        byDomain: {},
        byYear: {}
      },
      collaborationMetrics: {
        averageAuthorsPerPaper: publications.reduce((sum, pub) => sum + pub.authors.length, 0) / publications.length,
        internationalCollaborationRate: 0,
        interInstitutionalCollaborationRate: 0,
        interdisciplinaryRate: 0
      }
    };
  }

  /**
   * Export database to JSON
   */
  async exportToJSON(): Promise<string> {
    const data = {
      publications: Array.from(this.publications.values()),
      domains: Array.from(this.domains.values()),
      metadata: {
        exportDate: new Date().toISOString(),
        totalPublications: this.publications.size,
        totalDomains: this.domains.size
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import database from JSON
   */
  async importFromJSON(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    this.publications.clear();
    this.domains.clear();
    this.clearIndices();

    // Import publications
    for (const pub of data.publications || []) {
      await this.addPublication(pub);
    }

    // Import domains
    for (const domain of data.domains || []) {
      this.domains.set(domain.id, domain);
    }

    console.log(`📥 Imported ${this.publications.size} publications and ${this.domains.size} domains`);
  }

  /**
   * Clear all indices
   */
  private clearIndices(): void {
    this.citationIndex.clear();
    this.authorIndex.clear();
    this.keywordIndex.clear();
    this.yearIndex.clear();
    this.domainIndex.clear();
  }

  /**
   * Save to localStorage
   */
  private async saveToStorage(): Promise<void> {
    try {
      // Save publications in chunks to avoid localStorage size limits
      const publications = Array.from(this.publications.values());
      const chunkSize = 100;
      
      for (let i = 0; i < publications.length; i += chunkSize) {
        const chunk = publications.slice(i, i + chunkSize);
        const chunkKey = `munin_publications_${Math.floor(i / chunkSize)}`;
        localStorage.setItem(chunkKey, JSON.stringify(chunk));
      }

      // Save metadata
      localStorage.setItem('munin_metadata', JSON.stringify({
        totalPublications: publications.length,
        totalChunks: Math.ceil(publications.length / chunkSize),
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const metadata = JSON.parse(localStorage.getItem('munin_metadata') || '{}');
      const totalChunks = metadata.totalChunks || 0;

      for (let i = 0; i < totalChunks; i++) {
        const chunkKey = `munin_publications_${i}`;
        const chunkData = localStorage.getItem(chunkKey);
        
        if (chunkData) {
          const publications: ScientificPublication[] = JSON.parse(chunkData);
          for (const pub of publications) {
            this.publications.set(pub.id, pub);
            this.updateIndices(pub);
          }
        }
      }

      console.log(`📂 Loaded ${this.publications.size} publications from storage`);
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  /**
   * Get database statistics
   */
  getStats() {
    return {
      publications: this.publications.size,
      domains: this.domains.size,
      authors: this.authorIndex.size,
      keywords: this.keywordIndex.size,
      years: this.yearIndex.size
    };
  }
}

// Export singleton instance
export const scientificDatabaseManager = new ScientificDatabaseManager();
