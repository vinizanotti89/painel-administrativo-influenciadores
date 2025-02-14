import mongoose from 'mongoose';
import mongoosePlugin from '../middleware/databaseMonitoring.js';
import { httpRequestDuration, trackDBQuery } from '../config/monitoring.js';

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
influencerSchema.pre('save', function () {
  this._startTime = Date.now();
});

influencerSchema.post('save', function () {
  const duration = (Date.now() - this._startTime) / 1000;
  trackDBQuery('save', 'influencers', duration);
});

influencerSchema.plugin(mongoosePlugin);


export const Influencer = mongoose.model('Influencer', influencerSchema);
export default Influencer;