export interface PosterTemplate {
  name: string;
  description: string;
  size: { width: number; height: number };
  elements: any[];
}

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    name: 'Poster Scientifique Classique',
    description: 'Layout traditionnel avec titre, introduction, méthodes, résultats et conclusion',
    size: { width: 1189, height: 841 },
    elements: [
      {
        id: 'title',
        type: 'text',
        x: 50,
        y: 30,
        width: 1089,
        height: 100,
        content: 'TITRE DU PROJET DE RECHERCHE',
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1e293b',
        backgroundColor: 'transparent'
      },
      {
        id: 'authors',
        type: 'text',
        x: 50,
        y: 140,
        width: 1089,
        height: 40,
        content: 'Auteur 1, Auteur 2, Auteur 3 - Laboratoire de Recherche',
        fontSize: 20,
        textAlign: 'center',
        color: '#64748b'
      },
      {
        id: 'intro-box',
        type: 'shape',
        x: 50,
        y: 200,
        width: 350,
        height: 250,
        shapeType: 'rectangle',
        backgroundColor: '#f1f5f9',
        borderColor: '#3b82f6',
        borderWidth: 2
      },
      {
        id: 'intro-title',
        type: 'text',
        x: 70,
        y: 220,
        width: 310,
        height: 40,
        content: 'INTRODUCTION',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3b82f6'
      },
      {
        id: 'methods-box',
        type: 'shape',
        x: 420,
        y: 200,
        width: 350,
        height: 250,
        shapeType: 'rectangle',
        backgroundColor: '#f1f5f9',
        borderColor: '#10b981',
        borderWidth: 2
      },
      {
        id: 'methods-title',
        type: 'text',
        x: 440,
        y: 220,
        width: 310,
        height: 40,
        content: 'MÉTHODES',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10b981'
      },
      {
        id: 'results-box',
        type: 'shape',
        x: 790,
        y: 200,
        width: 350,
        height: 250,
        shapeType: 'rectangle',
        backgroundColor: '#f1f5f9',
        borderColor: '#f59e0b',
        borderWidth: 2
      },
      {
        id: 'results-title',
        type: 'text',
        x: 810,
        y: 220,
        width: 310,
        height: 40,
        content: 'RÉSULTATS',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f59e0b'
      },
      {
        id: 'conclusion-box',
        type: 'shape',
        x: 50,
        y: 470,
        width: 1089,
        height: 150,
        shapeType: 'rectangle',
        backgroundColor: '#f1f5f9',
        borderColor: '#8b5cf6',
        borderWidth: 2
      },
      {
        id: 'conclusion-title',
        type: 'text',
        x: 70,
        y: 490,
        width: 1049,
        height: 40,
        content: 'CONCLUSION',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#8b5cf6'
      },
      {
        id: 'footer',
        type: 'text',
        x: 50,
        y: 750,
        width: 1089,
        height: 60,
        content: 'Contact: email@laboratoire.fr | Conférence 2026',
        fontSize: 18,
        textAlign: 'center',
        color: '#64748b',
        backgroundColor: '#f8fafc'
      }
    ]
  },
  {
    name: 'Poster Moderne Minimaliste',
    description: 'Design épuré avec focus sur les visuels',
    size: { width: 841, height: 1189 },
    elements: [
      {
        id: 'header-bg',
        type: 'shape',
        x: 0,
        y: 0,
        width: 841,
        height: 200,
        shapeType: 'rectangle',
        backgroundColor: '#3b82f6',
        borderWidth: 0
      },
      {
        id: 'title',
        type: 'text',
        x: 50,
        y: 60,
        width: 741,
        height: 80,
        content: 'RECHERCHE INNOVANTE',
        fontSize: 52,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#ffffff'
      },
      {
        id: 'main-content',
        type: 'shape',
        x: 50,
        y: 250,
        width: 741,
        height: 850,
        shapeType: 'rectangle',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1
      }
    ]
  },
  {
    name: 'Poster Conférence',
    description: 'Format optimisé pour présentation en conférence',
    size: { width: 1189, height: 841 },
    elements: [
      {
        id: 'banner',
        type: 'shape',
        x: 0,
        y: 0,
        width: 1189,
        height: 120,
        shapeType: 'rectangle',
        backgroundColor: '#1e293b',
        borderWidth: 0
      },
      {
        id: 'title',
        type: 'text',
        x: 100,
        y: 30,
        width: 989,
        height: 60,
        content: 'TITRE DE LA PRÉSENTATION',
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#ffffff'
      },
      {
        id: 'logo-placeholder',
        type: 'shape',
        x: 50,
        y: 30,
        width: 60,
        height: 60,
        shapeType: 'circle',
        backgroundColor: '#3b82f6',
        borderWidth: 0
      }
    ]
  }
];
