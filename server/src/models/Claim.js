const claimSchema = new mongoose.Schema({
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Influencer',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['nutrition', 'medical', 'fitness']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'verified', 'questionable', 'refuted'],
      default: 'pending'
    },
    trustScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    originalSource: {
      url: String,
      postDate: Date,
      platform: String,
      engagement: {
        likes: Number,
        comments: Number,
        shares: Number
      }
    },
    studies: [{
      title: String,
      authors: [String],
      year: Number,
      journal: String,
      doi: String,
      conclusion: String,
      summary: String
    }],
    verificationNotes: String,
    expertOpinions: [{
      name: String,
      credentials: String,
      opinion: String
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
  
  export const Claim = mongoose.model('Claim', claimSchema);