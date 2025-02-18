export const mockInfluencers = [
  {
    id: "inf_1",
    name: "João Silva",
    platform: "Instagram",
    followers: 500000,
    trustScore: 85,
    claims: [
      {
        id: "claim_1",
        content: "Chá verde aumenta o metabolismo em 50%",
        category: "nutrition",
        status: "questionable",
        trustScore: 65
      }
    ],
    socialMedia: [
      {
        id: "social_1",
        platform: "Instagram",
        username: "@joaosilva",
        url: "https://instagram.com/joaosilva"
      }
    ]
  }
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
    ]
  }
];

export const api = {
  getInfluencers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockInfluencers), 500);
    });
  },

  getInfluencerById: async (id) => {
    return new Promise((resolve) => {
      const influencer = mockInfluencers.find(inf => inf.id === id);
      setTimeout(() => resolve(influencer), 300);
    });
  },

  getClaims: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockClaims), 400);
    });
  },

  getClaimById: async (id) => {
    return new Promise((resolve) => {
      const claim = mockClaims.find(c => c.id === id);
      setTimeout(() => resolve(claim), 200);
    });
  },

  searchInfluencers: async (query) => {
    return new Promise((resolve) => {
      const filtered = mockInfluencers.filter(inf =>
        inf.name.toLowerCase().includes(query.toLowerCase())
      );
      setTimeout(() => resolve(filtered), 300);
    });
  }
};