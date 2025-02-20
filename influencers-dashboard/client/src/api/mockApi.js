export const mockInfluencers = [
  {
    id: "inf_1",
    name: "Dr. João Silva",
    photo: "/placeholder.jpg", // Adicionar depois
    category: "Medicina",
    platform: "Instagram",
    followers: 1200000,
    trustScore: 85,
    trend: "up",
    statistics: {
      totalClaims: 150,
      verifiedClaims: 127,
      refutedClaims: 15,
      pendingClaims: 8
    }
  },
];

export const mockClaims = [
  {
    id: "claim_1",
    influencerId: "inf_1",
    description: "Chá verde cura ansiedade",
    type: "medicinal",
    verificationStatus: "refuted",
    date: "2024-01-15",
    originalSource: {
      url: "https://instagram.com/post/123",
      postDate: "2024-01-15",
      engagement: {
        likes: 15000,
        comments: 1200,
        shares: 800
      }
    },
    studies: [
      {
        id: 1,
        title: "Effects of Green Tea on Anxiety: A Systematic Review",
        authors: "Smith, J. et al",
        year: 2023,
        journal: "Journal of Clinical Psychology",
        doi: "10.1234/jcp.2023.001",
        conclusion: "refutes",
        summary: "Não foram encontradas evidências conclusivas de que o chá verde tem efeito significativo sobre a ansiedade."
      },
      {
        id: 2,
        title: "Green Tea Compounds and Mental Health",
        authors: "Johnson, M. et al",
        year: 2022,
        journal: "Nutrition Research",
        doi: "10.1234/nr.2022.002",
        conclusion: "inconclusive",
        summary: "Resultados mistos sobre os efeitos do chá verde na saúde mental, necessitando mais estudos."
      }
    ],
    verificationNotes: "Múltiplos estudos científicos não encontraram evidências que suportem esta alegação. A afirmação é considerada enganosa e pode criar falsas expectativas.",
    expertOpinions: [
      {
        expert: "Dra. Maria Santos",
        credential: "PhD em Psiquiatria",
        opinion: "Não há evidências científicas que suportem o uso de chá verde como tratamento para ansiedade. Pessoas com ansiedade devem buscar ajuda profissional."
      }
    ],
    // Adicionados campos necessários para os componentes
    content: "Chá verde cura ansiedade",
    category: "medical",
    status: "refuted",
    trustScore: 65,
    verificationDate: "2024-01-15",
    references: ["10.1234/jcp.2023.001", "10.1234/nr.2022.002"]
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getInfluencers: async () => {
    await delay(500);
    return mockInfluencers;
  },

  getInfluencerById: async (id) => {
    await delay(300);
    return mockInfluencers.find(inf => inf.id === id);
  },

  getClaims: async () => {
    await delay(400);
    return mockClaims;
  },

  getClaimById: async (id) => {
    await delay(200);
    return mockClaims.find(c => c.id === id);
  },

  searchInfluencers: async (query = '', filters = {}) => {
    await delay(300);
    let filtered = [...mockInfluencers];
    
    if (query) {
      filtered = filtered.filter(inf =>
        inf.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(inf =>
        inf.categories.includes(filters.category)
      );
    }

    if (filters.platform) {
      filtered = filtered.filter(inf =>
        inf.platform === filters.platform
      );
    }

    return filtered;
  }
};

export default api;