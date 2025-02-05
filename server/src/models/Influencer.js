import mongoose from 'mongoose';
import { mongoosePlugin } from '../middleware/databaseMonitoring';
import { httpRequestDuration, trackDBQuery } from '../config/monitoring';

const Schema = mongoose.Schema;

const influencerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['Instagram', 'YouTube', 'TikTok']
  },
  followers: {
    type: Number,
    required: true,
    min: 0
  },
  trustScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    required: true,
    enum: ['Nutrição', 'Saúde Mental', 'Fitness', 'Viagem']
  },
  claims: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Claim'
  }],
  socialMedia: [{
    platform: String,
    username: String,
    url: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hooks para monitoramento
influencerSchema.pre('save', function() {
  this._startTime = Date.now();
});

influencerSchema.post('save', function() {
  const duration = (Date.now() - this._startTime) / 1000;
  trackDBQuery('save', 'influencers', duration);
});

influencerSchema.plugin(mongoosePlugin);

export const Influencer = mongoose.model('Influencer', influencerSchema);

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