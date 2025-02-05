import { InfluencerService } from '../services/influencerService.js';
import { httpRequestDuration } from '../config/monitoring';


export const createInfluencer = async (req, res) => {
  const startTime = Date.now();
  try {
    const influencer = await Influencer.create(req.body);
    const duration = (Date.now() - startTime) / 1000;

    // Registrar métrica personalizada
    httpRequestDuration
      .labels('POST', '/influencers', 201)
      .observe(duration);

    res.status(201).json(influencer);
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    httpRequestDuration
      .labels('POST', '/influencers', 500)
      .observe(duration);

    res.status(500).json({ error: error.message });
  }
};
export class InfluencerController {
  static async getInfluencers(req, res) {
    try {
      const filters = req.query;
      const influencers = await InfluencerService.getAll(filters);
      res.json(influencers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getInfluencerById(req, res) {
    try {
      const { id } = req.params;
      const influencer = await InfluencerService.getById(id);

      if (!influencer) {
        return res.status(404).json({ message: 'Influenciador não encontrado' });
      }

      res.json(influencer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createInfluencer(req, res) {
    try {
      const influencerData = req.body;
      const newInfluencer = await InfluencerService.create(influencerData);
      res.status(201).json(newInfluencer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateInfluencer(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedInfluencer = await InfluencerService.update(id, updateData);

      if (!updatedInfluencer) {
        return res.status(404).json({ message: 'Influenciador não encontrado' });
      }

      res.json(updatedInfluencer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteInfluencer(req, res) {
    try {
      const { id } = req.params;
      await InfluencerService.delete(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}