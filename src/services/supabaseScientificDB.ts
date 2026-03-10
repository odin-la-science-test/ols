/**
 * MUNIN ATLAS - SUPABASE SCIENTIFIC DATABASE SERVICE
 * Service pour interagir avec la base de données scientifique Supabase
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  ScientificPublication,
  Author,
  SearchQuery,
  SearchResult,
  CitationNetwork,
  AggregationStats
} from '../types/scientific-database';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

export class SupabaseScientificDB {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // ==========================================================================
  // PUBLICATIONS
  // ==========================================================================

  /**
   * Add a publication to the database
   */
  async addPublication(publication: ScientificPublication): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Insert publication
      const { data: pubData, error: pubError } = await this.supabase
        .from('scientific_publications')
        .insert({
          doi: publication.doi,
          pmid: publication.pmid,
          pmcid: publication.pmcid,
          arxiv_id: publication.arxivId,
          hal_id: publication.halId,
          openalex_id: publication.openAlexId,
          semantic_scholar_id: publication.semanticScholarId,
          title: publication.title,
          abstract: publication.abstract,
          year: publication.year,
          publication_date: publication.publicationDate,
          journal: publication.journal,
          conference: publication.conference,
          publisher: publication.publisher,
          volume: publication.volume,
          issue: publication.issue,
          pages: publication.pages,
          field: publication.field,
          subfields: publication.subfields,
          keywords: publication.keywords,
          mesh_terms: publication.meshTerms,
          citation_count: publication.citationCount,
          references: publication.references,
          cited_by: publication.citedBy,
          full_text: publication.fullText,
          sources: publication.sources,
          quality_score: publication.qualityScore
        })
        .select()
        .single();

      if (pubError) throw pubError;

      // Insert authors
      for (let i = 0; i < publication.authors.length; i++) {
        const author = publication.authors[i];
        await this.addAuthor(author, pubData.id, i);
      }

      // Insert figures
      if (publication.figures) {
        for (const figure of publication.figures) {
          await this.supabase.from('figures').insert({
            publication_id: pubData.id,
            caption: figure.caption,
            url: figure.url,
            figure_type: figure.type
          });
        }
      }

      // Insert datasets
      if (publication.datasets) {
        for (const dataset of publication.datasets) {
          await this.supabase.from('datasets').insert({
            publication_id: pubData.id,
            name: dataset.name,
            description: dataset.description,
            url: dataset.url,
            doi: dataset.doi,
            repository: dataset.repository,
            license: dataset.license
          });
        }
      }

      // Insert code repositories
      if (publication.codeRepositories) {
        for (const repo of publication.codeRepositories) {
          await this.supabase.from('code_repositories').insert({
            publication_id: pubData.id,
            name: repo.name,
            url: repo.url,
            platform: repo.platform,
            language: repo.language,
            stars: repo.stars,
            license: repo.license
          });
        }
      }

      return { success: true, id: pubData.id };
    } catch (error: any) {
      console.error('Error adding publication:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add an author and link to publication
   */
  private async addAuthor(author: Author, publicationId: string, order: number): Promise<void> {
    // Check if author exists
    let authorId = author.id;

    if (!authorId) {
      const { data: existingAuthor } = await this.supabase
        .from('authors')
        .select('id')
        .eq('name', author.name)
        .single();

      if (existingAuthor) {
        authorId = existingAuthor.id;
      } else {
        // Create new author
        const { data: newAuthor } = await this.supabase
          .from('authors')
          .insert({
            name: author.name,
            first_name: author.firstName,
            last_name: author.lastName,
            orcid: author.orcid,
            email: author.email,
            h_index: author.hIndex,
            citation_count: author.citationCount
          })
          .select()
          .single();

        authorId = newAuthor?.id;
      }
    }

    // Link author to publication
    if (authorId) {
      await this.supabase.from('publication_authors').insert({
        publication_id: publicationId,
        author_id: authorId,
        author_order: order
      });
    }
  }

  /**
   * Search publications
   */
  async searchPublications(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();

    try {
      let supabaseQuery = this.supabase
        .from('scientific_publications')
        .select('*', { count: 'exact' });

      // Text search
      if (query.query) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query.query}%,abstract.ilike.%${query.query}%`
        );
      }

      // Filters
      if (query.filters) {
        if (query.filters.domains && query.filters.domains.length > 0) {
          supabaseQuery = supabaseQuery.in('field', query.filters.domains);
        }

        if (query.filters.years) {
          const [minYear, maxYear] = query.filters.years;
          supabaseQuery = supabaseQuery.gte('year', minYear).lte('year', maxYear);
        }

        if (query.filters.minCitations !== undefined) {
          supabaseQuery = supabaseQuery.gte('citation_count', query.filters.minCitations);
        }

        if (query.filters.hasFullText) {
          supabaseQuery = supabaseQuery.not('full_text', 'is', null);
        }
      }

      // Sorting
      if (query.sort) {
        const field = query.sort.field === 'date' ? 'year' : 
                     query.sort.field === 'citations' ? 'citation_count' : 
                     query.sort.field;
        const ascending = query.sort.order === 'asc';
        supabaseQuery = supabaseQuery.order(field, { ascending });
      }

      // Pagination
      const page = query.pagination?.page || 1;
      const pageSize = query.pagination?.pageSize || 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      supabaseQuery = supabaseQuery.range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) throw error;

      const executionTime = Date.now() - startTime;

      return {
        publications: data as any[],
        totalCount: count || 0,
        query,
        executionTime
      };
    } catch (error) {
      console.error('Error searching publications:', error);
      return {
        publications: [],
        totalCount: 0,
        query,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get publication by ID
   */
  async getPublication(id: string): Promise<ScientificPublication | null> {
    try {
      const { data, error } = await this.supabase
        .from('scientific_publications')
        .select(`
          *,
          publication_authors (
            author_order,
            authors (*)
          ),
          figures (*),
          publication_tables (*),
          datasets (*),
          code_repositories (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.mapToPublication(data);
    } catch (error) {
      console.error('Error getting publication:', error);
      return null;
    }
  }

  /**
   * Get publications by domain
   */
  async getPublicationsByDomain(domain: string, limit: number = 100): Promise<ScientificPublication[]> {
    try {
      const { data, error } = await this.supabase
        .from('scientific_publications')
        .select('*')
        .eq('field', domain)
        .limit(limit);

      if (error) throw error;

      return data.map(pub => this.mapToPublication(pub));
    } catch (error) {
      console.error('Error getting publications by domain:', error);
      return [];
    }
  }

  /**
   * Get publications by author
   */
  async getPublicationsByAuthor(authorName: string): Promise<ScientificPublication[]> {
    try {
      const { data, error } = await this.supabase
        .from('publication_authors')
        .select(`
          scientific_publications (*)
        `)
        .eq('authors.name', authorName);

      if (error) throw error;

      return data.map((item: any) => this.mapToPublication(item.scientific_publications));
    } catch (error) {
      console.error('Error getting publications by author:', error);
      return [];
    }
  }

  // ==========================================================================
  // AUTHORS
  // ==========================================================================

  /**
   * Get author by ID
   */
  async getAuthor(id: string): Promise<Author | null> {
    try {
      const { data, error } = await this.supabase
        .from('authors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.mapToAuthor(data);
    } catch (error) {
      console.error('Error getting author:', error);
      return null;
    }
  }

  /**
   * Search authors
   */
  async searchAuthors(query: string): Promise<Author[]> {
    try {
      const { data, error } = await this.supabase
        .from('authors')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(50);

      if (error) throw error;

      return data.map(author => this.mapToAuthor(author));
    } catch (error) {
      console.error('Error searching authors:', error);
      return [];
    }
  }

  // ==========================================================================
  // DOMAINS
  // ==========================================================================

  /**
   * Get all domains
   */
  async getDomains(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('scientific_domains')
        .select('*')
        .order('name');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting domains:', error);
      return [];
    }
  }

  /**
   * Add a domain
   */
  async addDomain(name: string, description: string, parentDomainId?: string): Promise<{ success: boolean; id?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('scientific_domains')
        .insert({
          name,
          description,
          parent_domain_id: parentDomainId
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('Error adding domain:', error);
      return { success: false };
    }
  }

  // ==========================================================================
  // USER COLLECTIONS
  // ==========================================================================

  /**
   * Create a user collection
   */
  async createCollection(userEmail: string, name: string, description: string, publicationIds: string[]): Promise<{ success: boolean; id?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_collections')
        .insert({
          user_email: userEmail,
          name,
          description,
          publication_ids: publicationIds
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, id: data.id };
    } catch (error: any) {
      console.error('Error creating collection:', error);
      return { success: false };
    }
  }

  /**
   * Get user collections
   */
  async getUserCollections(userEmail: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_collections')
        .select('*')
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting user collections:', error);
      return [];
    }
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const { count: publicationCount } = await this.supabase
        .from('scientific_publications')
        .select('*', { count: 'exact', head: true });

      const { count: authorCount } = await this.supabase
        .from('authors')
        .select('*', { count: 'exact', head: true });

      const { count: domainCount } = await this.supabase
        .from('scientific_domains')
        .select('*', { count: 'exact', head: true });

      return {
        totalPublications: publicationCount || 0,
        totalAuthors: authorCount || 0,
        totalDomains: domainCount || 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        totalPublications: 0,
        totalAuthors: 0,
        totalDomains: 0
      };
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Map database row to Publication object
   */
  private mapToPublication(data: any): ScientificPublication {
    return {
      id: data.id,
      doi: data.doi,
      pmid: data.pmid,
      pmcid: data.pmcid,
      arxivId: data.arxiv_id,
      halId: data.hal_id,
      openAlexId: data.openalex_id,
      semanticScholarId: data.semantic_scholar_id,
      title: data.title,
      abstract: data.abstract,
      year: data.year,
      publicationDate: data.publication_date,
      authors: data.publication_authors?.map((pa: any) => this.mapToAuthor(pa.authors)) || [],
      journal: data.journal,
      conference: data.conference,
      publisher: data.publisher,
      volume: data.volume,
      issue: data.issue,
      pages: data.pages,
      field: data.field,
      subfields: data.subfields || [],
      keywords: data.keywords || [],
      meshTerms: data.mesh_terms || [],
      citationCount: data.citation_count,
      references: data.references || [],
      citedBy: data.cited_by || [],
      fullText: data.full_text,
      figures: data.figures || [],
      tables: data.publication_tables || [],
      datasets: data.datasets || [],
      codeRepositories: data.code_repositories || [],
      sources: data.sources || [],
      lastUpdated: data.updated_at,
      qualityScore: data.quality_score
    };
  }

  /**
   * Map database row to Author object
   */
  private mapToAuthor(data: any): Author {
    return {
      id: data.id,
      name: data.name,
      firstName: data.first_name,
      lastName: data.last_name,
      orcid: data.orcid,
      email: data.email,
      affiliations: [],
      hIndex: data.h_index,
      citationCount: data.citation_count
    };
  }
}

// Export singleton instance
export const supabaseScientificDB = new SupabaseScientificDB();
