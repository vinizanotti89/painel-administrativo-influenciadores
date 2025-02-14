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
  },
  {
    id: "inf_2",
    name: "Maria Santos",
    platform: "YouTube",
    followers: 1000000,
    trustScore: 92,
    claims: [
      {
        id: "claim_2",
        content: "Exercícios de alta intensidade melhoram a imunidade",
        category: "medical",
        status: "verified",
        trustScore: 88
      }
    ],
    socialMedia: [
      {
        id: "social_2",
        platform: "YouTube",
        username: "MariaSantosHealth",
        url: "https://youtube.com/mariasantoshealth"
      }
    ]
  }
];

export const mockClaims = [
  {
    id: "claim_1",
    influencerId: "inf_1",
    content: "Chá verde aumenta o metabolismo em 50%",
    category: "nutrition",
    status: "questionable",
    trustScore: 65,
    originalSource: {
      id: "source_1",
      url: "https://instagram.com/p/123456",
      postDate: "2024-12-15",
      platform: "Instagram",
      engagement: {
        likes: 15000,
        comments: 1200,
        shares: 500
      }
    },
    studies: [
      {
        id: "study_1",
        title: "Effects of Green Tea on Metabolism",
        authors: "Smith, J., Johnson, M.",
        year: 2023,
        journal: "Journal of Nutrition",
        doi: "10.1234/jn.2023.1234",
        conclusion: "inconclusive",
        summary: "Estudos mostram aumento moderado no metabolismo, mas não na magnitude alegada."
      }
    ],
    verificationNotes: "Alegação exagerada dos benefícios reais",
    expertOpinions: [
      {
        id: "expert_1",
        name: "Dr. Ana Paula Silva",
        credentials: "PhD em Nutrição",
        opinion: "O chá verde tem benefícios metabólicos comprovados, mas o aumento de 50% é inexato."
      }
    ]
  }
];

export const api = {
  getInfluencers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "inf_1",
            name: "João Silva",
            platform: "Instagram",
            followers: 50000,
            trustScore: 85
          },
          {
            id: "inf_2",
            name: "Maria Santos",
            platform: "YouTube",
            followers: 75000,
            trustScore: 92
          }
        ]);
      }, 500);
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