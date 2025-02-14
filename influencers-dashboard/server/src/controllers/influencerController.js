import { InfluencerService } from '../services/influencerService.js';
import { httpRequestDuration } from '../config/monitoring.js';

export class InfluencerController {
  static async getInfluencers(req, res) {
    const startTime = Date.now();
    try {
      const filters = req.query;
      const influencers = await InfluencerService.getAll(filters);

      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration
        .labels('GET', '/influencers', 200)
        .observe(duration);

      res.json(influencers);
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration
        .labels('GET', '/influencers', 500)
        .observe(duration);

      res.status(500).json({ error: error.message });
    }
  }

  static async getInfluencerById(req, res) {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const influencer = await InfluencerService.getById(id);

      const duration = (Date.now() - startTime) / 1000;

      if (!influencer) {
        httpRequestDuration
          .labels('GET', `/influencers/${id}`, 404)
          .observe(duration);
        return res.status(404).json({ message: 'Influenciador não encontrado' });
      }

      httpRequestDuration
        .labels('GET', `/influencers/${id}`, 200)
        .observe(duration);

      res.json(influencer);
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration
        .labels('GET', `/influencers/${id}`, 500)
        .observe(duration);

      res.status(500).json({ error: error.message });
    }
  }

  static async createInfluencer(req, res) {
    const startTime = Date.now();
    try {
      const influencerData = req.body;
      const newInfluencer = await InfluencerService.create(influencerData);

      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration
        .labels('POST', '/influencers', 201)
        .observe(duration);

      res.status(201).json(newInfluencer);
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration
        .labels('POST', '/influencers', 500)
        .observe(duration);

      res.status(500).json({ error: error.message });
    }
  }

  static async updateInfluencer(req, res) {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedInfluencer = await InfluencerService.update(id, updateData);

      const duration = (Date.now() - startTime) / 1000;

      if (!updatedInfluencer) {
        httpRequestDuration
          .labels('PUT', `/influencers/${id}`, 404)
          .observe(duration);
        return res.status(404).json({ message: 'Influenciador não encontrado' });
      }

      httpRequestDuration
        .labels('PUT', `/influencers/${id}`, 200)
        .observe(duration);

      res.json(updatedInfluencer);
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration
        .labels('PUT', `/influencers/${id}`, 500)
        .observe(duration);

      res.status(500).json({ error: error.message });
    }
  }

  static async deleteInfluencer(req, res) {
    const startTime = Date.now();
    try {
      const { id } = req.params;
      const result = await InfluencerService.delete(id);

      const duration = (Date.now() - startTime) / 1000;

      if (!result) {
        httpRequestDuration
          .labels('DELETE', `/influencers/${id}`, 404)
          .observe(duration);
        return res.status(404).json({ message: 'Influenciador não encontrado' });
      }

      httpRequestDuration
        .labels('DELETE', `/influencers/${id}`, 204)
        .observe(duration);

      res.status(204).send();
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      httpRequestDuration
        .labels('DELETE', `/influencers/${id}`, 500)
        .observe(duration);

      res.status(500).json({ error: error.message });
    }
  }
}