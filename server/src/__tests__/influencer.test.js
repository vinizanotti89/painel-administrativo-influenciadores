import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { Influencer } from '../models/Influencer';

describe('Testes de API do Influenciador', () => {
  beforeAll(async () => {
    // Conecta ao banco de dados de teste
    const url = process.env.MONGODB_URI_TEST;
    await mongoose.connect(url);
  });

  afterAll(async () => {
    // Limpa o banco de dados e fecha a conexão
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Limpa a coleção antes de cada teste
    await Influencer.deleteMany({});
  });

  describe('POST /api/influencers', () => {
    it('deve criar um novo influenciador', async () => {
      const influencerData = {
        name: 'Teste Influencer',
        platform: 'Instagram',
        followers: 10000,
        trustScore: 85,
        category: 'Nutrição'
      };

      const response = await request(app)
        .post('/api/influencers')
        .send(influencerData)
        .expect(201);

      expect(response.body.name).toBe(influencerData.name);
      expect(response.body.platform).toBe(influencerData.platform);
    });

    it('deve retornar erro para dados inválidos', async () => {
      const invalidData = {
        name: '', // nome vazio deve falhar
        platform: 'InvalidPlatform', // plataforma inválida
        followers: -1 // número negativo de seguidores
      };

      const response = await request(app)
        .post('/api/influencers')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/influencers', () => {
    it('deve retornar lista de influenciadores', async () => {
      // Cria alguns influenciadores de teste
      await Influencer.create([
        {
          name: 'Influencer 1',
          platform: 'Instagram',
          followers: 10000,
          trustScore: 85,
          category: 'Nutrição'
        },
        {
          name: 'Influencer 2',
          platform: 'YouTube',
          followers: 20000,
          trustScore: 90,
          category: 'Fitness'
        }
      ]);

      const response = await request(app)
        .get('/api/influencers')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[1]).toHaveProperty('platform');
    });
  });
});