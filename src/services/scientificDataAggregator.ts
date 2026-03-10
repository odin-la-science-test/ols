/**
 * MUNIN ATLAS - SCIENTIFIC DATA AGGREGATOR
 * Service principal pour agréger les données de toutes les sources
 */

import type {
  ScientificPublication,
  DataSource,
  SearchQuery,
  SearchResult,
  IngestionJob,
  IngestionConfig
} from '../types/scientific-database';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_CONFIGS = {
  pubmed: {
    baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
    rateLimit: 3, // requests per second
    apiKey: import.meta.env.VITE_PUBMED_API_KEY
  },
  arxiv: {
    baseUrl: 'http://export.arxiv.org/api',
    rateLimit: 1,
    apiKey: null
  },
  crossref: {
    baseUrl: 'https://api.crossref.org',
    rateLimit: 50,
    apiKey: null
  },
  europepmc: {
    baseUrl: 'https://www.ebi.ac.uk/europepmc/webservices/rest',
    rateLimit: 10,
    apiKey: null
  },
  semanticScholar: {
    baseUrl: 'https://api.semanticscholar.org/graph/v1',
    rateLimit: 100,
    apiKey: import.meta.env.VITE_SEMANTIC_SCHOLAR_API_KEY
  },
  openalex: {
    baseUrl: 'https://api.openalex.org',
    rateLimit: 10,
    apiKey: null
  },
  hal: {
    baseUrl: 'https://api.archives-ouvertes.fr/search',
    rateLimit: 5,
    apiKey: null
  }
};

// ============================================================================
// RATE LIMITER
// ============================================================================

class RateLimiter {
  private queues: Map<DataSource, Promise<any>[]> = new Map();
  private lastRequest: Map<DataSource, number> = new Map();

  async throttle(source: DataSource): Promise<void> {
    // Map DataSource to API_CONFIGS keys
    const configKey = source === 'semantic-scholar' ? 'semanticScholar' : source as keyof typeof API_CONFIGS;
    const config = API_CONFIGS[configKey];
    if (!config) return;

    const now = Date.now();
    const lastReq = this.lastRequest.get(source) || 0;
    const minInterval = 1000 / config.rateLimit;
    const timeSinceLastReq = now - lastReq;

    if (timeSinceLastReq < minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, minInterval - timeSinceLastReq)
      );
    }

    this.lastRequest.set(source, Date.now());
  }
}

const rateLimiter = new RateLimiter();

// ============================================================================
// PUBMED SERVICE
// ============================================================================

export class PubMedService {
  private baseUrl = API_CONFIGS.pubmed.baseUrl;
  private apiKey = API_CONFIGS.pubmed.apiKey;

  async search(query: string, maxResults: number = 100): Promise<ScientificPublication[]> {
    await rateLimiter.throttle('pubmed');

    try {
      // Step 1: Search for PMIDs
      const searchUrl = `${this.baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      const pmids = searchData.esearchresult?.idlist || [];
      if (pmids.length === 0) return [];

      // Step 2: Fetch details for each PMID
      await rateLimiter.throttle('pubmed');
      const fetchUrl = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
      
      const fetchResponse = await fetch(fetchUrl);
      const xmlText = await fetchResponse.text();
      
      // Parse XML and convert to ScientificPublication[]
      return this.parseXML(xmlText);
    } catch (error) {
      console.error('PubMed search error:', error);
      return [];
    }
  }

  private parseXML(xml: string): ScientificPublication[] {
    // Simplified XML parsing - in production, use a proper XML parser
    const publications: ScientificPublication[] = [];
    
    // This is a placeholder - implement proper XML parsing
    // using DOMParser or xml2js library
    
    return publications;
  }

  async getByPMID(pmid: string): Promise<ScientificPublication | null> {
    await rateLimiter.throttle('pubmed');
    
    try {
      const url = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml${this.apiKey ? `&api_key=${this.apiKey}` : ''}`;
      const response = await fetch(url);
      const xmlText = await response.text();
      const publications = this.parseXML(xmlText);
      return publications[0] || null;
    } catch (error) {
      console.error('PubMed fetch error:', error);
      return null;
    }
  }
}

// ============================================================================
// ARXIV SERVICE
// ============================================================================

export class ArxivService {
  private baseUrl = API_CONFIGS.arxiv.baseUrl;

  async search(query: string, maxResults: number = 100): Promise<ScientificPublication[]> {
    await rateLimiter.throttle('arxiv');

    try {
      const url = `${this.baseUrl}/query?search_query=${encodeURIComponent(query)}&start=0&max_results=${maxResults}`;
      const response = await fetch(url);
      const xmlText = await response.text();
      
      return this.parseAtomFeed(xmlText);
    } catch (error) {
      console.error('arXiv search error:', error);
      return [];
    }
  }

  private parseAtomFeed(xml: string): ScientificPublication[] {
    // Placeholder - implement Atom feed parsing
    return [];
  }

  async getByArxivId(arxivId: string): Promise<ScientificPublication | null> {
    await rateLimiter.throttle('arxiv');
    
    try {
      const url = `${this.baseUrl}/query?id_list=${arxivId}`;
      const response = await fetch(url);
      const xmlText = await response.text();
      const publications = this.parseAtomFeed(xmlText);
      return publications[0] || null;
    } catch (error) {
      console.error('arXiv fetch error:', error);
      return null;
    }
  }
}

// ============================================================================
// CROSSREF SERVICE
// ============================================================================

export class CrossrefService {
  private baseUrl = API_CONFIGS.crossref.baseUrl;

  async search(query: string, maxResults: number = 100): Promise<ScientificPublication[]> {
    await rateLimiter.throttle('crossref');

    try {
      const url = `${this.baseUrl}/works?query=${encodeURIComponent(query)}&rows=${maxResults}`;
      const response = await fetch(url);
      const data = await response.json();
      
      return this.convertToPublications(data.message?.items || []);
    } catch (error) {
      console.error('Crossref search error:', error);
      return [];
    }
  }

  private convertToPublications(items: any[]): ScientificPublication[] {
    return items.map(item => ({
      id: item.DOI || `crossref-${Date.now()}-${Math.random()}`,
      doi: item.DOI,
      title: Array.isArray(item.title) ? item.title[0] : item.title,
      abstract: item.abstract,
      year: item.published?.['date-parts']?.[0]?.[0] || new Date().getFullYear(),
      publicationDate: this.formatDate(item.published),
      authors: this.parseAuthors(item.author || []),
      journal: item['container-title']?.[0],
      publisher: item.publisher,
      volume: item.volume,
      issue: item.issue,
      pages: item.page,
      field: 'unknown', // To be classified
      subfields: [],
      keywords: item.subject || [],
      citationCount: item['is-referenced-by-count'] || 0,
      references: [],
      citedBy: [],
      sources: ['crossref'],
      lastUpdated: new Date().toISOString(),
      qualityScore: this.calculateQualityScore(item)
    }));
  }

  private parseAuthors(authors: any[]): any[] {
    return authors.map(author => ({
      name: `${author.given || ''} ${author.family || ''}`.trim(),
      firstName: author.given,
      lastName: author.family,
      orcid: author.ORCID,
      affiliations: author.affiliation?.map((aff: any) => ({
        institution: aff.name
      })) || []
    }));
  }

  private formatDate(published: any): string {
    if (!published?.['date-parts']?.[0]) return '';
    const parts = published['date-parts'][0];
    return `${parts[0]}-${String(parts[1] || 1).padStart(2, '0')}-${String(parts[2] || 1).padStart(2, '0')}`;
  }

  private calculateQualityScore(item: any): number {
    let score = 50; // Base score
    
    if (item.abstract) score += 10;
    if (item.author?.length > 0) score += 10;
    if (item.DOI) score += 10;
    if (item['is-referenced-by-count'] > 0) score += 10;
    if (item.publisher) score += 5;
    if (item['container-title']) score += 5;
    
    return Math.min(score, 100);
  }

  async getByDOI(doi: string): Promise<ScientificPublication | null> {
    await rateLimiter.throttle('crossref');
    
    try {
      const url = `${this.baseUrl}/works/${encodeURIComponent(doi)}`;
      const response = await fetch(url);
      const data = await response.json();
      const publications = this.convertToPublications([data.message]);
      return publications[0] || null;
    } catch (error) {
      console.error('Crossref fetch error:', error);
      return null;
    }
  }
}

// ============================================================================
// SEMANTIC SCHOLAR SERVICE
// ============================================================================

export class SemanticScholarService {
  private baseUrl = API_CONFIGS.semanticScholar.baseUrl;
  private apiKey = API_CONFIGS.semanticScholar.apiKey;

  async search(query: string, maxResults: number = 100): Promise<ScientificPublication[]> {
    await rateLimiter.throttle('semantic-scholar');

    try {
      const headers: any = {};
      if (this.apiKey) {
        headers['x-api-key'] = this.apiKey;
      }

      const url = `${this.baseUrl}/paper/search?query=${encodeURIComponent(query)}&limit=${maxResults}&fields=paperId,title,abstract,year,authors,citationCount,referenceCount,fieldsOfStudy,publicationDate,journal,doi`;
      const response = await fetch(url, { headers });
      const data = await response.json();
      
      return this.convertToPublications(data.data || []);
    } catch (error) {
      console.error('Semantic Scholar search error:', error);
      return [];
    }
  }

  private convertToPublications(items: any[]): ScientificPublication[] {
    return items.map(item => ({
      id: item.paperId || `ss-${Date.now()}-${Math.random()}`,
      semanticScholarId: item.paperId,
      doi: item.doi,
      title: item.title,
      abstract: item.abstract,
      year: item.year || new Date().getFullYear(),
      publicationDate: item.publicationDate,
      authors: item.authors?.map((author: any) => ({
        id: author.authorId,
        name: author.name,
        affiliations: []
      })) || [],
      journal: item.journal?.name,
      field: item.fieldsOfStudy?.[0] || 'unknown',
      subfields: item.fieldsOfStudy || [],
      keywords: [],
      citationCount: item.citationCount || 0,
      references: [],
      citedBy: [],
      sources: ['semantic-scholar'],
      lastUpdated: new Date().toISOString(),
      qualityScore: this.calculateQualityScore(item)
    }));
  }

  private calculateQualityScore(item: any): number {
    let score = 50;
    
    if (item.abstract) score += 15;
    if (item.authors?.length > 0) score += 10;
    if (item.doi) score += 10;
    if (item.citationCount > 0) score += 10;
    if (item.journal) score += 5;
    
    return Math.min(score, 100);
  }
}

// ============================================================================
// OPENALEX SERVICE
// ============================================================================

export class OpenAlexService {
  private baseUrl = API_CONFIGS.openalex.baseUrl;

  async search(query: string, maxResults: number = 100): Promise<ScientificPublication[]> {
    await rateLimiter.throttle('openalex');

    try {
      const url = `${this.baseUrl}/works?search=${encodeURIComponent(query)}&per-page=${Math.min(maxResults, 200)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      return this.convertToPublications(data.results || []);
    } catch (error) {
      console.error('OpenAlex search error:', error);
      return [];
    }
  }

  private convertToPublications(items: any[]): ScientificPublication[] {
    return items.map(item => ({
      id: item.id || `openalex-${Date.now()}-${Math.random()}`,
      openAlexId: item.id,
      doi: item.doi?.replace('https://doi.org/', ''),
      title: item.title,
      abstract: item.abstract_inverted_index ? this.reconstructAbstract(item.abstract_inverted_index) : undefined,
      year: item.publication_year || new Date().getFullYear(),
      publicationDate: item.publication_date,
      authors: item.authorships?.map((authorship: any) => ({
        name: authorship.author?.display_name,
        orcid: authorship.author?.orcid,
        affiliations: authorship.institutions?.map((inst: any) => ({
          institution: inst.display_name,
          country: inst.country_code,
          rorId: inst.ror
        })) || []
      })) || [],
      journal: item.primary_location?.source?.display_name,
      publisher: item.primary_location?.source?.host_organization_name,
      field: item.primary_topic?.field?.display_name || 'unknown',
      subfields: item.topics?.map((t: any) => t.display_name) || [],
      keywords: item.keywords?.map((k: any) => k.display_name) || [],
      citationCount: item.cited_by_count || 0,
      references: item.referenced_works || [],
      citedBy: [],
      sources: ['openalex'],
      lastUpdated: new Date().toISOString(),
      qualityScore: this.calculateQualityScore(item)
    }));
  }

  private reconstructAbstract(invertedIndex: any): string {
    // Reconstruct abstract from inverted index
    const words: [string, number][] = [];
    for (const [word, positions] of Object.entries(invertedIndex)) {
      for (const pos of positions as number[]) {
        words.push([word, pos]);
      }
    }
    words.sort((a, b) => a[1] - b[1]);
    return words.map(w => w[0]).join(' ');
  }

  private calculateQualityScore(item: any): number {
    let score = 50;
    
    if (item.abstract_inverted_index) score += 15;
    if (item.authorships?.length > 0) score += 10;
    if (item.doi) score += 10;
    if (item.cited_by_count > 0) score += 10;
    if (item.primary_location?.source) score += 5;
    
    return Math.min(score, 100);
  }
}

// ============================================================================
// MAIN AGGREGATOR SERVICE
// ============================================================================

export class ScientificDataAggregator {
  private pubmed = new PubMedService();
  private arxiv = new ArxivService();
  private crossref = new CrossrefService();
  private semanticScholar = new SemanticScholarService();
  private openalex = new OpenAlexService();

  /**
   * Search across all sources and aggregate results
   */
  async searchAll(query: string, maxResultsPerSource: number = 100): Promise<ScientificPublication[]> {
    const results = await Promise.allSettled([
      this.pubmed.search(query, maxResultsPerSource),
      this.arxiv.search(query, maxResultsPerSource),
      this.crossref.search(query, maxResultsPerSource),
      this.semanticScholar.search(query, maxResultsPerSource),
      this.openalex.search(query, maxResultsPerSource)
    ]);

    const allPublications: ScientificPublication[] = [];
    
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allPublications.push(...result.value);
      }
    }

    // Deduplicate by DOI
    return this.deduplicatePublications(allPublications);
  }

  /**
   * Search a specific source
   */
  async searchSource(source: DataSource, query: string, maxResults: number = 100): Promise<ScientificPublication[]> {
    switch (source) {
      case 'pubmed':
        return this.pubmed.search(query, maxResults);
      case 'arxiv':
        return this.arxiv.search(query, maxResults);
      case 'crossref':
        return this.crossref.search(query, maxResults);
      case 'semantic-scholar':
        return this.semanticScholar.search(query, maxResults);
      case 'openalex':
        return this.openalex.search(query, maxResults);
      default:
        return [];
    }
  }

  /**
   * Deduplicate publications based on DOI and title similarity
   */
  private deduplicatePublications(publications: ScientificPublication[]): ScientificPublication[] {
    const seen = new Map<string, ScientificPublication>();
    
    for (const pub of publications) {
      // Use DOI as primary key
      if (pub.doi) {
        const existing = seen.get(pub.doi);
        if (existing) {
          // Merge sources
          existing.sources = [...new Set([...existing.sources, ...pub.sources])];
          // Keep the one with higher quality score
          if (pub.qualityScore > existing.qualityScore) {
            seen.set(pub.doi, pub);
          }
        } else {
          seen.set(pub.doi, pub);
        }
      } else {
        // Use title as fallback key
        const titleKey = pub.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!seen.has(titleKey)) {
          seen.set(titleKey, pub);
        }
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * Start an ingestion job for a specific domain
   */
  async startIngestion(config: IngestionConfig): Promise<IngestionJob> {
    const job: IngestionJob = {
      id: `job-${Date.now()}`,
      source: config.source,
      domain: config.domain,
      status: 'pending',
      progress: 0,
      startTime: new Date().toISOString(),
      recordsProcessed: 0,
      recordsAdded: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: []
    };

    // Start ingestion in background
    this.runIngestion(job, config).catch(error => {
      console.error('Ingestion error:', error);
      job.status = 'failed';
      job.errors.push({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    });

    return job;
  }

  private async runIngestion(job: IngestionJob, config: IngestionConfig): Promise<void> {
    job.status = 'running';
    
    // Implementation will vary based on source and domain
    // This is a placeholder for the actual ingestion logic
    
    const query = config.domain; // Simplified - use domain as query
    const publications = await this.searchSource(config.source, query, config.maxRecords || 1000);
    
    job.recordsProcessed = publications.length;
    job.recordsAdded = publications.length; // Simplified
    job.progress = 100;
    job.status = 'completed';
    job.endTime = new Date().toISOString();
  }
}

// Export singleton instance
export const scientificDataAggregator = new ScientificDataAggregator();
