/**
 * MUNIN ATLAS - SCIENTIFIC DATABASE TYPES
 * Types pour la base de données scientifique massive
 */

// ============================================================================
// PUBLICATION TYPES
// ============================================================================

export interface ScientificPublication {
  // Identifiants
  id: string;
  doi?: string;
  pmid?: string; // PubMed ID
  pmcid?: string; // PubMed Central ID
  arxivId?: string;
  halId?: string;
  openAlexId?: string;
  semanticScholarId?: string;
  
  // Métadonnées de base
  title: string;
  abstract?: string;
  year: number;
  publicationDate?: string;
  
  // Auteurs
  authors: Author[];
  correspondingAuthor?: Author;
  
  // Publication
  journal?: string;
  conference?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  
  // Classification
  field: string; // Domaine principal
  subfields: string[]; // Sous-domaines
  keywords: string[];
  meshTerms?: string[]; // Medical Subject Headings
  
  // Citations
  citationCount: number;
  references: string[]; // DOIs ou IDs des références
  citedBy: string[]; // DOIs ou IDs des articles citant
  
  // Contenu enrichi
  fullText?: string;
  figures?: Figure[];
  tables?: Table[];
  supplementaryMaterials?: SupplementaryMaterial[];
  
  // Données liées
  datasets?: Dataset[];
  codeRepositories?: CodeRepository[];
  
  // Métriques
  metrics?: PublicationMetrics;
  
  // Métadonnées système
  sources: DataSource[];
  lastUpdated: string;
  qualityScore: number; // 0-100
}

export interface Author {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  orcid?: string;
  email?: string;
  affiliations: Affiliation[];
  hIndex?: number;
  citationCount?: number;
}

export interface Affiliation {
  institution: string;
  department?: string;
  city?: string;
  country?: string;
  rorId?: string; // Research Organization Registry ID
}

export interface Figure {
  id: string;
  caption: string;
  url?: string;
  type: 'graph' | 'diagram' | 'photo' | 'chart' | 'other';
}

export interface Table {
  id: string;
  caption: string;
  data?: any[][];
  headers?: string[];
}

export interface SupplementaryMaterial {
  id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  url?: string;
  doi?: string;
  repository?: string;
  license?: string;
}

export interface CodeRepository {
  id: string;
  name: string;
  url: string;
  platform: 'github' | 'gitlab' | 'bitbucket' | 'other';
  language?: string;
  stars?: number;
  license?: string;
}

export interface PublicationMetrics {
  views?: number;
  downloads?: number;
  altmetricScore?: number;
  fieldCitationRatio?: number; // Normalized citation impact
  relativeCitationRatio?: number;
  influentialCitationCount?: number;
}

export type DataSource = 
  | 'pubmed'
  | 'arxiv'
  | 'crossref'
  | 'europepmc'
  | 'semantic-scholar'
  | 'openalex'
  | 'hal'
  | 'google-scholar';

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export interface ScientificDomain {
  id: string;
  name: string;
  description: string;
  parentDomain?: string;
  subDomains: string[];
  
  // Statistiques
  publicationCount: number;
  authorCount: number;
  institutionCount: number;
  
  // Entités clés
  keyEntities: ScientificEntity[];
  keyAuthors: Author[];
  keyJournals: Journal[];
  
  // Relations
  relatedDomains: DomainRelation[];
  
  // Métadonnées
  lastUpdated: string;
}

export interface ScientificEntity {
  id: string;
  name: string;
  type: 'concept' | 'method' | 'organism' | 'molecule' | 'theory' | 'other';
  description: string;
  aliases: string[];
  
  // Relations
  relatedEntities: EntityRelation[];
  publications: string[]; // Publication IDs
  
  // Propriétés
  properties: EntityProperty[];
}

export interface EntityProperty {
  id: string;
  name: string;
  value: string;
  unit?: string;
  description?: string;
  source?: string;
}

export interface EntityRelation {
  targetEntityId: string;
  relationType: 'is-a' | 'part-of' | 'related-to' | 'causes' | 'inhibits' | 'activates';
  strength: number; // 0-1
  evidence: string[]; // Publication IDs
}

export interface DomainRelation {
  targetDomainId: string;
  relationType: 'parent' | 'child' | 'related' | 'overlaps';
  strength: number; // 0-1
  sharedPublications: number;
}

export interface Journal {
  id: string;
  name: string;
  issn?: string;
  eissn?: string;
  publisher?: string;
  impactFactor?: number;
  hIndex?: number;
  publicationCount: number;
  domains: string[];
}

// ============================================================================
// CITATION NETWORK TYPES
// ============================================================================

export interface CitationNetwork {
  nodes: CitationNode[];
  edges: CitationEdge[];
  metrics: NetworkMetrics;
}

export interface CitationNode {
  publicationId: string;
  title: string;
  year: number;
  authors: string[];
  citationCount: number;
  pageRank?: number;
  betweennessCentrality?: number;
  clusteringCoefficient?: number;
}

export interface CitationEdge {
  source: string; // Publication ID
  target: string; // Publication ID
  weight: number;
  year: number;
}

export interface NetworkMetrics {
  nodeCount: number;
  edgeCount: number;
  density: number;
  averageDegree: number;
  diameter?: number;
  averagePathLength?: number;
  clusteringCoefficient?: number;
  communities?: Community[];
}

export interface Community {
  id: string;
  name?: string;
  members: string[]; // Publication IDs
  size: number;
  cohesion: number;
}

// ============================================================================
// SEARCH & QUERY TYPES
// ============================================================================

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export interface SearchFilters {
  domains?: string[];
  years?: [number, number];
  authors?: string[];
  journals?: string[];
  keywords?: string[];
  minCitations?: number;
  hasFullText?: boolean;
  hasDataset?: boolean;
  hasCode?: boolean;
  sources?: DataSource[];
}

export interface SortOptions {
  field: 'relevance' | 'date' | 'citations' | 'title';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface SearchResult {
  publications: ScientificPublication[];
  totalCount: number;
  facets?: SearchFacets;
  query: SearchQuery;
  executionTime: number;
}

export interface SearchFacets {
  domains: FacetCount[];
  years: FacetCount[];
  authors: FacetCount[];
  journals: FacetCount[];
  keywords: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

// ============================================================================
// AGGREGATION TYPES
// ============================================================================

export interface AggregationStats {
  totalPublications: number;
  totalAuthors: number;
  totalInstitutions: number;
  totalCitations: number;
  domainsCount: number;
  
  byYear: YearStats[];
  byDomain: DomainStats[];
  byCountry: CountryStats[];
  byInstitution: InstitutionStats[];
  
  topAuthors: AuthorStats[];
  topJournals: JournalStats[];
  topKeywords: KeywordStats[];
  
  growthRate: GrowthRate;
  collaborationMetrics: CollaborationMetrics;
}

export interface YearStats {
  year: number;
  publicationCount: number;
  citationCount: number;
  newAuthors: number;
}

export interface DomainStats {
  domainId: string;
  domainName: string;
  publicationCount: number;
  citationCount: number;
  authorCount: number;
  growthRate: number;
}

export interface CountryStats {
  country: string;
  publicationCount: number;
  citationCount: number;
  institutionCount: number;
  topInstitutions: string[];
}

export interface InstitutionStats {
  institution: string;
  country: string;
  publicationCount: number;
  citationCount: number;
  authorCount: number;
  hIndex: number;
}

export interface AuthorStats {
  authorId: string;
  name: string;
  publicationCount: number;
  citationCount: number;
  hIndex: number;
  domains: string[];
}

export interface JournalStats {
  journalId: string;
  name: string;
  publicationCount: number;
  impactFactor?: number;
  citationCount: number;
}

export interface KeywordStats {
  keyword: string;
  count: number;
  domains: string[];
  trend: 'rising' | 'stable' | 'declining';
}

export interface GrowthRate {
  overall: number; // Percentage
  byDomain: { [domainId: string]: number };
  byYear: { [year: number]: number };
}

export interface CollaborationMetrics {
  averageAuthorsPerPaper: number;
  internationalCollaborationRate: number;
  interInstitutionalCollaborationRate: number;
  interdisciplinaryRate: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp: string;
  executionTime: number;
  source: string;
  version: string;
}

// ============================================================================
// INGESTION TYPES
// ============================================================================

export interface IngestionJob {
  id: string;
  source: DataSource;
  domain: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  startTime: string;
  endTime?: string;
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: IngestionError[];
}

export interface IngestionError {
  recordId?: string;
  error: string;
  timestamp: string;
}

export interface IngestionConfig {
  source: DataSource;
  domain: string;
  batchSize: number;
  maxRecords?: number;
  startDate?: string;
  endDate?: string;
  filters?: any;
}
