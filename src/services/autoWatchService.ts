/**
 * Service d'Auto-Watch Automatique
 * - Exécution toutes les heures
 * - Email si nouvelle revue trouvée
 * - Email quotidien si aucune nouvelle revue en 24h
 */

import { fetchModuleData, saveModuleItem } from '../utils/persistence';

interface WatchItem {
    type: 'author' | 'keyword' | 'orcid';
    value: string;
    id?: string;
}

interface Article {
    id?: string;
    title: string;
    abstract: string;
    year: string;
    authors: string;
    doi: string;
    source: string;
    sourceUrl: string;
    url: string;
    pdfUrl: string | null;
    dateAdded?: string;
    folderId?: string;
    autoArchived?: boolean;
}

interface WatchResult {
    watchItem: WatchItem;
    articlesFound: number;
    newArticles: Article[];
    timestamp: string;
}

// Stockage des derniers résultats pour éviter les doublons
let lastWatchResults: Map<string, Set<string>> = new Map();
let lastEmailSent: Map<string, number> = new Map();

const ONE_HOUR = 60 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Recherche PubMed
 */
const searchPubMed = async (query: string, limit = 20): Promise<Article[]> => {
    try {
        const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const idList = searchData.esearchresult?.idlist || [];
        if (idList.length === 0) return [];

        const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${idList.join(',')}&retmode=xml`;
        const fetchRes = await fetch(fetchUrl);
        const xmlText = await fetchRes.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');
        const articlesXml = xml.querySelectorAll('PubmedArticle');

        const results: Article[] = [];
        articlesXml.forEach(art => {
            const title = art.querySelector('ArticleTitle')?.textContent || 'Untitled';
            const abstract = art.querySelector('AbstractText')?.textContent || 'No abstract available';
            const year = art.querySelector('PubDate Year')?.textContent || '';
            const pmid = art.querySelector('PMID')?.textContent || '';
            const doi = art.querySelector('ArticleId[IdType="doi"]')?.textContent || '';
            const authors: string[] = [];
            art.querySelectorAll('Author').forEach(au => {
                const fn = au.querySelector('ForeName')?.textContent || '';
                const ln = au.querySelector('LastName')?.textContent || '';
                if (fn || ln) authors.push(`${fn} ${ln}`.trim());
            });
            results.push({
                title,
                abstract: abstract.substring(0, 300),
                year,
                authors: authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : ''),
                doi: doi || `PMID:${pmid}`,
                source: 'PubMed',
                sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
                url: `https://doi.org/${doi}`,
                pdfUrl: doi ? `https://doi.org/${doi}` : null
            });
        });
        return results;
    } catch (e) {
        console.error('PubMed error:', e);
        return [];
    }
};

/**
 * Recherche arXiv
 */
const searchArXiv = async (query: string, limit = 20): Promise<Article[]> => {
    try {
        const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`;
        const res = await fetch(url);
        const xmlText = await res.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'text/xml');
        const entries = xml.querySelectorAll('entry');
        const results: Article[] = [];
        entries.forEach(entry => {
            const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled';
            const abstract = entry.querySelector('summary')?.textContent?.trim() || 'No abstract available';
            const published = entry.querySelector('published')?.textContent || '';
            const year = published ? new Date(published).getFullYear().toString() : '';
            const id = entry.querySelector('id')?.textContent || '';
            const arxivId = id.split('/abs/').pop() || '';
            const authors: string[] = [];
            entry.querySelectorAll('author name').forEach(a => {
                const name = a.textContent?.trim();
                if (name) authors.push(name);
            });
            results.push({
                title,
                abstract: abstract.substring(0, 300),
                year,
                authors: authors.slice(0, 3).join(', ') + (authors.length > 3 ? ' et al.' : ''),
                doi: arxivId,
                source: 'arXiv',
                sourceUrl: `https://arxiv.org/abs/${arxivId}`,
                url: `https://arxiv.org/abs/${arxivId}`,
                pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`
            });
        });
        return results;
    } catch (e) {
        console.error('arXiv error:', e);
        return [];
    }
};

/**
 * Dédoublonnage des articles
 */
const deduplicateArticles = (articles: Article[]): Article[] => {
    const seen = new Set<string>();
    return articles.filter(article => {
        const key = article.doi || article.title.toLowerCase().replace(/[^\w\s]/g, '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

/**
 * Vérifie si un article est nouveau (pas dans les résultats précédents)
 */
const isNewArticle = (article: Article, watchKey: string): boolean => {
    const previousResults = lastWatchResults.get(watchKey);
    if (!previousResults) return true;
    
    const articleKey = article.doi || article.title;
    return !previousResults.has(articleKey);
};

/**
 * Enregistre les résultats pour éviter les doublons futurs
 */
const recordResults = (articles: Article[], watchKey: string) => {
    const articleKeys = new Set(articles.map(a => a.doi || a.title));
    lastWatchResults.set(watchKey, articleKeys);
};

/**
 * Envoie un email via le système de messagerie interne
 */
const sendInternalEmail = async (
    recipient: string,
    subject: string,
    body: string
): Promise<void> => {
    try {
        const message = {
            id: Date.now().toString(),
            sender: 'Auto-Watch System',
            recipient: recipient,
            subject: subject,
            preview: body.substring(0, 50) + '...',
            date: new Date().toISOString(),
            read: false,
            body: body,
            folder: 'inbox' as const
        };
        
        await saveModuleItem('messaging', message);
        console.log(`Email sent to ${recipient}: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

/**
 * Exécute une recherche pour un item de veille
 */
const performWatchSearch = async (watchItem: WatchItem): Promise<WatchResult> => {
    let query = '';
    if (watchItem.type === 'author') {
        query = watchItem.value;
    } else if (watchItem.type === 'keyword') {
        query = watchItem.value;
    } else if (watchItem.type === 'orcid') {
        query = `ORCID:${watchItem.value}`;
    }

    const [pubmedResults, arxivResults] = await Promise.all([
        searchPubMed(query),
        searchArXiv(query)
    ]);

    const allArticles = deduplicateArticles([...pubmedResults, ...arxivResults]);
    
    // Filtrer les nouveaux articles pour les emails
    const watchKey = `${watchItem.type}-${watchItem.value}`;
    const newArticles = allArticles.filter(article => isNewArticle(article, watchKey));
    
    // Enregistrer les résultats pour éviter les doublons futurs
    recordResults(allArticles, watchKey);
    
    // Archiver TOUS les articles trouvés (pas seulement les nouveaux)
    console.log(`Archiving ${allArticles.length} articles for watch: ${watchItem.value}`);
    for (const article of allArticles) {
        const archiveItem = {
            ...article,
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ID unique
            dateAdded: new Date().toISOString(),
            folderId: 'auto-watch',
            autoArchived: true
        };
        try {
            await saveModuleItem('research_archives', archiveItem);
            console.log('Article archived:', archiveItem.title);
        } catch (error) {
            console.error('Error archiving article:', error);
        }
        // Petit délai pour éviter de surcharger le système
        await new Promise(resolve => setTimeout(resolve, 10));
    }

    return {
        watchItem,
        articlesFound: allArticles.length,
        newArticles,
        timestamp: new Date().toISOString()
    };
};

/**
 * Crée le dossier auto-watch s'il n'existe pas
 */
const ensureAutoWatchFolder = async (): Promise<void> => {
    try {
        const folders = await fetchModuleData('research_folders');
        const autoWatchExists = folders && folders.some((f: any) => f.id === 'auto-watch');
        
        if (!autoWatchExists) {
            const autoWatchFolder = {
                id: 'auto-watch',
                name: 'Auto-Watch',
                icon: 'folder',
                createdAt: new Date().toISOString()
            };
            await saveModuleItem('research_folders', autoWatchFolder);
            console.log('Auto-watch folder created');
        }
    } catch (error) {
        console.error('Error creating auto-watch folder:', error);
    }
};

/**
 * Exécute toutes les veilles actives
 */
export const runAllWatches = async (userEmail: string): Promise<void> => {
    try {
        // S'assurer que le dossier auto-watch existe
        await ensureAutoWatchFolder();
        
        const watchList = await fetchModuleData('research_watchlist');
        if (!watchList || !Array.isArray(watchList) || watchList.length === 0) {
            console.log('No active watches');
            return;
        }

        console.log(`Running ${watchList.length} watches for ${userEmail}`);
        
        const results: WatchResult[] = [];
        for (const watchItem of watchList) {
            try {
                const result = await performWatchSearch(watchItem);
                results.push(result);
            } catch (error) {
                console.error(`Error in watch ${watchItem.value}:`, error);
            }
        }

        // Compter les nouveaux articles
        const totalNewArticles = results.reduce((sum, r) => sum + r.newArticles.length, 0);
        
        if (totalNewArticles > 0) {
            // Envoyer email avec les nouveaux articles
            await sendNewArticlesEmail(userEmail, results);
            lastEmailSent.set(userEmail, Date.now());
        } else {
            // Vérifier si on doit envoyer l'email quotidien
            const lastEmail = lastEmailSent.get(userEmail) || 0;
            const timeSinceLastEmail = Date.now() - lastEmail;
            
            if (timeSinceLastEmail >= ONE_DAY) {
                await sendNoNewArticlesEmail(userEmail, results);
                lastEmailSent.set(userEmail, Date.now());
            }
        }
    } catch (error) {
        console.error('Error running watches:', error);
    }
};

/**
 * Email avec nouveaux articles trouvés
 */
const sendNewArticlesEmail = async (
    recipient: string,
    results: WatchResult[]
): Promise<void> => {
    const totalNew = results.reduce((sum, r) => sum + r.newArticles.length, 0);
    
    let body = `[AUTO-WATCH ALERT] ${totalNew} nouveaux articles trouvés!\n\n`;
    body += `Date: ${new Date().toLocaleString('fr-FR')}\n\n`;
    body += `═══════════════════════════════════════\n\n`;
    
    for (const result of results) {
        if (result.newArticles.length > 0) {
            body += `[VEILLE] ${result.watchItem.value} (${result.watchItem.type})\n`;
            body += `   Nouveaux articles: ${result.newArticles.length}\n\n`;
            
            result.newArticles.slice(0, 5).forEach((article, i) => {
                body += `   ${i + 1}. ${article.title}\n`;
                body += `      Auteurs: ${article.authors}\n`;
                body += `      Source: ${article.source} (${article.year})\n`;
                body += `      URL: ${article.url}\n\n`;
            });
            
            if (result.newArticles.length > 5) {
                body += `   ... et ${result.newArticles.length - 5} autres articles\n\n`;
            }
            
            body += `───────────────────────────────────────\n\n`;
        }
    }
    
    body += `\n[INFO] Tous les articles ont été automatiquement archivés dans votre bibliothèque (dossier "auto-watch").\n\n`;
    body += `Accédez à votre bibliothèque: Hugin Lab > Scientific Research > Publications\n\n`;
    body += `───────────────────────────────────────\n`;
    body += `Cet email a été généré automatiquement par le système Auto-Watch d'Odin.\n`;
    
    await sendInternalEmail(
        recipient,
        `[AUTO-WATCH] ${totalNew} nouveaux articles trouvés`,
        body
    );
};

/**
 * Email quotidien sans nouveaux articles
 */
const sendNoNewArticlesEmail = async (
    recipient: string,
    results: WatchResult[]
): Promise<void> => {
    let body = `[RAPPORT QUOTIDIEN] Auto-Watch\n\n`;
    body += `Date: ${new Date().toLocaleString('fr-FR')}\n\n`;
    body += `═══════════════════════════════════════\n\n`;
    body += `Aucun nouvel article trouvé dans les dernières 24 heures.\n\n`;
    body += `Veilles actives: ${results.length}\n\n`;
    
    results.forEach((result, i) => {
        body += `${i + 1}. ${result.watchItem.value} (${result.watchItem.type})\n`;
        body += `   Articles trouvés: ${result.articlesFound}\n`;
        body += `   Nouveaux: 0\n\n`;
    });
    
    body += `───────────────────────────────────────\n\n`;
    body += `[INFO] Vos veilles continuent de surveiller les bases de données.\n`;
    body += `Vous recevrez une notification dès qu'un nouvel article correspondant sera publié.\n\n`;
    body += `Gérer vos veilles: Hugin Lab > Scientific Research > Auto-Watch\n\n`;
    body += `───────────────────────────────────────\n`;
    body += `Cet email a été généré automatiquement par le système Auto-Watch d'Odin.\n`;
    
    await sendInternalEmail(
        recipient,
        `[AUTO-WATCH] Rapport quotidien`,
        body
    );
};

/**
 * Initialise le service d'auto-watch automatique
 * Exécute toutes les heures
 */
export const initAutoWatchService = (userEmail: string): void => {
    console.log(`Auto-Watch Service initialized for ${userEmail}`);
    
    // Exécution immédiate au démarrage
    runAllWatches(userEmail);
    
    // Exécution toutes les heures
    setInterval(() => {
        console.log('Running scheduled auto-watch...');
        runAllWatches(userEmail);
    }, ONE_HOUR);
};

/**
 * Arrête le service d'auto-watch
 */
export const stopAutoWatchService = (): void => {
    // Clear all intervals (would need to store interval IDs in production)
    console.log('Auto-Watch Service stopped');
};

/**
 * Force l'exécution immédiate de toutes les veilles
 */
export const forceRunWatches = async (userEmail: string): Promise<void> => {
    console.log('Force running all watches...');
    await runAllWatches(userEmail);
};
