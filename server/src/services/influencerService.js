import { Influencer } from '../models/Influencer.js';

export class InfluencerService {
  static async getAll(filters = {}) {
    const query = {};
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.platform) {
      query.platform = filters.platform;
    }
    
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }
    
    return await Influencer.find(query).populate('claims');
  }

  static async getById(id) {
    return await Influencer.findById(id).populate('claims');
  }

  static async create(influencerData) {
    const influencer = new Influencer(influencerData);
    return await influencer.save();
  }

  static async update(id, updateData) {
    return await Influencer.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
  }

  static async delete(id) {
    return await Influencer.findByIdAndDelete(id);
  }
}