import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Book, Brain, ChevronRight, Trash2, Download,
    Check, Copy, Archive, Folder, Plus, X, RefreshCw,
    LayoutGrid, List, FileText, ExternalLink, Eye, Filter
} from 'lucide-react';
import { useToast } from '../../components/ToastContext';
import { fetchModuleData, saveModuleItem, deleteModuleItem } from '../../utils/persistence';
import { forceRunWatches } from '../../services/autoWatchService';

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
    sources?: string[];
    sourceUrls?: string[];
}

interface FolderType {
    id: string;
    name: string;
    icon: string;
    createdAt: string;
}

interface WatchItem {
    type: 'author' | 'keyword' | 'orcid';
    value: string;
}

const ScientificResearch = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const [view, setView] = useState<'home' | 'research' | 'publications'>('home');
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'keywords' | 'exact' | 'author'>('keywords');
    const [yearMin, setYearMin] = useState('');
    const [yearMax, setYearMax] = useState('');
    const [activeSources, setActiveSources] = useState<string[]>(['pubmed', 'arxiv', 'crossref', 'europepmc', 'semantic', 'openalex', 'hal', 'scholar']);
    const [results, setResults] = useState<Article[]>([]);
    const [archives, setArchives] = useState<Article[]>([]);
    const [folders, setFolders] = useState<FolderType[]>([]);
    const [currentFolder, setCurrentFolder] = useState<string>('all');
    const [watchList, setWatchList] = useState<WatchItem[]>([]);
    const [showAutoWatchModal, setShowAutoWatchModal] = useState(false);
    const [watchType, setWatchType] = useState<'author' | 'keyword' | 'orcid'>('author');
    const [watchInput, setWatchInput] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadSavedData = async () => {
            try {
                const [savedArchives, savedFolders, savedWatchList] = await Promise.all([
                    fetchModuleData('research_archives'),
                    fetchModuleData('research_folders'),
                    fetchModuleData('research_watchlist')
                ]);
                
                console.log('Loaded watchList from storage:', savedWatchList);
                
                if (savedArchives && Array.isArray(savedArchives)) setArchives(savedArchives);
                if (savedFolders && Array.isArray(savedFolders)) setFolders(savedFolders);
                if (savedWatchList && Array.isArray(savedWatchList)) {
                    // Dédupliquer les veilles par type-value
                    const uniqueWatches = savedWatchList.reduce((acc: WatchItem[], watch: any) => {
                        const exists = acc.some(w => w.type === watch.type && w.value === watch.value);
                        if (!exists) {
                            acc.push({ type: watch.type, value: watch.value });
                        }
                        return acc;
                    }, []);
                    console.log('Deduplicated watchList:', uniqueWatches);
                    setWatchList(uniqueWatches);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadSavedData();
    }, []);

    const isArchived = (article: Article) => {
        return archives.some(a => {
            if (article.doi && a.doi) return article.doi === a.doi;
            return article.title === a.title;
        });
    };

    const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        showToast(msg, type);
    };

    const searchPubMed = async (query: string, limit = 50) => {
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

    const searchArXiv = async (query: string, limit = 50) => {
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

    const searchCrossRef = async (query: string, limit = 50) => {
        try {
            const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${limit}`;
            const res = await fetch(url);
            const data = await res.json();
            const items = data.message?.items || [];
            return items.map((item: any) => {
                const authors: string[] = [];
                if (item.author) {
                    item.author.slice(0, 3).forEach((a: any) => {
                        const name = `${a.given || ''} ${a.family || ''}`.trim();
                        if (name) authors.push(name);
                    });
                }
                return {
                    title: item.title?.[0] || 'Untitled',
                    abstract: (item.abstract || 'No abstract available').substring(0, 300),
                    year: item.published?.['date-parts']?.[0]?.[0]?.toString() || '',
                    authors: authors.join(', ') + (item.author?.length > 3 ? ' et al.' : ''),
                    doi: item.DOI || '',
                    source: 'CrossRef',
                    sourceUrl: item.DOI ? `https://doi.org/${item.DOI}` : '',
                    url: item.DOI ? `https://doi.org/${item.DOI}` : '',
                    pdfUrl: item.DOI ? `https://doi.org/${item.DOI}` : null
                };
            });
        } catch (e) {
            console.error('CrossRef error:', e);
            return [];
        }
    };

    const deduplicateAndMerge = (allResults: Article[]) => {
        const articlesMap = new Map<string, Article>();
        allResults.forEach(article => {
            let key = '';
            if (article.doi && article.doi.trim()) {
                key = 'doi:' + article.doi.trim().toLowerCase();
            } else if (article.title) {
                const normalizedTitle = article.title
                    .toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                key = 'title:' + normalizedTitle;
            }
            if (!key) return;

            if (articlesMap.has(key)) {
                const existing = articlesMap.get(key)!;
                if (!existing.sources) {
                    existing.sources = [existing.source];
                    existing.sourceUrls = [existing.sourceUrl || existing.url];
                }
                if (!existing.sources.includes(article.source)) {
                    existing.sources.push(article.source);
                    existing.sourceUrls?.push(article.sourceUrl || article.url);
                }
                if (!existing.abstract || existing.abstract.length < (article.abstract?.length || 0)) {
                    existing.abstract = article.abstract;
                }
                if (!existing.pdfUrl && article.pdfUrl) {
                    existing.pdfUrl = article.pdfUrl;
                }
            } else {
                articlesMap.set(key, { ...article });
            }
        });
        return Array.from(articlesMap.values());
    };

    const performSearch = async () => {
        if (!searchQuery.trim()) {
            notify('Veuillez entrer des termes de recherche', 'error');
            return;
        }
        setIsSearching(true);

        try {
            const promises: Promise<Article[]>[] = [];
            if (activeSources.includes('pubmed')) promises.push(searchPubMed(searchQuery));
            if (activeSources.includes('arxiv')) promises.push(searchArXiv(searchQuery));
            if (activeSources.includes('crossref')) promises.push(searchCrossRef(searchQuery));

            const resultsData = await Promise.all(promises);
            let merged = deduplicateAndMerge(resultsData.flat());

            if (searchType === 'exact') {
                merged = merged.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
            } else if (searchType === 'author') {
                merged = merged.filter(r => r.authors.toLowerCase().includes(searchQuery.toLowerCase()));
            }

            const min = parseInt(yearMin);
            const max = parseInt(yearMax);
            if (min || max) {
                merged = merged.filter(r => {
                    const y = parseInt(r.year);
                    if (!y) return true;
                    if (min && y < min) return false;
                    if (max && y > max) return false;
                    return true;
                });
            }

            setResults(merged);
            if (merged.length === 0) {
                notify('Aucun résultat trouvé', 'info');
            } else {
                notify(`${merged.length} résultats trouvés`, 'success');
            }
        } catch (e) {
            console.error('Search error:', e);
            notify('Erreur lors de la recherche', 'error');
        } finally {
            setIsSearching(false);
        }
    };

    const archiveArticle = async (article: Article, folderId = 'uncategorized') => {
        if (isArchived(article)) {
            notify('Déjà archivé', 'info');
            return;
        }
        const newArchive = {
            ...article,
            id: article.doi || article.title,
            dateAdded: new Date().toISOString(),
            folderId
        };
        try {
            await saveModuleItem('research_archives', newArchive);
            setArchives([newArchive, ...archives]);
            notify('Ajouté à la bibliothèque', 'success');
        } catch (e) {
            notify('Erreur d\'archivage', 'error');
        }
    };

    const addFolder = async (name: string) => {
        const newFolder: FolderType = {
            id: generateId(),
            name,
            icon: 'folder',
            createdAt: new Date().toISOString()
        };
        try {
            await saveModuleItem('research_folders', newFolder);
            setFolders([...folders, newFolder]);
            notify('Dossier créé', 'success');
        } catch (e) {
            notify('Erreur de création du dossier', 'error');
        }
    };

    const removeFolder = async (id: string) => {
        try {
            await deleteModuleItem('research_folders', id);
            setFolders(folders.filter(f => f.id !== id));
            setArchives(archives.map(a => a.folderId === id ? { ...a, folderId: 'uncategorized' } : a));
            notify('Dossier supprimé', 'info');
        } catch (e) {
            notify('Erreur de suppression du dossier', 'error');
        }
    };

    const addToWatchList = async (item: WatchItem) => {
        // Vérifier si la veille existe déjà
        const exists = watchList.some(w => w.type === item.type && w.value === item.value);
        if (exists) {
            notify('Cette veille existe déjà', 'info');
            return;
        }

        try {
            const id = `${item.type}-${item.value}`;
            const watchItem = { ...item, id };
            
            // Sauvegarder l'item individuel
            await saveModuleItem('research_watchlist', watchItem);
            
            // Mettre à jour l'état local
            setWatchList([...watchList, item]);
            notify('Veille activée', 'success');
        } catch (e) {
            notify('Erreur d\'activation de la veille', 'error');
        }
    };

    const removeArchive = async (article: Article) => {
        try {
            const id = article.id || article.doi || article.title;
            await deleteModuleItem('research_archives', id);
            setArchives(archives.filter(a => (a.id || a.doi || a.title) !== id));
            notify('Retiré de la bibliothèque', 'info');
        } catch (e) {
            notify('Erreur de suppression', 'error');
        }
    };

    const copyDOI = (doi: string) => {
        navigator.clipboard.writeText(doi);
        notify('DOI copié', 'success');
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Header Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <button
                    onClick={() => view === 'home' ? navigate('/hugin') : setView('home')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> 
                    {view === 'home' ? 'Retour au Labo' : 'Accueil'}
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setView('research')}
                        className="btn"
                        style={{
                            background: view === 'research' ? 'var(--accent-hugin)' : 'var(--bg-secondary)',
                            color: view === 'research' ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Search size={18} /> Recherche
                    </button>
                    <button
                        onClick={() => setView('publications')}
                        className="btn"
                        style={{
                            background: view === 'publications' ? 'var(--accent-hugin)' : 'var(--bg-secondary)',
                            color: view === 'publications' ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Book size={18} /> Bibliothèque
                    </button>
                    <button
                        onClick={() => setShowAutoWatchModal(true)}
                        className="btn btn-primary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RefreshCw size={18} /> Auto-Watch
                    </button>
                </div>
            </div>

            {/* Home View */}
            {view === 'home' && (
                <>
                    <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                            <Brain size={40} color="var(--accent-hugin)" />
                            Scientific Research
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            Explorez des millions de publications scientifiques depuis PubMed, arXiv, CrossRef et plus encore.
                        </p>
                    </header>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                        <div
                            className="card glass-panel"
                            onClick={() => setView('research')}
                            style={{ 
                                padding: '2.5rem', 
                                cursor: 'pointer', 
                                border: '2px solid transparent', 
                                transition: 'all 0.3s',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-hugin)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                                <Search size={48} color="var(--accent-hugin)" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recherche Active</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Lancez des requêtes complexes à travers les bases de données scientifiques mondiales.
                            </p>
                        </div>

                        <div
                            className="card glass-panel"
                            onClick={() => setView('publications')}
                            style={{ 
                                padding: '2.5rem', 
                                cursor: 'pointer', 
                                border: '2px solid transparent', 
                                transition: 'all 0.3s',
                                textAlign: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
                                <Book size={48} color="#10b981" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Ma Bibliothèque</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Gérez votre collection personnelle d'articles et de documentation technique.
                            </p>
                            <div style={{ marginTop: '1rem', fontSize: '2rem', fontWeight: 700, color: 'var(--accent-hugin)' }}>
                                {archives.length}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>articles archivés</div>
                        </div>
                    </div>
                </>
            )}

            {/* Research View */}
            {view === 'research' && (
                <>
                    <header style={{ marginBottom: '2rem' }}>
                        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Recherche Scientifique</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Explorez les bases de données scientifiques mondiales</p>
                    </header>

                    {/* Search Bar */}
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                                    placeholder="Mots-clés, DOI, ou noms d'auteurs..."
                                    className="input-field"
                                    style={{ paddingLeft: '3rem', marginBottom: 0 }}
                                />
                            </div>
                            <button
                                onClick={performSearch}
                                disabled={isSearching}
                                className="btn btn-primary"
                                style={{ minWidth: '120px' }}
                            >
                                {isSearching ? 'Recherche...' : 'Rechercher'}
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="btn"
                                style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Filter size={18} /> Filtres
                            </button>
                        </div>

                        {showFilters && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <div>
                                    <label className="label">Type de recherche</label>
                                    <select
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value as any)}
                                        className="input-field"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <option value="keywords">Mots-clés</option>
                                        <option value="exact">Correspondance exacte</option>
                                        <option value="author">Par auteur</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Année min</label>
                                    <input
                                        type="number"
                                        value={yearMin}
                                        onChange={(e) => setYearMin(e.target.value)}
                                        placeholder="2020"
                                        className="input-field"
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                                <div>
                                    <label className="label">Année max</label>
                                    <input
                                        type="number"
                                        value={yearMax}
                                        onChange={(e) => setYearMax(e.target.value)}
                                        placeholder="2024"
                                        className="input-field"
                                        style={{ marginBottom: 0 }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>Sources:</span>
                            {['pubmed', 'arxiv', 'crossref', 'europepmc', 'semantic', 'openalex', 'hal', 'scholar'].map(src => (
                                <button
                                    key={src}
                                    onClick={() => {
                                        if (activeSources.includes(src)) {
                                            setActiveSources(activeSources.filter(s => s !== src));
                                        } else {
                                            setActiveSources([...activeSources, src]);
                                        }
                                    }}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        background: activeSources.includes(src) ? 'var(--accent-hugin)' : 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        color: activeSources.includes(src) ? 'white' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {src}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-hugin)' }}>{results.length}</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Résultats</div>
                        </div>
                        <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>{results.filter(r => r.pdfUrl).length}</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>PDFs Disponibles</div>
                        </div>
                        <div className="card glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6366f1' }}>{archives.length}</div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Bibliothèque</div>
                        </div>
                    </div>

                    {/* Results */}
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {results.length === 0 && !isSearching && (
                            <div className="card glass-panel" style={{ padding: '5rem', textAlign: 'center', opacity: 0.5 }}>
                                <Search size={64} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
                                <p>Entrez des termes de recherche pour commencer</p>
                            </div>
                        )}

                        {results.map((article, idx) => (
                            <div key={idx} className="card glass-panel" style={{
                                borderLeft: isArchived(article) ? '4px solid #10b981' : '1px solid var(--border-color)',
                                padding: '1.5rem',
                                display: 'flex',
                                gap: '1.5rem'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{article.title}</h3>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '0.25rem', 
                                            fontSize: '0.75rem', 
                                            background: 'rgba(99, 102, 241, 0.1)', 
                                            color: '#a5b4fc' 
                                        }}>
                                            {article.year || 'N/A'}
                                        </span>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '0.25rem', 
                                            fontSize: '0.75rem', 
                                            background: 'rgba(16, 185, 129, 0.1)', 
                                            color: '#6ee7b7' 
                                        }}>
                                            {article.source}
                                        </span>
                                        {article.sources && article.sources.length > 1 && (
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', 
                                                borderRadius: '0.25rem', 
                                                fontSize: '0.75rem', 
                                                background: 'rgba(236, 72, 153, 0.1)', 
                                                color: '#f9a8d4' 
                                            }}>
                                                {article.sources.length} sources
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                        <strong>Auteurs:</strong> {article.authors}
                                    </div>
                                    <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.8, marginBottom: '1.5rem' }}>
                                        {article.abstract}...
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <a href={article.url} target="_blank" rel="noreferrer" className="btn" style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem', 
                                            background: 'var(--bg-secondary)',
                                            fontSize: '0.85rem',
                                            padding: '0.5rem 1rem'
                                        }}>
                                            <ExternalLink size={14} /> Ouvrir
                                        </a>
                                        {article.pdfUrl && (
                                            <button onClick={() => window.open(article.pdfUrl!, '_blank')} className="btn" style={{ 
                                                background: 'rgba(59, 130, 246, 0.2)', 
                                                color: '#93c5fd',
                                                fontSize: '0.85rem',
                                                padding: '0.5rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Download size={14} /> PDF
                                            </button>
                                        )}
                                        {article.doi && (
                                            <button onClick={() => copyDOI(article.doi)} className="btn" style={{ 
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                fontSize: '0.85rem',
                                                padding: '0.5rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}>
                                                <Copy size={14} /> DOI
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => archiveArticle(article)}
                                    disabled={isArchived(article)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '0.75rem',
                                        background: isArchived(article) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                                        color: isArchived(article) ? '#10b981' : 'var(--accent-hugin)',
                                        border: 'none',
                                        cursor: isArchived(article) ? 'default' : 'pointer',
                                        alignSelf: 'flex-start'
                                    }}
                                >
                                    {isArchived(article) ? <Check size={24} /> : <Archive size={24} />}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Publications View */}
            {view === 'publications' && (
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                    {/* Sidebar */}
                    <aside>
                        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dossiers</h3>
                                <button
                                    onClick={() => {
                                        const name = prompt('Nom du dossier:');
                                        if (name) addFolder(name);
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent-hugin)', cursor: 'pointer' }}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setCurrentFolder('all')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem',
                                        background: currentFolder === 'all' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                        color: currentFolder === 'all' ? 'var(--accent-hugin)' : 'var(--text-secondary)',
                                        border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <LayoutGrid size={18} /> Tous ({archives.length})
                                </button>
                                <button
                                    onClick={() => setCurrentFolder('uncategorized')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem',
                                        background: currentFolder === 'uncategorized' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                        color: currentFolder === 'uncategorized' ? 'var(--accent-hugin)' : 'var(--text-secondary)',
                                        border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    <List size={18} /> Non classés ({archives.filter(a => !a.folderId || a.folderId === 'uncategorized').length})
                                </button>
                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.5rem 0' }} />
                                {folders.map(f => (
                                    <div key={f.id} style={{ position: 'relative', display: 'flex' }}>
                                        <button
                                            onClick={() => setCurrentFolder(f.id)}
                                            style={{
                                                flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem',
                                                background: currentFolder === f.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                                color: currentFolder === f.id ? 'var(--accent-hugin)' : 'var(--text-secondary)',
                                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <Folder size={18} /> {f.name}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFolder(f.id); }}
                                            style={{ padding: '0.5rem', opacity: 0.3, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <div>
                        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                                {currentFolder === 'all' ? 'Toutes les Publications' : folders.find(f => f.id === currentFolder)?.name || 'Non classés'}
                            </h2>
                            <input
                                type="text"
                                placeholder="Filtrer..."
                                className="input-field"
                                style={{ marginBottom: 0, maxWidth: '250px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {archives
                                .filter(a => currentFolder === 'all' || (currentFolder === 'uncategorized' ? (!a.folderId || a.folderId === 'uncategorized') : a.folderId === currentFolder))
                                .map((article, idx) => (
                                    <div key={idx} className="card glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.4 }}>{article.title}</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{article.source}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>•</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{article.year}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeArchive(article)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer', padding: '0.25rem' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                                            <button className="btn" onClick={() => window.open(article.url, '_blank')} style={{ 
                                                background: 'var(--bg-secondary)', 
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.85rem'
                                            }}>
                                                <Eye size={14} /> Voir
                                            </button>
                                            {article.pdfUrl && (
                                                <button className="btn" onClick={() => window.open(article.pdfUrl!, '_blank')} style={{ 
                                                    background: 'rgba(16, 185, 129, 0.1)', 
                                                    color: '#10b981', 
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    <FileText size={14} /> PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Auto Watch Modal */}
            {showAutoWatchModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="card glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-hugin)' }}>
                                <Brain size={24} /> Veille Automatique
                            </h2>
                            <button onClick={() => setShowAutoWatchModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Ajouter une Veille</h3>
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <select
                                    value={watchType}
                                    onChange={(e) => setWatchType(e.target.value as any)}
                                    className="input-field"
                                    style={{ marginBottom: 0, minWidth: '120px' }}
                                >
                                    <option value="author">Auteur</option>
                                    <option value="keyword">Mot-clé</option>
                                    <option value="orcid">ORCID</option>
                                </select>
                                <input
                                    type="text"
                                    value={watchInput}
                                    onChange={(e) => setWatchInput(e.target.value)}
                                    placeholder="ex: Marie Curie"
                                    className="input-field"
                                    style={{ flex: 1, marginBottom: 0, minWidth: '200px' }}
                                />
                                <button
                                    onClick={async () => {
                                        if (watchInput.trim()) {
                                            const newWatch = { type: watchType, value: watchInput.trim() };
                                            await addToWatchList(newWatch);
                                            setWatchInput('');
                                        }
                                    }}
                                    className="btn btn-primary"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Veilles Actives ({watchList.length})</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {watchList.length === 0 ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.5 }}>
                                        Aucune veille active
                                    </div>
                                ) : (
                                    watchList.map((watch, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '0.75rem' }}>
                                            <div>
                                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '0.3rem', textTransform: 'uppercase', marginRight: '0.75rem' }}>{watch.type}</span>
                                                <span style={{ fontWeight: 600 }}>{watch.value}</span>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const watchToRemove = watchList[i];
                                                    const id = `${watchToRemove.type}-${watchToRemove.value}`;
                                                    try {
                                                        await deleteModuleItem('research_watchlist', id);
                                                        setWatchList(watchList.filter((_, idx) => idx !== i));
                                                        notify('Veille supprimée', 'info');
                                                    } catch (e) {
                                                        notify('Erreur de suppression', 'error');
                                                    }
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={async () => {
                                    if (watchList.length === 0) {
                                        notify('Aucune veille active', 'error');
                                        return;
                                    }
                                    
                                    notify('Lancement des recherches de veille automatique...', 'info');
                                    
                                    const userStr = localStorage.getItem('currentUser');
                                    if (!userStr) {
                                        notify('Utilisateur non connecté', 'error');
                                        return;
                                    }
                                    
                                    try {
                                        let userEmail = '';
                                        
                                        // Vérifier si c'est un JSON ou directement l'email
                                        try {
                                            const user = JSON.parse(userStr);
                                            userEmail = user.email || userStr;
                                        } catch {
                                            // Si ce n'est pas du JSON, c'est probablement l'email directement
                                            userEmail = userStr;
                                        }
                                        
                                        if (!userEmail) {
                                            notify('Email utilisateur introuvable', 'error');
                                            return;
                                        }
                                        
                                        await forceRunWatches(userEmail);
                                        
                                        notify('Veille terminée! Vérifiez votre messagerie pour les résultats.', 'success');
                                        setShowAutoWatchModal(false);
                                        setView('publications');
                                    } catch (e) {
                                        console.error('Error running watches:', e);
                                        notify('Erreur lors de l\'exécution de la veille', 'error');
                                    }
                                }}
                            >
                                Lancer la veille maintenant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScientificResearch;
